# Feature: Page State Persistence

**Priority:** 🔴 High
**Status:** ✅ Shipped
**Started:** 2026-04-08
**Shipped:** 2026-04-08

---

## Problem

Two pages throw away expensive state when the user navigates away:

### Interview Prep (`/interview-prep/[role]`)
- Questions are regenerated via Claude API on **every** page mount — even if you navigated away for 30 seconds
- API call costs tokens, takes 2–4 seconds, and the questions are always different
- User loses their "in-session" context (mentor narration text, current answer, MCQ state) on every nav

### Jobs (`/jobs`)
- Full API re-fetch on **every** mount — even if you navigated away for 5 seconds
- Adzuna/JSearch has rate limits and latency (~1–2s)
- Scroll position, expanded cards, and results list all reset

---

## Solution: localStorage cache with TTL + explicit invalidation

### Why localStorage over React context / Zustand?
- Works across full page navigations (Next.js App Router remounts pages on nav)
- Persists across browser refreshes
- Zero deps — no state library needed
- TTL prevents stale data from living forever

### Interview Session Cache
**Key:** `interview-questions-${roleId}`
**TTL:** 24 hours (questions don't change day-to-day, re-generate overnight)
**Stored:**
```ts
{
  questions: Question[],   // full question objects
  cachedAt: number,        // Date.now() timestamp
  roleId: string,
}
```
**Behaviour:**
- On mount: check cache. If fresh (<24h), use it — skip API call entirely
- "New Questions" button: clears cache key + re-fetches
- Completes session (all debrief done): clears cache so next visit is fresh

**Also preserve in-session state (already partly done, extend):**
- Mentor narration text for current question (so "Why" / "Scene" / "Guide" don't re-stream)
- User's typed answer (so partial answers survive a accidental back-nav)

### Jobs Cache
**Key:** `job-search-cache`
**TTL:** 10 minutes (jobs change fast — stale results after 10min warrant a re-fetch)
**Stored:**
```ts
{
  jobs: AdzunaJob[],
  total: number,
  page: number,
  query: string,           // serialised search params — cache bust if params change
  cachedAt: number,
}
```
**Behaviour:**
- On mount: if cache exists, same query, and <10min old → restore instantly, skip API
- Any filter/keyword change → new fetch (cache automatically busted by query mismatch)
- Explicit "Refresh" button in results header → clears cache + re-fetches
- Pagination: only cache page 1 (users rarely go back to page 2+ anyway)

---

## Files Changed

| File | Change |
|------|--------|
| `app/interview-prep/[role]/InterviewSession.tsx` | Read questions from cache on mount; write cache after fetch; "New Questions" clears cache; persist mentor narration per question |
| `app/jobs/page.tsx` | Read results from cache on mount; write cache after fetch; "Refresh" button; bust cache on param change |

---

## Acceptance Criteria

- [ ] Navigate away from `/interview-prep/[role]` mid-session → come back → same questions, same progress, no API call
- [ ] Reload `/interview-prep/[role]` same day → same questions (from cache), instant load
- [ ] Click "New Questions" → questions regenerated, old cache cleared
- [ ] Questions cache expires after 24h → fresh fetch on next visit
- [ ] Navigate away from `/jobs` → come back → results instantly restored, no API call
- [ ] Change any filter → re-fetch fires (cache busted)
- [ ] "Refresh results" button forces re-fetch
- [ ] Jobs cache expires after 10 minutes
- [ ] No regressions — existing session progress (index, stage, completedStages) still works
