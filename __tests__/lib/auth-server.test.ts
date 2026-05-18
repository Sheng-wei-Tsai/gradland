import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// next/headers is mocked globally in vitest.setup.ts.
// Mock the Supabase clients so lib/auth-server can be imported without
// real network connections.
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from:  vi.fn(),
  }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: { getUser: vi.fn() },
    from:  vi.fn(),
  }),
}));

// ── isOwner — fail-closed when OWNER_EMAIL is not configured ─────────────────
// The module reads OWNER_EMAIL once at import time. When it is absent the
// constant becomes '' so isOwner() must return false for every input,
// preventing accidental admin access on misconfigured deployments.
describe('isOwner — OWNER_EMAIL unset (fail-closed)', () => {
  let isOwner: (email: string | undefined | null) => boolean;

  beforeAll(async () => {
    vi.resetModules();
    delete process.env.OWNER_EMAIL;
    ({ isOwner } = await import('@/lib/auth-server'));
  });

  it('returns false for undefined', () => {
    expect(isOwner(undefined)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isOwner(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isOwner('')).toBe(false);
  });

  it('returns false for any email when env var is missing', () => {
    expect(isOwner('anyone@example.com')).toBe(false);
  });
});

// ── isOwner — email matching when OWNER_EMAIL is configured ──────────────────
describe('isOwner — OWNER_EMAIL = owner@example.com', () => {
  let isOwner: (email: string | undefined | null) => boolean;

  beforeAll(async () => {
    vi.resetModules();
    process.env.OWNER_EMAIL = 'owner@example.com';
    ({ isOwner } = await import('@/lib/auth-server'));
  });

  afterAll(() => {
    delete process.env.OWNER_EMAIL;
  });

  it('returns true for an exact-case match', () => {
    expect(isOwner('owner@example.com')).toBe(true);
  });

  it('returns true for an all-uppercase input (comparison is case-insensitive)', () => {
    expect(isOwner('OWNER@EXAMPLE.COM')).toBe(true);
  });

  it('returns true for mixed-case input', () => {
    expect(isOwner('Owner@Example.Com')).toBe(true);
  });

  it('returns false for undefined', () => {
    expect(isOwner(undefined)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isOwner(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isOwner('')).toBe(false);
  });

  it('returns false for a non-owner email', () => {
    expect(isOwner('other@example.com')).toBe(false);
  });

  it('returns false for a domain-only substring of the owner email', () => {
    expect(isOwner('@example.com')).toBe(false);
  });

  it('returns false for owner email with an extra prefix character', () => {
    expect(isOwner('xowner@example.com')).toBe(false);
  });
});

// ── isOwner — env var stored in uppercase is normalised to lowercase ──────────
// OWNER_EMAIL may arrive from the shell in any case; the module lower-cases it
// at import time so the comparison is always canonical.
describe('isOwner — OWNER_EMAIL stored in uppercase is normalised', () => {
  let isOwner: (email: string | undefined | null) => boolean;

  beforeAll(async () => {
    vi.resetModules();
    process.env.OWNER_EMAIL = 'OWNER@EXAMPLE.COM';
    ({ isOwner } = await import('@/lib/auth-server'));
  });

  afterAll(() => {
    delete process.env.OWNER_EMAIL;
  });

  it('returns true when input matches after normalisation', () => {
    expect(isOwner('owner@example.com')).toBe(true);
  });

  it('returns true when both sides are uppercase', () => {
    expect(isOwner('OWNER@EXAMPLE.COM')).toBe(true);
  });
});
