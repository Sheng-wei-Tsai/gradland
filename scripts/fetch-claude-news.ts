/**
 * Daily Claude / Anthropic news fetcher for the /posts/claude-code surface.
 *
 * Pulls from three sources:
 *   1. anthropic.com/news       (HTML scrape — same approach as fetch-ai-news.ts)
 *   2. anthropic.com/rss.xml    (research RSS — via rss-parser)
 *   3. code.claude.com sitemap  (HTML scrape — diff against data/claude-docs-seen.json)
 *
 * Writes News-shape markdown to content/claude-code/YYYY-MM-DD-<slug>.md.
 * No XP / terminal / quiz frontmatter — that lives under /learn/claude-skills.
 *
 * Cron: 22:00 UTC via .github/workflows/daily-claude-news.yml.
 */
import dotenv from 'dotenv';
import { existsSync } from 'fs';
if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import Parser from 'rss-parser';
import { claudeJSON, ClaudeQuotaError } from './llm-claude';

const OUT_DIR        = path.join(process.cwd(), 'content', 'claude-code');
const DOCS_SEEN_PATH = path.join(process.cwd(), 'data', 'claude-docs-seen.json');
const LOOKBACK_DAYS  = Number(process.argv.find(a => a.startsWith('--days='))?.split('=')[1] ?? 3);
const DRY_RUN        = process.argv.includes('--dry-run');

const parser = new Parser({ timeout: 20000 });

interface NewsItem {
  source:    'anthropic-news' | 'anthropic-rss' | 'claude-docs';
  title:     string;
  link:      string;
  isoDate:   string;
  excerpt:   string;
  slug:      string;
  coverEmoji: string;
}

interface Enrichment {
  summary:      string;
  whyItMatters: string;
  takeaways:    string[];
  coverEmoji:   string;
}

function formatDate(d: Date) { return d.toISOString().split('T')[0]; }
function sleep(ms: number)   { return new Promise<void>(r => setTimeout(r, ms)); }

function stripHtml(s: string) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function kebabCase(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 70).replace(/-+$/, '');
}

// ─── Anthropic /news (HTML scrape) ────────────────────────────────
async function scrapeAnthropicNews(cutoff: Date): Promise<NewsItem[]> {
  try {
    console.log('  Fetching anthropic.com/news...');
    const res = await fetch('https://www.anthropic.com/news', {
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GradlandBot/1.0)' },
    });
    if (!res.ok) { console.warn(`  WARNING: anthropic.com returned ${res.status}`); return []; }
    const html = await res.text();
    const seen = new Set<string>();
    const slugs: string[] = [];
    for (const m of html.matchAll(/href="(\/news\/[a-z0-9-]+)"/g)) {
      if (!seen.has(m[1]) && m[1] !== '/news') { seen.add(m[1]); slugs.push(m[1]); }
    }
    const items: NewsItem[] = [];
    for (const p of slugs.slice(0, 10)) {
      try {
        const articleUrl = `https://www.anthropic.com${p}`;
        const aRes = await fetch(articleUrl, {
          signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GradlandBot/1.0)' },
        });
        if (!aRes.ok) continue;
        const aHtml = await aRes.text();
        const rawTitle = aHtml.match(/property="og:title"\s+content="([^"]+)"/i)?.[1]
          ?? stripHtml(aHtml.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '');
        const title = rawTitle.replace(/\s*[|–—\\\/]\s*Anthropic.*$/i, '').trim();
        const pubTimeRaw = aHtml.match(/(?:property|name)="article:published_time"\s+content="([^"]+)"/i)?.[1] ?? '';
        if (!pubTimeRaw || !title || title.length < 5) { await sleep(300); continue; }
        const pubDate = new Date(pubTimeRaw);
        if (isNaN(pubDate.getTime()) || pubDate < cutoff) { await sleep(300); continue; }
        const articleParas = [...aHtml.matchAll(
          /<p[^>]+class="[^"]*(?:body|content|article|post|text|lead|intro|paragraph|prose|copy|rich)[^"]*"[^>]*>([\s\S]{60,800}?)<\/p>/gi,
        )].map(m => stripHtml(m[1])).filter(t => t.length > 50).slice(0, 6);
        const excerpt = articleParas.join('\n\n').slice(0, 1500);
        items.push({
          source:     'anthropic-news',
          title,
          link:       articleUrl,
          isoDate:    pubDate.toISOString(),
          excerpt,
          slug:       `${formatDate(pubDate)}-anthropic-${kebabCase(title)}`,
          coverEmoji: '📡',
        });
        await sleep(400);
      } catch { await sleep(300); }
    }
    console.log(`  anthropic.com/news: ${items.length} recent`);
    return items;
  } catch (err) {
    console.warn(`  WARNING: anthropic.com scrape failed: ${(err as Error).message}`);
    return [];
  }
}

