/**
 * Hatch.team graduate jobs scraper.
 *
 * Tries the public JSON endpoint first; falls back to HTML scrape if 401/403.
 * Graduate-focused — high signal for international students on 485 visas.
 */

import { load as cheerioLoad } from 'cheerio';
import { fetchJSON, isAULocation, isITJob, type RawSourceJob } from './types';

const API_URL  = 'https://app.hatch.team/api/jobs?function=Engineering&location=Australia';
const HTML_URL = 'https://app.hatch.team/jobs?function=Engineering';

interface HatchJob {
  id:           string;
  title?:       string;
  companyName?: string;
  company?:     { name?: string };
  location?:    string;
  city?:        string;
  url?:         string;
  jobUrl?:      string;
  createdAt?:   string;
  publishedAt?: string;
}

interface HatchResponse { jobs?: HatchJob[]; data?: HatchJob[]; }

function normalizeJob(j: HatchJob): RawSourceJob | null {
  const title = j.title ?? '';
  if (!title || !isITJob(title)) return null;
  const loc = j.location ?? j.city ?? '';
  if (loc && !isAULocation(loc)) return null;
  return {
    source:     'hatch',
    externalId: j.id,
    title,
    company:    j.companyName ?? j.company?.name ?? 'Unknown',
    location:   loc || 'Australia',
    url:        j.url ?? j.jobUrl ?? `https://app.hatch.team/jobs/${j.id}`,
    created:    j.publishedAt ?? j.createdAt ?? new Date().toISOString(),
  };
}

async function tryApi(): Promise<RawSourceJob[]> {
  const data = await fetchJSON<HatchResponse>(API_URL);
  const items = data.jobs ?? data.data ?? [];
  return items.map(normalizeJob).filter((j): j is RawSourceJob => j !== null);
}

async function tryHtml(): Promise<RawSourceJob[]> {
  const res = await fetch(HTML_URL, {
    signal:  AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechPathAU/1.0)' },
  });
  if (!res.ok) return [];
  const html = await res.text();
  // Try to pull a JSON island that Hatch may inline.
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      const jobs: HatchJob[] =
        data?.props?.pageProps?.jobs ??
        data?.props?.pageProps?.initialJobs ??
        [];
      return jobs.map(normalizeJob).filter((j): j is RawSourceJob => j !== null);
    } catch { /* fall through to no-op */ }
  }
  // Last resort: nothing structured to extract; surface zero.
  cheerioLoad(html); // keep import used to avoid pruning
  return [];
}

export async function scrapeHatch(): Promise<RawSourceJob[]> {
  try {
    return await tryApi();
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes('401') || msg.includes('403') || msg.includes('404')) {
      try { return await tryHtml(); }
      catch (e2) {
        console.warn(`  Hatch fallback HTML: ${(e2 as Error).message}`);
        return [];
      }
    }
    console.warn(`  Hatch: ${msg}`);
    return [];
  }
}
