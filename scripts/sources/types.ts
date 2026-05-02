/**
 * Shared types + helpers for per-source scrapers in scripts/sources/.
 *
 * Each source returns `RawSourceJob[]` — the orchestrator (`scrape-au-jobs.ts`)
 * passes them through `makeJob()` to materialise full `ScrapedJob` records.
 */

export interface RawSourceJob {
  source:       string;
  externalId:   string;
  title:        string;
  company:      string;
  location:     string;
  url:          string;
  description?: string;
  salary?:      string | null;
  salary_min?:  number | null;
  salary_max?:  number | null;
  created?:     string;
}

const IT_TITLE_RE = /\b(developer|engineer|devops|architect|analyst|scientist|dba|database|software|frontend|backend|fullstack|full.?stack|qa|tester|testing|security|cloud|aws|azure|gcp|machine.?learning|data|python|java|javascript|react|node|php|ruby|golang|kotlin|mobile|android|ios|sre|platform|infrastructure|network|systems|it.?support|helpdesk|cyber|soc|scrum|agile|product.?manager|ux|ui.?ux|devSecOps|ict|technology)\b/i;

export function isITJob(title: string): boolean {
  return IT_TITLE_RE.test(title);
}

const AU_LOC_RE = /\b(australia|sydney|melbourne|brisbane|perth|adelaide|canberra|hobart|darwin|gold.?coast|newcastle|wollongong|geelong|nsw|vic|qld|wa|sa|act|tas|nt|remote.*au|aus|au)\b/i;

export function isAULocation(loc: string | undefined): boolean {
  if (!loc) return false;
  return AU_LOC_RE.test(loc);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

export async function fetchJSON<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    ...init,
    headers: {
      'User-Agent':       UA,
      'Accept':           'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json() as Promise<T>;
}
