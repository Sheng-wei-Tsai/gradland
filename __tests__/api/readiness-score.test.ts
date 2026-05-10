import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
  createSupabaseService: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select:      vi.fn().mockReturnThis(),
      eq:          vi.fn().mockReturnThis(),
      order:       vi.fn().mockReturnThis(),
      lte:         vi.fn().mockReturnThis(),
      limit:       vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      upsert:      vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

const { GET } = await import('@/app/api/readiness-score/route');

describe('GET /api/readiness-score', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it('returns 401 when no session cookie is present', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 401 when session is invalid', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 200 with CSS-var bandColor and full component shape for a zero-data user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();

    expect(typeof body.score).toBe('number');
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);

    // bandColor must be a CSS custom property (verifies BANDS token fix — supplement 2)
    expect(body.bandColor).toMatch(/^var\(--/);
    expect(typeof body.band).toBe('string');
    expect(body.band.length).toBeGreaterThan(0);

    // All four scoring components present with correct shape
    expect(body.components).toMatchObject({
      resume:    { score: 0, detail: expect.any(String) },
      skills:    { score: 0, detail: expect.any(String) },
      interview: { score: 0, detail: expect.any(String) },
      quiz:      { score: 0, detail: expect.any(String) },
    });

    // boostAction must have all three fields
    expect(body.boostAction).toMatchObject({
      label: expect.any(String),
      href:  expect.any(String),
      gain:  expect.any(String),
    });
  });
});