// ─── Anthropic research RSS ────────────────────────────────────────
async function fetchAnthropicRss(cutoff: Date): Promise<NewsItem[]> {
  try {
    console.log('  Fetching anthropic.com/rss.xml...');
    const result = await parser.parseURL('https://www.anthropic.com/rss.xml');
    return (result.items ?? [])
      .filter(item => item.isoDate && new Date(item.isoDate) >= cutoff)
      .map(item => {
        const title = (item.title ?? 'Untitled').trim();
        const date  = item.isoDate ? formatDate(new Date(item.isoDate)) : formatDate(new Date());
        const excerpt = stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? '').slice(0, 1500);
        return {
          source:     'anthropic-rss' as const,
          title,
          link:       item.link ?? '',
          isoDate:    item.isoDate ?? '',
          excerpt,
          slug:       `${date}-anthropic-research-${kebabCase(title)}`,
          coverEmoji: '🔬',
        };
      });
  } catch (err) {
    console.warn(`  WARNING: anthropic RSS failed: ${(err as Error).message}`);
    return [];
  }
}

// ─── code.claude.com docs sitemap diff ─────────────────────────────
interface DocsSeen { urls: string[]; lastChecked: string }

function loadDocsSeen(): DocsSeen {
  if (!existsSync(DOCS_SEEN_PATH)) return { urls: [], lastChecked: '' };
  try { return JSON.parse(fs.readFileSync(DOCS_SEEN_PATH, 'utf8')) as DocsSeen; }
  catch { return { urls: [], lastChecked: '' }; }
}

function saveDocsSeen(state: DocsSeen) {
  if (!existsSync(path.dirname(DOCS_SEEN_PATH))) {
    fs.mkdirSync(path.dirname(DOCS_SEEN_PATH), { recursive: true });
  }
  fs.writeFileSync(DOCS_SEEN_PATH, JSON.stringify(state, null, 2));
}

async function diffClaudeDocs(): Promise<NewsItem[]> {
  try {
    console.log('  Fetching code.claude.com/sitemap.xml...');
    const res = await fetch('https://code.claude.com/sitemap.xml', {
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GradlandBot/1.0)' },
    });
    if (!res.ok) { console.warn(`  WARNING: code.claude.com sitemap returned ${res.status}`); return []; }
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(m => m[1])
      .filter(u => u.includes('/docs/en/'));

    const seen = loadDocsSeen();
    const seenSet = new Set(seen.urls);
    const newUrls = urls.filter(u => !seenSet.has(u));

    if (seen.urls.length === 0) {
      // First run — seed cache, don't post historical pages.
      saveDocsSeen({ urls, lastChecked: new Date().toISOString() });
      console.log(`  code.claude.com docs: seeded ${urls.length} URLs (no posts on first run).`);
      return [];
    }

    const items: NewsItem[] = [];
    for (const url of newUrls.slice(0, 5)) {
      try {
        const aRes = await fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GradlandBot/1.0)' },
        });
        if (!aRes.ok) continue;
        const aHtml = await aRes.text();
        const rawTitle = aHtml.match(/property="og:title"\s+content="([^"]+)"/i)?.[1]
          ?? stripHtml(aHtml.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '');
        const title = rawTitle.replace(/\s*[|–—\\\/]\s*Claude.*$/i, '').trim();
        if (!title || title.length < 4) continue;
        const description = aHtml.match(/(?:property|name)="(?:og:description|description)"\s+content="([^"]+)"/i)?.[1] ?? '';
        const today = formatDate(new Date());
        items.push({
          source:     'claude-docs',
          title:      `New docs page: ${title}`,
          link:       url,
          isoDate:    new Date().toISOString(),
          excerpt:    description.slice(0, 1500),
          slug:       `${today}-claude-docs-${kebabCase(title)}`,
          coverEmoji: '📘',
        });
        await sleep(300);
      } catch { /* swallow */ }
    }

    saveDocsSeen({ urls, lastChecked: new Date().toISOString() });
    console.log(`  code.claude.com docs: ${items.length} new page(s) since last run.`);
    return items;
  } catch (err) {
    console.warn(`  WARNING: code.claude.com diff failed: ${(err as Error).message}`);
    return [];
  }
}

