import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockFrom    = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

const { GET } = await import('@/app/api/dashboard/summary/route');

const TEST_USER = { id: 'test-user-id' };

// Returns a chainable Supabase query mock that resolves via .maybeSingle().
// limit() returns `this` so .limit(1).maybeSingle() can be chained;
// for the job_applications query (ends with .limit, no .maybeSingle) use makeAppsChain().
function makeChain(maybeSingleData: unknown = null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {};
  c.select      = vi.fn().mockReturnValue(c);
  c.eq          = vi.fn().mockReturnValue(c);
  c.order       = vi.fn().mockReturnValue(c);
  c.lte         = vi.fn().mockReturnValue(c);
  c.limit       = vi.fn().mockReturnValue(c);
  c.maybeSingle = vi.fn().mockResolvedValue({ data: maybeSingleData, error: null });
  return c;
}

// job_applications ends with .limit(500), not .maybeSingle() — limit must return a Promise.
function makeAppsChain(rows: { status: string }[] = []) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = {};
  c.select = vi.fn().mockReturnValue(c);
  c.eq     = vi.fn().mockReturnValue(c);
  c.order  = vi.fn().mockReturnValue(c);
  c.limit  = vi.fn().mockResolvedValue({ data: rows, error: null });
  return c;
}

describe('GET /api/dashboard/summary', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockFrom.mockReturnValue(makeChain(null));
  });

  it('returns 401 without a session cookie', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 401 when session is invalid', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 200 with full DashboardSummary shape for a zero-data user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: TEST_USER }, error: null });

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();

    // All required fields present with correct types
    expect(typeof body.onboardingCompleted).toBe('boolean');
    expect(body.onboardingCompleted).toBe(false);
    expect(body.onboardingRole).toBeNull();
    expect(body.onboardingVisaStatus).toBeNull();
    expect(body.onboardingJobStage).toBeNull();
    expect(body.onboardingAnzsco).toBeNull();
    expect(body.onboardingExperienceYrs).toBeNull();
    expect(body.visaStep).toBeNull();
    expect(body.reviewDue).toBeNull();
    expect(body.resumeStaleDays).toBeNull();
    expect(body.applicationCount).toBe(0);
    expect(body.interviewCount).toBe(0);
  });

  it('extracts an in-progress visa step and returns the correct visaStep shape', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: TEST_USER }, error: null });

    // Route queries 5 tables in parallel via Promise.all in this order:
    // profiles, visa_tracker, skill_progress, resume_analyses, job_applications
    mockFrom
      .mockReturnValueOnce(makeChain({
        onboarding_completed:  true,
        onboarding_role:       'developer',
        onboarding_visa_status: '485',
        onboarding_job_stage:  'searching',
      }))                                                                   // profiles
      .mockReturnValueOnce(makeChain({
        steps:      { '3': { status: 'in_progress' } },
        started_at: '2025-01-15T00:00:00Z',
      }))                                                                   // visa_tracker
      .mockReturnValue(makeChain(null));                                    // remaining tables

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.visaStep).toEqual({ step: 3, status: 'in_progress', startedAt: '2025-01-15T00:00:00Z' });
    expect(body.onboardingCompleted).toBe(true);
    expect(body.onboardingRole).toBe('developer');
    expect(body.onboardingVisaStatus).toBe('485');
  });

  it('forwards onboardingAnzsco and onboardingExperienceYrs from the profiles row', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: TEST_USER }, error: null });

    mockFrom
      .mockReturnValueOnce(makeChain({
        onboarding_completed:     true,
        onboarding_role:          'developer',
        onboarding_visa_status:   'graduate',
        onboarding_job_stage:     'searching',
        onboarding_anzsco:        '261313',
        onboarding_experience_years: 3,
      }))                                                                   // profiles
      .mockReturnValue(makeChain(null));                                    // remaining tables

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.onboardingAnzsco).toBe('261313');
    expect(body.onboardingExperienceYrs).toBe(3);
  });

  it('counts total applications and interview-status rows correctly', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: TEST_USER }, error: null });

    mockFrom
      .mockReturnValueOnce(makeChain(null))  // profiles
      .mockReturnValueOnce(makeChain(null))  // visa_tracker
      .mockReturnValueOnce(makeChain(null))  // skill_progress
      .mockReturnValueOnce(makeChain(null))  // resume_analyses
      .mockReturnValueOnce(makeAppsChain([   // job_applications
        { status: 'applied' },
        { status: 'interview' },
        { status: 'interview' },
        { status: 'rejected' },
      ]));

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.applicationCount).toBe(4);
    expect(body.interviewCount).toBe(2);
  });
});
