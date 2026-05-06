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

const { POST } = await import('@/app/api/learn/diagram/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/learn/diagram', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validBody = {
  skillId:   'js-async',
  skillName: 'Async JavaScript',
  pathId:    'frontend',
};

const validAuth = { user: { id: 'u1' } };

function makeOpenAIResponse(content: string) {
  return Promise.resolve({
    choices: [{ message: { content } }],
  });
}

describe('POST /api/learn/diagram', () => {
  afterEach(() => {
    mockRequireSubscription.mockReset();
    mockCheckEndpointRateLimit.mockResolvedValue(true);
    mockCreate.mockReset();
    delete process.env.OPENAI_API_KEY;
  });

  // ── Auth ──────────────────────────────────────────────────────────────────

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

  // ── Input validation — missing required fields ────────────────────────────

  it('returns 400 when skillId is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ skillName: 'Async JavaScript', pathId: 'frontend' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/skillId/);
  });

  it('returns 400 when skillName is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ skillId: 'js-async', pathId: 'frontend' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/skillName/);
  });

  it('returns 400 when pathId is missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ skillId: 'js-async', skillName: 'Async JavaScript' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/pathId/);
  });

  it('returns 400 when all three required fields are missing', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an unparseable request body', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const req = new NextRequest('http://localhost/api/learn/diagram', {
      method:  'POST',
      body:    'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
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

  // ── Fence stripping ───────────────────────────────────────────────────────

  it('strips ```mermaid\\n...``` fence from OpenAI response', async () => {
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
    mockCreate.mockResolvedValueOnce(
      makeOpenAIResponse('flowchart TD\n  A --> B'),
    );
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaidCode).toBe('flowchart TD\n  A --> B');
  });

  it('returns 502 when OpenAI returns an empty response', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse(''));
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(502);
  });

  // ── Successful response shape ─────────────────────────────────────────────

  it('returns mermaidCode, skillId, and pathId on success', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockResolvedValueOnce(
      makeOpenAIResponse('flowchart TD\n  A --> B'),
    );
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mermaidCode).toBeDefined();
    expect(body.skillId).toBe('js-async');
    expect(body.pathId).toBe('frontend');
  });

  it('returns 502 when OpenAI throws', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    mockCreate.mockRejectedValueOnce(new Error('network error'));
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(502);
  });
});
