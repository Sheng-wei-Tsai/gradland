import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth-server directly — @supabase/ssr creates its own GoTrueClient
// internally and doesn't go through the @supabase/supabase-js mock.
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
const mockUpsert  = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
  createSupabaseService: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      upsert: mockUpsert,
    }),
  }),
}));

const { POST } = await import('@/app/api/onboarding/route');

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/onboarding', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/onboarding', () => {
  it('returns 401 without auth — no session cookie', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
  });

  it('returns 401 when session is invalid', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('bad session') });
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

  it('accepts partial data (skipped questions → null values)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
  });

  // ── ANZSCO validation ────────────────────────────────────────────────────────

  it('returns 400 when anzsco is only 5 digits', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ anzsco: '26131' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/anzsco/i);
  });

  it('returns 400 when anzsco contains non-digit characters', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ anzsco: '2613XX' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/anzsco/i);
  });

  it('returns 200 when anzsco is empty string (stored as null)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ anzsco: '' }));
    expect(res.status).toBe(200);
  });

  // ── experienceYears coercion ─────────────────────────────────────────────────

  it('returns 200 when experienceYears is a non-numeric string (coerced to null)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makeRequest({ experienceYears: 'two' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('clamps experienceYears of 51 to 50 before upsert', async () => {
    mockUpsert.mockClear();
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    await POST(makeRequest({ experienceYears: 51 }));
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.onboarding_experience_years).toBe(50);
  });
});
