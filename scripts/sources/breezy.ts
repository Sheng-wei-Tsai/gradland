/**
 * Breezy HR direct API scraper.
 *
 * Public, no-auth endpoint:
 *   GET https://{slug}.breezy.hr/json
 *
 * Returns a bare array of jobs. Each job has nested `location.country.name`,
 * `location.state.name`, `location.city`, `location.is_remote`.
 *
 * Slug list: data/au-breezy-slugs.json
 * Each entry: { slug, company }.
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface BreezySlug { slug: string; company: string; }

interface BreezyLocation {
  country?: { id?: string; name?: string };
  state?:   { id?: string; name?: string };
  city?:    string;
  name?:    string;
  is_remote?: boolean;
}

interface BreezyJob {
  id?:           string;
  friendly_id?:  string;
  name?:         string;
  url?:          string;
  published_date?: string;
  type?:         { id?: string; name?: string };
  location?:     BreezyLocation;
  salary?:       string;
}

const SLUG_FILE  = 'data/au-breezy-slugs.json';
const SLUG_DELAY = 800;

function loadSlugs(): BreezySlug[] {
  if (!existsSync(SLUG_FILE)) return [];
  try { return JSON.parse(readFileSync(SLUG_FILE, 'utf8')); }
  catch { return []; }
}

function jobLocation(j: BreezyJob): string {
  if (j.location?.name) return j.location.name;
  return [j.location?.city, j.location?.state?.name, j.location?.country?.name].filter(Boolean).join(', ');
}

async function fetchBoard(s: BreezySlug): Promise<RawSourceJob[]> {
  try {
    const jobs = await fetchJSON<BreezyJob[]>(`https://${s.slug}.breezy.hr/json`);
    if (!Array.isArray(jobs)) return [];
    const out: RawSourceJob[] = [];
    for (const j of jobs) {
      if (!j.name || !isITJob(j.name)) continue;
      const loc    = jobLocation(j);
      const remote = j.location?.is_remote === true;
      if (!isAULocation(loc) && !remote) continue;
      const externalId = j.id ?? j.friendly_id ?? j.name;
      const url = j.url ?? `https://${s.slug}.breezy.hr/p/${j.friendly_id ?? j.id ?? ''}`;
      out.push({
        source:     'breezy',
        externalId,
        title:      j.name,
        company:    s.company,
        location:   isAULocation(loc) ? loc : (remote ? 'Remote (AU)' : 'Australia'),
        url,
        created:    j.published_date ?? new Date().toISOString(),
      });
    }
    return out;
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes('404') && !msg.includes('403')) console.warn(`  Breezy ${s.slug}: ${msg}`);
    return [];
  }
}

export async function scrapeBreezy(): Promise<RawSourceJob[]> {
  const slugs = loadSlugs();
  if (!slugs.length) {
    console.warn('  Breezy: no slugs loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const s of slugs) {
    const jobs = await fetchBoard(s);
    if (jobs.length) console.log(`  Breezy ${s.slug}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
