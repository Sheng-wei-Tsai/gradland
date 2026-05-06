import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Supabase query chain mock ─────────────────────────────────────────────────
const mockLimit  = vi.fn().mockResolvedValue({ data: [], error: null });
const mockOrder  = vi.fn().mockReturnValue({ limit: mockLimit });
const mockGt     = vi.fn().mockReturnValue({ order: mockOrder });
const mockEq     = vi.fn().mockReturnValue({ gt: mockGt });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom   = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

const { GET } = await import('@/app/api/jobs/listings/route');

describe('GET /api/jobs/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockGt.mockReturnValue({ order: mockOrder });
    mockEq.mockReturnValue({ gt: mockGt });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it('returns empty listings when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    const orig = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const res  = await GET();
    const body = await res.json();
    expect(body.listings).toEqual([]);

    process.env.NEXT_PUBLIC_SUPABASE_URL = orig;
  });

  it('queries only status=active rows with expires_at > now()', async () => {
    const rows = [{ id: '1', company: 'Atlassian', title: 'Engineer', location: 'Sydney',
      job_type: 'Full-time', description: 'desc', apply_url: 'https://atlassian.com',
      salary: null, logo_url: null, posted_at: '2026-05-01' }];
    mockLimit.mockResolvedValueOnce({ data: rows, error: null });

    await GET();

    expect(mockEq).toHaveBeenCalledWith('status', 'active');
    expect(mockGt).toHaveBeenCalledWith('expires_at', expect.any(String));
  });

  it('returns the listings from Supabase in the response body', async () => {
    const rows = [{ id: '2', company: 'Canva', title: 'FE Engineer', location: 'Melbourne',
      job_type: 'Full-time', description: 'desc', apply_url: 'https://canva.com',
      salary: '$150k', logo_url: null, posted_at: '2026-05-02' }];
    mockLimit.mockResolvedValueOnce({ data: rows, error: null });

    const res  = await GET();
    const body = await res.json();
    expect(body.listings).toEqual(rows);
  });

  it('caps results at 10 via .limit(10)', async () => {
    await GET();
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('returns empty listings when Supabase returns an error', async () => {
    mockLimit.mockResolvedValueOnce({ data: null, error: { message: 'DB unavailable' } });

    const res  = await GET();
    const body = await res.json();
    expect(body.listings).toEqual([]);
  });
});
