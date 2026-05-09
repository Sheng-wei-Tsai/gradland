import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Stripe mock ───────────────────────────────────────────────────────────────
const mockSessionsCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_abc' });

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function MockStripe() {
    return {
      checkout: {
        sessions: {
          create: mockSessionsCreate,
        },
      },
    };
  }),
}));

// ── Auth mock — default: anonymous visitor ────────────────────────────────────
const mockGetServerUser = vi.fn(async () => null);
vi.mock('@/lib/auth-server', () => ({
  getServerUser: mockGetServerUser,
}));

// ── Rate-limit mock — default: not limited ────────────────────────────────────
const mockCheckRateLimit = vi.fn(async () => false);
vi.mock('@/lib/rate-limit-db', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

const { POST } = await import('@/app/api/stripe/job-listing/route');

const VALID_BODY = {
  company:      'Atlassian',
  title:        'Senior Engineer',
  location:     'Sydney',
  jobType:      'Full-time',
  description:  'Build cool stuff.',
  applyUrl:     'https://atlassian.com/jobs/123',
  salary:       '$150k–$180k',
  contactEmail: 'hiring@atlassian.com',
};

// Each call gets a fresh IP by default so tests don't interfere with the rate-limit map
let ipSeq = 10;
function makePost(body: object, ip?: string) {
  return new NextRequest('http://localhost/api/stripe/job-listing', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip ?? `10.1.${Math.floor(ipSeq / 256)}.${ipSeq++ % 256}` },
  });
}

describe('POST /api/stripe/job-listing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_abc' });
    mockGetServerUser.mockResolvedValue(null);
    mockCheckRateLimit.mockResolvedValue(false);
    process.env.STRIPE_SECRET_KEY           = 'sk_test_dummy';
    process.env.STRIPE_JOB_LISTING_PRICE_ID = 'price_test_dummy';
    process.env.NEXT_PUBLIC_APP_URL         = 'https://gradland.au';
  });

  // ── Input validation ─────────────────────────────────────────────────────────

  it('returns 400 when body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost/api/stripe/job-listing', {
      method: 'POST',
      body:   'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res  = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const { company: _c, ...withoutCompany } = VALID_BODY;
    const res  = await POST(makePost(withoutCompany));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 when contactEmail is missing', async () => {
    const { contactEmail: _e, ...withoutEmail } = VALID_BODY;
    const res  = await POST(makePost(withoutEmail));
    expect(res.status).toBe(400);
  });

  it('returns 400 when location is outside VALID_LOCATIONS', async () => {
    const res  = await POST(makePost({ ...VALID_BODY, location: 'London' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid location/);
  });

  it('accepts all valid location values', async () => {
    const locations = ['Sydney', 'Melbourne', 'Brisbane', 'Remote', 'Hybrid'];
    for (const location of locations) {
      mockSessionsCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/pay/cs_test' });
      const res = await POST(makePost({ ...VALID_BODY, location }));
      expect(res.status).toBe(200);
    }
  });

  it('returns 400 when jobType is outside VALID_JOB_TYPES', async () => {
    const res  = await POST(makePost({ ...VALID_BODY, jobType: 'Part-time' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid job type/);
  });

  it('accepts all valid jobType values', async () => {
    const jobTypes = ['Full-time', 'Contract', 'Graduate'];
    for (const jobType of jobTypes) {
      mockSessionsCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/pay/cs_test' });
      const res = await POST(makePost({ ...VALID_BODY, jobType }));
      expect(res.status).toBe(200);
    }
  });

  it('returns 400 on malformed contactEmail', async () => {
    const res  = await POST(makePost({ ...VALID_BODY, contactEmail: 'not-an-email' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid contact email/);
  });

  it('returns 400 when contactEmail has no domain part', async () => {
    const res = await POST(makePost({ ...VALID_BODY, contactEmail: 'user@' }));
    expect(res.status).toBe(400);
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('returns 200 with { url } from Stripe on valid input', async () => {
    const res  = await POST(makePost(VALID_BODY));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe('https://checkout.stripe.com/pay/cs_test_abc');
  });

  it('works without optional salary field', async () => {
    const { salary: _s, ...withoutSalary } = VALID_BODY;
    const res  = await POST(makePost(withoutSalary));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBeTruthy();
  });

  // ── Stripe metadata truncation ────────────────────────────────────────────────

  it('truncates company to 100 chars in Stripe metadata', async () => {
    const longCompany = 'A'.repeat(200);
    await POST(makePost({ ...VALID_BODY, company: longCompany }));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.metadata.company).toHaveLength(100);
    expect(call.metadata.company).toBe('A'.repeat(100));
  });

  it('truncates title to 200 chars in Stripe metadata', async () => {
    const longTitle = 'T'.repeat(400);
    await POST(makePost({ ...VALID_BODY, title: longTitle }));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.metadata.title).toHaveLength(200);
  });

  it('truncates description to 500 chars in Stripe metadata', async () => {
    const longDesc = 'D'.repeat(1000);
    await POST(makePost({ ...VALID_BODY, description: longDesc }));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.metadata.description).toHaveLength(500);
  });

  it('truncates applyUrl to 500 chars in Stripe metadata', async () => {
    const longUrl = 'https://example.com/' + 'u'.repeat(600);
    await POST(makePost({ ...VALID_BODY, applyUrl: longUrl }));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.metadata.applyUrl).toHaveLength(500);
  });

  it('truncates salary to 100 chars in Stripe metadata', async () => {
    const longSalary = '$' + '1'.repeat(200);
    await POST(makePost({ ...VALID_BODY, salary: longSalary }));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.metadata.salary).toHaveLength(100);
  });

  it('truncates contactEmail to 200 chars in Stripe metadata', async () => {
    const longEmail = 'a'.repeat(195) + '@b.com'; // 201 chars total — passes regex, sliced to 200
    await POST(makePost({ ...VALID_BODY, contactEmail: longEmail }));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.metadata.contactEmail).toHaveLength(200);
  });

  it('sets metadata.type to "job_listing"', async () => {
    await POST(makePost(VALID_BODY));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.metadata.type).toBe('job_listing');
  });

  it('uses one-time payment mode', async () => {
    await POST(makePost(VALID_BODY));

    const call = mockSessionsCreate.mock.calls[0][0];
    expect(call.mode).toBe('payment');
  });

  // ── Abuse gate ───────────────────────────────────────────────────────────────

  it('returns 429 when IP rate limit is exceeded (anonymous visitor)', async () => {
    mockCheckRateLimit.mockResolvedValueOnce(true);
    const res  = await POST(makePost(VALID_BODY));
    const body = await res.json();
    expect(res.status).toBe(429);
    expect(body.error).toMatch(/Too many requests/);
  });

  it('uses per-user rate-limit key when authenticated', async () => {
    mockGetServerUser.mockResolvedValueOnce({ id: 'user-abc' } as never);
    await POST(makePost(VALID_BODY));
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('user:user-abc'),
      3600,
      10,
    );
  });

  it('uses per-IP rate-limit key when anonymous', async () => {
    mockGetServerUser.mockResolvedValueOnce(null);
    await POST(makePost(VALID_BODY));
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('ip:'),
      3600,
      5,
    );
  });
});
