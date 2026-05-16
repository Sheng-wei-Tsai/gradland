import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase query chain mock ─────────────────────────────────────────────────
//
// network/list builds a Supabase query and conditionally adds .eq() calls
// before awaiting the builder directly:
//   let query = sb.from(...).select(...).order(...).limit(200)
//   if (city && valid) query = query.eq('city', city)
//   if (visa && valid) query = query.eq('visa_type', visa)
//   const { data, error } = await query
//
// The chain object must be both chainable (returning itself) and thenable so
// that `await query` resolves to the result we control per test.

let chainRef: any = null;

function makeChain(result: { data: any[] | null; error: any } = { data: [], error: null }) {
  const c: any = {};
  c.select = vi.fn(() => c);
  c.order  = vi.fn(() => c);
  c.limit  = vi.fn(() => c);
  c.eq     = vi.fn(() => c);
  c.ilike  = vi.fn(() => c);
  c.then   = (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
    Promise.resolve(result).then(resolve, reject);
  chainRef = c;
  return c;
}

const mockFrom = vi.fn(() => makeChain());

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

const { GET } = await import('@/app/api/network/list/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeGet(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/network/list');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

const sampleProfiles = [
  { id: '1', role_title: 'Software Engineer', visa_type: '485', skills: ['TypeScript'], city: 'Sydney',    created_at: '2026-01-01' },
  { id: '2', role_title: 'Data Scientist',    visa_type: '482', skills: ['Python'],     city: 'Melbourne', created_at: '2026-01-02' },
];

// =============================================================================
describe('GET /api/network/list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => makeChain({ data: sampleProfiles, error: null }));
  });

  it('returns 200 with all profiles when no filters provided', async () => {
    const res  = await GET(makeGet());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual(sampleProfiles);
  });

  it('calls .eq("city", value) for a valid city filter', async () => {
    await GET(makeGet({ city: 'Sydney' }));
    expect(chainRef.eq).toHaveBeenCalledWith('city', 'Sydney');
  });

  it('ignores an invalid city value — no .eq("city") call', async () => {
    await GET(makeGet({ city: 'Darwin' }));
    const cityEqCall = chainRef.eq.mock.calls.find((c: unknown[]) => c[0] === 'city');
    expect(cityEqCall).toBeUndefined();
  });

  it('calls .eq("visa_type", value) for a valid visa filter', async () => {
    await GET(makeGet({ visa: '485' }));
    expect(chainRef.eq).toHaveBeenCalledWith('visa_type', '485');
  });

  it('ignores an invalid visa value — no .eq("visa_type") call', async () => {
    await GET(makeGet({ visa: 'tourist' }));
    const visaEqCall = chainRef.eq.mock.calls.find((c: unknown[]) => c[0] === 'visa_type');
    expect(visaEqCall).toBeUndefined();
  });

  it('calls .ilike("role_title", ...) for a role keyword filter (server-side)', async () => {
    await GET(makeGet({ role: 'software' }));
    expect(chainRef.ilike).toHaveBeenCalledWith('role_title', '%software%');
  });

  it('escapes ILIKE wildcard % in role before DB call', async () => {
    await GET(makeGet({ role: '%py' }));
    expect(chainRef.ilike).toHaveBeenCalledWith('role_title', '%\\%py%');
  });

  it('escapes ILIKE wildcard _ in role before DB call', async () => {
    await GET(makeGet({ role: 'java_dev' }));
    expect(chainRef.ilike).toHaveBeenCalledWith('role_title', '%java\\_dev%');
  });

  it('returns empty array when DB returns no results for role filter', async () => {
    mockFrom.mockImplementationOnce(() =>
      makeChain({ data: [], error: null }),
    );
    const res  = await GET(makeGet({ role: 'accountant' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual([]);
    expect(chainRef.ilike).toHaveBeenCalledWith('role_title', '%accountant%');
  });

  it('returns 500 when Supabase query returns an error', async () => {
    mockFrom.mockImplementationOnce(() =>
      makeChain({ data: null, error: { message: 'DB error' } }),
    );
    const res  = await GET(makeGet());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBeDefined();
  });
});
