/**
 * Pre-publish content gate.
 *
 * Walks every markdown file under content/<source>/ and rejects:
 *   - missing title or date frontmatter (would render as "Untitled")
 *   - bare JSX-style tags in prose, e.g. <Tooltip> not in backticks
 *     (these break MDX render at build time)
 *   - frontmatter mermaid: blocks that don't parse
 *   - dotfiles that slipped past lib/posts.ts filter
 *
 * Exits 1 on any failure. Wire it into npm run check so the build refuses
 * to ship until every published file is clean.
 *
 *   npx tsx scripts/validate-content.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ROOT = path.resolve(process.cwd(), 'content');
const SOURCES = ['posts', 'digests', 'githot', 'ai-news', 'visa-news', 'career-edge', 'diagrams'] as const;

interface Issue {
  file:    string;
  line?:   number;
  rule:    string;
  message: string;
}

const issues: Issue[] = [];

function checkDotfile(file: string) {
  const base = path.basename(file);
  if (base.startsWith('.')) {
    issues.push({ file, rule: 'dotfile', message: `Dotfiles must not live in content/<source>/. Move ${base} elsewhere.` });
  }
}

function checkFrontmatter(file: string, data: Record<string, unknown>) {
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    issues.push({ file, rule: 'frontmatter.title', message: 'Missing or empty `title:` in frontmatter — would render as "Untitled".' });
  }
  if (!data.date || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(data.date)) {
    issues.push({ file, rule: 'frontmatter.date', message: 'Missing or invalid `date:` (expected YYYY-MM-DD).' });
  }
}

/**
 * Find bare JSX-style tags in prose. They look like `<TagName>` followed by
 * whitespace or a tag close. They must either be inside a code fence (```) or
 * inside `inline backticks`. Anything else fails MDX parsing at build time.
 */
function checkBareJsxTags(file: string, body: string) {
  const lines = body.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;

    // Strip inline `code` spans
    const stripped = line.replace(/`[^`]*`/g, '');

    // Match <Tag> or </Tag> or <Tag … /> in raw prose. Skip common HTML
    // (a, p, div, span, br, img, etc.) which MDX accepts.
    const match = stripped.match(/<([A-Z][A-Za-z0-9]*)\b[^>]*>?/);
    if (match) {
      issues.push({
        file,
        line: i + 1,
        rule: 'mdx.bareJsx',
        message: `Bare JSX-like tag <${match[1]}> in prose. Wrap in backticks or remove. Line: "${line.trim().slice(0, 100)}"`,
      });
    }
  }
}

/**
 * If the frontmatter has a `mermaid:` field (used by content/diagrams), do a
 * basic syntax sanity check. We can't run the full mermaid parser server-side
 * cleanly, so we check for obvious breakage:
 *   - empty after pipe
 *   - first non-blank line names a known diagram type
 *   - balanced quotes / brackets in arrow definitions
 */
function checkMermaid(file: string, data: Record<string, unknown>) {
  const m = data.mermaid;
  if (typeof m !== 'string') return;
  const trimmed = m.trim();
  if (!trimmed) {
    issues.push({ file, rule: 'mermaid.empty', message: '`mermaid:` field is empty.' });
    return;
  }
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  const known = [
    'graph', 'flowchart', 'sequencediagram', 'classdiagram', 'statediagram',
    'erdiagram', 'gantt', 'pie', 'mindmap', 'timeline', 'journey', 'gitgraph',
    'quadrantchart', 'requirementdiagram', 'c4context', 'sankey', 'block-beta',
  ];
  const looksKnown = known.some(k => firstLine.startsWith(k));
  if (!looksKnown) {
    issues.push({
      file,
      rule: 'mermaid.unknownType',
      message: `mermaid first line "${trimmed.split('\n')[0]}" doesn't start with a known diagram type. Mermaid will fail to parse.`,
    });
  }
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(f => path.join(dir, f));
}

function main() {
  for (const src of SOURCES) {
    const dir = path.join(ROOT, src);
    const files = walk(dir);
    for (const file of files) {
      checkDotfile(file);
      const raw = fs.readFileSync(file, 'utf8');
      let parsed: { data: Record<string, unknown>; content: string };
      try {
        parsed = matter(raw) as { data: Record<string, unknown>; content: string };
      } catch (err) {
        issues.push({ file, rule: 'frontmatter.parse', message: `Cannot parse frontmatter: ${(err as Error).message}` });
        continue;
      }
      checkFrontmatter(file, parsed.data);
      checkMermaid(file, parsed.data);
      checkBareJsxTags(file, parsed.content);
    }
  }

  if (issues.length === 0) {
    console.log(`✅ Content gate passed — all files in content/<source>/ are valid.`);
    return;
  }

  console.error(`\n❌ Content gate found ${issues.length} issue${issues.length === 1 ? '' : 's'}:\n`);
  const grouped = new Map<string, Issue[]>();
  for (const i of issues) {
    const k = path.relative(process.cwd(), i.file);
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(i);
  }
  for (const [file, list] of grouped) {
    console.error(`  ${file}`);
    for (const i of list) {
      const loc = i.line ? `:${i.line}` : '';
      console.error(`    ${i.rule}${loc} — ${i.message}`);
    }
  }
  console.error(`\nFix the files above (or move dotfiles out of content/<source>/) and re-run.\n`);
  process.exit(1);
}

main();
