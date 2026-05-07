import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Shared mocks ──────────────────────────────────────────────────────────────
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
const mockFrom    = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

const { GET, POST }     = await import('@/app/api/comments/route');
const { PATCH, DELETE } = await import('@/app/api/comments/[id]/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeReq(method: string, url: string, body?: object) {
  return new NextRequest(url, {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

/**
 * Returns an object that is directly awaitable (admin delete path) AND has
 * an .eq() method (regular-user delete path), both resolving to `result`.
 */
function makeThenableEq(result: { error: { message: string } | null }) {
  return {
    then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
    eq: vi.fn().mockResolvedValue(result),
  };
}

// ── GET /api/comments ─────────────────────────────────────────────────────────
describe('GET /api/comments', () => {
  beforeEach(() => mockFrom.mockReset());

  it('returns 400 when slug param is missing', async () => {
    const res = await GET(makeReq('GET', 'http://localhost/api/comments'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when slug contains invalid characters', async () => {
    const res = await GET(makeReq('GET', 'http://localhost/api/comments?slug=UPPER_CASE'));
    expect(res.status).toBe(400);
  });

  it('returns 200 with a comments array on success', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    });
    const res  = await GET(makeReq('GET', 'http://localhost/api/comments?slug=my-post'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.comments)).toBe(true);
  });

  it('returns 500 when Supabase returns an error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
          }),
        }),
      }),
    });
    const res = await GET(makeReq('GET', 'http://localhost/api/comments?slug=my-post'));
    expect(res.status).toBe(500);
  });
});

// ── POST /api/comments ────────────────────────────────────────────────────────
describe('POST /api/comments', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  it('returns 401 without auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeReq('POST', 'http://localhost/api/comments', {
      post_slug: 'my-post', content: 'hello',
    }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when post_slug is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res  = await POST(makeReq('POST', 'http://localhost/api/comments', {
      post_slug: 'Invalid Slug!', content: 'hello',
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/slug/i);
  });

  it('returns 400 when content is empty', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res  = await POST(makeReq('POST', 'http://localhost/api/comments', {
      post_slug: 'my-post', content: '',
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/content/i);
  });

  it('returns 400 when content exceeds 2000 chars', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await POST(makeReq('POST', 'http://localhost/api/comments', {
      post_slug: 'my-post', content: 'a'.repeat(2001),
    }));
    expect(res.status).toBe(400);
  });

  it('returns 201 with the new comment on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'c1', post_slug: 'my-post', content: 'hello', parent_id: null },
            error: null,
          }),
        }),
      }),
    });
    const res  = await POST(makeReq('POST', 'http://localhost/api/comments', {
      post_slug: 'my-post', content: 'hello',
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.comment).toBeDefined();
  });
});

// ── PATCH /api/comments/[id] ──────────────────────────────────────────────────
describe('PATCH /api/comments/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  function makePatch(id: string, body: object) {
    return new NextRequest(`http://localhost/api/comments/${id}`, {
      method: 'PATCH', body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    });
  }

  it('returns 401 without auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(makePatch('c1', { content: 'updated' }), makeParams('c1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when content is empty', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await PATCH(makePatch('c1', { content: '' }), makeParams('c1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when content exceeds 2000 chars', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await PATCH(makePatch('c1', { content: 'a'.repeat(2001) }), makeParams('c1'));
    expect(res.status).toBe(400);
  });

  it('returns 403 when comment not found or caller is not the owner', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      }),
    });
    const res = await PATCH(makePatch('c1', { content: 'updated' }), makeParams('c1'));
    expect(res.status).toBe(403);
  });

  it('returns 200 with the updated comment on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'c1', content: 'updated', edited_at: '2026-05-06T00:00:00Z' },
                error: null,
              }),
            }),
          }),
        }),
      }),
    });
    const res  = await PATCH(makePatch('c1', { content: 'updated' }), makeParams('c1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.comment).toBeDefined();
  });
});

// ── DELETE /api/comments/[id] ─────────────────────────────────────────────────
describe('DELETE /api/comments/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  function makeDeleteReq(id: string) {
    return new NextRequest(`http://localhost/api/comments/${id}`, { method: 'DELETE' });
  }

  it('returns 401 without auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await DELETE(makeDeleteReq('c1'), makeParams('c1'));
    expect(res.status).toBe(401);
  });

  it('regular user can delete their own comment (200)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        };
      }
      return {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(makeThenableEq({ error: null })),
        }),
      };
    });
    const res  = await DELETE(makeDeleteReq('c1'), makeParams('c1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('admin can delete any comment (200)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-id' } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
            }),
          }),
        };
      }
      return {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(makeThenableEq({ error: null })),
        }),
      };
    });
    const res = await DELETE(makeDeleteReq('c1'), makeParams('c1'));
    expect(res.status).toBe(200);
  });

  it('returns 403 when Supabase delete fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        };
      }
      return {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(makeThenableEq({ error: { message: 'delete failed' } })),
        }),
      };
    });
    const res = await DELETE(makeDeleteReq('c1'), makeParams('c1'));
    expect(res.status).toBe(403);
  });
});
