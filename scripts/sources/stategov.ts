/**
 * Australian State Government Job Board scrapers (HTML-based).
 *
 * Covers four state portals that have no public RSS or structured API:
 *   - NSW iWorkFor (iworkfor.nsw.gov.au) — React SPA, NEXT_DATA or HTML parse
 *   - VIC Careers  (careers.vic.gov.au)  — React SPA, NEXT_DATA or HTML parse
 *   - QLD SmartJobs (smartjobs.qld.gov.au) — Springboard ATS, POST form
 *   - WA Jobs (jobs.wa.gov.au)            — BigRedSky ASP.NET, GET form
 *
 * Each scraper returns RawSourceJob[] and fails silently so the orchestrator
 * can continue even if a state board blocks the request (403/429 common from
 * cloud IPs — these sites are behind WAFs that whitelist AU residential IPs).
 *
 * IT-relevance filter: isITJob() from ./types (same regex as all other sources).
 */

import { load as cheerioLoad } from 'cheerio';
import { isITJob, isAULocation, sleep, type RawSourceJob } from './types';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const HEADERS_HTML = {
  'User-Agent':      UA,
  Accept:            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-AU,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control':   'no-cache',
  Pragma:            'no-cache',
};

async function fetchHtml(url: string, init: RequestInit = {}): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      ...init,
      headers: { ...HEADERS_HTML, ...(init.headers ?? {}) },
    });
    if (res.status === 403 || res.status === 429) {
      console.warn(`  StateGov: ${url} → ${res.status} (WAF blocked — skipping)`);
      return null;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes('403') && !msg.includes('429')) {
      console.warn(`  StateGov fetch error ${url}: ${msg}`);
    }
    return null;
  }
}

// ── NSW iWorkFor ──────────────────────────────────────────────────────────────
// React/Next.js SPA. The server renders initial HTML with __NEXT_DATA__ JSON
// containing the job list. Falls back to parsing visible HTML job cards.

const NSW_SEARCH_URLS = [
  'https://iworkfor.nsw.gov.au/jobs/developer/all-agencies/all-organisations--entities/all-categories/all-locations/all-worktypes',
  'https://iworkfor.nsw.gov.au/jobs/engineer/all-agencies/all-organisations--entities/all-categories/all-locations/all-worktypes',
  'https://iworkfor.nsw.gov.au/jobs/ICT/all-agencies/all-organisations--entities/IT/all-locations/all-worktypes',
];

interface NswNextJob {
  id?:           string | number;
  jobTitle?:     string;
  title?:        string;
  jobId?:        string | number;
  advertiserName?: string;
  agencyName?:   string;
  organisation?: string;
  locationName?: string;
  location?:     string;
  salary?:       string;
  salaryText?:   string;
  jobUrl?:       string;
  url?:          string;
  expiryDate?:   string;
  postedDate?:   string;
}

function parseNswNextData(html: string): RawSourceJob[] {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return [];
  try {
    const nextData = JSON.parse(match[1]);
    // Traverse the Next.js props tree looking for job arrays
    const text    = JSON.stringify(nextData);
    const pageArr = text.match(/"jobs"\s*:\s*(\[[\s\S]*?\])/)?.[1];
    if (!pageArr) return [];
    const jobs: NswNextJob[] = JSON.parse(pageArr);
    return jobs.flatMap(j => {
      const title = j.jobTitle ?? j.title ?? '';
      if (!title || !isITJob(title)) return [];
      const id  = j.jobId ?? j.id ?? title;
      const url = j.jobUrl ?? j.url ?? `https://iworkfor.nsw.gov.au/jobs/${encodeURIComponent(title)}`;
      return [{
        source:     'nsw-iworkfor',
        externalId: String(id),
        title,
        company:    j.advertiserName ?? j.agencyName ?? j.organisation ?? 'NSW Government',
        location:   j.locationName ?? j.location ?? 'NSW',
        url,
        salary:     j.salary ?? j.salaryText ?? undefined,
        created:    j.postedDate ?? new Date().toISOString(),
      }];
    });
  } catch { return []; }
}

function parseNswHtmlCards(html: string): RawSourceJob[] {
  const $ = cheerioLoad(html);
  const jobs: RawSourceJob[] = [];

  // Try multiple selectors used by iWorkFor redesigns
  const cards = $('[class*="job-card"], [class*="jobCard"], article[class*="job"], li[class*="job"]');
  cards.each((_, el) => {
    const title   = $(el).find('[class*="title"], h2, h3').first().text().trim();
    if (!title || !isITJob(title)) return;
    const agency  = $(el).find('[class*="agency"], [class*="organisation"], [class*="company"]').first().text().trim();
    const loc     = $(el).find('[class*="location"]').first().text().trim();
    const sal     = $(el).find('[class*="salary"]').first().text().trim();
    const href    = $(el).find('a').first().attr('href') ?? '';
    const url     = href.startsWith('http') ? href : `https://iworkfor.nsw.gov.au${href}`;
    const eid     = href.match(/\/(\d+)/)?.[1] ?? title;

    jobs.push({
      source:     'nsw-iworkfor',
      externalId: eid,
      title,
      company:    agency || 'NSW Government',
      location:   loc || 'NSW',
      url,
      salary:     sal || undefined,
    });
  });
  return jobs;
}

