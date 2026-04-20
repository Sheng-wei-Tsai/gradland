import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

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
    }),
  }),
}));

const { GET } = await import('@/app/api/dashboard/summary/route');

describe('GET /api/dashboard/summary', () => {
  it('returns 401 without a session cookie', async () => {
    const req = new NextRequest('http://localhost/api/dashboard/summary');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when session is invalid', async () => {
    const req = new NextRequest('http://localhost/api/dashboard/summary');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
