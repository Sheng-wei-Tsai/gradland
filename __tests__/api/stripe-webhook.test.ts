import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase mock ─────────────────────────────────────────────────────────────
const mockStripeEventsSelect = vi.fn().mockResolvedValue({ data: [{ event_id: 'evt_test' }], error: null });
const mockStripeEventsUpsert = vi.fn().mockReturnValue({ select: mockStripeEventsSelect });
const mockJobListingsInsert  = vi.fn().mockResolvedValue({ error: null });
const mockProfilesUpdate     = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'stripe_events') return { upsert: mockStripeEventsUpsert };
      if (table === 'job_listings')  return { insert: mockJobListingsInsert };
      if (table === 'profiles')      return { update: mockProfilesUpdate };
      return {};
    }),
  })),
}));

// ── Email mock ────────────────────────────────────────────────────────────────
vi.mock('@/lib/email', () => ({
  sendJobListingConfirmation: vi.fn().mockResolvedValue(undefined),
}));

// ── Stripe mock ───────────────────────────────────────────────────────────────
const mockConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn().mockResolvedValue({
  metadata:   { supabase_user_id: 'user-123' },
  status:     'active',
  items:      { data: [{ current_period_end: Math.floor(Date.now() / 1000) + 2592000 }] },
});

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function MockStripe() {
    return {
      webhooks:      { constructEvent: mockConstructEvent },
      subscriptions: { retrieve: mockSubscriptionsRetrieve },
    };
  }),
}));

const { POST } = await import('@/app/api/stripe/webhook/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeEvent(type: string, data: object, id = 'evt_test_001') {
  return { id, type, data: { object: data } };
}

function makeRequest(body: string, signature = 'valid-sig') {
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method:  'POST',
    body,
    headers: { 'stripe-signature': signature },
  });
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: constructEvent succeeds
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', {}));
    // Default: upsert returns 1 row = new event (not a replay)
    mockStripeEventsSelect.mockResolvedValue({ data: [{ event_id: 'evt_test_001' }], error: null });
    mockStripeEventsUpsert.mockReturnValue({ select: mockStripeEventsSelect });
    mockJobListingsInsert.mockResolvedValue({ error: null });
    mockProfilesUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockSubscriptionsRetrieve.mockResolvedValue({
      metadata:   { supabase_user_id: 'user-123' },
      status:     'active',
      items:      { data: [{ current_period_end: Math.floor(Date.now() / 1000) + 2592000 }] },
    });
    process.env.STRIPE_SECRET_KEY      = 'sk_test_dummy';
    process.env.STRIPE_WEBHOOK_SECRET  = 'whsec_dummy';
  });

  // ── Signature validation ──────────────────────────────────────────────────

  it('returns 400 on invalid webhook signature', async () => {
    mockConstructEvent.mockImplementationOnce(() => { throw new Error('Invalid signature'); });
    const res = await POST(makeRequest('{}', 'bad-sig'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid webhook signature/);
  });

  // ── Idempotency guard ─────────────────────────────────────────────────────

  it('returns 200 with replay:true when event already processed', async () => {
    // upsert with ignoreDuplicates returns [] when the row already existed
    mockStripeEventsSelect.mockResolvedValueOnce({ data: [], error: null });

    const event = makeEvent('checkout.session.completed', {}, 'evt_duplicate');
    mockConstructEvent.mockReturnValueOnce(event);

    const res  = await POST(makeRequest(JSON.stringify(event)));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.replay).toBe(true);
    // Handler must not run — no job_listings insert
    expect(mockJobListingsInsert).not.toHaveBeenCalled();
  });

  it('processes a new event exactly once', async () => {
    const jobMeta = {
      type:         'job_listing',
      company:      'Atlassian',
      title:        'Engineer',
      location:     'Sydney',
      jobType:      'Full-time',
      description:  'Build stuff',
      applyUrl:     'https://atlassian.com/jobs',
      salary:       '',
      contactEmail: 'hire@atlassian.com',
    };
    const event = makeEvent('checkout.session.completed', {
      id:       'cs_test_001',
      metadata: jobMeta,
    });
    mockConstructEvent.mockReturnValueOnce(event);

    const res  = await POST(makeRequest(JSON.stringify(event)));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
    expect(body.replay).toBeUndefined();
    expect(mockJobListingsInsert).toHaveBeenCalledOnce();
  });

  it('duplicate event_id processes the job insert only once', async () => {
    const jobMeta = {
      type:         'job_listing',
      company:      'Canva',
      title:        'Designer',
      location:     'Sydney',
      jobType:      'Full-time',
      description:  'Create',
      applyUrl:     'https://canva.com/jobs',
      salary:       '',
      contactEmail: 'hire@canva.com',
    };
    const event = makeEvent('checkout.session.completed', { id: 'cs_dup', metadata: jobMeta }, 'evt_dup');
    mockConstructEvent.mockReturnValue(event);

    // First call: new event
    mockStripeEventsSelect.mockResolvedValueOnce({ data: [{ event_id: 'evt_dup' }], error: null });
    await POST(makeRequest(JSON.stringify(event)));
    expect(mockJobListingsInsert).toHaveBeenCalledTimes(1);

    // Second call: replay (0 rows from upsert)
    mockStripeEventsSelect.mockResolvedValueOnce({ data: [], error: null });
    await POST(makeRequest(JSON.stringify(event)));
    // Still only 1 insert total — replay was skipped
    expect(mockJobListingsInsert).toHaveBeenCalledTimes(1);
  });

  // ── Event routing ─────────────────────────────────────────────────────────

  it('handles checkout.session.completed for subscription', async () => {
    const event = makeEvent('checkout.session.completed', {
      id:           'cs_sub_001',
      subscription: 'sub_test_001',
      metadata:     { supabase_user_id: 'user-456' },
    }, 'evt_sub_001');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeRequest(JSON.stringify(event)));
    expect(res.status).toBe(200);
    expect(mockProfilesUpdate).toHaveBeenCalled();
  });

  it('handles customer.subscription.deleted (downgrade to free)', async () => {
    const event = makeEvent('customer.subscription.deleted', {
      id:       'sub_deleted',
      metadata: { supabase_user_id: 'user-789' },
      status:   'canceled',
    }, 'evt_cancel_001');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeRequest(JSON.stringify(event)));
    expect(res.status).toBe(200);
    expect(mockProfilesUpdate).toHaveBeenCalled();
  });

  it('returns 200 received:true for unknown event types', async () => {
    const event = makeEvent('payment_intent.created', {}, 'evt_unknown_001');
    mockConstructEvent.mockReturnValueOnce(event);

    const res  = await POST(makeRequest(JSON.stringify(event)));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });
});
