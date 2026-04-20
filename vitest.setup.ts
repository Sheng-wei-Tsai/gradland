import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// ── Env vars ──────────────────────────────────────────────────────────────────
process.env.NEXT_PUBLIC_SUPABASE_URL    = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY   = 'test-service-key';
process.env.NEXT_PUBLIC_APP_URL         = 'https://henrysdigitallife.com';

// ── next/headers mock ─────────────────────────────────────────────────────────
// cookies() requires a Next.js request scope that doesn't exist in Vitest/jsdom.
// We mock it globally so route handlers that call createSupabaseServer() don't
// throw "cookies was called outside a request scope".
// By default the store is empty (no session) → routes return 401.
// Individual tests can override via vi.mocked(cookies).mockReturnValueOnce(...).
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get:    vi.fn().mockReturnValue(undefined),
    getAll: vi.fn().mockReturnValue([]),
    has:    vi.fn().mockReturnValue(false),
    set:    vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Headers()),
}));

// ── localStorage isolation ────────────────────────────────────────────────────
// Component tests that call goTo() persist step to localStorage. Without a
// reset, later tests in the same suite start mid-flow (e.g. step 1 instead of
// step 0) and can't find the "Let's go" button.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
