import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Auth mock ──────────────────────────────────────────────────────────────────
const mockRequireAdmin = vi.fn();
const mockFrom         = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  requireAdmin:          mockRequireAdmin,
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

vi.mock('@/lib/email', () => ({
  sendJobListingApproved: vi.fn().mockResolvedValue(undefined),
}));

const { GET, PATCH, DELETE } = await import('@/app/api/admin/job-listings/route');

const ADMIN_USER = { id: 'admin-id', email: 'admin@test.com' };
const VALID_UUID  = '123e4567-e89b-12d3-a456-426614174000';

// ── GET ────────────────────────────────────────────────────────────────────────
describe('GET /api/admin/job-listings', () => {
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

  it('returns listings array when called by an admin', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const rows = [{ id: VALID_UUID, company: 'Atlassian', title: 'Engineer', status: 'active' }];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
        }),
      }),
    });

    const res  = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.listings).toEqual(rows);
  });
});

// ── PATCH ──────────────────────────────────────────────────────────────────────
describe('PATCH /api/admin/job-listings', () => {
  function makePatch(body: object) {
    return new NextRequest('http://localhost/api/admin/job-listings', {
      method:  'PATCH',
      body:    JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    });
  }

  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockFrom.mockReset();
  });

  it('returns 403 when caller is not an admin', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const res = await PATCH(makePatch({ id: VALID_UUID, action: 'approve' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when action is missing', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await PATCH(makePatch({ id: VALID_UUID }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/required/);
  });

  it('returns 400 for an invalid action value', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await PATCH(makePatch({ id: VALID_UUID, action: 'archive' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/approve.*reject.*extend/);
  });

  it('returns 400 when body.id is not a valid UUID', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await PATCH(makePatch({ id: 'not-a-uuid', action: 'approve' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('id must be a valid UUID');
  });

  it('returns 400 when body.id is an empty string', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await PATCH(makePatch({ id: '', action: 'approve' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/required/);
  });

  it('reject action deletes the listing and returns 200', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const res  = await PATCH(makePatch({ id: VALID_UUID, action: 'reject' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it('extend uses Math.max so an already-expired listing gets at least 30 days from now', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);

    // Listing that expired 7 days ago
    const expiredAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let capturedPatch: Record<string, string> | undefined;

    mockFrom
      .mockReturnValueOnce({
        // First call: select expires_at
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data:  { expires_at: expiredAt },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        // Second call: update expires_at
        update: vi.fn().mockImplementation((patch: Record<string, string>) => {
          capturedPatch = patch;
          return { eq: vi.fn().mockResolvedValue({ error: null }) };
        }),
      });

    const res  = await PATCH(makePatch({ id: VALID_UUID, action: 'extend' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);

    // The new expiry must be at least 29 days from now (not from the past expiry date)
    const newExpiry    = new Date(capturedPatch!.expires_at).getTime();
    const minAccepted  = Date.now() + 29 * 24 * 60 * 60 * 1000;
    expect(newExpiry).toBeGreaterThan(minAccepted);
  });
});

// ── DELETE ─────────────────────────────────────────────────────────────────────
describe('DELETE /api/admin/job-listings', () => {
  function makeDelete(params: Record<string, string> = {}) {
    const url = new URL('http://localhost/api/admin/job-listings');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return new NextRequest(url.toString(), { method: 'DELETE' });
  }

  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockFrom.mockReset();
  });

  it('returns 403 when caller is not an admin', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const res = await DELETE(makeDelete({ id: VALID_UUID }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when id query param is missing', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await DELETE(makeDelete());
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('id is required');
  });

  it('returns 400 when id is not a valid UUID', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await DELETE(makeDelete({ id: 'not-a-uuid' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('id must be a valid UUID');
  });

  it('returns 400 for a UUID-shaped but wrong-length id', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    const res  = await DELETE(makeDelete({ id: '123e4567-e89b-12d3-a456-42661417400' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('id must be a valid UUID');
  });

  it('deletes the listing and returns 200 for a valid UUID', async () => {
    mockRequireAdmin.mockResolvedValue(ADMIN_USER);
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const res  = await DELETE(makeDelete({ id: VALID_UUID }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });
});
