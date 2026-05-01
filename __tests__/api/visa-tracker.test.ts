import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// visa-tracker uses @supabase/ssr directly (not lib/auth-server),
// so we mock createServerClient to return a controllable fake client.
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
const mockUpsert  = vi.fn().mockResolvedValue({ error: null });
const mockSingle  = vi.fn().mockResolvedValue({ data: null });

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      single: mockSingle,
      upsert: mockUpsert,
    })),
  })),
}));

const { GET, POST } = await import('@/app/api/visa-tracker/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/visa-tracker', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /api/visa-tracker', () => {
  it('returns 401 without auth', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns default empty object when user has no tracker row', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: null });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ employer: '', occupation: '', started_at: null, steps: {} });
  });

  it('returns saved tracker data for authenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: { employer: 'Atlassian', occupation: 'Software Engineer', started_at: '2024-01-01', steps: {} } });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.employer).toBe('Atlassian');
  });
});

describe('POST /api/visa-tracker', () => {
  beforeEach(() => {
    mockUpsert.mockClear();
  });

  it('returns 401 without auth', async () => {
    const res = await POST(makePost({ employer: 'Canva' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid started_at format', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makePost({ employer: 'Canva', started_at: 'not-a-date' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/started_at/i);
  });

  it('accepts oversized employer/occupation — truncates both to 100 chars before DB write', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const longString = 'A'.repeat(200);
    const res = await POST(makePost({ employer: longString, occupation: longString }));
    expect(res.status).toBe(200);
    const upsertPayload = mockUpsert.mock.calls[0][0] as Record<string, unknown>;
    expect((upsertPayload.employer as string).length).toBe(100);
    expect((upsertPayload.occupation as string).length).toBe(100);
  });

  it('returns 200 with valid payload', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makePost({ employer: 'Canva', occupation: 'Backend Engineer', started_at: '2024-06-01', steps: { step1: true } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
