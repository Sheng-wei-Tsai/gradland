import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Auth / DB mocks ───────────────────────────────────────────────────────────
const mockGetUser  = vi.fn();
const mockSignOut  = vi.fn().mockResolvedValue({});
const mockServiceFrom = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser, signOut: mockSignOut },
  }),
  createSupabaseService: vi.fn().mockReturnValue({ from: mockServiceFrom }),
}));

// ── Stripe mock ────────────────────────────────────────────────────────────────
const mockSubsList   = vi.fn();
const mockSubsCancel = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function MockStripe() {
    return {
      subscriptions: { list: mockSubsList, cancel: mockSubsCancel },
    };
  }),
}));

const { POST } = await import('@/app/api/account/delete/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeServiceChain(profileData: Record<string, unknown> | null) {
  // profile select chain
  const profileSelect = {
    select:      vi.fn(),
    eq:          vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: profileData, error: null }),
  };
  profileSelect.select.mockReturnValue(profileSelect);
  profileSelect.eq.mockReturnValue(profileSelect);

  // post_comments delete chain
  const commentsDelete = { delete: vi.fn(), eq: vi.fn().mockResolvedValue({ error: null }) };
  commentsDelete.delete.mockReturnValue(commentsDelete);

  // profile update chain
  const profileUpdate = { update: vi.fn(), eq: vi.fn().mockResolvedValue({ error: null }) };
  profileUpdate.update.mockReturnValue(profileUpdate);

  // Route calls from('profiles') twice (select then update) and from('post_comments') once
  mockServiceFrom.mockImplementation((table: string) => {
    if (table === 'post_comments') return commentsDelete;
    // First profiles call → select; second → update
    const callCount = mockServiceFrom.mock.calls.filter((c: string[]) => c[0] === 'profiles').length;
    return callCount <= 1 ? profileSelect : profileUpdate;
  });

  return { profileSelect, commentsDelete, profileUpdate };
}

// ── Tests ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
});

describe('POST /api/account/delete', () => {
  it('returns 401 when no session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('soft-deletes profile and deletes comments for free user (no Stripe call)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
    const { profileUpdate, commentsDelete } = makeServiceChain({
      stripe_customer_id: null,
      subscription_tier:  'free',
    });

    const res  = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);

    // Comments deleted for user
    expect(commentsDelete.eq).toHaveBeenCalledWith('user_id', 'user-abc');

    // Profile soft-deleted with a deleted_at timestamp
    const updateArg = profileUpdate.update.mock.calls[0][0] as Record<string, unknown>;
    expect(updateArg).toHaveProperty('deleted_at');
    expect(new Date(updateArg.deleted_at as string).getFullYear()).toBeGreaterThan(2020);

    // No Stripe calls for free user
    expect(mockSubsList).not.toHaveBeenCalled();
    expect(mockSubsCancel).not.toHaveBeenCalled();

    // Session signed out
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('cancels active Stripe subscription before soft-deleting for pro user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-pro' } } });
    makeServiceChain({ stripe_customer_id: 'cus_123', subscription_tier: 'pro' });

    mockSubsList.mockResolvedValue({ data: [{ id: 'sub_active_456' }] });
    mockSubsCancel.mockResolvedValue({});

    const res  = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockSubsList).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_123', status: 'active' })
    );
    expect(mockSubsCancel).toHaveBeenCalledWith('sub_active_456');
  });

  it('does not call Stripe cancel when subscription list is empty', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-lapsed' } } });
    makeServiceChain({ stripe_customer_id: 'cus_no_sub', subscription_tier: 'pro' });

    mockSubsList.mockResolvedValue({ data: [] });

    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockSubsCancel).not.toHaveBeenCalled();
  });

  it('returns 200 even when Stripe cancel throws (deletion is not blocked)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-stripe-err' } } });
    makeServiceChain({ stripe_customer_id: 'cus_broken', subscription_tier: 'pro' });

    mockSubsList.mockRejectedValue(new Error('Stripe API down'));

    const res  = await POST();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    // Profile soft-deletion still happened
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('skips Stripe when profile row is null (new user edge case)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-norow' } } });
    makeServiceChain(null);

    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockSubsList).not.toHaveBeenCalled();
  });
});
