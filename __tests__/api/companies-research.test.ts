import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      JSON.stringify({ error: 'Rate limit exceeded.', code: 'RATE_LIMIT_EXCEEDED' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
}));

// ── Anthropic mock ────────────────────────────────────────────────────────────
const mockMessagesCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function MockAnthropic() {
    return { messages: { create: mockMessagesCreate } };
  }),
}));

const { POST } = await import('@/app/api/companies/research/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
const validAuth = { user: { id: 'u1' } };

function makePost(body: object) {
  return new NextRequest('http://localhost/api/companies/research', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validResearch = {
  culture:          { snapshot: 'Great place', workStyle: 'Hybrid 3 days', standout: 'Very flat' },
  techStack:        { primary: ['Java'], infrastructure: ['AWS'], interesting: 'Event-driven' },
  interviewProcess: { rounds: 'Phone + 2x coding', style: 'LeetCode', tips: ['Practice DP'] },
  candidateProfile: { ideal: 'T-shaped engineer', mustHaves: ['Java'], niceToHaves: ['Kotlin'] },
  forInternational: { sponsorship: 'Yes, 482 sponsored', pathway: 'Grad → Associate → Senior' },
  insiderTips:      ['Coffee chats matter', 'Check the eng blog'],
};

describe('POST /api/companies/research', () => {
  beforeEach(() => {
    mockRequireSubscription.mockReset();
    mockCheckEndpointRateLimit.mockResolvedValue(true);
    mockMessagesCreate.mockReset();
    mockRecordUsage.mockReset();
  });

  it('returns 401 without session', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 }),
    );
    const res = await POST(makePost({ slug: 'atlassian' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 SUBSCRIPTION_REQUIRED without active plan', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' }, { status: 403 }),
    );
    const res  = await POST(makePost({ slug: 'atlassian' }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('SUBSCRIPTION_REQUIRED');
  });

  describe('authenticated requests', () => {
    beforeEach(() => {
      mockRequireSubscription.mockResolvedValue(validAuth);
    });

    it('returns 429 when endpoint rate limit is exceeded', async () => {
      mockCheckEndpointRateLimit.mockResolvedValueOnce(false);
      const res = await POST(makePost({ slug: 'atlassian' }));
      expect(res.status).toBe(429);
    });

    it('returns 400 when slug contains uppercase letters', async () => {
      const res  = await POST(makePost({ slug: 'Atlassian' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    });

    it('returns 400 when slug contains spaces', async () => {
      const res  = await POST(makePost({ slug: 'bad slug' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    });

    it('returns 400 when slug contains special characters', async () => {
      const res  = await POST(makePost({ slug: 'bad_slug!' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    });

    it('returns 400 when slug is missing', async () => {
      const res  = await POST(makePost({}));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    });

    it('returns 404 when slug format is valid but company does not exist', async () => {
      const res  = await POST(makePost({ slug: 'nonexistent-company-xyz' }));
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    });

    it('returns 200 with parsed research for a known company slug', async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validResearch) }],
      });
      const res  = await POST(makePost({ slug: 'atlassian' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.culture).toBeDefined();
      expect(body.techStack).toBeDefined();
      expect(body.insiderTips).toBeInstanceOf(Array);
    });

    it('returns 500 when Anthropic returns malformed JSON', async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'not-valid-json' }],
      });
      const res = await POST(makePost({ slug: 'atlassian' }));
      expect(res.status).toBe(500);
    });

    it('records usage after a successful Claude call', async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validResearch) }],
      });
      await POST(makePost({ slug: 'atlassian' }));
      expect(mockRecordUsage).toHaveBeenCalledWith('u1', 'companies/research');
    });
  });
});
