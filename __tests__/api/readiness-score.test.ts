import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
  createSupabaseService: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select:      vi.fn().mockReturnThis(),
      eq:          vi.fn().mockReturnThis(),
      order:       vi.fn().mockReturnThis(),
      lte:         vi.fn().mockReturnThis(),
      limit:       vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      upsert:      vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

const { GET } = await import('@/app/api/readiness-score/route');

describe('GET /api/readiness-score', () => {
  it('returns 401 when no session cookie is present', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 401 when session is invalid', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
