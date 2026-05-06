/**
 * iCIMS per-tenant RSS scraper.
 *
 * Public, no-auth RSS endpoint:
 *   GET https://careers-{slug}.icims.com/jobs/feed/rss?pr=0
 *
 * iCIMS is widely used by AU enterprise IT services firms.
 * Each company has its own subdomain — there is no centralized API.
 * Location may appear in custom XML namespace fields or embedded
 * in the description HTML; falls back to 'Australia' for AU-anchored slugs.
 *
 * Slug list: data/au-icims-slugs.json
 * Each entry: { slug, company }.
 */

import Parser from 'rss-parser';
import { existsSync, readFileSync } from 'fs';
import { isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface ICIMSSlug { slug: string; company: string; }

// rss-parser item extended with iCIMS custom namespace fields
interface ICIMSItem {
  title?:          string;
  link?:           string;
  guid?:           string;
  pubDate?:        string;
  content?:        string;
  contentSnippet?: string;
  // custom fields parsed from iCIMS RSS namespace
  'g2:location'?:  string;
  'g2:city'?:      string;
  'g2:state'?:     string;
  'g2:country'?:   string;
  location?:       string;
}

const SLUG_FILE  = 'data/au-icims-slugs.json';
const SLUG_DELAY = 1200; // polite delay — per-tenant servers, not a CDN

const parser = new Parser<Record<string, unknown>, ICIMSItem>({
  timeout: 20000,
  customFields: {
    item: [
      ['g2:location', 'g2:location'],
      ['g2:city',     'g2:city'],
      ['g2:state',    'g2:state'],
      ['g2:country',  'g2:country'],
      ['location',    'location'],
    ],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Accept':     'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
  },
});

function loadSlugs(): ICIMSSlug[] {
  if (!existsSync(SLUG_FILE)) return [];
  try { return JSON.parse(readFileSync(SLUG_FILE, 'utf8')); }
  catch { return []; }
}

function resolveLocation(item: ICIMSItem): string {
  // Try custom namespace fields first
  const g2loc = item['g2:location'];
  if (g2loc) return g2loc;

  const parts = [item['g2:city'], item['g2:state'], item['g2:country']].filter(Boolean);
  if (parts.length) return parts.join(', ');

  if (item.location) return item.location;

  // Try extracting from description HTML — iCIMS often embeds it as "Location: Sydney, NSW"
  const desc = item.content ?? item.contentSnippet ?? '';
  const m = desc.match(/[Ll]ocation[:\s]+([A-Za-z ,]+?)(?:<|\n|$)/);
  if (m) return m[1].trim();

  return '';
}

async function fetchBoard(entry: ICIMSSlug): Promise<RawSourceJob[]> {
  const rssUrl = `https://careers-${entry.slug}.icims.com/jobs/feed/rss?pr=0`;
  try {
    const feed = await parser.parseURL(rssUrl);
    const out: RawSourceJob[] = [];
    for (const item of feed.items) {
      const title = item.title?.trim();
      if (!title || !isITJob(title)) continue;

      const loc    = resolveLocation(item);
      // Accept if explicitly AU, or if location unknown (slug is AU-anchored company)
      if (loc && !isAULocation(loc)) continue;

      const url = item.link ?? rssUrl;
      out.push({
        source:     'icims',
        externalId: item.guid ?? url,
        title,
        company:    entry.company,
        location:   isAULocation(loc) ? loc : 'Australia',
        url,
        created:    item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      });
    }
    return out;
  } catch (err) {
    const msg = (err as Error).message;
    // Suppress expected errors: wrong slug (404), blocked (403), DNS miss (ENOTFOUND)
    if (!msg.includes('404') && !msg.includes('403') && !msg.includes('ENOTFOUND')) {
      console.warn(`  iCIMS ${entry.slug}: ${msg}`);
    }
    return [];
  }
}

export async function scrapeICIMS(): Promise<RawSourceJob[]> {
  const slugs = loadSlugs();
  if (!slugs.length) {
    console.warn('  iCIMS: no slugs loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const entry of slugs) {
    const jobs = await fetchBoard(entry);
    if (jobs.length) console.log(`  iCIMS ${entry.slug}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
