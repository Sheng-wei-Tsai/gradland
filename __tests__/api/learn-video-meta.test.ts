import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Global fetch mock — must be set before route module is imported ────────────
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ── Supabase mock ─────────────────────────────────────────────────────────────
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockEq          = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
const mockSelect      = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom        = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn(() => ({ from: mockFrom })),
}));

const { GET } = await import('@/app/api/learn/video-meta/route');

function makeGet(params: Record<string, string>) {
  const url = new URL('http://localhost/api/learn/video-meta');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

// 11-char alphanumeric videoId used throughout success-path tests
const VALID_ID = 'abcdefg1234';

describe('GET /api/learn/video-meta', () => {
  afterEach(() => {
    mockFetch.mockReset();
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    delete process.env.RAPIDAPI_KEY;
  });

  // ── Input validation ──────────────────────────────────────────────────────

  it('returns 400 when videoId query param is missing', async () => {
    const res = await GET(makeGet({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/videoId/i);
  });

  it('returns 400 when videoId is too short (fails 11-char regex)', async () => {
    const res = await GET(makeGet({ videoId: 'short' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('returns 400 when videoId contains invalid characters', async () => {
    // Exactly 11 chars but has ! which is outside [A-Za-z0-9_-]
    const res = await GET(makeGet({ videoId: 'not-valid!!' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  // ── Supabase cache hit ────────────────────────────────────────────────────

  it('returns 200 from Supabase cache without calling RapidAPI', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data:  { video_title: 'TypeScript Tutorial', channel_title: 'Fireship' },
      error: null,
    });
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(VALID_ID);
    expect(body.title).toBe('TypeScript Tutorial');
    expect(body.channelTitle).toBe('Fireship');
    expect(body.thumbnail).toContain(VALID_ID); // thumbnail URL from YouTube CDN
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('uses empty string for channelTitle when cache row has no channel_title', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data:  { video_title: 'No Channel', channel_title: null },
      error: null,
    });
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.channelTitle).toBe('');
  });

  // ── API key guard ─────────────────────────────────────────────────────────

  it('returns 503 when RAPIDAPI_KEY is not configured (cache miss)', async () => {
    // default mock returns { data: null } — simulates cache miss
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  // ── RapidAPI fallback ─────────────────────────────────────────────────────

  it('returns 404 when RapidAPI returns non-OK status', async () => {
    process.env.RAPIDAPI_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({ ok: false });
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(404);
  });

  it('returns 404 when RapidAPI response has no id field', async () => {
    process.env.RAPIDAPI_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve({}),
    });
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(404);
  });

  it('returns 200 with correctly mapped fields from RapidAPI', async () => {
    process.env.RAPIDAPI_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({
      ok:   true,
      json: () =>
        Promise.resolve({
          id:            VALID_ID,
          title:         'TypeScript in 100 Seconds',
          author:        { title: 'Fireship' },
          thumbnails:    [
            { url: 'https://i.ytimg.com/vi/abcdefg1234/thumb1.jpg' },
            { url: 'https://i.ytimg.com/vi/abcdefg1234/thumb2.jpg' },
          ],
          lengthSeconds: 100,
          description:   'A quick intro to TypeScript',
        }),
    });
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(VALID_ID);
    expect(body.title).toBe('TypeScript in 100 Seconds');
    expect(body.channelTitle).toBe('Fireship');
    expect(body.duration).toBe('PT1M40S');
    expect(body.description).toBe('A quick intro to TypeScript');
  });

  it('truncates description to 300 chars from RapidAPI', async () => {
    process.env.RAPIDAPI_KEY = 'test-key';
    const longDesc = 'D'.repeat(400);
    mockFetch.mockResolvedValueOnce({
      ok:   true,
      json: () =>
        Promise.resolve({
          id:          VALID_ID,
          title:       'Long Video',
          author:      { title: 'Channel' },
          thumbnails:  [],
          description: longDesc,
        }),
    });
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.description).toHaveLength(300);
    expect(body.description).toBe('D'.repeat(300));
  });

  it('returns empty duration string when lengthSeconds is absent', async () => {
    process.env.RAPIDAPI_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({
      ok:   true,
      json: () =>
        Promise.resolve({
          id:          VALID_ID,
          title:       'No Duration',
          author:      { title: 'Chan' },
          thumbnails:  [],
          description: '',
        }),
    });
    const res = await GET(makeGet({ videoId: VALID_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.duration).toBe('');
  });
});
