# Feature: Integration Test Suite

**Priority:** 🔴 P2 — Engineering Credibility
**Status:** 🔲 Not started
**Effort:** Medium (3–5 days)
**Started:** —
**Shipped:** —

---

## Problem

89 source files. Zero tests. One silent failure already exists: `/api/track` swallows all errors and returns `{ ok: false }` with a 200 status. If the Supabase insert has been failing for weeks, nobody would know — analytics data would silently disappear.

This is the single biggest credibility gap when a senior engineer reviews the codebase. A portfolio project demonstrating AI, Stripe, Supabase, streaming responses, and serverless edge functions — with no test coverage — signals that the developer doesn't know when their code breaks.

---

## Goal

A test suite that covers the 8 most critical API routes and 3 critical components. Each test verifies real business logic, not mocks. The CI pipeline runs tests before the build gate.

---

## Test Stack

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event msw happy-dom
```

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner (fast, native ESM, same config as Next.js) |
| **MSW (Mock Service Worker)** | Intercept API calls in tests without hitting real endpoints |
| **@testing-library/react** | Component rendering and interaction |
| **happy-dom** | DOM environment for component tests (faster than jsdom) |
| **@vitest/coverage-v8** | Coverage reports (target: 80% on critical paths) |

---

## Test Structure

```
tests/
  api/
    track.test.ts                 ← analytics beacon
    gap-analysis.test.ts          ← gap engine (most complex)
    cover-letter.test.ts          ← streaming response
    interview-questions.test.ts   ← cached AI questions
    resume-match.test.ts          ← scoring logic
    visa-tracker.test.ts          ← CRUD + auth
    analytics-summary.test.ts     ← admin-only gate
    readiness-score.test.ts       ← score formula
  components/
    Analytics.test.tsx            ← beacon fires correctly
    PathTracker.test.tsx          ← skill progress persistence
    AuthProvider.test.tsx         ← auth state propagation
  lib/
    skill-paths.test.ts           ← path data integrity
    posts.test.ts                 ← safe slug validation
