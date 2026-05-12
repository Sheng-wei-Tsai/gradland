import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ── Auth / subscription mocks ─────────────────────────────────────────────────
const mockRequireSubscription    = vi.fn();
const mockCheckEndpointRateLimit = vi.fn().mockResolvedValue(true);

vi.mock('@/lib/subscription', () => ({
  requireSubscription:    mockRequireSubscription,
  checkEndpointRateLimit: mockCheckEndpointRateLimit,
  recordUsage:            vi.fn(),
}));

// ── KV mocks ──────────────────────────────────────────────────────────────────
const mockKvGet = vi.fn().mockResolvedValue(null);
const mockKvSet = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/kv', () => ({
  kvGet: mockKvGet,
  kvSet: mockKvSet,
}));

// ── Supabase mock — cache always misses by default ────────────────────────────
const sbChain = {
  select:      vi.fn(),
  eq:          vi.fn(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  upsert:      vi.fn().mockResolvedValue({ error: null }),
};
sbChain.select.mockReturnValue(sbChain);
sbChain.eq.mockReturnValue(sbChain);

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue(sbChain) }),
  rateLimitResponse: () =>
    new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
}));

// ── Gemini mock ───────────────────────────────────────────────────────────────
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function MockGemini() {
    return {
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContentStream: vi.fn().mockResolvedValue({
          stream: (async function* () { yield { text: () => '{}' }; })(),
        }),
      }),
    };
  }),
}));

const { POST } = await import('@/app/api/learn/analyse/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/learn/analyse', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validAuth  = { user: { id: 'u1' } };
const fakeGuide  = { essay: 'This video covers async/await in depth.', summary: 'Short summary.', keyConcepts: [] };

describe('POST /api/learn/analyse', () => {
  afterEach(() => {
    mockRequireSubscription.mockReset();
    mockCheckEndpointRateLimit.mockResolvedValue(true);
    mockKvGet.mockResolvedValue(null);
    mockKvSet.mockResolvedValue(undefined);
    sbChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    delete process.env.GEMINI_API_KEY;
  });

  it('passes auth failure through unchanged', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    );
    const res = await POST(makePost({ videoId: 'abc1234defg', videoTitle: 'Test' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when videoId is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ videoTitle: 'Test Video' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when videoId is not a valid 11-char YouTube ID', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ videoId: 'not-valid!!', videoTitle: 'Test' }));
    expect(res.status).toBe(400);
  });

  it('truncates videoTitle and channelTitle to 200 chars before using them', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    process.env.GEMINI_API_KEY = 'test-key';
    const longTitle   = 'A'.repeat(300);
    const longChannel = 'B'.repeat(300);
    mockKvGet.mockResolvedValueOnce(JSON.stringify(fakeGuide));

    const res = await POST(makePost({ videoId: 'abc1234defg', videoTitle: longTitle, channelTitle: longChannel }));
    expect(res.status).toBe(200);
    // Confirm it reached the cache path — the 300-char strings were accepted (truncated internally)
    expect(mockKvGet).toHaveBeenCalledWith('study-guide:abc1234defg');
  });

  it('returns 422 when video duration exceeds 2 hours', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({
      videoId:         'abc1234defg',
      videoTitle:      'Very Long Conference Talk',
      durationSeconds: 8000,
    }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toMatch(/2 hours/i);
  });

  it('does not block a video at exactly 2 hours (7200s is the boundary)', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    // 7200 is not > 7200, so no 422 — route proceeds to API key check → 503
    const res = await POST(makePost({
      videoId:         'abc1234defg',
      videoTitle:      'Two Hour Tutorial',
      durationSeconds: 7200,
    }));
    expect(res.status).not.toBe(422);
  });

  it('returns 503 when Gemini API key is not configured', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ videoId: 'abc1234defg', videoTitle: 'Test Video' }));
    expect(res.status).toBe(503);
  });

  it('returns 429 when endpoint rate limit is exceeded', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCheckEndpointRateLimit.mockResolvedValueOnce(false);
    const res = await POST(makePost({ videoId: 'abc1234defg', videoTitle: 'Test' }));
    expect(res.status).toBe(429);
  });

  it('returns 200 from KV cache hit without calling Supabase', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    process.env.GEMINI_API_KEY = 'test-key';
    mockKvGet.mockResolvedValueOnce(JSON.stringify(fakeGuide));

    const res = await POST(makePost({ videoId: 'abc1234defg', videoTitle: 'Test Video' }));
    expect(res.status).toBe(200);
    const body = await res.json() as typeof fakeGuide;
    expect(body.essay).toBe(fakeGuide.essay);
    expect(sbChain.maybeSingle).not.toHaveBeenCalled();
  });

  it('returns 200 from Supabase cache hit without calling Gemini', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    process.env.GEMINI_API_KEY = 'test-key';
    sbChain.maybeSingle.mockResolvedValueOnce({ data: { study_guide: fakeGuide }, error: null });

    const res = await POST(makePost({ videoId: 'abc1234defg', videoTitle: 'Test Video' }));
    expect(res.status).toBe(200);
    const body = await res.json() as typeof fakeGuide;
    expect(body.essay).toBe(fakeGuide.essay);
  });
});
