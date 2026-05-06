/**
 * Recruitee direct API scraper.
 *
 * Public, no-auth endpoint:
 *   GET https://{slug}.recruitee.com/api/offers/
 *
 * Slug list: data/au-recruitee-slugs.json
 * Each entry: { slug, company }.
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface RecruiteeSlug { slug: string; company: string; }

interface RecruiteeOffer {
  id?:          number | string;
  slug?:        string;
  title?:       string;
  location?:    string;
  city?:        string;
  country?:     string;
  country_code?: string;
  department?:  string;
  employment_type_code?: string;
  remote?:      boolean;
  url?:         string;
  careers_url?: string;
  careers_apply_url?: string;
  created_at?:  string;
  published_at?: string;
}

interface RecruiteeResponse { offers?: RecruiteeOffer[]; }

const SLUG_FILE  = 'data/au-recruitee-slugs.json';
const SLUG_DELAY = 800;

function loadSlugs(): RecruiteeSlug[] {
  if (!existsSync(SLUG_FILE)) return [];
  try { return JSON.parse(readFileSync(SLUG_FILE, 'utf8')); }
  catch { return []; }
}

function joinLocation(o: RecruiteeOffer): string {
  if (o.location) return o.location;
  return [o.city, o.country].filter(Boolean).join(', ');
}

async function fetchBoard(s: RecruiteeSlug): Promise<RawSourceJob[]> {
  try {
    const data = await fetchJSON<RecruiteeResponse>(
      `https://${s.slug}.recruitee.com/api/offers/`,
    );
    const offers = data.offers ?? [];
    const out: RawSourceJob[] = [];
    for (const o of offers) {
      if (!o.title || !isITJob(o.title)) continue;
      const loc = joinLocation(o);
      if (!isAULocation(loc) && !o.remote) continue;
      const externalId = String(o.id ?? o.slug ?? o.title);
      const url = o.careers_apply_url ?? o.careers_url ?? o.url
                  ?? `https://${s.slug}.recruitee.com/o/${o.slug ?? ''}`;
      out.push({
        source:     'recruitee',
        externalId,
        title:      o.title,
        company:    s.company,
        location:   isAULocation(loc) ? loc : (o.remote ? 'Remote (AU)' : 'Australia'),
        url,
        created:    o.published_at ?? o.created_at ?? new Date().toISOString(),
      });
    }
    return out;
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes('404')) console.warn(`  Recruitee ${s.slug}: ${msg}`);
    return [];
  }
}

export async function scrapeRecruitee(): Promise<RawSourceJob[]> {
  const slugs = loadSlugs();
  if (!slugs.length) {
    console.warn('  Recruitee: no slugs loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const s of slugs) {
    const jobs = await fetchBoard(s);
    if (jobs.length) console.log(`  Recruitee ${s.slug}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
