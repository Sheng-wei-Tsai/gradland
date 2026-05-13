import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ── Subscription mock ─────────────────────────────────────────────────────────
const mockRequireSubscription    = vi.fn();
const mockCheckEndpointRateLimit = vi.fn().mockResolvedValue(true);
const mockRecordUsage            = vi.fn();

vi.mock('@/lib/subscription', () => ({
  requireSubscription:    mockRequireSubscription,
  checkEndpointRateLimit: mockCheckEndpointRateLimit,
  recordUsage:            mockRecordUsage,
  rateLimitResponse: () =>
    new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
}));

// ── OpenAI mock ───────────────────────────────────────────────────────────────
const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function MockOpenAI() {
    return { chat: { completions: { create: mockCreate } } };
  }),
}));

// ── Route imports ─────────────────────────────────────────────────────────────
const { POST: chatPOST }     = await import('@/app/api/interview/chat/route');
const { POST: evaluatePOST } = await import('@/app/api/interview/evaluate/route');
const { POST: mentorPOST }   = await import('@/app/api/interview/mentor/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makePost(url: string, body: object) {
  return new NextRequest(url, {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validAuth = { user: { id: 'u1' } };

async function* fakeStream(chunks: string[]) {
  for (const text of chunks) {
    yield { choices: [{ delta: { content: text } }] };
  }
}

// ── Shared reset ──────────────────────────────────────────────────────────────
beforeEach(() => {
  mockRequireSubscription.mockResolvedValue(validAuth);
  mockCheckEndpointRateLimit.mockResolvedValue(true);
  mockCreate.mockReset();
  mockRecordUsage.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// interview/chat
// =============================================================================
describe('POST /api/interview/chat', () => {
  const url  = 'http://localhost/api/interview/chat';
  const msgs = [{ role: 'user', content: 'How do I answer behavioural questions?' }];

  it('returns 401 without session', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    );
    const res = await chatPOST(makePost(url, { messages: msgs }));
    expect(res.status).toBe(401);
  });

  it('returns 403 SUBSCRIPTION_REQUIRED without active plan', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' }, { status: 403 }),
    );
    const res = await chatPOST(makePost(url, { messages: msgs }));
    expect(res.status).toBe(403);
  });

  it('returns 429 when endpoint rate limit is exceeded', async () => {
    mockCheckEndpointRateLimit.mockResolvedValueOnce(false);
    const res = await chatPOST(makePost(url, { messages: msgs }));
    expect(res.status).toBe(429);
  });

  it('returns 400 when messages is missing', async () => {
    const res = await chatPOST(makePost(url, {}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when messages is empty array', async () => {
    const res = await chatPOST(makePost(url, { messages: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for unparseable request body', async () => {
    const req = new NextRequest(url, {
      method:  'POST',
      body:    'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await chatPOST(req);
    expect(res.status).toBe(400);
  });

  it('streams plain-text on valid input', async () => {
    mockCreate.mockResolvedValueOnce(fakeStream(['Great ', 'question!']));
    const res = await chatPOST(makePost(url, { messages: msgs, roleTitle: 'Software Engineer' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();
    expect(text).toBe('Great question!');
  });

  it('records usage on successful response', async () => {
    mockCreate.mockResolvedValueOnce(fakeStream(['ok']));
    await chatPOST(makePost(url, { messages: msgs }));
    expect(mockRecordUsage).toHaveBeenCalledWith('u1', 'interview/chat');
  });

  it('returns 502 when OpenAI throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('upstream timeout'));
    const res = await chatPOST(makePost(url, { messages: msgs }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Chat failed');
  });
});

// =============================================================================
// interview/evaluate
// =============================================================================
describe('POST /api/interview/evaluate', () => {
  const url       = 'http://localhost/api/interview/evaluate';
  const validBody = { question: 'What is closure?', answer: 'A closure captures variables.', roleTitle: 'Frontend Dev' };

  it('returns 401 without session', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    );
    const res = await evaluatePOST(makePost(url, validBody));
    expect(res.status).toBe(401);
  });

  it('returns 429 when endpoint rate limit is exceeded', async () => {
    mockCheckEndpointRateLimit.mockResolvedValueOnce(false);
    const res = await evaluatePOST(makePost(url, validBody));
    expect(res.status).toBe(429);
  });

  it('returns 400 when question is missing', async () => {
    const res = await evaluatePOST(makePost(url, { answer: 'A', roleTitle: 'Dev' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when answer is missing', async () => {
    const res = await evaluatePOST(makePost(url, { question: 'Q?', roleTitle: 'Dev' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when roleTitle is missing', async () => {
    const res = await evaluatePOST(makePost(url, { question: 'Q?', answer: 'A' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for unparseable request body', async () => {
    const req = new NextRequest(url, {
      method:  'POST',
      body:    '{bad',
      headers: { 'content-type': 'application/json' },
    });
    const res = await evaluatePOST(req);
    expect(res.status).toBe(400);
  });

  it('streams plain-text feedback on valid input', async () => {
    mockCreate.mockResolvedValueOnce(fakeStream(['**Score: 80/100**', ' Good answer.']));
    const res = await evaluatePOST(makePost(url, validBody));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();
    expect(text).toContain('Score: 80/100');
  });

  it('truncates answer to 2000 chars before sending to OpenAI', async () => {
    let capturedUserContent = '';
    mockCreate.mockImplementationOnce(
      async (opts: { messages: { role: string; content: string }[] }) => {
        capturedUserContent = opts.messages.find(m => m.role === 'user')?.content ?? '';
        return fakeStream(['ok']);
      },
    );

    await evaluatePOST(makePost(url, { ...validBody, answer: 'a'.repeat(2500) }));

    expect(capturedUserContent).toContain('a'.repeat(2000));
    expect(capturedUserContent).not.toContain('a'.repeat(2001));
  });

  it('records usage on successful response', async () => {
    mockCreate.mockResolvedValueOnce(fakeStream(['ok']));
    await evaluatePOST(makePost(url, validBody));
    expect(mockRecordUsage).toHaveBeenCalledWith('u1', 'interview/evaluate');
  });

  it('returns 502 when OpenAI throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('model overloaded'));
    const res = await evaluatePOST(makePost(url, validBody));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Evaluation failed');
  });
});

// =============================================================================
// interview/mentor
// =============================================================================
describe('POST /api/interview/mentor', () => {
  const url       = 'http://localhost/api/interview/mentor';
  const validBody = { stage: 'scene', question: 'Tell me about yourself.', roleTitle: 'Software Engineer' };

  it('returns 401 without session', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    );
    const res = await mentorPOST(makePost(url, validBody));
    expect(res.status).toBe(401);
  });

  it('returns 429 when endpoint rate limit is exceeded', async () => {
    mockCheckEndpointRateLimit.mockResolvedValueOnce(false);
    const res = await mentorPOST(makePost(url, validBody));
    expect(res.status).toBe(429);
  });

  it('returns 400 when stage is missing', async () => {
    const res = await mentorPOST(makePost(url, { question: 'Q?', roleTitle: 'Dev' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when question is missing', async () => {
    const res = await mentorPOST(makePost(url, { stage: 'scene', roleTitle: 'Dev' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when roleTitle is missing', async () => {
    const res = await mentorPOST(makePost(url, { stage: 'scene', question: 'Q?' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid stage value', async () => {
    const res = await mentorPOST(makePost(url, { ...validBody, stage: 'not-a-real-stage' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid stage/i);
  });

  it('returns 400 for unparseable request body', async () => {
    const req = new NextRequest(url, {
      method:  'POST',
      body:    ':::',
      headers: { 'content-type': 'application/json' },
    });
    const res = await mentorPOST(req);
    expect(res.status).toBe(400);
  });

  it('streams plain-text narration on valid input', async () => {
    mockCreate.mockResolvedValueOnce(fakeStream(['In Australian tech teams,', ' this question matters.']));
    const res = await mentorPOST(makePost(url, validBody));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();
    expect(text).toContain('Australian tech teams');
  });

  it.each(['scene', 'why', 'guide', 'reality', 'followup'] as const)(
    'accepts valid stage "%s"',
    async (stage) => {
      mockCreate.mockResolvedValueOnce(fakeStream(['ok']));
      const body = stage === 'followup'
        ? { stage, question: 'Q?', roleTitle: 'Dev', userAnswer: 'My answer.' }
        : { stage, question: 'Q?', roleTitle: 'Dev' };
      const res = await mentorPOST(makePost(url, body));
      expect(res.status).toBe(200);
    },
  );

  it('records usage on successful response', async () => {
    mockCreate.mockResolvedValueOnce(fakeStream(['ok']));
    await mentorPOST(makePost(url, validBody));
    expect(mockRecordUsage).toHaveBeenCalledWith('u1', 'interview/mentor');
  });

  it('returns 502 when OpenAI throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('connection reset'));
    const res = await mentorPOST(makePost(url, validBody));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Failed to generate narration');
  });
});
