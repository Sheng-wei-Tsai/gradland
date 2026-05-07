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

// ── OpenAI mock ───────────────────────────────────────────────────────────────
const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function MockOpenAI() {
    return {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  }),
}));

const { POST } = await import('@/app/api/diagrams/generate/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/diagrams/generate', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validBody = { topic: 'How async/await works in JavaScript', type: 'flowchart' };
const validAuth = { user: { id: 'u1' } };

function makeOpenAIResponse(content: string) {
  return Promise.resolve({ choices: [{ message: { content } }] });
}

describe('POST /api/diagrams/generate', () => {
  afterEach(() => {
    mockRequireSubscription.mockReset();
    mockCheckEndpointRateLimit.mockResolvedValue(true);
    mockCreate.mockReset();
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

  it('returns 400 when topic is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ type: 'flowchart' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/topic/i);
  });

  it('returns 400 for an unparseable request body', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const req = new NextRequest('http://localhost/api/diagrams/generate', {
      method:  'POST',
      body:    'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when topic is shorter than 3 characters', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ topic: 'ab' }));
    expect(res.status).toBe(400);
  });

  // ── API key check ─────────────────────────────────────────────────────────

  it('returns 500 when OPENAI_API_KEY is not configured', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    // env var not set — deleted in afterEach
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  // ── Type validation ───────────────────────────────────────────────────────

  it('falls back to flowchart for an unrecognised type', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost({ topic: 'CI/CD pipeline', type: 'unknown-type' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.type).toBe('flowchart');
  });

  // ── Topic truncation ──────────────────────────────────────────────────────

  it('truncates topic to 200 chars before sending to OpenAI', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const longTopic = 'A'.repeat(300);
    await POST(makePost({ topic: longTopic }));

    const callArg = mockCreate.mock.calls[0][0];
    const promptContent: string = callArg.messages[1].content;
    expect(promptContent).toContain('A'.repeat(200));
    expect(promptContent).not.toContain('A'.repeat(201));
  });

  // ── Fence stripping ───────────────────────────────────────────────────────

  it('strips ```mermaid fence from OpenAI response', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(
      makeOpenAIResponse('```mermaid\nflowchart TD\n  A --> B\n```'),
    );

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaid).toBe('flowchart TD\n  A --> B');
  });

  it('strips plain ``` fence from OpenAI response', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(
      makeOpenAIResponse('```\nflowchart LR\n  X --> Y\n```'),
    );

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaid).toBe('flowchart LR\n  X --> Y');
  });

  it('leaves unfenced Mermaid code unchanged', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaid).toBe('flowchart TD\n  A --> B');
  });

  // ── Successful response shape ─────────────────────────────────────────────

  it('returns mermaid, type, and topic on success', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaid).toBeDefined();
    expect(body.type).toBe('flowchart');
    expect(body.topic).toBe(validBody.topic);
  });

  // ── Failure modes ─────────────────────────────────────────────────────────

  it('returns 502 when OpenAI returns an empty response', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse(''));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(502);
  });

  it('returns 502 when OpenAI throws', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockRejectedValueOnce(new Error('network error'));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(502);
  });
});
