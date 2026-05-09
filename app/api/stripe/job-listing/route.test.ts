/**
 * Stripe job-listing route tests.
 *
 * Covers: input validation — malformed body, missing required fields,
 * invalid location, invalid jobType, and invalid contactEmail.
 * Does NOT test Stripe API calls (those are Stripe's responsibility).
 */
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe so no real API calls are made (validation rejects before Stripe is reached)
vi.mock('stripe', () => ({
  default: class {
    checkout = {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    };
  },
}));

// Auth + rate-limit — default: anonymous, not limited
vi.mock('@/lib/auth-server', () => ({
  getServerUser: vi.fn(async () => null),
}));

vi.mock('@/lib/rate-limit-db', () => ({
  checkRateLimit: vi.fn(async () => false),
}));

const { POST } = await import('./route');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: string | object) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return new NextRequest('https://example.com/api/stripe/job-listing', {
    method:  'POST',
    body:    raw,
    headers: { 'content-type': 'application/json' },
  });
}

const validBody = {
  company:      'Acme Corp',
  title:        'Software Engineer',
  location:     'Sydney',
  jobType:      'Full-time',
  description:  'A great role in Sydney.',
  applyUrl:     'https://example.com/apply',
  contactEmail: 'hr@acme.com',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/stripe/job-listing', () => {
  // ── Malformed body ──────────────────────────────────────────────────────────

  it('returns 400 on malformed JSON body', async () => {
    const res = await POST(makeRequest('{not valid json'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid request');
  });

  // ── Missing required fields ─────────────────────────────────────────────────

  it('returns 400 when company is missing', async () => {
    const { company: _c, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  it('returns 400 when title is missing', async () => {
    const { title: _t, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  it('returns 400 when location is missing', async () => {
    const { location: _l, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  it('returns 400 when jobType is missing', async () => {
    const { jobType: _j, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  it('returns 400 when description is missing', async () => {
    const { description: _d, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  it('returns 400 when applyUrl is missing', async () => {
    const { applyUrl: _a, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  it('returns 400 when contactEmail is missing', async () => {
    const { contactEmail: _e, ...rest } = validBody;
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  // ── Invalid location ────────────────────────────────────────────────────────

  it('returns 400 when location is not in VALID_LOCATIONS', async () => {
    const res = await POST(makeRequest({ ...validBody, location: 'London' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid location');
  });

  it('returns 400 when location is an empty string', async () => {
    const res = await POST(makeRequest({ ...validBody, location: '' }));
    expect(res.status).toBe(400);
  });

  // ── Invalid jobType ─────────────────────────────────────────────────────────

  it('returns 400 when jobType is not in VALID_JOB_TYPES', async () => {
    const res = await POST(makeRequest({ ...validBody, jobType: 'Casual' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid job type');
  });

  it('returns 400 when jobType is an empty string', async () => {
    const res = await POST(makeRequest({ ...validBody, jobType: '' }));
    expect(res.status).toBe(400);
  });

  // ── Invalid contactEmail ────────────────────────────────────────────────────

  it('returns 400 when contactEmail is malformed', async () => {
    const res = await POST(makeRequest({ ...validBody, contactEmail: 'not-an-email' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid contact email');
  });
});
