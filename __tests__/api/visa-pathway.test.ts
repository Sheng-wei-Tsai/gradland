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

vi.mock('@/lib/auth-server', () => ({
  rateLimitResponse: () =>
    new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
}));

const { POST } = await import('@/app/api/visa/pathway/route');

function makePost(body: object) {
  return new NextRequest('http://localhost/api/visa/pathway', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validAuth = { user: { id: 'u1' } };

const validBody = {
  currentVisa:     'graduate',
  anzsco:          '261313',
  ageBracket:      '25-32',
  experienceYears: 2,
  englishLevel:    'proficient',
  educationLevel:  'bachelor-or-master',
  salary:          90000,
  state:           'NSW',
};

describe('POST /api/visa/pathway', () => {
  afterEach(() => {
    mockRequireSubscription.mockReset();
    mockCheckEndpointRateLimit.mockResolvedValue(true);
  });

  // ── Auth gates ──────────────────────────────────────────────────────────────

  it('returns 401 when unauthenticated', async () => {
    mockRequireSubscription.mockResolvedValueOnce(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    );
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 403 when subscription is required', async () => {
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

  // ── Input validation ────────────────────────────────────────────────────────

  it('returns 400 for unparseable request body', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const req = new NextRequest('http://localhost/api/visa/pathway', {
      method:  'POST',
      body:    'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when currentVisa is not in VALID_VISA', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, currentVisa: 'tourist' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/currentVisa/);
  });

  it('returns 400 when anzsco is not 6 digits', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, anzsco: '26131' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/anzsco/);
  });

  it('returns 400 when anzsco contains non-digits', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, anzsco: '26131X' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/anzsco/);
  });

  it('returns 400 when ageBracket is not in VALID_AGE', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, ageBracket: '20-24' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/ageBracket/);
  });

  it('returns 400 when experienceYears is negative', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, experienceYears: -1 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/experienceYears/);
  });

  it('returns 400 when experienceYears exceeds 50', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, experienceYears: 51 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/experienceYears/);
  });

  it('returns 400 when state is not in VALID_STATE', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, state: 'NZ' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/state/);
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('returns 200 with { input, analysis } on valid payload', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('input');
    expect(body).toHaveProperty('analysis');
    expect(body.input.currentVisa).toBe('graduate');
    expect(body.input.anzsco).toBe('261313');
    expect(body.input.state).toBe('NSW');
  });

  it('truncates experienceYears and salary to integer via Math.trunc', async () => {
    mockRequireSubscription.mockResolvedValueOnce(validAuth);
    const res = await POST(makePost({ ...validBody, experienceYears: 2.9, salary: 90000.75 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.input.experienceYears).toBe(2);
    expect(body.input.salary).toBe(90000);
  });
});
