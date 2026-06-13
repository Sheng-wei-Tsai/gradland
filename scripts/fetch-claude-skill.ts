/**
 * Daily Claude Code interactive lesson generator.
 *
 * Picks one topic from data/claude-code-topics.json that hasn't been published,
 * asks Claude Haiku to generate:
 *   - lesson body (markdown)
 *   - a 2-sentence excerpt
 *   - 3 multi-choice quiz questions (JSON)
 * Writes to content/claude-code/YYYY-MM-DD-<slug>.mdx with frontmatter that
 * includes a deterministic terminal_scenario built from the topic spec.
 *
 * Runs in .github/workflows/daily-claude-tip.yml. Falls back to GitHub Models
 * via lib/llm-claude.ts wrapper when Claude quota is exhausted.
 */
import dotenv from 'dotenv';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();

import path from 'path';
import { execFileSync } from 'child_process';
import { commitAndPublish } from './lib/git-publish';
import { claudeJSON, claudeMessage, ClaudeQuotaError } from './llm-claude';

const OUT_DIR    = path.join(process.cwd(), 'content', 'claude-skills');
const POOL_PATH  = path.join(process.cwd(), 'data', 'claude-skills-topics.json');
const DRY_RUN    = process.argv.includes('--dry-run');

interface PoolEntry {
  slug:              string;
  title:             string;
  shortLabel:        string;
  category:          string;
  tier:              number;
  position:          { x: number; y: number };
  prerequisites:     string[];
  docsUrl:           string;
  prompt:            string;
  terminalExpected:  string;
  xpReward:          number;
  videoIds:          string[];
}

interface QuizQuestion {
  q:           string;
  options:     string[];
  answer:      number;
  explanation: string;
}

function formatDate(d: Date) { return d.toISOString().split('T')[0]; }

function loadPool(): PoolEntry[] {
  const raw = readFileSync(POOL_PATH, 'utf8');
  return JSON.parse(raw) as PoolEntry[];
}

function existingSlugs(): Set<string> {
  if (!existsSync(OUT_DIR)) return new Set();
  return new Set(
    readdirSync(OUT_DIR)
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(f => f.replace(/\.(mdx|md)$/, '').slice(11)) // strip YYYY-MM-DD-
  );
}

function pickTopic(pool: PoolEntry[], done: Set<string>): PoolEntry {
  const fresh = pool.filter(t => !done.has(t.slug));
  if (fresh.length > 0) {
    // Earliest in the pool array — preserves curated priority order.
    return fresh[0];
  }
  // Pool exhausted — pick the topic published longest ago (least recent slug).
  return pool[Math.floor(Math.random() * pool.length)];
}

async function generateBody(t: PoolEntry): Promise<string> {
  const system = `You are a senior developer teaching Claude Code to peers.
Output ONLY the lesson body in Markdown. Do NOT include frontmatter (the host script handles that).
Length: 350–500 words.
Required section headings (in this order):
## What it does
## When to use it
## Try it yourself
## Gotchas
Rules:
- Plain prose, no marketing fluff.
- Code blocks must use fenced \`\`\`bash or \`\`\`ts.
- No bare JSX-style tags (write \`<Tag>\` in backticks if you must reference one).
- Don't link out — the host page adds the docs link separately.
- "Try it yourself" section should be 2–3 sentences pointing the reader at the terminal exercise below; do not write the command for them.`;

  return claudeMessage({
    model: 'claude-haiku-4-5-20251001',
    system,
    prompt: `Write today's Claude Code daily tip about: ${t.title}.\nTopic context: ${t.prompt}\nReference docs (do not link in body): ${t.docsUrl}`,
    retries: 2,
  });
}

async function generateExcerpt(t: PoolEntry): Promise<string> {
  return claudeMessage({
    model: 'claude-haiku-4-5-20251001',
    prompt: `Write a 2-sentence plain-prose excerpt for a Claude Code lesson titled "${t.title}". First sentence: what the reader will learn. Second: why it matters for an AI workflow. Under 50 words. No markdown.`,
    retries: 1,
  });
}

async function generateQuiz(t: PoolEntry): Promise<QuizQuestion[]> {
  // The shared claudeJSON helper looks for a single balanced {...} object,
  // so we wrap the array in `{ "quiz": [...] }` instead of returning a bare
  // array. This survives any preamble/postscript the model adds.
  const system = `You write multi-choice quiz questions for software developers learning Claude Code.
Output ONLY a valid JSON object with this exact shape:
{
  "quiz": [
    { "q": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "..." },
    { "q": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "..." },
    { "q": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "..." }
  ]
}
Rules:
- Exactly 3 questions, 4 options each.
- "answer" is the 0-based index of the correct option.
- Distractors must be plausible — no joke options.
- Explanations 1–2 sentences. No markdown.
- Cover different angles per question (mechanics, when-to-use, common mistakes).`;

  const fallback: { quiz: QuizQuestion[] } = { quiz: [] };
  const result = await claudeJSON<{ quiz: QuizQuestion[] }>({
    model: 'claude-haiku-4-5-20251001',
    system,
    prompt: `Topic: ${t.title}\nContext: ${t.prompt}\nReturn the JSON object now (no surrounding prose, no code fences).`,
    fallback,
    retries: 3,
  });

  const arr = result.quiz;
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Quiz generator returned empty/invalid JSON.');
  }
  return arr;
}

