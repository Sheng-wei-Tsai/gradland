import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// ── Mocks ──────────────────────────────────────────────────────────────────────
const mockGetUser     = vi.fn();
const mockMaybeSingle = vi.fn();
const mockGte         = vi.fn();
const mockInsert      = vi.fn().mockResolvedValue({ error: null });

// Fluent chain for profiles: .select().eq().maybeSingle()
const profilesChain = {
  select: vi.fn().mockReturnThis(),
  eq:     vi.fn().mockReturnThis(),
  maybeSingle: mockMaybeSingle,
};

// Fluent chain for api_usage: .select().eq()[.eq()].gte()  OR  .insert()
const apiUsageChain = {
  select: vi.fn().mockReturnThis(),
  eq:     vi.fn().mockReturnThis(),
  gte:    mockGte,
  insert: mockInsert,
};

const mockFrom = vi.fn((table: string) =>
  table === 'profiles' ? profilesChain : apiUsageChain,
);

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
  // isOwner mirrors the real implementation but keyed to a test owner email
  isOwner: (email: string | undefined | null) =>
    !!(email && email.toLowerCase() === 'owner@test.com'),
  unauthorizedResponse: () =>
    NextResponse.json({ error: 'Auth required', code: 'UNAUTHENTICATED' }, { status: 401 }),
  subscriptionRequiredResponse: () =>
    NextResponse.json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' }, { status: 403 }),
  rateLimitResponse: () =>
    NextResponse.json({ error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' }, { status: 429 }),
}));

const {
  getSubscriptionStatus,
  checkRateLimit,
  checkEndpointRateLimit,
  recordUsage,
  requireSubscription,
} = await import('@/lib/subscription');

// ── getSubscriptionStatus ─────────────────────────────────────────────────────
describe('getSubscriptionStatus', () => {
  beforeEach(() => mockMaybeSingle.mockReset());

  it('returns {active:false, tier:"free"} when no profile row exists', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    expect(await getSubscriptionStatus('u1')).toEqual({ active: false, tier: 'free' });
  });

  it('returns {active:true, tier:"admin"} for admin tier', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'admin', subscription_expires_at: null },
    });
    expect(await getSubscriptionStatus('u1')).toEqual({ active: true, tier: 'admin' });
  });

  it('returns {active:true, tier:"pro"} for pro with no expiry (lifetime)', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'pro', subscription_expires_at: null },
    });
    expect(await getSubscriptionStatus('u1')).toEqual({ active: true, tier: 'pro' });
  });

  it('returns {active:true, tier:"pro"} for pro with a future expiry', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'pro', subscription_expires_at: future },
    });
    expect(await getSubscriptionStatus('u1')).toEqual({ active: true, tier: 'pro' });
  });

  it('returns {active:false, tier:"free"} for pro with an expired subscription', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'pro', subscription_expires_at: past },
    });
    expect(await getSubscriptionStatus('u1')).toEqual({ active: false, tier: 'free' });
  });

  it('returns {active:false, tier:"free"} for free tier', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'free', subscription_expires_at: null },
    });
    expect(await getSubscriptionStatus('u1')).toEqual({ active: false, tier: 'free' });
  });
});

// ── checkRateLimit (global 100/day limit) ─────────────────────────────────────
describe('checkRateLimit (global 100/day)', () => {
  beforeEach(() => mockGte.mockReset());

  it('returns true (within limit) when usage is below 100 calls', async () => {
    mockGte.mockResolvedValueOnce({ count: 99, error: null });
    expect(await checkRateLimit('u1')).toBe(true);
  });

  it('returns false (over limit) when usage meets or exceeds 100 calls', async () => {
    mockGte.mockResolvedValueOnce({ count: 100, error: null });
    expect(await checkRateLimit('u1')).toBe(false);
  });
});

// ── checkEndpointRateLimit ────────────────────────────────────────────────────
describe('checkEndpointRateLimit', () => {
  beforeEach(() => mockGte.mockReset());

  it('returns true without a DB call when endpoint has no configured limit', async () => {
    expect(await checkEndpointRateLimit('u1', 'no-such-endpoint')).toBe(true);
    expect(mockGte).not.toHaveBeenCalled();
  });

  it('returns true when call count is below the per-endpoint limit', async () => {
    mockGte.mockResolvedValueOnce({ count: 4, error: null });
    expect(await checkEndpointRateLimit('u1', 'gap-analysis')).toBe(true); // limit = 5
  });

  it('returns false when call count meets the per-endpoint limit', async () => {
    mockGte.mockResolvedValueOnce({ count: 5, error: null });
    expect(await checkEndpointRateLimit('u1', 'gap-analysis')).toBe(false); // limit = 5
  });
});

// ── recordUsage ───────────────────────────────────────────────────────────────
describe('recordUsage', () => {
  beforeEach(() => mockInsert.mockReset());

  it('inserts a row with user_id and endpoint into api_usage', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    await recordUsage('u1', 'cover-letter');
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(mockInsert.mock.calls[0][0]).toMatchObject({
      user_id:  'u1',
      endpoint: 'cover-letter',
    });
  });
});

// ── requireSubscription ───────────────────────────────────────────────────────
describe('requireSubscription', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockMaybeSingle.mockReset();
    mockGte.mockReset();
  });

  it('returns 401 when the request has no valid session', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const result = await requireSubscription();
    expect(result instanceof NextResponse).toBe(true);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns {user} for the platform owner without checking subscription', async () => {
    const user = { id: 'owner-id', email: 'owner@test.com' };
    mockGetUser.mockResolvedValueOnce({ data: { user }, error: null });
    const result = await requireSubscription();
    expect(result).toEqual({ user });
    expect(mockMaybeSingle).not.toHaveBeenCalled(); // no subscription DB check
  });

  it('returns 403 when authenticated user has free-tier subscription', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'user@example.com' } },
    });
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'free', subscription_expires_at: null },
    });
    const result = await requireSubscription();
    expect(result instanceof NextResponse).toBe(true);
    expect((result as NextResponse).status).toBe(403);
  });

  it('returns {user} for a pro user within the daily rate limit', async () => {
    const user = { id: 'pro-id', email: 'pro@example.com' };
    mockGetUser.mockResolvedValueOnce({ data: { user }, error: null });
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'pro', subscription_expires_at: null },
    });
    mockGte.mockResolvedValueOnce({ count: 50, error: null }); // well within 100
    const result = await requireSubscription();
    expect(result).toEqual({ user });
  });

  it('returns 429 when a pro user has exhausted the daily rate limit', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'pro-id', email: 'pro@example.com' } },
    });
    mockMaybeSingle.mockResolvedValueOnce({
      data: { subscription_tier: 'pro', subscription_expires_at: null },
    });
    mockGte.mockResolvedValueOnce({ count: 100, error: null }); // at limit → over
    const result = await requireSubscription();
    expect(result instanceof NextResponse).toBe(true);
    expect((result as NextResponse).status).toBe(429);
  });
});
