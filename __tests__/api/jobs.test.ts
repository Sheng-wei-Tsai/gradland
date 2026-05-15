import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase mock (for fetchScrapedJobs via createSupabaseServer) ────────────
// Chain: from().select().or().gt().gte().not().order().limit()
const mockLimit  = vi.fn().mockResolvedValue({ data: [], error: null });
const mockOrder  = vi.fn().mockReturnValue({ limit: mockLimit });
const mockNot    = vi.fn().mockReturnValue({ order: mockOrder });
const mockGte    = vi.fn().mockReturnValue({ not: mockNot });
const mockGt     = vi.fn().mockReturnValue({ gte: mockGte });
const mockOr     = vi.fn().mockReturnValue({ gt: mockGt });
const mockSelect = vi.fn().mockReturnValue({ or: mockOr });
const mockFrom   = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

// RAPIDAPI_KEY / SCRAPERAPI_KEY / ADZUNA_APP_ID / ADZUNA_APP_KEY are NOT set in
// the CI test env, so fetchGoogleJobs, fetchAdzuna, and fetchJSearch all
// early-return [] without making any fetch calls. Only fetchScrapedJobs runs.

const { GET } = await import('@/app/api/jobs/route');

function makeReq(params: Record<string, string> = {}): NextRequest {
  const sp = new URLSearchParams({ location: 'Sydney', ...params });
  return new NextRequest(`http://localhost/api/jobs?${sp}`);
}

function resetChain(data: unknown[] = [], error: null | { message: string } = null) {
  mockLimit.mockResolvedValue({ data, error });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockNot.mockReturnValue({ order: mockOrder });
  mockGte.mockReturnValue({ not: mockNot });
  mockGt.mockReturnValue({ gte: mockGte });
  mockOr.mockReturnValue({ gt: mockGt });
  mockSelect.mockReturnValue({ or: mockOr });
  mockFrom.mockReturnValue({ select: mockSelect });
}

const IT_ROW = {
  id: 'scraped-1', source: 'jora' as const, primary_source: 'jora',
  sources: null, sponsor_signal: false,
  title: 'Software Developer', company: 'Acme', location: 'Sydney NSW',
  description: 'Build software', salary: '$120k',
  salary_min: 120000, salary_max: 140000,
  url: 'https://acme.com/jobs/1', category: 'IT', contract_type: 'full-time',
  created: '2026-05-01T00:00:00Z',
};

describe('GET /api/jobs — AU tab', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('response always contains sources.{scraped,google,adzuna,jsearch} keys', async () => {
    const res  = await GET(makeReq());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('sources');
    expect(body.sources).toHaveProperty('scraped');
    expect(body.sources).toHaveProperty('google');
    expect(body.sources).toHaveProperty('adzuna');
    expect(body.sources).toHaveProperty('jsearch');
  });

  it('returns all-zero sources when Supabase has no rows', async () => {
    resetChain([]);
    const body = await (await GET(makeReq())).json();

    expect(body.sources).toEqual({ scraped: 0, google: 0, adzuna: 0, jsearch: 0 });
    expect(body.jobs).toEqual([]);
    expect(body.total).toBe(0);
  });

  it('sources.scraped equals the number of IT rows returned by Supabase', async () => {
    resetChain([IT_ROW]);
    const body = await (await GET(makeReq())).json();

    expect(body.sources.scraped).toBe(1);
    expect(body.jobs).toHaveLength(1);
    expect(body.jobs[0].title).toBe('Software Developer');
  });

  it('non-IT scraped rows are filtered out and not counted in sources.scraped', async () => {
    const nonITRow = { ...IT_ROW, id: 'scraped-2', title: 'Receptionist', company: 'Hotel' };
    resetChain([IT_ROW, nonITRow]);
    const body = await (await GET(makeReq())).json();

    // Receptionist does not match IT_TITLE_RE — only the developer row passes
    expect(body.sources.scraped).toBe(1);
    expect(body.jobs.every((j: { title: string }) => j.title !== 'Receptionist')).toBe(true);
  });

  it('returns 200 with zero sources when Supabase errors', async () => {
    resetChain([], { message: 'connection refused' });
    const res  = await GET(makeReq());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sources).toEqual({ scraped: 0, google: 0, adzuna: 0, jsearch: 0 });
    expect(body.jobs).toEqual([]);
  });

  it('deduplicates identical title+company rows from Supabase', async () => {
    const dup = { ...IT_ROW, id: 'scraped-dup', url: 'https://acme.com/jobs/2' };
    resetChain([IT_ROW, dup]);
    const body = await (await GET(makeReq())).json();

    // Both rows have same title + company → only 1 survives dedup
    expect(body.jobs).toHaveLength(1);
    expect(body.sources.scraped).toBe(1);
  });

  it('response includes scrapedCount + googleCount + adzunaCount + jsearchCount', async () => {
    resetChain([IT_ROW]);
    const body = await (await GET(makeReq())).json();

    expect(body).toHaveProperty('scrapedCount', 1);
    expect(body).toHaveProperty('googleCount',  0);
    expect(body).toHaveProperty('adzunaCount',  0);
    expect(body).toHaveProperty('jsearchCount', 0);
  });

  it('sanitizes script tags in job descriptions', async () => {
    const xssRow = { ...IT_ROW, id: 'xss-1', description: '<script>alert(1)</script>React dev' };
    resetChain([xssRow]);
    const body = await (await GET(makeReq())).json();

    expect(body.jobs[0].description).not.toContain('<script>');
    expect(body.jobs[0].description).toContain('React dev');
  });

  it('sanitizes single-quoted javascript: href in job descriptions', async () => {
    const xssRow = { ...IT_ROW, id: 'xss-2', description: "<a href='javascript:alert(1)'>click</a>" };
    resetChain([xssRow]);
    const body = await (await GET(makeReq())).json();

    expect(body.jobs[0].description).not.toContain("javascript:alert");
    expect(body.jobs[0].description).toContain("href='#'");
  });

  it('sanitizes unquoted javascript: href in job descriptions', async () => {
    const xssRow = { ...IT_ROW, id: 'xss-3', description: '<a href=javascript:alert(1)>click</a>' };
    resetChain([xssRow]);
    const body = await (await GET(makeReq())).json();

    expect(body.jobs[0].description).not.toContain('javascript:alert');
    expect(body.jobs[0].description).toContain('href="#"');
  });

  it('sanitizes unquoted event-handler attributes in job descriptions', async () => {
    const xssRow = { ...IT_ROW, id: 'xss-4', description: '<a onclick=alert(1) href="https://example.com">click</a>' };
    resetChain([xssRow]);
    const body = await (await GET(makeReq())).json();

    expect(body.jobs[0].description).not.toContain('onclick=');
    expect(body.jobs[0].description).toContain('href="https://example.com"');
  });

  it('tab=au is selected by default when tab param is omitted', async () => {
    resetChain([IT_ROW]);
    const body = await (await GET(makeReq())).json();

    // AU tab returns sources.scraped — if remote tab were selected it wouldn't call fetchScrapedJobs
    expect(body.sources).toHaveProperty('scraped');
    expect(body.sources).toHaveProperty('jsearch');
  });
});
