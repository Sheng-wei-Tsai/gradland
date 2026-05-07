import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Auth mock ──────────────────────────────────────────────────────────────────
const mockRequireAdmin = vi.fn();
const mockFrom         = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  requireAdmin:          mockRequireAdmin,
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ── Route import ───────────────────────────────────────────────────────────────
const { GET } = await import('@/app/api/admin/stats/route');

const ADMIN_USER = { id: 'admin-id', email: 'admin@test.com' };

/**
 * Builds a Supabase-like query builder that supports both query styles used by
 * the stats route:
 *
 *   Count:  await sb.from('x').select('id', { count: 'exact', head: true })
 *           → { count: N, error: null }
 *
 *   Data:   await sb.from('x').select('…').order(…).limit(5)
 *           → { data: [...], error: null }
 *
 * We model this by making select() return a Thenable (direct-await = count) that
 * also exposes .order().limit() for the chained data path.
 */
function makeFromBuilder(count: number | null, data: unknown[] = []) {
  return {
    select: vi.fn().mockReturnValue({
      then: (
        onFulfilled: (v: unknown) => unknown,
        onRejected?: (e: unknown) => unknown,
      ) => Promise.resolve({ count, error: null }).then(onFulfilled, onRejected),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  };
}

// =============================================================================
// GET /api/admin/stats
// =============================================================================
describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockFrom.mockReset();
  });

  it('returns 403 when caller is not an admin', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const res  = await GET();
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('returns 200 with counts and recentComments/recentUsers shape', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    mockFrom.mockImplementation(() => makeFromBuilder(5));

    const res  = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('counts');
    expect(body).toHaveProperty('recentComments');
    expect(body).toHaveProperty('recentUsers');
  });

  it('counts.users, counts.comments, counts.applications are non-negative', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    mockFrom.mockImplementation(() => makeFromBuilder(12));

    const res  = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.counts.users).toBeGreaterThanOrEqual(0);
    expect(body.counts.comments).toBeGreaterThanOrEqual(0);
    expect(body.counts.applications).toBeGreaterThanOrEqual(0);
  });

  it('falls back to 0 when Supabase returns null count', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    mockFrom.mockImplementation(() => makeFromBuilder(null));

    const res  = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.counts.users).toBe(0);
    expect(body.counts.comments).toBe(0);
    expect(body.counts.applications).toBe(0);
  });

  it('recentUsers is an array', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const user = {
      id: 'u1',
      full_name: 'Alice',
      email: 'alice@test.com',
      role: 'user',
      created_at: '2026-05-01T00:00:00Z',
    };
    mockFrom.mockImplementation(() => makeFromBuilder(1, [user]));

    const res  = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.recentUsers)).toBe(true);
  });
});
