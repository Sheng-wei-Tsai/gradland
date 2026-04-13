import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('no token') }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ limit: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }) }),
          eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }),
          lte: () => ({ limit: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }) }),
        }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      }),
      upsert: vi.fn().mockResolvedValue({}),
    }),
  }),
}));

const { GET } = await import('@/app/api/readiness-score/route');

describe('GET /api/readiness-score', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const req = new NextRequest('http://localhost/api/readiness-score');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const req = new NextRequest('http://localhost/api/readiness-score', {
      headers: { authorization: 'Bearer bad-token' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
