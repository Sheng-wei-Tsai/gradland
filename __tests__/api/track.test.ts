import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Shared mock so individual tests can override upsert behaviour
const mockUpsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({ upsert: mockUpsert }),
  }),
}));

// Import after mocking
const { POST } = await import('@/app/api/track/route');

function makeRequest(body: object, ip = '1.2.3.4') {
  return new NextRequest('http://localhost/api/track', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
      'cookie': 'cookies-consent=accepted',
    },
  });
}

describe('POST /api/track', () => {
  beforeEach(() => {
    mockUpsert.mockResolvedValue({ error: null });
  });

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

  it('returns 429 on the 61st POST from the same IP within a minute', async () => {
    const ip = '7.7.7.7';
    const validBody = { path: '/blog', sessionId: 'abcdef1234567890abcdef1234567890' };
    for (let i = 0; i < 60; i++) {
      await POST(makeRequest(validBody, ip));
    }
    const res = await POST(makeRequest(validBody, ip));
    expect(res.status).toBe(429);
  });

  it('returns 200 ok:false when Supabase upsert throws (silent error swallowing)', async () => {
    mockUpsert.mockRejectedValueOnce(new Error('connection refused'));
    const res = await POST(makeRequest({
      path: '/blog',
      sessionId: 'abcdef1234567890abcdef1234567891',
    }, '8.8.8.8'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});