function validateQuiz(q: QuizQuestion[]): boolean {
  return q.every(
    item =>
      typeof item.q === 'string' &&
      Array.isArray(item.options) &&
      item.options.length >= 2 &&
      typeof item.answer === 'number' &&
      item.answer >= 0 &&
      item.answer < item.options.length &&
      typeof item.explanation === 'string',
  );
}

function buildTerminalScenario(t: PoolEntry): string {
  // Single-quoted YAML strings escape via doubled single quotes.
  const escape = (s: string) => s.replace(/'/g, "''");
  return [
    `terminal_scenario:`,
    `  prompt: '${escape(`Try the command for: ${t.title}`)}'`,
    `  hint: '${escape(`Need a nudge? The command starts with the symbol shown in the title.`)}'`,
    `  match: 'exact'`,
    `  expectedInput: '${escape(t.terminalExpected)}'`,
    `  successOutput: '${escape(`✓ Recognised: ${t.terminalExpected}\nGood. Review the gotchas above before you use this in a real session.`)}'`,
  ].join('\n');
}

function buildQuizYaml(q: QuizQuestion[]): string {
  // Use a JSON-in-YAML literal for safety — YAML accepts JSON arrays inline.
  return `quiz: ${JSON.stringify(q)}`;
}

function buildFrontmatter(t: PoolEntry, today: string, excerpt: string, quiz: QuizQuestion[]): string {
  const sanitizedExcerpt = excerpt.trim().replace(/"/g, '\\"').split('\n')[0];
  const prereqYaml = t.prerequisites.length === 0
    ? `prerequisites: []`
    : `prerequisites:\n${t.prerequisites.map(p => `  - ${p}`).join('\n')}`;
  const videoYaml = t.videoIds.length === 0
    ? `video_ids: []`
    : `video_ids:\n${t.videoIds.map(v => `  - ${v}`).join('\n')}`;
  return [
    '---',
    `title: "${t.title.replace(/"/g, '\\"')}"`,
    `date: "${today}"`,
    `excerpt: "${sanitizedExcerpt}"`,
    `tags: ["Claude Code", "AI Workflow", "${t.category}"]`,
    `topics: ["${t.terminalExpected.replace(/"/g, '\\"')}", "${t.category}"]`,
    `coverEmoji: "🌳"`,
    `category: "${t.category}"`,
    `short_label: "${t.shortLabel.replace(/"/g, '\\"')}"`,
    `tier: ${t.tier}`,
    `position:`,
    `  x: ${t.position.x}`,
    `  y: ${t.position.y}`,
    prereqYaml,
    `docs_url: "${t.docsUrl}"`,
    `xp_reward: ${t.xpReward}`,
    videoYaml,
    `auto_generated: true`,
    `ai_enriched: true`,
    buildTerminalScenario(t),
    buildQuizYaml(quiz),
    '---',
    '',
  ].join('\n');
}

async function run() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const pool   = loadPool();
  const done   = existingSlugs();
  const topic  = pickTopic(pool, done);
  const today  = formatDate(new Date());
  const filename = `${today}-${topic.slug}.mdx`;
  const filepath = path.join(OUT_DIR, filename);

  if (existsSync(filepath)) {
    console.log(`Already published today: ${filename} — exiting cleanly.`);
    return;
  }

  console.log(`Generating Claude Code daily tip: ${topic.title}`);

  let body:    string;
  let excerpt: string;
  let quiz:    QuizQuestion[];
  try {
    body    = await generateBody(topic);
    excerpt = await generateExcerpt(topic);
    quiz    = await generateQuiz(topic);
  } catch (err) {
    if (err instanceof ClaudeQuotaError) throw err;
    console.error(`  generation failed:`, err);
    process.exit(1);
  }

  if (!validateQuiz(quiz)) {
    console.error('  quiz failed validation — refusing to publish:', JSON.stringify(quiz));
    process.exit(1);
  }

  const frontmatter = buildFrontmatter(topic, today, excerpt, quiz);
  const file = `${frontmatter}${body.trim()}\n`;

  writeFileSync(filepath, file, 'utf8');
  console.log(`Wrote ${filename} (${body.length} chars).`);

  if (DRY_RUN) {
    console.log('Dry run — skipping git commit.');
    return;
  }

  await commitAndPublish({
    add: ['content/claude-skills/'],
    message: `claude-skills: daily lesson ${today} — ${topic.title}`,
  });
}

run().catch(err => {
  if (err instanceof ClaudeQuotaError) {
    console.error('Claude quota exhausted:', err.message);
    process.exit(2);
  }
  console.error(err);
  process.exit(1);
});
