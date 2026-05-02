import { SOURCE_PRECEDENCE, type SourceRef } from './jobs-sources';

// ── Jaro-Winkler (inline — no extra package) ──────────────────────────────────

function jaro(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const len1 = s1.length, len2 = s2.length;
  const matchDist = Math.max(Math.floor(Math.max(len1, len2) / 2) - 1, 0);
  const m1 = new Uint8Array(len1);
  const m2 = new Uint8Array(len2);
  let matches = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDist);
    const end   = Math.min(i + matchDist + 1, len2);
    for (let j = start; j < end; j++) {
      if (m2[j] || s1[i] !== s2[j]) continue;
      m1[i] = m2[j] = 1; matches++; break;
    }
  }
  if (!matches) return 0;

  let transpositions = 0, k = 0;
  for (let i = 0; i < len1; i++) {
    if (!m1[i]) continue;
    while (!m2[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
}

function jaroWinkler(s1: string, s2: string): number {
  const j = jaro(s1, s2);
  if (j < 0.7) return j;
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefix++; else break;
  }
  return j + prefix * 0.1 * (1 - j);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clusterKey(title: string, company: string): string {
  return `${title}|${company}`.toLowerCase().replace(/\s+/g, ' ').trim();
}

function canonicalUrl(url: string): string {
  try {
    const u = new URL(url);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
      .forEach(p => u.searchParams.delete(p));
    return u.origin + u.pathname.replace(/\/$/, '') + (u.search || '');
  } catch {
    return url.replace(/[?#].*$/, '').replace(/\/$/, '');
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DedupableJob {
  id:             string;
  title:          string;
  company:        string;
  url:            string;
  primary_source: string;
  sources:        SourceRef[];
  [key: string]:  unknown;
}

// ── Merge two jobs — keep higher-precedence primary, union sources ─────────────

function merge<T extends DedupableJob>(a: T, b: T): T {
  const aIdx = SOURCE_PRECEDENCE.indexOf(a.primary_source as KnownSource);
  const bIdx = SOURCE_PRECEDENCE.indexOf(b.primary_source as KnownSource);
  const base = (aIdx !== -1 && (bIdx === -1 || aIdx <= bIdx)) ? a : b;

  const seenNames = new Set<string>();
  const allSources: SourceRef[] = [];
  for (const s of [...(a.sources ?? []), ...(b.sources ?? [])]) {
    if (!seenNames.has(s.name)) { seenNames.add(s.name); allSources.push(s); }
  }
  return { ...base, sources: allSources };
}

type KnownSource = typeof SOURCE_PRECEDENCE[number];

// ── 3-pass deduplication ──────────────────────────────────────────────────────

export function deduplicateJobs<T extends DedupableJob>(jobs: T[]): T[] {
  // Pass 1 — exact cluster_key
  const clusterMap = new Map<string, T>();
  for (const job of jobs) {
    const key = clusterKey(job.title, job.company);
    const existing = clusterMap.get(key);
    clusterMap.set(key, existing ? merge(existing, job) : { ...job, sources: [...(job.sources ?? [])] });
  }

  // Pass 2 — fuzzy (Jaro-Winkler ≥ 0.92 on cluster_key, same company required)
  const arr = Array.from(clusterMap.values());
  const used = new Set<number>();
  const pass2: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (used.has(i)) continue;
    let base = arr[i];
    const co1 = arr[i].company.toLowerCase().trim();
    for (let j = i + 1; j < arr.length; j++) {
      if (used.has(j)) continue;
      const co2 = arr[j].company.toLowerCase().trim();
      if (co1 !== co2 && jaroWinkler(co1, co2) < 0.92) continue;
      const k1 = clusterKey(arr[i].title, arr[i].company);
      const k2 = clusterKey(arr[j].title, arr[j].company);
      if (jaroWinkler(k1, k2) >= 0.92) { base = merge(base, arr[j]); used.add(j); }
    }
    pass2.push(base);
    used.add(i);
  }

  // Pass 3 — URL canonical
  const urlMap = new Map<string, T>();
  for (const job of pass2) {
    const canon = canonicalUrl(job.url);
    if (!canon) { urlMap.set(job.id, job); continue; }
    const existing = urlMap.get(canon);
    urlMap.set(canon, existing ? merge(existing, job) : job);
  }

  return Array.from(urlMap.values());
}
