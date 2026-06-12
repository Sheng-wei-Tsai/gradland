export const SOURCE_PRECEDENCE = [
  'greenhouse', 'lever', 'workday', 'ashby',
  'workable', 'recruitee', 'breezy', 'comeet', 'icims', 'successfactors', 'taleo',
  'smartrec', 'apsjobs', 'hatch',
  'apify',
  'adzuna', 'googlejobs', 'google_jobs', 'jsearch',
  '80kh', 'jora', 'acs',
  'nsw-iworkfor', 'vic-careers', 'qld-smartjobs', 'wa-jobs',
  'remotive', 'jobicy',
] as const;

export type KnownSource = typeof SOURCE_PRECEDENCE[number];

const SOURCE_LABELS: Record<string, string> = {
  greenhouse:  'Greenhouse',
  lever:       'Lever',
  workday:     'Workday',
  ashby:       'Ashby',
  apify:       'Apify',
  adzuna:      'Adzuna',
  googlejobs:  'Google Jobs',
  google_jobs: 'Google Jobs',
  jsearch:     'Google Jobs',
  '80kh':      '80,000 Hours',
  jora:        'Jora',
  acs:         'ACS',
  remotive:    'Remotive',
  jobicy:      'Jobicy',
  indeed:      'Indeed',
  seek:        'Seek',
  linkedin:    'LinkedIn',
  smartrec:    'Smartrecruiters',
  apsjobs:     'APS Jobs',
  hatch:       'Hatch',
  workable:    'Workable',
  recruitee:   'Recruitee',
  breezy:      'Breezy HR',
  comeet:           'Comeet',
  icims:            'iCIMS',
  successfactors:   'SAP SuccessFactors',
  taleo:            'Oracle Taleo',
  'nsw-iworkfor':   'NSW iWorkFor',
  'vic-careers':    'VIC Careers',
  'qld-smartjobs':  'QLD SmartJobs',
  'wa-jobs':        'WA Government Jobs',
};

export function sourceLabel(name: string): string {
  return SOURCE_LABELS[name] ?? name;
}

export interface SourceRef {
  name:      string;
  label:     string;
  apply_url: string;
}

export function formatAttribution(sources: SourceRef[]): string {
  if (!sources.length) return '';
  const primary = sources[0];
  const extra   = sources.length - 1;
  return extra > 0 ? `via ${primary.label} + ${extra} ↗` : `via ${primary.label}`;
}

export function pickPrimarySource(sources: SourceRef[]): string {
  for (const p of SOURCE_PRECEDENCE) {
    if (sources.some(s => s.name === p)) return p;
  }
  return sources[0]?.name ?? 'unknown';
}

export function makeSingleSource(name: string, url: string): SourceRef[] {
  return [{ name, label: sourceLabel(name), apply_url: url }];
}

// ── Source groups — platform-level buckets for the /jobs filter chips ─────────

export type SourceGroup = 'seek' | 'indeed' | 'linkedin' | 'adzuna' | 'official' | 'gov' | 'boards';

export const SOURCE_GROUP_LABELS: Record<SourceGroup, string> = {
  seek:     'Seek',
  indeed:   'Indeed',
  linkedin: 'LinkedIn',
  adzuna:   'Adzuna',
  official: 'Official career sites',
  gov:      'Government',
  boards:   'Other boards',
};

// Display order for chips
export const SOURCE_GROUP_ORDER: SourceGroup[] = ['official', 'seek', 'indeed', 'linkedin', 'adzuna', 'gov', 'boards'];

const OFFICIAL_SOURCES = new Set([
  'greenhouse', 'lever', 'workday', 'ashby', 'workable', 'recruitee',
  'breezy', 'comeet', 'icims', 'successfactors', 'taleo', 'smartrec', 'hatch', 'apify',
]);

const GOV_SOURCES = new Set(['apsjobs', 'nsw-iworkfor', 'vic-careers', 'qld-smartjobs', 'wa-jobs']);

/**
 * Bucket a job into a platform group. Seek/Indeed/LinkedIn arrive indirectly
 * via JSearch / Google Jobs — detect them from the publisher name or apply URL.
 */
export function jobSourceGroup(source: string, publisher?: string, url?: string): SourceGroup {
  const pub  = (publisher ?? '').toLowerCase();
  const link = (url ?? '').toLowerCase();
  if (pub.includes('seek')     || link.includes('seek.com.au'))  return 'seek';
  if (pub.includes('indeed')   || link.includes('indeed.com'))   return 'indeed';
  if (pub.includes('linkedin') || link.includes('linkedin.com')) return 'linkedin';
  if (source === 'adzuna')          return 'adzuna';
  if (OFFICIAL_SOURCES.has(source)) return 'official';
  if (GOV_SOURCES.has(source))      return 'gov';
  return 'boards';
}
