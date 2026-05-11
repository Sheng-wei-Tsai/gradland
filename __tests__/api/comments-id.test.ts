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

const { PATCH, DELETE } = await import('@/app/api/comments/[id]/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePatch(id: string, body: object) {
  return new NextRequest(`http://localhost/api/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function makeDeleteReq(id: string) {
  return new NextRequest(`http://localhost/api/comments/${id}`, { method: 'DELETE' });
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

// ── DELETE /api/comments/[id] ─────────────────────────────────────────────────
describe('DELETE /api/comments/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  it('returns 400 when id is not a valid UUID', async () => {
    const res = await DELETE(makeDeleteReq('not-a-uuid'), makeParams('not-a-uuid'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid id/i);
  });

  it('returns 401 when no session', async () => {
    const id = '00000000-0000-0000-0000-000000000001';
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await DELETE(makeDeleteReq(id), makeParams(id));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns 403 when comment belongs to another user (RLS-equivalent)', async () => {
    const id = '00000000-0000-0000-0000-000000000099';
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
      // Supabase returns an error (RLS denies delete when user_id doesn't match)
      return {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(makeThenableEq({ error: { message: 'insufficient privilege' } })),
        }),
      };
    });
    const res = await DELETE(makeDeleteReq(id), makeParams(id));
    expect(res.status).toBe(403);
  });
});

// ── PATCH /api/comments/[id] ──────────────────────────────────────────────────
describe('PATCH /api/comments/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  it('returns 400 when id is not a valid UUID', async () => {
    const res = await PATCH(makePatch('bad-id!!', { content: 'hello' }), makeParams('bad-id!!'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid id/i);
  });

  it('returns 400 when content exceeds 2000 chars', async () => {
    const id = '00000000-0000-0000-0000-000000000001';
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await PATCH(makePatch(id, { content: 'a'.repeat(2001) }), makeParams(id));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 200 and response includes edited_at timestamp', async () => {
    const id      = '00000000-0000-0000-0000-000000000001';
    const editedAt = '2026-05-07T01:00:00.000Z';
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id, content: 'fixed typo', edited_at: editedAt },
                error: null,
              }),
            }),
          }),
        }),
      }),
    });
    const res  = await PATCH(makePatch(id, { content: 'fixed typo' }), makeParams(id));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.comment).toBeDefined();
    expect(body.comment.edited_at).toBe(editedAt);
  });
});