```

---

## Critical Tests — API Routes

### `/api/track` — Analytics beacon

```typescript
describe('POST /api/track', () => {
  it('accepts a valid beacon and returns { ok: true }', async () => {
    const res = await POST({ path: '/blog/test', sessionId: 'abc123', device: 'desktop' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it('returns 400 when path or sessionId is missing', async () => {
    const res = await POST({ device: 'desktop' });
    expect(res.status).toBe(400);
  });

  it('does not expose Supabase errors to the client (silent failure)', async () => {
    // Mock Supabase to throw
    const res = await POST({ path: '/test', sessionId: 'x', device: 'desktop' });
    // Must still return 200 — never 500 — analytics failures are silent
    expect(res.status).toBe(200);
  });
});
```

### `/api/gap-analysis` — Gap Engine

```typescript
describe('POST /api/gap-analysis', () => {
  it('returns a structured gap analysis for a valid JD', async () => {
    const res = await POST({ jdText: sampleJD, userId: testUserId });
    const data = await res.json();
    expect(data).toHaveProperty('matchScore');
    expect(data.matchScore).toBeGreaterThanOrEqual(0);
    expect(data.matchScore).toBeLessThanOrEqual(100);
    expect(data.strengths).toBeInstanceOf(Array);
    expect(data.gaps).toBeInstanceOf(Array);
    expect(data.actionPlan).toBeInstanceOf(Array);
  });

  it('returns 401 without authentication', async () => {
    const res = await POST({ jdText: sampleJD }); // no auth
    expect(res.status).toBe(401);
  });
});
```

### `/api/analytics/summary` — Admin gate

```typescript
describe('GET /api/analytics/summary', () => {
  it('returns 403 for non-admin users', async () => {
    const res = await GET_asRegularUser();
    expect(res.status).toBe(403);
  });

  it('returns valid summary structure for admin', async () => {
    const res = await GET_asAdmin();
    const data = await res.json();
    expect(data).toHaveProperty('overview.totalViews');
    expect(data).toHaveProperty('daily');
    expect(data.daily).toHaveLength(30);
  });
});
```

### `/api/visa-tracker` — CRUD + RLS

```typescript
describe('Visa Tracker', () => {
  it('GET returns empty tracker for new user', async () => {
    const res = await GET_asUser(testUser);
    const data = await res.json();
    expect(data.steps).toEqual({});
  });

  it('POST saves and GET retrieves steps correctly', async () => {
    const steps = { '1': { status: 'completed', docs: [], notes: '' } };
    await POST_asUser(testUser, { steps });
    const res = await GET_asUser(testUser);
    expect((await res.json()).steps['1'].status).toBe('completed');
  });

  it('GET returns 401 without auth', async () => {
    const res = await GET_noAuth();
    expect(res.status).toBe(401);
  });
});
```

### Readiness Score formula

```typescript
describe('Readiness Score formula', () => {
  it('returns 0 for a brand new user with no activity', () => {
    const score = computeScore({ resume: 0, skills: 0, interview: 0, quiz: 0 });
    expect(score).toBe(0);
  });

  it('returns 100 for perfect scores in all components', () => {
    const score = computeScore({ resume: 100, skills: 100, interview: 100, quiz: 100 });
    expect(score).toBe(100);
  });

  it('weights each component at 25%', () => {
    const score = computeScore({ resume: 100, skills: 0, interview: 0, quiz: 0 });
    expect(score).toBe(25);
  });

  it('caps resume score at 60 when analysis is older than 30 days', () => {
    const component = computeResumeScore({ score: 95, analysedDaysAgo: 35 });
    expect(component).toBe(60);
  });
});
```

---

## Critical Tests — Components

### `Analytics.tsx` — Beacon fires correctly

```typescript
describe('Analytics component', () => {
  it('fires POST /api/track on mount with correct path', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    render(<Analytics />, { wrapper: RouterWrapper('/blog/test-post') });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/track',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('/blog/test-post'),
        })
      );
    });
  });

  it('does NOT fire on /admin paths', () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    render(<Analytics />, { wrapper: RouterWrapper('/admin/analytics') });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

### `lib/posts.ts` — Security: path traversal prevention

```typescript
describe('isSafeSlug', () => {
  it('rejects path traversal attempts', () => {
    expect(getPostBySlug('../../../etc/passwd')).toBeNull();
    expect(getPostBySlug('..%2F..%2Fetc')).toBeNull();
    expect(getPostBySlug('valid-post-slug')).not.toBeNull(); // assuming this post exists
  });
});
```

---

## CI Integration

Add test step to `.github/workflows/deploy.yml`:

```yaml
jobs:
  check:
    steps:
      - name: Install dependencies
        run: npm ci
      - name: Run tests          # ← NEW
        run: npm test
        env:
          # Use test-only Supabase project or MSW mocks
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
      - name: Run quality gate
        run: npm run check
```

Test failures block deployment. Build failures block deployment. Both gates must pass.

---

## `package.json` additions

```json
{
  "scripts": {
    "test":         "vitest run",
    "test:watch":   "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Files

| File | Change |
|------|--------|
| `vitest.config.ts` | Create — Vitest config (happy-dom, path aliases) |
| `tests/setup.ts` | Create — MSW setup, global test utilities |
| `tests/api/*.test.ts` | Create — 8 API route tests |
| `tests/components/*.test.tsx` | Create — 3 component tests |
| `tests/lib/*.test.ts` | Create — 2 library tests |
| `.github/workflows/deploy.yml` | Modify — add test step before build |
| `package.json` | Add Vitest + testing library deps |

---

## Acceptance Criteria

- [ ] `npm test` runs all tests and exits 0
- [ ] All 8 API route tests pass
- [ ] All 3 component tests pass
- [ ] `/api/track` silent failure behaviour explicitly tested
- [ ] Admin-only endpoints return 403 for non-admin (tested)
- [ ] Path traversal in `getPostBySlug` explicitly tested
- [ ] Readiness Score formula unit-tested with edge cases
- [ ] CI test step runs before build gate
- [ ] Test failures block Vercel deployment
- [ ] `npm run build` still passes
