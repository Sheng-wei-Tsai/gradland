import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const SENDER_UUID    = '00000000-0000-0000-0000-000000000001';
const RECIPIENT_UUID = '00000000-0000-0000-0000-000000000002';
const DM_DAILY_LIMIT = 20;

// ── Supabase mock chains ──────────────────────────────────────────────────────

const mockGetUser = vi.fn();

// anonymous_profiles: .select('id').eq(...).maybeSingle()
const mockMaybySingle   = vi.fn();
const mockProfileEq     = vi.fn().mockReturnValue({ maybeSingle: mockMaybySingle });
const mockProfileSelect = vi.fn().mockReturnValue({ eq: mockProfileEq });

// dm_messages count: .select(...).eq(...).gte(...)  → resolves to { count }
const mockGte        = vi.fn();
const mockDmCountEq  = vi.fn().mockReturnValue({ gte: mockGte });
const mockDmCountSel = vi.fn().mockReturnValue({ eq: mockDmCountEq });

// dm_messages insert: .insert({}).select('...').maybeSingle()
const mockInsertSingle = vi.fn();
const mockInsertSelect = vi.fn().mockReturnValue({ maybeSingle: mockInsertSingle });
const mockInsert       = vi.fn().mockReturnValue({ select: mockInsertSelect });

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'anonymous_profiles') return { select: mockProfileSelect };
  return { select: mockDmCountSel, insert: mockInsert };
});

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
  unauthorizedResponse: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 }),
  ),
}));

const { POST } = await import('@/app/api/network/messages/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makePost(body: object) {
  return new NextRequest('http://localhost/api/network/messages', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validBody = { recipient_profile_id: RECIPIENT_UUID, content: 'Hello there' };

describe('POST /api/network/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    // Rebuild chains after clearAllMocks
    mockMaybySingle.mockResolvedValue({ data: { id: SENDER_UUID }, error: null });
    mockProfileEq.mockReturnValue({ maybeSingle: mockMaybySingle });
    mockProfileSelect.mockReturnValue({ eq: mockProfileEq });

    mockGte.mockResolvedValue({ count: 0 });
    mockDmCountEq.mockReturnValue({ gte: mockGte });
    mockDmCountSel.mockReturnValue({ eq: mockDmCountEq });

    mockInsertSingle.mockResolvedValue({
      data: {
        id:                   '00000000-0000-0000-0000-000000000099',
        sender_profile_id:    SENDER_UUID,
        recipient_profile_id: RECIPIENT_UUID,
        content:              'Hello there',
        created_at:           new Date().toISOString(),
      },
      error: null,
    });
    mockInsertSelect.mockReturnValue({ maybeSingle: mockInsertSingle });
    mockInsert.mockReturnValue({ select: mockInsertSelect });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'anonymous_profiles') return { select: mockProfileSelect };
      return { select: mockDmCountSel, insert: mockInsert };
    });
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is invalid JSON', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const req = new NextRequest('http://localhost/api/network/messages', {
      method:  'POST',
      body:    'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when recipient_profile_id is not a valid UUID', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await POST(makePost({ ...validBody, recipient_profile_id: 'not-a-uuid' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid recipient/i);
  });

  it('returns 400 when content is empty', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await POST(makePost({ ...validBody, content: '   ' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/content/i);
  });

  it('returns 403 when sender has no network profile', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle.mockResolvedValueOnce({ data: null, error: null });
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(403);
  });

  it('returns 400 when recipient_profile_id equals own profile id (self-message)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle.mockResolvedValueOnce({ data: { id: SENDER_UUID }, error: null });
    const res  = await POST(makePost({ ...validBody, recipient_profile_id: SENDER_UUID }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/yourself/i);
  });

  it('returns 404 when recipient profile does not exist', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle
      .mockResolvedValueOnce({ data: { id: SENDER_UUID }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(404);
  });

  it('returns 429 when sender has reached DM_DAILY_LIMIT messages in the past 24h', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle
      .mockResolvedValueOnce({ data: { id: SENDER_UUID }, error: null })
      .mockResolvedValueOnce({ data: { id: RECIPIENT_UUID }, error: null });
    mockGte.mockResolvedValueOnce({ count: DM_DAILY_LIMIT });
    const res  = await POST(makePost(validBody));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('returns 429 when count exceeds DM_DAILY_LIMIT', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle
      .mockResolvedValueOnce({ data: { id: SENDER_UUID }, error: null })
      .mockResolvedValueOnce({ data: { id: RECIPIENT_UUID }, error: null });
    mockGte.mockResolvedValueOnce({ count: DM_DAILY_LIMIT + 5 });
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(429);
  });

  it('returns 201 with message on success', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle
      .mockResolvedValueOnce({ data: { id: SENDER_UUID }, error: null })
      .mockResolvedValueOnce({ data: { id: RECIPIENT_UUID }, error: null });
    mockGte.mockResolvedValueOnce({ count: 0 });
    const res  = await POST(makePost(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.content).toBe('Hello there');
  });

  it('returns 500 when Supabase insert fails', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle
      .mockResolvedValueOnce({ data: { id: SENDER_UUID }, error: null })
      .mockResolvedValueOnce({ data: { id: RECIPIENT_UUID }, error: null });
    mockGte.mockResolvedValueOnce({ count: 0 });
    mockInsertSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
  });
});
