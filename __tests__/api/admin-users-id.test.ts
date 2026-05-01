import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Auth mock ──────────────────────────────────────────────────────────────────
const mockRequireAdmin = vi.fn();
const mockFrom = vi.fn();

// Makes a thenable chain — every node can be awaited directly or chained further.
// This mirrors Supabase's query builder where any step can be the final await.
function makeChain(resolved: unknown): Record<string, unknown> {
  return {
    then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(resolved).then(onFulfilled, onRejected),
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(resolved),
    }),
    single: vi.fn().mockResolvedValue(resolved),
    eq:     vi.fn().mockImplementation(() => makeChain(resolved)),
    update: vi.fn().mockImplementation(() => makeChain(resolved)),
    delete: vi.fn().mockImplementation(() => makeChain(resolved)),
  };
}

vi.mock('@/lib/auth-server', () => ({
  requireAdmin:          mockRequireAdmin,
  createSupabaseServer:  vi.fn().mockResolvedValue({ from: mockFrom }),
}));

const { PATCH, DELETE } = await import('@/app/api/admin/users/[id]/route');

function makePatch(id: string, body: object) {
  return new NextRequest(`http://localhost/api/admin/users/${id}`, {
    method:  'PATCH',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function makeDelete(id: string) {
  return new NextRequest(`http://localhost/api/admin/users/${id}`, {
    method: 'DELETE',
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

const ADMIN_USER     = { id: 'admin-id', email: 'admin@test.com' };
const PATCH_RESPONSE = {
  data: { id: 'u2', full_name: 'Bob', email: 'bob@test.com', role: 'admin' },
  error: null,
};

// ── PATCH ──────────────────────────────────────────────────────────────────────
describe('PATCH /api/admin/users/[id]', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockFrom.mockReset();
    mockFrom.mockImplementation(() => makeChain(PATCH_RESPONSE));
  });

  it('returns 403 when caller is not an admin', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const res = await PATCH(makePatch('u2', { role: 'admin' }), makeParams('u2'));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('returns 400 for an invalid role enum value', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res = await PATCH(makePatch('u2', { role: 'superuser' }), makeParams('u2'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid role');
  });

  it('returns 400 when role is missing entirely', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res = await PATCH(makePatch('u2', {}), makeParams('u2'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid role');
  });

  it('returns 200 with updated user on a valid role change', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res = await PATCH(makePatch('u2', { role: 'admin' }), makeParams('u2'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeDefined();
  });
});

// ── DELETE ─────────────────────────────────────────────────────────────────────
describe('DELETE /api/admin/users/[id]', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockFrom.mockReset();
    mockFrom.mockImplementation(() => makeChain({ error: null }));
  });

  it('returns 403 when caller is not an admin', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const res = await DELETE(makeDelete('u2'), makeParams('u2'));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('returns 400 when an admin tries to ban themselves (self-ban prevention)', async () => {
    mockRequireAdmin.mockResolvedValue({ id: 'admin-id' });
    const res = await DELETE(makeDelete('admin-id'), makeParams('admin-id'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Cannot ban yourself');
  });

  it('returns 200 when banning a different user', async () => {
    mockRequireAdmin.mockResolvedValue({ id: 'admin-id' });
    const res = await DELETE(makeDelete('u2'), makeParams('u2'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
