import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const MY_PROFILE_UUID    = '00000000-0000-0000-0000-000000000001';
const OTHER_PROFILE_UUID = '00000000-0000-0000-0000-000000000002';

// ── Supabase mock chains ──────────────────────────────────────────────────────

const mockGetUser = vi.fn();

// anonymous_profiles: .select('id').eq(...).maybeSingle()
const mockMaybySingle   = vi.fn();
const mockProfileEq     = vi.fn().mockReturnValue({ maybeSingle: mockMaybySingle });
const mockProfileSelect = vi.fn().mockReturnValue({ eq: mockProfileEq });

// dm_messages GET: .select(...).or(...).order(...).limit(200)
const mockLimit  = vi.fn();
const mockOrder  = vi.fn().mockReturnValue({ limit: mockLimit });
const mockOr     = vi.fn().mockReturnValue({ order: mockOrder });
const mockDmSelect = vi.fn().mockReturnValue({ or: mockOr });

// dm_messages PATCH: .update({}).eq(...).eq(...).is(...)
const mockIs         = vi.fn().mockResolvedValue({ error: null });
const mockUpdateEq2  = vi.fn().mockReturnValue({ is: mockIs });
const mockUpdateEq1  = vi.fn().mockReturnValue({ eq: mockUpdateEq2 });
const mockUpdate     = vi.fn().mockReturnValue({ eq: mockUpdateEq1 });

const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'anonymous_profiles') return { select: mockProfileSelect };
  return { select: mockDmSelect, update: mockUpdate };
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

const { GET, PATCH } = await import('@/app/api/network/messages/[profileId]/route');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeParams(profileId: string) {
  return { params: Promise.resolve({ profileId }) };
}

function makeRequest(method: string, profileId: string) {
  return new NextRequest(`http://localhost/api/network/messages/${profileId}`, { method });
}

const sampleMessages = [
  {
    id: 'msg-1',
    sender_profile_id:    MY_PROFILE_UUID,
    recipient_profile_id: OTHER_PROFILE_UUID,
    content:              'Hello',
    created_at:           '2026-01-01T00:00:00Z',
    read_at:              null,
    deleted_by_sender:    false,
    deleted_by_recipient: false,
  },
  {
    id: 'msg-2',
    sender_profile_id:    OTHER_PROFILE_UUID,
    recipient_profile_id: MY_PROFILE_UUID,
    content:              'Hi back',
    created_at:           '2026-01-01T00:01:00Z',
    read_at:              null,
    deleted_by_sender:    false,
    deleted_by_recipient: false,
  },
];

function resetChains() {
  mockMaybySingle.mockResolvedValue({ data: { id: MY_PROFILE_UUID }, error: null });
  mockProfileEq.mockReturnValue({ maybeSingle: mockMaybySingle });
  mockProfileSelect.mockReturnValue({ eq: mockProfileEq });

  mockLimit.mockResolvedValue({ data: sampleMessages, error: null });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockOr.mockReturnValue({ order: mockOrder });
  mockDmSelect.mockReturnValue({ or: mockOr });

  mockIs.mockResolvedValue({ error: null });
  mockUpdateEq2.mockReturnValue({ is: mockIs });
  mockUpdateEq1.mockReturnValue({ eq: mockUpdateEq2 });
  mockUpdate.mockReturnValue({ eq: mockUpdateEq1 });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'anonymous_profiles') return { select: mockProfileSelect };
    return { select: mockDmSelect, update: mockUpdate };
  });
}

// ── GET tests ─────────────────────────────────────────────────────────────────

describe('GET /api/network/messages/[profileId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    resetChains();
  });

  it('returns 400 when profileId is not a valid UUID', async () => {
    // Route returns before reaching auth — no user mock needed
    const res = await GET(makeRequest('GET', 'not-a-uuid'), makeParams('not-a-uuid'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid profileid/i);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await GET(makeRequest('GET', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(res.status).toBe(401);
  });

  it('returns 403 when user has no network profile', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle.mockResolvedValueOnce({ data: null, error: null });
    const res = await GET(makeRequest('GET', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(res.status).toBe(403);
  });

  it('returns 200 with visible messages on success', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await GET(makeRequest('GET', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  it('hides messages deleted by sender from the sender', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const msgs = [
      { ...sampleMessages[0], deleted_by_sender: true },
      sampleMessages[1],
    ];
    mockLimit.mockResolvedValueOnce({ data: msgs, error: null });
    const res  = await GET(makeRequest('GET', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    const body = await res.json();
    // msg-1 sent by me and deleted_by_sender — should be hidden
    expect(body.find((m: { id: string }) => m.id === 'msg-1')).toBeUndefined();
    expect(body.find((m: { id: string }) => m.id === 'msg-2')).toBeDefined();
  });

  it('hides messages deleted by recipient from the recipient', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const msgs = [
      sampleMessages[0],
      { ...sampleMessages[1], deleted_by_recipient: true },
    ];
    mockLimit.mockResolvedValueOnce({ data: msgs, error: null });
    const res  = await GET(makeRequest('GET', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    const body = await res.json();
    // msg-2 sent by other and deleted_by_recipient — hidden from my (recipient) view
    expect(body.find((m: { id: string }) => m.id === 'msg-2')).toBeUndefined();
    expect(body.find((m: { id: string }) => m.id === 'msg-1')).toBeDefined();
  });

  it('returns 500 when dm_messages query errors', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockLimit.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });
    const res = await GET(makeRequest('GET', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(res.status).toBe(500);
  });
});

// ── PATCH tests ───────────────────────────────────────────────────────────────

describe('PATCH /api/network/messages/[profileId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    resetChains();
  });

  it('returns 400 when profileId is not a valid UUID', async () => {
    // Route returns before reaching auth — no user mock needed
    const res = await PATCH(makeRequest('PATCH', 'bad-id'), makeParams('bad-id'));
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await PATCH(makeRequest('PATCH', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(res.status).toBe(401);
  });

  it('returns 403 when user has no network profile', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockMaybySingle.mockResolvedValueOnce({ data: null, error: null });
    const res = await PATCH(makeRequest('PATCH', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(res.status).toBe(403);
  });

  it('returns 200 with { ok: true } when marking thread as read', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await PATCH(makeRequest('PATCH', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('calls update with sender_profile_id = profileId and recipient = myProfile.id', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    await PATCH(makeRequest('PATCH', OTHER_PROFILE_UUID), makeParams(OTHER_PROFILE_UUID));
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ read_at: expect.any(String) }));
    expect(mockUpdateEq1).toHaveBeenCalledWith('sender_profile_id', OTHER_PROFILE_UUID);
    expect(mockUpdateEq2).toHaveBeenCalledWith('recipient_profile_id', MY_PROFILE_UUID);
  });
});
