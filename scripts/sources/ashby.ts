/**
 * Direct Ashby posting-api scraper — replaces the paid Apify Ashby actor.
 *
 * Public, no-auth endpoint:
 *   GET https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true
 *
 * Slug list: data/au-ashby-slugs.json
 * Each entry: { slug, company }.
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface AshbySlug { slug: string; company: string; }

interface AshbyJob {
  id:                 string;
  title:              string;
  location?:          string;
  locationName?:      string;
  employmentType?:    string;
  jobUrl?:            string;
  publishedAt?:       string;
  compensation?:      { compensationTierSummary?: string };
  isRemote?:          boolean;
  secondaryLocations?: Array<{ location?: string; locationName?: string }>;
}

interface AshbyResponse { jobs?: AshbyJob[]; }

const SLUG_FILE  = 'data/au-ashby-slugs.json';
const SLUG_DELAY = 800;

function loadSlugs(): AshbySlug[] {
  if (!existsSync(SLUG_FILE)) return [];
  try { return JSON.parse(readFileSync(SLUG_FILE, 'utf8')); }
  catch { return []; }
}

function locationsFor(j: AshbyJob): string[] {
  const main = j.location ?? j.locationName ?? '';
  const others = (j.secondaryLocations ?? [])
    .map(s => s.location ?? s.locationName ?? '')
    .filter(Boolean);
  return [main, ...others].filter(Boolean);
}

async function fetchBoard(s: AshbySlug): Promise<RawSourceJob[]> {
  try {
    const data = await fetchJSON<AshbyResponse>(
      `https://api.ashbyhq.com/posting-api/job-board/${s.slug}?includeCompensation=true`,
    );
    const jobs = data.jobs ?? [];
    const out: RawSourceJob[] = [];
    for (const j of jobs) {
      if (!isITJob(j.title)) continue;
      const locs = locationsFor(j);
      const auMatch = locs.find(isAULocation);
      if (!auMatch && !j.isRemote) continue;
      out.push({
        source:     'ashby',
        externalId: j.id,
        title:      j.title,
        company:    s.company,
        location:   auMatch ?? (j.isRemote ? 'Remote (AU)' : locs[0] ?? 'Australia'),
        url:        j.jobUrl ?? `https://jobs.ashbyhq.com/${s.slug}/${j.id}`,
        created:    j.publishedAt ?? new Date().toISOString(),
        salary:     j.compensation?.compensationTierSummary ?? null,
      });
    }
    return out;
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes('404')) console.warn(`  Ashby ${s.slug}: ${msg}`);
    return [];
  }
}

export async function scrapeAshby(): Promise<RawSourceJob[]> {
  const slugs = loadSlugs();
  if (!slugs.length) {
    console.warn('  Ashby: no slugs loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const s of slugs) {
    const jobs = await fetchBoard(s);
    if (jobs.length) console.log(`  Ashby ${s.slug}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
