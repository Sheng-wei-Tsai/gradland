import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ──────────────────────────────────────────────────────────────────────
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
const mockUpsert  = vi.fn().mockResolvedValue({ error: null });
const mockLimit   = vi.fn().mockResolvedValue({ data: [], error: null });
const mockEq      = vi.fn();
const mockSelect  = vi.fn();
const mockFrom    = vi.fn();

mockEq.mockReturnValue({ eq: mockEq, limit: mockLimit });
mockSelect.mockReturnValue({ eq: mockEq });
mockFrom.mockReturnValue({ upsert: mockUpsert, select: mockSelect });

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [] }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
    from:  mockFrom,
  }),
}));

const { POST, GET } = await import('@/app/api/learn/progress/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/learn/progress', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function makeGet(search = '') {
  return new NextRequest(`http://localhost/api/learn/progress${search}`);
}

// ── POST ───────────────────────────────────────────────────────────────────────
describe('POST /api/learn/progress', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockUpsert.mockReset();
    mockUpsert.mockResolvedValue({ error: null });
  });

  it('returns 401 without a session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makePost({ videoId: 'v1', videoTitle: 'Intro' }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns 400 when videoId is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await POST(makePost({ videoTitle: 'Intro to Node' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
  });

  it('returns 400 when videoTitle is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await POST(makePost({ videoId: 'v1' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with ok:true on a valid upsert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await POST(makePost({ videoId: 'v1', videoTitle: 'Intro', completed: true }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('upserts on (user_id,video_id) conflict — omitting quizScore preserves prior quiz_score', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    await POST(makePost({ videoId: 'v1', videoTitle: 'Intro' }));
    expect(mockUpsert).toHaveBeenCalledOnce();
    const [payload, opts] = mockUpsert.mock.calls[0] as [
      Record<string, unknown>,
      { onConflict: string },
    ];
    expect(opts.onConflict).toBe('user_id,video_id');
    expect(payload).not.toHaveProperty('quiz_score');
    expect(payload).not.toHaveProperty('quiz_taken');
  });

  it('includes quiz_score and quiz_taken:true when quizScore is provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    await POST(makePost({ videoId: 'v1', videoTitle: 'Intro', quizScore: 85 }));
    const [payload] = mockUpsert.mock.calls[0] as [Record<string, unknown>];
    expect(payload.quiz_score).toBe(85);
    expect(payload.quiz_taken).toBe(true);
  });

  it('returns 500 when the DB upsert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockUpsert.mockResolvedValueOnce({ error: { message: 'constraint violation' } });
    const res = await POST(makePost({ videoId: 'v1', videoTitle: 'Intro' }));
    expect(res.status).toBe(500);
  });
});

// ── GET ────────────────────────────────────────────────────────────────────────
describe('GET /api/learn/progress', () => {
  beforeEach(() => mockGetUser.mockReset());

  it('returns empty progress array without a session (public fallback, not 401)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(makeGet());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.progress).toEqual([]);
  });

  it('returns a progress array for an authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await GET(makeGet());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.progress)).toBe(true);
  });
});