// ─── Optional Claude enrichment ────────────────────────────────────
const ENRICH_SYSTEM = `You are a concise, opinionated technical analyst writing for developers who use Claude Code daily.
Summarise this Claude / Anthropic announcement and explain why it matters to AI-tool users.
Return strict JSON: { "summary": "...", "whyItMatters": "...", "takeaways": ["..."], "coverEmoji": "📡" }.
No marketing fluff.`;

async function enrich(item: NewsItem): Promise<Enrichment | null> {
  const fallback: Enrichment = { summary: '', whyItMatters: '', takeaways: [], coverEmoji: item.coverEmoji };
  try {
    const result = await claudeJSON<Enrichment>({
      model: 'claude-haiku-4-5-20251001',
      system: ENRICH_SYSTEM,
      prompt: `Title: ${item.title}\nSource: ${item.source}\nURL: ${item.link}\n\nContent:\n${item.excerpt.slice(0, 2500)}`,
      fallback,
      retries: 2,
    });
    if (!result.summary) return null;
    return result;
  } catch (err) {
    if (err instanceof ClaudeQuotaError) throw err;
    console.warn(`  WARNING: enrich failed for "${item.title}": ${(err as Error).message}`);
    return null;
  }
}

// ─── Write markdown ────────────────────────────────────────────────
function writeMarkdown(item: NewsItem, enrichment: Enrichment | null): string {
  const dateStr = item.isoDate ? formatDate(new Date(item.isoDate)) : formatDate(new Date());
  const emoji   = enrichment?.coverEmoji ?? item.coverEmoji;
  const safeTitle   = item.title.replace(/"/g, '\\"');
  const safeExcerpt = (enrichment?.summary || item.excerpt || item.title).slice(0, 160).replace(/"/g, '\\"').replace(/\n/g, ' ');
  const tags = ['Claude Code', item.source === 'claude-docs' ? 'Docs' : item.source === 'anthropic-rss' ? 'Research' : 'Announcement'];

  const fm = `---
title: "${safeTitle}"
date: "${dateStr}"
company: "anthropic"
source: "${item.source}"
source_url: "${item.link}"
excerpt: "${safeExcerpt}"
tags: ${JSON.stringify(tags)}
coverEmoji: "${emoji}"
auto_generated: true
ai_enriched: ${enrichment !== null}
---

*Source: [${item.source === 'claude-docs' ? 'Claude Code docs' : 'Anthropic'}](${item.link})*

`;

  if (!enrichment) {
    return fm + `## Summary\n\n${item.excerpt || item.title}\n`;
  }

  const tk = enrichment.takeaways.map(t => `- ${t}`).join('\n');
  return fm + `## Summary

${enrichment.summary}

## Why it matters

${enrichment.whyItMatters}

## Key takeaways

${tk}
`;
}

// ─── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log(`\nClaude / Anthropic news pipeline (last ${LOOKBACK_DAYS} day${LOOKBACK_DAYS > 1 ? 's' : ''})\n`);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);

  const [a, b, c] = await Promise.all([
    scrapeAnthropicNews(cutoff),
    fetchAnthropicRss(cutoff),
    diffClaudeDocs(),
  ]);
  const items = [...a, ...b, ...c];
  console.log(`\nTotal candidate items: ${items.length}`);

  let written = 0;
  for (const item of items) {
    const filename = `${item.slug}.md`;
    const filepath = path.join(OUT_DIR, filename);
    if (existsSync(filepath)) { console.log(`  skip (exists): ${filename}`); continue; }

    console.log(`  enriching + writing: ${filename}`);
    let enrichment: Enrichment | null = null;
    try {
      enrichment = await enrich(item);
    } catch (err) {
      if (err instanceof ClaudeQuotaError) {
        console.warn('  Claude quota hit — writing remaining items without enrichment.');
      } else {
        throw err;
      }
    }

    fs.writeFileSync(filepath, writeMarkdown(item, enrichment), 'utf8');
    written++;
  }

  if (written === 0) { console.log('\nNo new items written.'); return; }
  console.log(`\nWrote ${written} new item(s).`);

  if (DRY_RUN) { console.log('Dry run — skipping git commit.'); return; }
  execFileSync('git', ['add', 'content/claude-code/', 'data/claude-docs-seen.json'], { stdio: 'inherit' });
  execFileSync('git', ['commit', '-m', `claude-code: ${written} news item${written === 1 ? '' : 's'} ${formatDate(new Date())}`], { stdio: 'inherit' });
  execFileSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });
}

main().catch(err => {
  if (err instanceof ClaudeQuotaError) {
    console.error('Claude quota exhausted:', err.message);
    process.exit(2);
  }
  console.error(err);
  process.exit(1);
});
