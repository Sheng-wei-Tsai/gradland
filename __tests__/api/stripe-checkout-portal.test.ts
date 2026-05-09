import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Auth mock ──────────────────────────────────────────────────────────────────
const mockGetServerUser = vi.fn();
const mockFrom          = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  getServerUser:         (...args: unknown[]) => mockGetServerUser(...args),
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ── Stripe mock ────────────────────────────────────────────────────────────────
const mockCheckoutCreate      = vi.fn();
const mockCustomersCreate     = vi.fn();
const mockBillingPortalCreate = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function MockStripe() {
    return {
      checkout: {
        sessions: { create: mockCheckoutCreate },
      },
      customers: { create: mockCustomersCreate },
      billingPortal: {
        sessions: { create: mockBillingPortalCreate },
      },
    };
  }),
}));

// ── Import routes after mocks ─────────────────────────────────────────────────
const { POST: checkoutPOST } = await import('@/app/api/stripe/checkout/route');
const { POST: portalPOST }   = await import('@/app/api/stripe/portal/route');

function makePost(url: string) {
  return new NextRequest(url, { method: 'POST' });
}

// ── Shared setup ───────────────────────────────────────────────────────────────
const AUTHED_USER = { id: 'user-123', email: 'user@example.com' };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_PRICE_ID   = 'price_test_dummy';
  process.env.NEXT_PUBLIC_APP_URL = 'https://gradland.au';
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/stripe/checkout
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/stripe/checkout', () => {
  it('returns 401 when no session', async () => {
    mockGetServerUser.mockResolvedValue(null);
    const res = await checkoutPOST(makePost('http://localhost/api/stripe/checkout'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe('UNAUTHENTICATED');
  });

  it('returns 200 with { url } when user has an existing stripe_customer_id', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: 'cus_existing', email: 'user@example.com', full_name: 'Test User' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_abc' });

    const res  = await checkoutPOST(makePost('http://localhost/api/stripe/checkout'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe('https://checkout.stripe.com/pay/cs_test_abc');
    // Should NOT create a new customer when one already exists
    expect(mockCustomersCreate).not.toHaveBeenCalled();
  });

  it('creates a new Stripe customer when profile has no stripe_customer_id', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: null, email: 'user@example.com', full_name: 'Test User' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new_123' });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_new' });

    const res  = await checkoutPOST(makePost('http://localhost/api/stripe/checkout'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe('https://checkout.stripe.com/pay/cs_test_new');
    expect(mockCustomersCreate).toHaveBeenCalledOnce();
    expect(mockCustomersCreate.mock.calls[0][0]).toMatchObject({
      email:    'user@example.com',
      metadata: { supabase_user_id: 'user-123' },
    });
  });

  it('creates a new Stripe customer when profile row is null (new user)', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    mockCustomersCreate.mockResolvedValue({ id: 'cus_brand_new' });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_brandnew' });

    const res = await checkoutPOST(makePost('http://localhost/api/stripe/checkout'));
    expect(res.status).toBe(200);
    expect(mockCustomersCreate).toHaveBeenCalledOnce();
  });

  it('creates checkout session with subscription mode', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: 'cus_existing' },
            error: null,
          }),
        }),
      }),
    });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_mode' });

    await checkoutPOST(makePost('http://localhost/api/stripe/checkout'));

    const call = mockCheckoutCreate.mock.calls[0][0];
    expect(call.mode).toBe('subscription');
    expect(call.line_items[0].price).toBe('price_test_dummy');
    expect(call.metadata.supabase_user_id).toBe('user-123');
  });

  it('sets success_url and cancel_url using NEXT_PUBLIC_APP_URL', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: 'cus_existing' },
            error: null,
          }),
        }),
      }),
    });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_urls' });

    await checkoutPOST(makePost('http://localhost/api/stripe/checkout'));

    const call = mockCheckoutCreate.mock.calls[0][0];
    expect(call.success_url).toContain('/dashboard?subscribed=1');
    expect(call.cancel_url).toContain('/pricing?cancelled=1');
  });

  it('uses a matching Origin header in success/cancel URLs', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: 'cus_existing' },
            error: null,
          }),
        }),
      }),
    });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_origin' });

    // NEXT_PUBLIC_APP_URL is 'https://gradland.au' (set in beforeEach)
    // — that value is what populates the default allowlist when ALLOWED_ORIGINS is unset
    const req = new NextRequest('http://localhost/api/stripe/checkout', {
      method:  'POST',
      headers: { Origin: 'https://gradland.au' },
    });
    await checkoutPOST(req);

    const call = mockCheckoutCreate.mock.calls[0][0];
    expect(call.success_url).toContain('gradland.au/dashboard');
    expect(call.cancel_url).toContain('gradland.au/pricing');
  });

  it('falls back to NEXT_PUBLIC_APP_URL when Origin header is not in the allowlist', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: 'cus_existing' },
            error: null,
          }),
        }),
      }),
    });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_blocked' });

    const req = new NextRequest('http://localhost/api/stripe/checkout', {
      method:  'POST',
      headers: { Origin: 'https://evil.example.com' },
    });
    await checkoutPOST(req);

    const call = mockCheckoutCreate.mock.calls[0][0];
    // Disallowed origin must NOT appear in URLs — falls back to NEXT_PUBLIC_APP_URL
    expect(call.success_url).not.toContain('evil.example.com');
    expect(call.cancel_url).not.toContain('evil.example.com');
    expect(call.success_url).toContain('gradland.au');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/stripe/portal
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/stripe/portal', () => {
  it('returns 401 when no session', async () => {
    mockGetServerUser.mockResolvedValue(null);
    const res  = await portalPOST(makePost('http://localhost/api/stripe/portal'));
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.code).toBe('UNAUTHENTICATED');
  });

  it('returns 404 when profile has no stripe_customer_id', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const res  = await portalPOST(makePost('http://localhost/api/stripe/portal'));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.error).toMatch(/No active subscription/);
  });

  it('returns 404 when stripe_customer_id field is empty string', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: '' },
            error: null,
          }),
        }),
      }),
    });

    const res = await portalPOST(makePost('http://localhost/api/stripe/portal'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with { url } from Stripe billing portal on success', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: 'cus_existing_123' },
            error: null,
          }),
        }),
      }),
    });
    mockBillingPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/session/bps_test_abc' });

    const res  = await portalPOST(makePost('http://localhost/api/stripe/portal'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe('https://billing.stripe.com/session/bps_test_abc');
  });

  it('passes customer id and return_url to billingPortal.sessions.create', async () => {
    mockGetServerUser.mockResolvedValue(AUTHED_USER);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: 'cus_portal_456' },
            error: null,
          }),
        }),
      }),
    });
    mockBillingPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/session/bps_test_xyz' });

    await portalPOST(makePost('http://localhost/api/stripe/portal'));

    const call = mockBillingPortalCreate.mock.calls[0][0];
    expect(call.customer).toBe('cus_portal_456');
    expect(call.return_url).toContain('/dashboard');
  });
});
