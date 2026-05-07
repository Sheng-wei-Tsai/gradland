import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase service mock ─────────────────────────────────────────────────────
const mockFrom = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ── Email mocks ───────────────────────────────────────────────────────────────
const mockSendExpired  = vi.fn().mockResolvedValue(undefined);
const mockSendReminder = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/email', () => ({
  sendJobListingExpired:         mockSendExpired,
  sendJobListingRenewalReminder: mockSendReminder,
}));

const { GET } = await import('@/app/api/cron/expire-job-listings/route');

const CRON_SECRET = 'test-secret-abc';

function makeReq(authorization?: string) {
  const headers: Record<string, string> = {};
  if (authorization !== undefined) headers['authorization'] = authorization;
  return new NextRequest('http://localhost/api/cron/expire-job-listings', { headers });
}

describe('GET /api/cron/expire-job-listings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
  });

  // ── Auth guard ───────────────────────────────────────────────────────────────

  it('returns 500 when CRON_SECRET env var is not set', async () => {
    delete process.env.CRON_SECRET;
    const res  = await GET(makeReq(`Bearer ${CRON_SECRET}`));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toMatch(/CRON_SECRET/);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res  = await GET(makeReq());
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toMatch(/Unauthorized/);
  });

  it('returns 401 when Authorization header has the wrong secret', async () => {
    const res  = await GET(makeReq('Bearer wrong-secret'));
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toMatch(/Unauthorized/);
  });

  it('returns 401 when token is provided without Bearer prefix', async () => {
    const res  = await GET(makeReq(CRON_SECRET));
    const body = await res.json();
    expect(res.status).toBe(401);
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('returns 200 with { expired, reminded } shape when auth is valid', async () => {
    mockFrom
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        }),
      });

    const res  = await GET(makeReq(`Bearer ${CRON_SECRET}`));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.expired).toBe('number');
    expect(typeof body.reminded).toBe('number');
  });

  it('sends expiry email for each just-expired listing', async () => {
    const expiredListings = [
      { id: 'id-1', company: 'Atlassian', title: 'Engineer',   contact_email: 'a@a.com' },
      { id: 'id-2', company: 'Canva',     title: 'Designer',   contact_email: 'b@b.com' },
    ];

    mockFrom
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({ data: expiredListings, error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        }),
      });

    const res  = await GET(makeReq(`Bearer ${CRON_SECRET}`));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.expired).toBe(2);
    expect(mockSendExpired).toHaveBeenCalledTimes(2);
    expect(mockSendExpired).toHaveBeenCalledWith({
      to:      'a@a.com',
      company: 'Atlassian',
      title:   'Engineer',
    });
    expect(mockSendExpired).toHaveBeenCalledWith({
      to:      'b@b.com',
      company: 'Canva',
      title:   'Designer',
    });
  });

  it('sends renewal reminder email for each listing expiring in 4-6 days', async () => {
    const expiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const expiringSoon = [
      { id: 'id-3', company: 'Seek', title: 'PM', contact_email: 'c@c.com', expires_at: expiresAt },
    ];

    mockFrom
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: expiringSoon, error: null }),
              }),
            }),
          }),
        }),
      });

    const res  = await GET(makeReq(`Bearer ${CRON_SECRET}`));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.reminded).toBe(1);
    expect(mockSendReminder).toHaveBeenCalledTimes(1);
    expect(mockSendReminder).toHaveBeenCalledWith({
      to:        'c@c.com',
      company:   'Seek',
      title:     'PM',
      expiresAt,
    });
  });

  it('returns 200 (non-fatal) when reminder query errors but expire succeeded', async () => {
    mockFrom
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB timeout' } }),
              }),
            }),
          }),
        }),
      });

    const res  = await GET(makeReq(`Bearer ${CRON_SECRET}`));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.expired).toBe(0);
    expect(body.reminded).toBe(0);
  });

  it('returns 500 when the expire update query itself fails', async () => {
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Constraint violation' } }),
          }),
        }),
      }),
    });

    const res  = await GET(makeReq(`Bearer ${CRON_SECRET}`));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe('Constraint violation');
  });
});
