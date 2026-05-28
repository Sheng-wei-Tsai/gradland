/**
 * One-shot seeder: walk data/claude-skills-topics.json and, for every topic
 * with empty `videoIds`, query YouTube Data API search.list with a query
 * derived from the topic's title + slug, then save the top N relevant video
 * IDs back into the pool.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... npx tsx scripts/seed-claude-skill-videos.ts [--per 2] [--dry-run] [--force]
 *
 * Default: writes 2 video IDs per topic that doesn't already have them.
 * `--force` overwrites existing arrays.
 *
 * Quota cost: YouTube search.list = 100 units per call. Default quota 10,000/day
 * = up to 100 topics per run. We have ~31 topics, so well under budget.
 */
import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();

import path from 'path';

const POOL_PATH = path.join(process.cwd(), 'data', 'claude-skills-topics.json');
const API_KEY   = process.env.YOUTUBE_API_KEY;
const PER_TOPIC = Number(process.argv.find(a => a.startsWith('--per='))?.split('=')[1] ?? 2);
const DRY_RUN   = process.argv.includes('--dry-run');
const FORCE     = process.argv.includes('--force');

if (!API_KEY) {
  console.error('YOUTUBE_API_KEY missing. Set it in .env.local or export before running.');
  process.exit(1);
}

interface PoolEntry {
  slug:             string;
  title:            string;
  shortLabel:       string;
  category:         string;
  videoIds:         string[];
  [k: string]:      unknown;
}

interface YtSearchItem {
  id:      { kind: string; videoId?: string };
  snippet: { title: string; channelTitle: string; description: string };
}

function buildQuery(t: PoolEntry): string {
  // Bias the query toward Claude Code + the topic's user-facing label.
  return `claude code ${t.shortLabel} tutorial`;
}

async function searchTop(query: string, limit: number): Promise<string[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', String(Math.max(limit, 5)));
  url.searchParams.set('order', 'relevance');
  url.searchParams.set('safeSearch', 'strict');
  url.searchParams.set('relevanceLanguage', 'en');
  url.searchParams.set('key', API_KEY!);

  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`YouTube ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json() as { items?: YtSearchItem[] };
  const items = data.items ?? [];

  // Light filter: drop obviously off-topic items (very short titles, "shorts" tag).
  const filtered = items.filter(it => {
    if (!it.id?.videoId) return false;
    const title = it.snippet.title.toLowerCase();
    if (title.length < 12) return false;
    return true;
  });

  return filtered.slice(0, limit).map(it => it.id.videoId!).filter(Boolean);
}

async function main() {
  const pool = JSON.parse(readFileSync(POOL_PATH, 'utf8')) as PoolEntry[];
  console.log(`Loaded ${pool.length} topics. Seeding up to ${PER_TOPIC} video(s) each.`);

  let touched = 0;
  let calls   = 0;

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  for (const t of pool) {
    if (!FORCE && t.videoIds && t.videoIds.length > 0) {
      console.log(`  skip (already has ${t.videoIds.length}): ${t.slug}`);
      continue;
    }
    try {
      const q = buildQuery(t);
      let ids: string[] = [];
      // Retry with exponential backoff on 429 from the per-minute quota.
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          ids = await searchTop(q, PER_TOPIC);
          break;
        } catch (err) {
          const msg = (err as Error).message;
          if (msg.includes('429') && attempt < 3) {
            const wait = 65_000 + attempt * 15_000;
            console.warn(`  429 on ${t.slug} — sleeping ${Math.round(wait / 1000)}s then retrying`);
            await sleep(wait);
            continue;
          }
          throw err;
        }
      }
      calls++;
      if (ids.length === 0) {
        console.warn(`  no results: ${t.slug} — query "${q}"`);
        continue;
      }
      t.videoIds = ids;
      touched++;
      console.log(`  ${t.slug}: ${ids.join(', ')}`);
      // Tiny gap so we don't slam the per-minute window on the next call.
      await sleep(800);
    } catch (err) {
      console.error(`  error on ${t.slug}: ${(err as Error).message}`);
      // Don't break — best-effort across the pool.
    }
  }

  console.log(`\nTouched ${touched} topic(s) in ${calls} API call(s) (${calls * 100} units).`);

  if (DRY_RUN) { console.log('Dry run — pool file untouched.'); return; }
  writeFileSync(POOL_PATH, JSON.stringify(pool, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${POOL_PATH}.`);
}

main().catch(err => { console.error(err); process.exit(1); });