export async function scrapeNSWiWorkFor(): Promise<RawSourceJob[]> {
  const seen = new Set<string>();
  const all: RawSourceJob[] = [];

  for (const url of NSW_SEARCH_URLS) {
    const html = await fetchHtml(url);
    if (!html) continue;

    // Prefer structured NEXT_DATA; fall back to HTML card parse
    const jobs = parseNswNextData(html).length
      ? parseNswNextData(html)
      : parseNswHtmlCards(html);

    for (const j of jobs) {
      if (!seen.has(j.externalId)) {
        seen.add(j.externalId);
        all.push(j);
      }
    }
    await sleep(2000);
  }

  if (all.length) console.log(`  NSW iWorkFor: ${all.length} IT jobs`);
  return all;
}

// ── VIC Careers ───────────────────────────────────────────────────────────────
// React SPA (careers.vic.gov.au). Tries __NEXT_DATA__ first, then HTML cards.

const VIC_SEARCH_URLS = [
  'https://www.careers.vic.gov.au/jobs?keyword=developer',
  'https://www.careers.vic.gov.au/jobs?keyword=engineer+ICT',
  'https://www.careers.vic.gov.au/jobs?keyword=software+engineer',
];

interface VicNextJob {
  id?:           string | number;
  title?:        string;
  jobTitle?:     string;
  organisation?: string;
  department?:   string;
  location?:     string;
  salary?:       string;
  url?:          string;
  slug?:         string;
  closingDate?:  string;
  datePosted?:   string;
}

function parseVicNextData(html: string): RawSourceJob[] {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return [];
  try {
    const raw = JSON.parse(match[1]);
    const str = JSON.stringify(raw);
    // Extract first array value for jobs/positions/listings key
    const m   = str.match(/"(?:jobs|positions|listings)"\s*:\s*(\[[\s\S]*?\])/);
    const arr = m?.[1];
    if (!arr) return [];
    const items: VicNextJob[] = JSON.parse(arr);
    return items.flatMap(j => {
      const title = j.jobTitle ?? j.title ?? '';
      if (!title || !isITJob(title)) return [];
      const id  = j.id ?? j.slug ?? title;
      const url = j.url
        ? (j.url.startsWith('http') ? j.url : `https://www.careers.vic.gov.au${j.url}`)
        : (j.slug ? `https://www.careers.vic.gov.au/job/${j.slug}` : 'https://www.careers.vic.gov.au/jobs');
      return [{
        source:     'vic-careers',
        externalId: String(id),
        title,
        company:    j.organisation ?? j.department ?? 'Victorian Government',
        location:   j.location ?? 'VIC',
        url,
        salary:     j.salary ?? undefined,
        created:    j.datePosted ?? new Date().toISOString(),
      }];
    });
  } catch { return []; }
}

function parseVicHtmlCards(html: string): RawSourceJob[] {
  const $ = cheerioLoad(html);
  const jobs: RawSourceJob[] = [];

  $('[class*="job-card"], [class*="JobCard"], article, [class*="listing-item"]').each((_, el) => {
    const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
    if (!title || !isITJob(title)) return;
    const org   = $(el).find('[class*="organisation"], [class*="department"], [class*="company"]').first().text().trim();
    const loc   = $(el).find('[class*="location"]').first().text().trim();
    const sal   = $(el).find('[class*="salary"]').first().text().trim();
    const href  = $(el).find('a[href]').first().attr('href') ?? '';
    const url   = href.startsWith('http') ? href : `https://www.careers.vic.gov.au${href}`;
    const eid   = href.match(/\/(\d+|[a-z0-9-]{6,})/)?.[1] ?? title;

    jobs.push({
      source:     'vic-careers',
      externalId: eid,
      title,
      company:    org || 'Victorian Government',
      location:   loc || 'VIC',
      url,
      salary:     sal || undefined,
    });
  });
  return jobs;
}

export async function scrapeVICCareers(): Promise<RawSourceJob[]> {
  const seen = new Set<string>();
  const all: RawSourceJob[] = [];

  for (const url of VIC_SEARCH_URLS) {
    const html = await fetchHtml(url);
    if (!html) continue;

    const jobs = parseVicNextData(html).length
      ? parseVicNextData(html)
      : parseVicHtmlCards(html);

    for (const j of jobs) {
      if (!seen.has(j.externalId)) {
        seen.add(j.externalId);
        all.push(j);
      }
    }
    await sleep(2000);
  }

  if (all.length) console.log(`  VIC Careers: ${all.length} IT jobs`);
  return all;
}

