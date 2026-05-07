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

const { POST } = await import('@/app/api/learn/roadmap-image/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/learn/roadmap-image', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validBody = { role: 'frontend', visaStatus: 'graduate-485', jobStage: 'applying' };
const validAuth = { user: { id: 'u1' } };

function makeOpenAIResponse(content: string) {
  return Promise.resolve({ choices: [{ message: { content } }] });
}

describe('POST /api/learn/roadmap-image', () => {
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

  it('returns 400 when role is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ visaStatus: 'graduate-485', jobStage: 'applying' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/role/i);
  });

  // ── API key check ─────────────────────────────────────────────────────────

  it('returns 500 when OPENAI_API_KEY is not configured', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  // ── Enum fallback ─────────────────────────────────────────────────────────

  it('falls back to "other" for an unrecognised role value', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost({ role: 'unknown-role', visaStatus: 'graduate-485', jobStage: 'applying' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cacheKey).toMatch(/^other_/);
  });

  it('falls back to "exploring" for an unrecognised jobStage', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost({ role: 'frontend', visaStatus: 'graduate-485', jobStage: 'bad-stage' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cacheKey).toMatch(/_exploring$/);
  });

  it('falls back to "other" for an unrecognised visaStatus', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost({ role: 'frontend', visaStatus: 'bad-visa', jobStage: 'applying' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    // cacheKey: frontend_other_applying
    expect(body.cacheKey.split('_')[1]).toBe('other');
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
    expect(body.mermaidCode).toBe('flowchart TD\n  A --> B');
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
    expect(body.mermaidCode).toBe('flowchart LR\n  X --> Y');
  });

  it('leaves unfenced Mermaid code unchanged', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaidCode).toBe('flowchart TD\n  A --> B');
  });

  // ── Successful response shape ─────────────────────────────────────────────

  it('returns mermaidCode and correctly formatted cacheKey on success', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse('flowchart TD\n  A --> B'));

    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaidCode).toBe('flowchart TD\n  A --> B');
    expect(body.cacheKey).toBe('frontend_graduate-485_applying');
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
