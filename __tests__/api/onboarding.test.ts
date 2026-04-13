import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetUser = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

const { POST } = await import('@/app/api/onboarding/route');

function makeRequest(body: object, token = 'valid-token') {
  return new NextRequest('http://localhost/api/onboarding', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });
}

describe('POST /api/onboarding', () => {
  it('returns 401 without auth token', async () => {
    const req = new NextRequest('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('bad token') });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid role', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ role: 'wizard' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/role/i);
  });

  it('returns 400 for invalid visaStatus', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ visaStatus: 'tourist' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid jobStage', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ jobStage: 'dreaming' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with valid data', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ role: 'frontend', visaStatus: 'graduate', jobStage: 'applying' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('accepts partial data (skip questions → null values)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
  });
});
