import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ── Subscription mock ─────────────────────────────────────────────────────────
const mockRequireSubscription    = vi.fn();
const mockCheckEndpointRateLimit = vi.fn().mockResolvedValue(true);

vi.mock('@/lib/subscription', () => ({
  requireSubscription:    mockRequireSubscription,
  checkEndpointRateLimit: mockCheckEndpointRateLimit,
  rateLimitResponse: () =>
    new Response(
      JSON.stringify({ error: 'Rate limit exceeded.', code: 'RATE_LIMIT_EXCEEDED' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
}));

// ── Supabase mock ─────────────────────────────────────────────────────────────
const mockInsertThen = vi.fn();
const mockInsert     = vi.fn().mockReturnValue({ then: mockInsertThen });
const mockFrom       = vi.fn().mockReturnValue({ insert: mockInsert });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ── Anthropic mock ────────────────────────────────────────────────────────────
const mockMessagesCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(function MockAnthropic() {
    return { messages: { create: mockMessagesCreate } };
  }),
}));

const { POST } = await import('@/app/api/resume-analyse/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makePdfFile(sizeBytes = 1024): File {
  return new File([new Uint8Array(sizeBytes)], 'resume.pdf', { type: 'application/pdf' });
}

function makeRequest(file: File | null): NextRequest {
  const req = new NextRequest('http://localhost/api/resume-analyse', { method: 'POST' });
  const fd  = new FormData();
  if (file) fd.append('resume', file);
  vi.spyOn(req, 'formData').mockResolvedValue(fd);
  return req;
}

const validAnalysis = {
  overallScore:      78,
  scoreLabel:        'Strong',
  summary:           'A solid resume for the AU market.',
  auFormatting:      { score: 80, issues: [] },
  contentQuality:    { score: 75, strengths: ['Quantified achievements'], gaps: [] },
  auMarketFit:       { score: 70, topRolesMatch: ['Software Engineer'], missingSkills: [], shortage: false },
  actionItems:       [{ priority: 'medium', action: 'Add a GitHub link' }],
  interviewReadiness: '1-2 quick fixes needed',
};

const validAuth = { user: { id: 'u1' } };

describe('POST /api/resume-analyse', () => {
  it('returns 401 without session', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 },
      ),
    );
    const res = await POST(makeRequest(makePdfFile()));
    expect(res.status).toBe(401);
  });

  it('returns 403 SUBSCRIPTION_REQUIRED without active plan', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json(
        { error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' },
        { status: 403 },
      ),
    );
    const res  = await POST(makeRequest(makePdfFile()));
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
      const res = await POST(makeRequest(makePdfFile()));
      expect(res.status).toBe(429);
    });

    it('returns 400 when no file is provided', async () => {
      const res  = await POST(makeRequest(null));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    });

    it('returns 400 for a non-PDF file type', async () => {
      const docx = new File([new Uint8Array(100)], 'resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const res  = await POST(makeRequest(docx));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('PDF');
    });

    it('returns 400 for a file larger than 5 MB', async () => {
      const res  = await POST(makeRequest(makePdfFile(6 * 1024 * 1024)));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('5 MB');
    });

    it('returns 500 when Anthropic returns malformed JSON', async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'not-valid-json' }],
      });
      const res = await POST(makeRequest(makePdfFile()));
      expect(res.status).toBe(500);
    });

    it('returns 200 with parsed analysis for a valid PDF', async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
      });
      const res  = await POST(makeRequest(makePdfFile()));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.overallScore).toBe(78);
      expect(body.scoreLabel).toBe('Strong');
      expect(Array.isArray(body.actionItems)).toBe(true);
    });

    it('calls Anthropic with claude-sonnet-4-6 and a base64 PDF document', async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validAnalysis) }],
      });
      await POST(makeRequest(makePdfFile()));
      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-6',
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: 'document',
                  source: expect.objectContaining({
                    type:       'base64',
                    media_type: 'application/pdf',
                  }),
                }),
              ]),
            }),
          ]),
        }),
      );
    });
  });
});
