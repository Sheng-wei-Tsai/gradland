/**
 * Workable direct API scraper.
 *
 * Public, no-auth widget endpoint:
 *   GET https://apply.workable.com/api/v1/widget/accounts/{slug}
 *
 * Returns { name, description, jobs[] } where each job has top-level
 * country/city/state (not a nested location object).
 *
 * Slug list: data/au-workable-slugs.json
 * Each entry: { slug, company }.
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface WorkableSlug { slug: string; company: string; }

interface WorkableJob {
  id?:               string;
  shortcode?:        string;
  title:             string;
  url?:              string;
  shortlink?:        string;
  application_url?:  string;
  published_on?:     string;
  created_at?:       string;
  employment_type?:  string;
  telecommuting?:    boolean;
  country?:          string;
  city?:             string;
  state?:            string;
}

interface WorkableResponse { name?: string; description?: string | null; jobs?: WorkableJob[]; }

const SLUG_FILE  = 'data/au-workable-slugs.json';
const SLUG_DELAY = 800;

function loadSlugs(): WorkableSlug[] {
  if (!existsSync(SLUG_FILE)) return [];
  try { return JSON.parse(readFileSync(SLUG_FILE, 'utf8')); }
  catch { return []; }
}

function jobLocation(j: WorkableJob): string {
  return [j.city, j.state, j.country].filter(Boolean).join(', ');
}

async function fetchBoard(s: WorkableSlug): Promise<RawSourceJob[]> {
  try {
    const data = await fetchJSON<WorkableResponse>(
      `https://apply.workable.com/api/v1/widget/accounts/${s.slug}`,
    );
    const jobs = data.jobs ?? [];
    const out: RawSourceJob[] = [];
    for (const j of jobs) {
      if (!isITJob(j.title)) continue;
      const loc    = jobLocation(j);
      const remote = j.telecommuting === true;
      if (!isAULocation(loc) && !remote) continue;
      const externalId = j.shortcode ?? j.id ?? j.url ?? j.title;
      const url = j.shortlink ?? j.application_url ?? j.url
                  ?? `https://apply.workable.com/${s.slug}/j/${j.shortcode ?? ''}`;
      out.push({
        source:     'workable',
        externalId,
        title:      j.title,
        company:    s.company,
        location:   isAULocation(loc) ? loc : (remote ? 'Remote (AU)' : 'Australia'),
        url,
        created:    j.published_on ?? j.created_at ?? new Date().toISOString(),
      });
    }
    return out;
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes('404')) console.warn(`  Workable ${s.slug}: ${msg}`);
    return [];
  }
}

export async function scrapeWorkable(): Promise<RawSourceJob[]> {
  const slugs = loadSlugs();
  if (!slugs.length) {
    console.warn('  Workable: no slugs loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const s of slugs) {
    const jobs = await fetchBoard(s);
    if (jobs.length) console.log(`  Workable ${s.slug}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
