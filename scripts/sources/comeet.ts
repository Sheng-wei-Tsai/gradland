/**
 * Comeet direct API scraper.
 *
 * Public, no-auth endpoint:
 *   GET https://www.comeet.com/jobs/{uid}
 *   Accept: application/json
 *
 * Returns a JSON array of position objects with fields:
 *   name, uid, location, url_active_candidates, date_opened
 *
 * UID format: simple slug ("rokt") or hex-style ("74.006.F8D").
 * UID list: data/au-comeet-slugs.json
 * Each entry: { uid, company }.
 */

import { existsSync, readFileSync } from 'fs';
import { fetchJSON, isAULocation, isITJob, sleep, type RawSourceJob } from './types';

interface ComeetEntry { uid: string; company: string; }

interface ComeetPosition {
  uid?:                    string;
  name?:                   string;
  position_name?:          string;
  location?:               string | { city?: string; state?: string; country?: string };
  url_active_candidates?:  string;
  url?:                    string;
  date_opened?:            string;
  created_at?:             string;
  is_remote?:              boolean;
  remote?:                 boolean;
  employment_type?:        string;
}

type ComeetResponse = ComeetPosition[] | { positions?: ComeetPosition[] };

const SLUG_FILE  = 'data/au-comeet-slugs.json';
const SLUG_DELAY = 800;

function loadEntries(): ComeetEntry[] {
  if (!existsSync(SLUG_FILE)) return [];
  try { return JSON.parse(readFileSync(SLUG_FILE, 'utf8')); }
  catch { return []; }
}

function resolveLocation(loc: string | { city?: string; state?: string; country?: string } | undefined): string {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  return [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
}

async function fetchBoard(e: ComeetEntry): Promise<RawSourceJob[]> {
  try {
    const raw = await fetchJSON<ComeetResponse>(
      `https://www.comeet.com/jobs/${e.uid}`,
      { headers: { Accept: 'application/json' } },
    );
    const positions: ComeetPosition[] = Array.isArray(raw)
      ? raw
      : ((raw as { positions?: ComeetPosition[] }).positions ?? []);
    const out: RawSourceJob[] = [];
    for (const p of positions) {
      const title = p.name ?? p.position_name;
      if (!title || !isITJob(title)) continue;
      const loc    = resolveLocation(p.location);
      const remote = p.is_remote === true || p.remote === true;
      if (!isAULocation(loc) && !remote) continue;
      const externalId = p.uid ?? title;
      const url = p.url_active_candidates ?? p.url
                  ?? `https://www.comeet.com/jobs/${e.uid}`;
      out.push({
        source:     'comeet',
        externalId,
        title,
        company:    e.company,
        location:   isAULocation(loc) ? loc : (remote ? 'Remote (AU)' : 'Australia'),
        url,
        created:    p.date_opened ?? p.created_at ?? new Date().toISOString(),
      });
    }
    return out;
  } catch (err) {
    const msg = (err as Error).message;
    if (!msg.includes('404') && !msg.includes('403')) console.warn(`  Comeet ${e.uid}: ${msg}`);
    return [];
  }
}

export async function scrapeComeet(): Promise<RawSourceJob[]> {
  const entries = loadEntries();
  if (!entries.length) {
    console.warn('  Comeet: no entries loaded');
    return [];
  }
  const all: RawSourceJob[] = [];
  for (const e of entries) {
    const jobs = await fetchBoard(e);
    if (jobs.length) console.log(`  Comeet ${e.uid}: ${jobs.length}`);
    all.push(...jobs);
    await sleep(SLUG_DELAY);
  }
  return all;
}