// ── QLD SmartJobs ─────────────────────────────────────────────────────────────
// Springboard ATS. Requires a POST with form body to get results.
// Occupational group 29 = "IT & Telecommunications".
// Results rendered as an HTML table.

const QLD_BASE    = 'https://smartjobs.qld.gov.au';
const QLD_ORG_ID  = '14904';
const QLD_RESULTS = `${QLD_BASE}/jobtools/jncustomsearch.searchResults`;
const QLD_JOB_URL = `${QLD_BASE}/jobtools/viewhtmldoc?in_servicecode=CUSTOMSEARCH&in_jdocId=`;

// POST body mimics the SmartJobs search form filtering for IT & Telecom
function qldFormBody(keyword: string): URLSearchParams {
  const p = new URLSearchParams();
  p.set('in_organid',    QLD_ORG_ID);
  p.set('in_skills',     keyword);
  p.set('in_others',     '"29"');       // IT & Telecommunications occupational group
  p.set('in_param1',     '');           // salary min (any)
  p.set('in_param2',     '');           // salary max (any)
  p.set('in_jobDate',    'Last 14 days');
  p.set('in_location',   '');
  p.set('in_multi01',    '');
  p.set('in_multi02',    '');
  p.set('in_multi03',    '');
  p.set('in_multi04',    '');
  return p;
}

