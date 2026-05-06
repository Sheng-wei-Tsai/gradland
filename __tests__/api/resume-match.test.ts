import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ── Subscription mock ─────────────────────────────────────────────────────────
const mockRequireSubscription = vi.fn();
const mockCheckEndpointRateLimit = vi.fn().mockResolvedValue(true);

vi.mock('@/lib/subscription', () => ({
  requireSubscription:    mockRequireSubscription,
  checkEndpointRateLimit: mockCheckEndpointRateLimit,
  recordUsage:            vi.fn(),
}));

// ── Auth-server mock (rateLimitResponse lives here) ───────────────────────────
vi.mock('@/lib/auth-server', () => ({
  rateLimitResponse: () =>
    NextResponse.json(
      { error: 'Rate limit exceeded.', code: 'RATE_LIMIT_EXCEEDED' },
      { status: 429 },
    ),
}));

// ── OpenAI mock ───────────────────────────────────────────────────────────────
const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function MockOpenAI() {
    return { chat: { completions: { create: mockCreate } } };
  }),
}));

const { POST } = await import('@/app/api/resume-match/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/resume-match', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validBody = { jobDescription: 'React TypeScript Node.js developer role.' };
const validAuth = { user: { id: 'u1' } };

const mockOpenAIResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        score:       75,
        summary:     'Good match. Missing Docker experience.',
        matched:     ['React', 'TypeScript'],
        missing:     ['Docker'],
        suggestions: ['Add Docker to your DevOps section.'],
      }),
    },
  }],
};

describe('POST /api/resume-match', () => {
  it('returns 401 without session', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 }),
    );
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 403 SUBSCRIPTION_REQUIRED without active plan', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' }, { status: 403 }),
    );
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('SUBSCRIPTION_REQUIRED');
  });

  describe('authenticated requests', () => {
    beforeEach(() => {
      mockRequireSubscription.mockResolvedValue(validAuth);
      mockCheckEndpointRateLimit.mockResolvedValue(true);
    });

    it('returns 429 when endpoint rate limit is reached', async () => {
      mockCheckEndpointRateLimit.mockResolvedValueOnce(false);
      const res = await POST(makePost(validBody));
      expect(res.status).toBe(429);
    });

    it('returns 503 when OPENAI_API_KEY is missing', async () => {
      const saved = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      try {
        const res = await POST(makePost(validBody));
        expect(res.status).toBe(503);
      } finally {
        if (saved !== undefined) process.env.OPENAI_API_KEY = saved;
      }
    });

    it('returns 400 for an unparseable request body', async () => {
      process.env.OPENAI_API_KEY = 'sk-test';
      const req = new NextRequest('http://localhost/api/resume-match', {
        method:  'POST',
        body:    'not-json',
        headers: { 'content-type': 'application/json' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when jobDescription is missing', async () => {
      process.env.OPENAI_API_KEY = 'sk-test';
      const res = await POST(makePost({}));
      expect(res.status).toBe(400);
    });

    it('returns 200 with JSON result for a valid request', async () => {
      process.env.OPENAI_API_KEY = 'sk-test';
      mockCreate.mockResolvedValueOnce(mockOpenAIResponse);
      const res = await POST(makePost(validBody));
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/json');
      const body = await res.json();
      expect(body).toHaveProperty('score');
      expect(body).toHaveProperty('matched');
      expect(body).toHaveProperty('missing');
    });

    it('truncates jobDescription to 3000 chars in the OpenAI prompt', async () => {
      process.env.OPENAI_API_KEY = 'sk-test';
      let capturedContent = '';
      mockCreate.mockImplementationOnce(
        async (opts: { messages: { role: string; content: string }[] }) => {
          capturedContent = opts.messages.find(m => m.role === 'user')?.content ?? '';
          return mockOpenAIResponse;
        },
      );
      await POST(makePost({ jobDescription: 'x'.repeat(4000) }));
      expect(capturedContent).toContain('x'.repeat(3000));
      expect(capturedContent).not.toContain('x'.repeat(3001));
    });
  });
});
