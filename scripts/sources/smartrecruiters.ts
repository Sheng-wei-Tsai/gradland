/**
 * Smartrecruiters posting-api scraper — free, no-auth.
 *
 *   GET https://api.smartrecruiters.com/v1/companies/{slug}/postings?country=au&limit=100
 *
 * Slug list: data/au-smartrecruiters-slugs.json
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface SrSlug { slug: string; company: string; }

interface SrPosting {
  id:               string;
  uuid?:            string;
  name:             string;
  refNumber?:       string;
  releasedDate?:    string;
  location?:        { city?: string; region?: string; country?: string; remote?: boolean };
  applyUrl?:        string;
  jobAd?:           { sections?: Record<string, { text?: string }> };
}

interface SrResponse { content?: SrPosting[]; totalFound?: number; }

const SLUG_FILE  = 'data/au-smartrecruiters-slugs.json';
const SLUG_DELAY = 1000;

function loadSlugs(): SrSlug[] {
  if (!existsSync(SLUG_FILE)) return [];
  try { return JSON.parse(readFileSync(SLUG_FILE, 'utf8')); }
  catch { return []; }
}

function locationOf(p: SrPosting): string {
  const loc = p.location;
  if (!loc) return 'Australia';
  const parts = [loc.city, loc.region, loc.country].filter(Boolean);
  return parts.join(', ') || 'Australia';
}

async function fetchCompany(s: SrSlug): Promise<RawSourceJob[]> {
  try {
    const data = await fetchJSON<SrResponse>(
      `https://api.smartrecruiters.com/v1/companies/${s.slug}/postings?country=au&limit=100`,
    );
    const postings = data.content ?? [];
    const out: RawSourceJob[] = [];
    for (const p of postings) {
      if (!isITJob(p.name)) continue;
      const loc = locationOf(p);
      if (!isAULocation(loc) && !p.location?.remote) continue;
      out.push({
        source:     'smartrec',
        externalId: p.id,
        title:      p.name,
        company:    s.company,
        location:   loc,
        url:        p.applyUrl ?? `https://jobs.smartrecruiters.com/${s.slug}/${p.id}`,
        created:    p.releasedDate ?? new Date().toISOString(),
      });
    }
    return out;
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes('404')) console.warn(`  Smartrec ${s.slug}: ${msg}`);
    return [];
  }
}

export async function scrapeSmartrecruiters(): Promise<RawSourceJob[]> {
  const slugs = loadSlugs();
  if (!slugs.length) {
    console.warn('  Smartrec: no slugs loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const s of slugs) {
    const jobs = await fetchCompany(s);
    if (jobs.length) console.log(`  Smartrec ${s.slug}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
