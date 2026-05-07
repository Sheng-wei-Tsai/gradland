import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ── Auth / subscription mocks ─────────────────────────────────────────────────
const mockRequireSubscription    = vi.fn();
const mockCheckEndpointRateLimit = vi.fn().mockResolvedValue(true);

vi.mock('@/lib/subscription', () => ({
  requireSubscription:    mockRequireSubscription,
  checkEndpointRateLimit: mockCheckEndpointRateLimit,
  rateLimitResponse: () =>
    new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
  recordUsage: vi.fn(),
}));

// ── Supabase mock ─────────────────────────────────────────────────────────────
const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockEq     = vi.fn();
const mockSelect = vi.fn();
const mockFrom   = vi.fn();

mockSelect.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ single: mockSingle, maybeSingle: mockSingle });
mockFrom.mockReturnValue({ select: mockSelect, upsert: mockUpsert });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn(() => ({ from: mockFrom })),
}));

// ── OpenAI mock ───────────────────────────────────────────────────────────────
const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function MockOpenAI() {
    return { chat: { completions: { create: mockCreate } } };
  }),
}));

const { POST } = await import('@/app/api/learn/quiz/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/learn/quiz', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validAuth = { user: { id: 'u1' } };

const validStudyGuide = {
  summary:      'A guide to async JavaScript',
  keyConcepts:  [{ term: 'Promise', definition: 'An async value', whyMatters: 'Core pattern' }],
  coreInsights: ['Async/await is sugar over Promises'],
};

const validBody = {
  videoId:    'abc123',
  videoTitle: 'Async JavaScript Explained',
  studyGuide: validStudyGuide,
};

const mockQuestions = [
  {
    q:           'What is a Promise?',
    options:     ['A. Sync value', 'B. Async value', 'C. Error', 'D. Callback'],
    answer:      1,
    explanation: 'A Promise represents an eventual async value.',
  },
];

function makeOpenAIResponse(content: string) {
  return Promise.resolve({ choices: [{ message: { content } }] });
}

describe('POST /api/learn/quiz', () => {
  afterEach(() => {
    mockRequireSubscription.mockReset();
    mockCheckEndpointRateLimit.mockResolvedValue(true);
    mockCreate.mockReset();
    mockSingle.mockResolvedValue({ data: null, error: null });
    delete process.env.OPENAI_API_KEY;
  });

  // ── Auth gates ────────────────────────────────────────────────────────────

  it('passes 401 auth failure through unchanged', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    );
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(401);
  });

  it('passes 403 subscription failure through unchanged', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Subscription required' }, { status: 403 }),
    );
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(403);
  });

  it('returns 429 when endpoint rate limit is exceeded', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCheckEndpointRateLimit.mockResolvedValueOnce(false);
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(429);
  });

  // ── Input validation ──────────────────────────────────────────────────────

  it('returns 400 when videoId is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ videoTitle: 'Title', studyGuide: validStudyGuide }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when videoTitle is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ videoId: 'abc123', studyGuide: validStudyGuide }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when studyGuide is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ videoId: 'abc123', videoTitle: 'Title' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an unparseable request body', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const req = new NextRequest('http://localhost/api/learn/quiz', {
      method:  'POST',
      body:    'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // ── API key check ─────────────────────────────────────────────────────────

  it('returns 503 when OPENAI_API_KEY is not configured', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    // no OPENAI_API_KEY in env
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  // ── Cache hit ─────────────────────────────────────────────────────────────

  it('returns cached questions from Supabase without calling OpenAI', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockSingle.mockResolvedValueOnce({ data: { quiz_questions: mockQuestions }, error: null });

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.questions).toEqual(mockQuestions);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // ── OpenAI generation ─────────────────────────────────────────────────────

  it('returns 200 with questions from OpenAI on cache miss', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(
      makeOpenAIResponse(JSON.stringify({ questions: mockQuestions })),
    );

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.questions).toHaveLength(1);
    expect(body.questions[0].q).toBe('What is a Promise?');
  });

  it('truncates videoTitle to 200 chars before sending to OpenAI', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(
      makeOpenAIResponse(JSON.stringify({ questions: mockQuestions })),
    );

    const longTitle = 'A'.repeat(300);
    await POST(makePost({ ...validBody, videoTitle: longTitle }));

    const callArg = mockCreate.mock.calls[0][0];
    const promptContent: string = callArg.messages[0].content;
    // The truncated title (200 chars) should appear in the prompt
    expect(promptContent).toContain('A'.repeat(200));
    // The full 300-char title should NOT appear
    expect(promptContent).not.toContain('A'.repeat(201));
  });

  it('returns 500 when OpenAI response contains no valid JSON object', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('Sorry, I cannot generate a quiz.'));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
  });

  it('returns 500 when OpenAI throws', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockRejectedValueOnce(new Error('OpenAI network error'));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
  });
});
