import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('no token') }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockReturnThis(),
      lte:    vi.fn().mockReturnThis(),
      limit:  vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  }),
}));

const { GET } = await import('@/app/api/dashboard/summary/route');

describe('GET /api/dashboard/summary', () => {
  it('returns 401 without Authorization header', async () => {
    const req = new NextRequest('http://localhost/api/dashboard/summary');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const req = new NextRequest('http://localhost/api/dashboard/summary', {
      headers: { authorization: 'Bearer bad-token' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
