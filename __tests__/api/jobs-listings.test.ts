import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Supabase query chain mock ─────────────────────────────────────────────────
const mockLimit  = vi.fn().mockResolvedValue({ data: [], error: null });
const mockOrder  = vi.fn().mockReturnValue({ limit: mockLimit });
const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
const mockFrom   = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

const { GET } = await import('@/app/api/jobs/listings/route');

describe('GET /api/jobs/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it('returns empty listings when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    const orig = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const res  = await GET();
    const body = await res.json();
    expect(body.listings).toEqual([]);

    process.env.SUPABASE_SERVICE_ROLE_KEY = orig;
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

  it('orders by posted_at descending', async () => {
    await GET();
    expect(mockOrder).toHaveBeenCalledWith('posted_at', { ascending: false });
  });

  it('returns empty listings when Supabase returns an error', async () => {
    mockLimit.mockResolvedValueOnce({ data: null, error: { message: 'DB unavailable' } });

    const res  = await GET();
    const body = await res.json();
    expect(body.listings).toEqual([]);
  });
});
