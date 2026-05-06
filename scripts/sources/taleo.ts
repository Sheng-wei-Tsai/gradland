/**
 * Oracle Taleo per-tenant REST scraper.
 *
 * Public, no-auth endpoint:
 *   GET https://{org}.taleo.net/careersection/rest/jobboard/visible/1/jobs
 *       ?lang=en&start=1&count=200&sortBy=POSTING_DATE&sortOrder=DESC
 *
 * Returns { requisitionList: [...], totalCount: N }
 * Apply URL: https://{org}.taleo.net/careersection/1/jobdetail.ftl?job={id}&lang=en
 *
 * Tenant list: data/au-taleo-tenants.json
 * Each entry: { org, company }
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface TaleoTenant { org: string; company: string; }

interface TaleoJob {
  id?:           number;
  title?:        string;
  organization?: string;
  location?:     string;
  postedDate?:   number;  // Unix ms
  referenceId?:  string;
}

interface TaleoResponse {
  requisitionList?: TaleoJob[];
  totalCount?:      number;
}

const TENANT_FILE = 'data/au-taleo-tenants.json';
const SLUG_DELAY  = 1000;

function loadTenants(): TaleoTenant[] {
  if (!existsSync(TENANT_FILE)) return [];
  try { return JSON.parse(readFileSync(TENANT_FILE, 'utf8')); }
  catch { return []; }
}

async function fetchBoard(t: TaleoTenant): Promise<RawSourceJob[]> {
  const base = `https://${t.org}.taleo.net/careersection/rest/jobboard/visible/1/jobs`;
  const url  = `${base}?lang=en&start=1&count=200&sortBy=POSTING_DATE&sortOrder=DESC`;
  try {
    const raw = await fetchJSON<TaleoResponse>(url);
    const jobs = raw.requisitionList ?? [];
    const out: RawSourceJob[] = [];
    for (const j of jobs) {
      const title = j.title?.trim();
      if (!title || !isITJob(title)) continue;
      const loc = j.location ?? '';
      // Accept if explicitly AU, or if location unknown (tenant is AU-anchored)
      if (loc && !isAULocation(loc)) continue;
      const id = String(j.id ?? j.referenceId ?? title);
      const applyUrl = `https://${t.org}.taleo.net/careersection/1/jobdetail.ftl?job=${j.id}&lang=en`;
      out.push({
        source:     'taleo',
        externalId: `${t.org}-${id}`,
        title,
        company:    t.company,
        location:   isAULocation(loc) ? loc : 'Australia',
        url:        applyUrl,
        created:    j.postedDate ? new Date(j.postedDate).toISOString() : new Date().toISOString(),
      });
    }
    return out;
  } catch (err) {
    const msg = (err as Error).message;
    // Suppress expected errors: wrong org (404), blocked (403), DNS miss (ENOTFOUND), auth (401)
    if (!msg.includes('404') && !msg.includes('403') && !msg.includes('401') && !msg.includes('ENOTFOUND')) {
      console.warn(`  Taleo ${t.org}: ${msg}`);
    }
    return [];
  }
}

export async function scrapeTaleo(): Promise<RawSourceJob[]> {
  const tenants = loadTenants();
  if (!tenants.length) {
    console.warn('  Taleo: no tenants loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const t of tenants) {
    const jobs = await fetchBoard(t);
    if (jobs.length) console.log(`  Taleo ${t.org}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