async function fetchQldResults(keyword: string): Promise<RawSourceJob[]> {
  const body = qldFormBody(keyword);
  const html = await fetchHtml(QLD_RESULTS, {
    method:  'POST',
    body:    body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!html) return [];

  const $ = cheerioLoad(html);
  const jobs: RawSourceJob[] = [];

  // SmartJobs/Springboard result rows: table with clickable job links
  // Typical selector: 'table tr' or '.searchResults tr' — try several
  const rows = $('table tr, .searchResultsTable tr, .resultsTable tr').filter((_, el) => {
    return $(el).find('a[href*="viewhtmldoc"]').length > 0;
  });

  rows.each((_, el) => {
    const link    = $(el).find('a[href*="viewhtmldoc"]').first();
    const href    = link.attr('href') ?? '';
    const title   = link.text().trim();
    if (!title || !isITJob(title)) return;

    // Extract jdocId from the href for a stable external ID
    const jdocId  = href.match(/in_jdocId=(\d+)/i)?.[1] ?? href;
    const url     = href.startsWith('http') ? href : `${QLD_BASE}${href}`;

    // Remaining cells: department, location, salary, closing date
    const cells   = $(el).find('td');
    const dept    = cells.eq(1).text().trim() || 'Queensland Government';
    const loc     = cells.eq(2).text().trim() || 'QLD';
    const sal     = cells.eq(3).text().trim();

    jobs.push({
      source:     'qld-smartjobs',
      externalId: jdocId,
      title,
      company:    dept,
      location:   isAULocation(loc) ? loc : 'QLD',
      url:        url.includes('viewhtmldoc') ? url : `${QLD_JOB_URL}${jdocId}`,
      salary:     sal || undefined,
    });
  });

  // Fallback: sometimes results are in <div> blocks
  if (!jobs.length) {
    $('div[class*="job"], div[class*="result"], li[class*="job"]').each((_, el) => {
      const anchor = $(el).find('a').first();
      const title  = anchor.text().trim();
      if (!title || !isITJob(title)) return;
      const href   = anchor.attr('href') ?? '';
      const jdocId = href.match(/in_jdocId=(\d+)/i)?.[1] ?? href.slice(-8);
      const url    = href.startsWith('http') ? href : `${QLD_BASE}${href}`;
      jobs.push({
        source:     'qld-smartjobs',
        externalId: jdocId || title,
        title,
        company:    $(el).find('[class*="department"], [class*="agency"]').first().text().trim() || 'Queensland Government',
        location:   $(el).find('[class*="location"]').first().text().trim() || 'QLD',
        url,
      });
    });
  }

  return jobs;
}

export async function scrapeQLDSmartJobs(): Promise<RawSourceJob[]> {
  const keywords = ['ICT developer', 'software engineer', 'data analyst', 'cyber security'];
  const seen     = new Set<string>();
  const all: RawSourceJob[] = [];

  for (const kw of keywords) {
    const jobs = await fetchQldResults(kw);
    for (const j of jobs) {
      if (!seen.has(j.externalId)) {
        seen.add(j.externalId);
        all.push(j);
      }
    }
    await sleep(2500);
  }

  if (all.length) console.log(`  QLD SmartJobs: ${all.length} IT jobs`);
  return all;
}

// ── WA Government Jobs ────────────────────────────────────────────────────────
// BigRedSky ASP.NET e-Recruitment. GET-based search form.
// Results page: /Search/SearchJobsResult.aspx?KeywordEx=developer
// Job links: /ViewJob.aspx?JobId=XXXXX

const WA_BASE       = 'https://jobs.wa.gov.au';
const WA_SEARCH_URL = `${WA_BASE}/Search/SearchJobsResult.aspx`;

// Occupation category for IT roles in WA Government BigRedSky system
// Category ID 17 = "Information Technology" based on common BigRedSky taxonomy
const WA_KEYWORDS = ['developer', 'software engineer', 'ICT analyst', 'cyber security', 'data engineer'];

async function fetchWAResults(keyword: string): Promise<RawSourceJob[]> {
  const params = new URLSearchParams({
    KeywordEx:       keyword,
    ddlWorkType:     '0',
    ddlClassification: '0',
    ddlLocation:     '0',
    ddlOrganisation: '0',
    ddlWage:         '0',
    ddlDateFilter:   '14',  // last 14 days
  });
  const url  = `${WA_SEARCH_URL}?${params}`;
  const html = await fetchHtml(url);
  if (!html) return [];

  const $ = cheerioLoad(html);
  const jobs: RawSourceJob[] = [];

  // BigRedSky results: typically a table with class "searchresults" or "resultTable"
  // Each row: td with link to ViewJob.aspx, agency, location, salary, closing date
  const rows = $('table tr, .searchresults tr, .resultTable tr, #tblSearchResults tr').filter((_, el) => {
    return $(el).find('a[href*="ViewJob"], a[href*="viewjob"]').length > 0;
  });

  rows.each((_, el) => {
    const link    = $(el).find('a[href*="ViewJob"], a[href*="viewjob"]').first();
    const href    = link.attr('href') ?? '';
    const title   = link.text().trim();
    if (!title || !isITJob(title)) return;

    const jobId   = href.match(/JobId=(\d+)/i)?.[1] ?? href;
    const url     = href.startsWith('http') ? href : `${WA_BASE}${href}`;
    const cells   = $(el).find('td');
    const agency  = cells.eq(1).text().trim() || 'WA Government';
    const loc     = cells.eq(2).text().trim() || 'WA';
    const sal     = cells.eq(3).text().trim();

    jobs.push({
      source:     'wa-jobs',
      externalId: jobId,
      title,
      company:    agency,
      location:   isAULocation(loc) ? loc : 'WA',
      url,
      salary:     sal || undefined,
    });
  });

  // Fallback: BigRedSky sometimes renders in divs/lists
  if (!jobs.length) {
    $('[class*="job-listing"], [id*="job"], .jobrow').each((_, el) => {
      const link  = $(el).find('a').first();
      const title = link.text().trim();
      if (!title || !isITJob(title)) return;
      const href  = link.attr('href') ?? '';
      const jobId = href.match(/JobId=(\d+)/i)?.[1] ?? href.slice(-6);
      const url   = href.startsWith('http') ? href : `${WA_BASE}${href}`;
      jobs.push({
        source:     'wa-jobs',
        externalId: jobId || title,
        title,
        company:    $(el).find('[class*="agency"], [class*="organisation"]').first().text().trim() || 'WA Government',
        location:   $(el).find('[class*="location"]').first().text().trim() || 'WA',
        url,
      });
    });
  }

  return jobs;
}

export async function scrapeWAJobs(): Promise<RawSourceJob[]> {
  const seen = new Set<string>();
  const all: RawSourceJob[] = [];

  for (const kw of WA_KEYWORDS) {
    const jobs = await fetchWAResults(kw);
    for (const j of jobs) {
      if (!seen.has(j.externalId)) {
        seen.add(j.externalId);
        all.push(j);
      }
    }
    await sleep(2000);
  }

  if (all.length) console.log(`  WA Jobs: ${all.length} IT jobs`);
  return all;
}

// ── Combined export ───────────────────────────────────────────────────────────

export async function scrapeStateGovBoards(): Promise<RawSourceJob[]> {
  const [nsw, vic, qld, wa] = await Promise.allSettled([
    scrapeNSWiWorkFor(),
    scrapeVICCareers(),
    scrapeQLDSmartJobs(),
    scrapeWAJobs(),
  ]);
  const results = [
    nsw.status === 'fulfilled' ? nsw.value : [],
    vic.status === 'fulfilled' ? vic.value : [],
    qld.status === 'fulfilled' ? qld.value : [],
    wa.status  === 'fulfilled' ? wa.value  : [],
  ];
  const total = results.reduce((s, a) => s + a.length, 0);
  console.log(`  State Gov total: NSW ${results[0].length} / VIC ${results[1].length} / QLD ${results[2].length} / WA ${results[3].length} = ${total}`);
  return results.flat();
}
