/**
 * Direct Workday CXS scraper — replaces the paid Apify Workday actor.
 *
 * Each AU tenant exposes a public, no-auth endpoint:
 *   POST https://{tenant}.{wd}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs
 *   body: { appliedFacets:{}, limit, offset, searchText:"" }
 *
 * Tenant list: data/au-workday-tenants.json
 * Each entry: { tenant, wd:"wd1|wd3|wd5", site, company }.
 */

import { existsSync, readFileSync } from 'fs';
import { isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface WorkdayTenant { tenant: string; wd: string; site: string; company: string; }

interface WorkdayJobPosting {
  title:               string;
  externalPath:        string;
  locationsText?:      string;
  postedOn?:           string;
  bulletFields?:       string[];
}

interface WorkdayResponse { total?: number; jobPostings?: WorkdayJobPosting[]; }

const TENANTS_FILE = 'data/au-workday-tenants.json';
const PAGE_LIMIT   = 20;
const MAX_OFFSET   = 200;
const TENANT_DELAY = 1500;

function loadTenants(): WorkdayTenant[] {
  if (!existsSync(TENANTS_FILE)) return [];
  try { return JSON.parse(readFileSync(TENANTS_FILE, 'utf8')); }
  catch { return []; }
}

async function fetchTenantPage(t: WorkdayTenant, offset: number): Promise<WorkdayResponse | null> {
  const url = `https://${t.tenant}.${t.wd}.myworkdayjobs.com/wday/cxs/${t.tenant}/${t.site}/jobs`;
  try {
    const res = await fetch(url, {
      method:  'POST',
      signal:  AbortSignal.timeout(15000),
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
        'User-Agent':   'Mozilla/5.0 (compatible; TechPathAU/1.0)',
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit:         PAGE_LIMIT,
        offset,
        searchText:    '',
      }),
    });
    if (res.status === 404) return null;
    if (res.status === 429 || res.status === 403) {
      throw new Error(`HTTP ${res.status} (rate-limited or blocked)`);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as WorkdayResponse;
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes('404')) console.warn(`  Workday ${t.tenant}: ${msg}`);
    return null;
  }
}

async function fetchTenantJobs(t: WorkdayTenant): Promise<RawSourceJob[]> {
  const out: RawSourceJob[] = [];
  for (let offset = 0; offset < MAX_OFFSET; offset += PAGE_LIMIT) {
    const page = await fetchTenantPage(t, offset);
    if (!page?.jobPostings?.length) break;

    for (const j of page.jobPostings) {
      if (!isITJob(j.title)) continue;
      const loc = j.locationsText ?? '';
      if (!isAULocation(loc)) continue;       // global tenants — keep AU only
      const reqId = (j.bulletFields ?? [])[0] ?? j.externalPath.split('/').pop() ?? '';
      out.push({
        source:     'workday',
        externalId: reqId,
        title:      j.title,
        company:    t.company,
        location:   loc || 'Australia',
        url:        `https://${t.tenant}.${t.wd}.myworkdayjobs.com${j.externalPath}`,
        created:    j.postedOn ?? new Date().toISOString(),
      });
    }

    const total = page.total ?? 0;
    if (total > 0 && offset + PAGE_LIMIT >= total) break;
    await sleep(400);
  }
  return out;
}

export async function scrapeWorkday(): Promise<RawSourceJob[]> {
  const tenants = loadTenants();
  if (!tenants.length) {
    console.warn('  Workday: no tenants loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const t of tenants) {
    const jobs = await fetchTenantJobs(t);
    if (jobs.length) console.log(`  Workday ${t.tenant}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(TENANT_DELAY);
  }
  return all;
}
