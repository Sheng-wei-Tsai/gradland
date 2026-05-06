/**
 * SAP SuccessFactors per-tenant OData scraper.
 *
 * Public OData v2 endpoint (no auth needed when tenant allows anonymous reads):
 *   GET https://{apiHost}/odata/v2/JobExternalPosting
 *       ?companyId={id}&$format=json&$top=200&$filter=status%20eq%20%27Active%27
 *
 * Most APAC/AU tenants sit on api.successfactors.com (AP1/AP2).
 * Response: { d: { results: [{jobReqId, jobTitle, location, country, startDate}] } }
 *
 * Tenant list: data/au-successfactors-tenants.json
 * Each entry: { companyId, host, company }
 *   companyId: SF company identifier (case-sensitive, e.g. "COLES")
 *   host:      OData API host (e.g. "api.successfactors.com")
 *   company:   display name
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface SFTenant {
  companyId: string;
  host:      string;
  company:   string;
}

interface SFJob {
  jobReqId?:               string | number;
  jobTitle?:               string;
  location?:               string;
  country?:                string;
  status?:                 string;
  startDate?:              string;  // OData v2 format: /Date(1714435200000)/
  externalJobDescription?: string;
}

interface SFODataResponse {
  d?: { results?: SFJob[] };
}

const TENANT_FILE = 'data/au-successfactors-tenants.json';
const SLUG_DELAY  = 1200;

function loadTenants(): SFTenant[] {
  if (!existsSync(TENANT_FILE)) return [];
  try { return JSON.parse(readFileSync(TENANT_FILE, 'utf8')); }
  catch { return []; }
}

function parseSFDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString();
  const ms = raw.match(/\/Date\((\d+)\)\//)?.[1];
  return ms ? new Date(Number(ms)).toISOString() : new Date().toISOString();
}

async function fetchBoard(t: SFTenant): Promise<RawSourceJob[]> {
  const filter = encodeURIComponent("status eq 'Active'");
  const url = `https://${t.host}/odata/v2/JobExternalPosting?companyId=${t.companyId}&$format=json&$top=200&$filter=${filter}`;
  try {
    const raw = await fetchJSON<SFODataResponse>(url);
    const jobs = raw?.d?.results ?? [];
    const out: RawSourceJob[] = [];
    for (const j of jobs) {
      const title = j.jobTitle?.trim();
      if (!title || !isITJob(title)) continue;
      const loc = [j.location, j.country].filter(Boolean).join(', ');
      // Accept if explicitly AU, or if location unknown (tenant is AU-anchored)
      if (loc && !isAULocation(loc)) continue;
      const id = String(j.jobReqId ?? title);
      const applyUrl = `https://${t.host}/careers/jobsearch?company=${t.companyId}#jobId=${id}`;
      out.push({
        source:      'successfactors',
        externalId:  `${t.companyId}-${id}`,
        title,
        company:     t.company,
        location:    isAULocation(loc) ? loc : 'Australia',
        url:         applyUrl,
        description: j.externalJobDescription ?? '',
        created:     parseSFDate(j.startDate),
      });
    }
    return out;
  } catch (err) {
    const msg = (err as Error).message;
    // Suppress expected errors: auth required (401), wrong tenant (404/403), DNS miss
    if (!msg.includes('401') && !msg.includes('404') && !msg.includes('403') && !msg.includes('ENOTFOUND')) {
      console.warn(`  SuccessFactors ${t.companyId}: ${msg}`);
    }
    return [];
  }
}

export async function scrapeSuccessFactors(): Promise<RawSourceJob[]> {
  const tenants = loadTenants();
  if (!tenants.length) {
    console.warn('  SuccessFactors: no tenants loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const t of tenants) {
    const jobs = await fetchBoard(t);
    if (jobs.length) console.log(`  SuccessFactors ${t.companyId}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
