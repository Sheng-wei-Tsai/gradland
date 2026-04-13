import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock supabase — module-level createClient is called on import
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

// Import after mocking
const { POST } = await import('@/app/api/track/route');

function makeRequest(body: object, ip = '1.2.3.4') {
  return new NextRequest('http://localhost/api/track', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  });
}

describe('POST /api/track', () => {
  it('returns 400 when sessionId is missing', async () => {
    const res = await POST(makeRequest({ path: '/blog' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when sessionId format is invalid', async () => {
    const res = await POST(makeRequest({ path: '/blog', sessionId: 'bad!' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when path is missing', async () => {
    const res = await POST(makeRequest({ sessionId: 'abc123abc123abc123abc123abc12312' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when path does not start with /', async () => {
    const res = await POST(makeRequest({ path: 'noslash', sessionId: 'abc123abc123abc123abc123abc12312' }));
    expect(res.status).toBe(400);
  });

  it('accepts a valid UUID-like sessionId', async () => {
    const res = await POST(makeRequest({
      path: '/blog',
      sessionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    }));
    // 200 or 400 depending on db mock — key check is NOT 400 for validation reasons
    const body = await res.json();
    expect(res.status).not.toBe(400);
    expect(body).toHaveProperty('ok');
  });

  it('accepts a valid 32-char hex sessionId', async () => {
    const res = await POST(makeRequest({
      path: '/learn',
      sessionId: 'abcdef1234567890abcdef1234567890',
    }));
    const body = await res.json();
    expect(res.status).not.toBe(400);
    expect(body.ok).toBe(true);
  });
});
