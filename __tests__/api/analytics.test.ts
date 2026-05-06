import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Auth mock ──────────────────────────────────────────────────────────────────
const mockRequireAdmin = vi.fn();
const mockFrom         = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  requireAdmin:          mockRequireAdmin,
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ── Subscription mock (ai-insights) ───────────────────────────────────────────
const mockCheckEndpointRateLimit = vi.fn().mockResolvedValue(true);
const mockRecordUsage            = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/subscription', () => ({
  checkEndpointRateLimit: mockCheckEndpointRateLimit,
  recordUsage:            mockRecordUsage,
  rateLimitResponse: () =>
    new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
}));

// ── OpenAI mock (ai-insights) ─────────────────────────────────────────────────
const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function MockOpenAI() {
    return { chat: { completions: { create: mockCreate } } };
  }),
}));

// ── Route imports ─────────────────────────────────────────────────────────────
const { GET: summaryGET }      = await import('@/app/api/analytics/summary/route');
const { POST: aiInsightsPOST } = await import('@/app/api/analytics/ai-insights/route');

const ADMIN_USER = { id: 'admin-id', email: 'admin@test.com' };

// Builds a chainable Supabase query mock that resolves to { data, error: null }
function makeQueryChain(data: unknown[] = []) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.gte    = vi.fn().mockReturnValue(chain);
  chain.not    = vi.fn().mockReturnValue(chain);
  chain.order  = vi.fn().mockReturnValue(chain);
  chain.limit  = vi.fn().mockResolvedValue({ data, error: null });
  return chain;
}

// =============================================================================
// GET /api/analytics/summary
// =============================================================================
describe('GET /api/analytics/summary', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockFrom.mockReset();
  });

  it('returns 403 when caller is not an admin', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const res  = await summaryGET();
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('returns 200 with overview, daily, topPages, referrers, countries, devices', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    // All five parallel Supabase queries return empty arrays — route still builds full shape
    mockFrom.mockReturnValue(makeQueryChain([]));

    const res  = await summaryGET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('overview');
    expect(body).toHaveProperty('daily');
    expect(body).toHaveProperty('topPages');
    expect(body).toHaveProperty('referrers');
    expect(body).toHaveProperty('countries');
    expect(body).toHaveProperty('devices');
    // Always fills exactly 30 days (zeroed where no data)
    expect(body.daily).toHaveLength(30);
  });

  it('aggregates view counts and unique sessions correctly', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);

    const viewRows = [
      { created_at: '2026-05-01T10:00:00Z', session_id: 's1' },
      { created_at: '2026-05-01T11:00:00Z', session_id: 's2' },
      { created_at: '2026-05-01T12:00:00Z', session_id: 's1' }, // duplicate session
    ];

    mockFrom
      .mockReturnValueOnce(makeQueryChain(viewRows))  // allViews
      .mockReturnValueOnce(makeQueryChain([]))         // pagesRaw
      .mockReturnValueOnce(makeQueryChain([]))         // referrers
      .mockReturnValueOnce(makeQueryChain([]))         // countries
      .mockReturnValueOnce(makeQueryChain([]));        // devices

    const res  = await summaryGET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.overview.totalViews).toBe(3);
    expect(body.overview.uniqueSessions).toBe(2); // s1 deduped
  });
});

// =============================================================================
// POST /api/analytics/ai-insights
// =============================================================================
describe('POST /api/analytics/ai-insights', () => {
  const url = 'http://localhost/api/analytics/ai-insights';

  function makeRawPost(body: string) {
    return new NextRequest(url, {
      method:  'POST',
      body,
      headers: { 'content-type': 'application/json' },
    });
  }

  function makePost(body: object) {
    return makeRawPost(JSON.stringify(body));
  }

  const validPayload = {
    overview:  { totalViews: 100, uniqueSessions: 50, topDay: { date: '2026-05-01', views: 20 } },
    topPages:  [{ path: '/jobs', count: 40 }],
    referrers: [{ source: 'Google', count: 30 }],
    countries: [{ country: 'AU', count: 60 }],
    devices:   { desktop: 70, mobile: 25, tablet: 5 },
  };

  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockCheckEndpointRateLimit.mockResolvedValue(true);
    mockRecordUsage.mockResolvedValue(undefined);
    mockCreate.mockReset();
  });

  it('returns 403 when caller is not an admin', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const res  = await aiInsightsPOST(makePost(validPayload));
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    mockCheckEndpointRateLimit.mockResolvedValue(false);
    const res = await aiInsightsPOST(makePost(validPayload));
    expect(res.status).toBe(429);
  });

  it('returns 413 when payload exceeds 50 KB', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const oversized = 'x'.repeat(51 * 1024);
    const res  = await aiInsightsPOST(makeRawPost(oversized));
    const body = await res.json();
    expect(res.status).toBe(413);
    expect(body.error).toBe('Payload too large');
  });

  it('returns 400 on invalid JSON body', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await aiInsightsPOST(makeRawPost('{not valid json'));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid JSON');
  });

  it('returns 200 with suggestions array on valid payload', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const suggestions = [
      { title: 'Expand job listings', insight: 'High traffic on /jobs', action: 'Add 20 more job cards' },
    ];
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(suggestions) } }],
    });

    const res  = await aiInsightsPOST(makePost(validPayload));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.suggestions).toEqual(suggestions);
    expect(mockRecordUsage).toHaveBeenCalledWith(ADMIN_USER.id, 'analytics/ai-insights');
  });

  it('returns suggestions array even when OpenAI response is not parseable JSON', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'plain text, not JSON' } }],
    });

    const res  = await aiInsightsPOST(makePost(validPayload));
    const body = await res.json();
    expect(res.status).toBe(200);
    // Route falls back to a parse-error suggestion object
    expect(Array.isArray(body.suggestions)).toBe(true);
    expect(body.suggestions[0]).toHaveProperty('title');
  });
});
