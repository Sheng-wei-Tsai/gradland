# Feature: Job Search — Australian Market

**Priority:** 🔴 High (JSearch freshness) · 🟡 Medium (filters, preferences)
**Status:** 🟡 In Progress
**Branch:** `feature/job-search-improvements` (create when starting)
**Started:** 2026-04-03
**Shipped:** —

---

## Goal

Improve the Australian IT job search experience: add JSearch (Google for Jobs via RapidAPI) as a
fresher data source alongside Adzuna, surface job posting age prominently with colour coding, build
a job alerts UI, and add quality-of-life filters.

> **Note:** Indeed Publisher XML feed was deprecated and shut down March 31 2026. SEEK has no
> public read API. JSearch (RapidAPI) pulling from Google for Jobs is the best viable second source.

---

## Data Sources

| Source | Freshness | Coverage | Cost |
|--------|-----------|----------|------|
| Adzuna (existing) | 24–48h lag | Broad AU breadth | Free |
| JSearch / Google for Jobs (new) | Hours | LinkedIn AU, Glassdoor, Workday, career pages | ~$10/mo RapidAPI |

JSearch results are shown first (fresher); Adzuna fills unique listings after deduplication.

---

## Acceptance Criteria

### JSearch Integration ✅
- [x] JSearch added as second job source alongside Adzuna (`RAPIDAPI_KEY`)
- [x] Results merged and deduplicated by title + company in `app/api/jobs/route.ts`
- [x] "via [publisher]" badge shown (e.g. "via LinkedIn", "via Glassdoor")
- [x] Parallel fetch — JSearch + Adzuna run concurrently, not sequentially
- [x] `RAPIDAPI_KEY` added to `.env.local` placeholder

### Job Freshness ✅
- [x] Posting age displayed on every job card
- [x] Age colour: green < 24h · amber 1–3 days · red > 3 days · grey > 30 days

### Job Alerts UI ✅
- [x] "Save this search" button on `/jobs` saves criteria to `job_alerts` table via `/api/alerts`
- [x] "Alerts" tab visible on `/dashboard` with saved alerts listed
- [x] Alerts can be deleted from the dashboard
- [x] Alert links back to `/jobs` pre-filled with saved search params

### Filters ✅
- [x] Salary range filter (Adzuna `salary_min` / `salary_max` params)
- [x] IT sub-category filter: All / Developer / DevOps / Data / QA (client-side)
- [x] Search preferences persist to localStorage across sessions

### Alerts API ✅
- [x] `GET /api/alerts` — list user's alerts (auth required)
- [x] `POST /api/alerts` — create alert (auth required, validated)
- [x] `DELETE /api/alerts?id=` — delete alert (user-scoped RLS double-check)

---

## Affected Files

| File | Status | Notes |
|------|--------|-------|
| `app/api/jobs/route.ts` | ✅ Done | JSearch parallel fetch + Adzuna merge |
| `app/jobs/page.tsx` | ✅ Done | Freshness colours, filters, localStorage, Save Search |
| `app/dashboard/page.tsx` | ✅ Done | Alerts tab added |
| `app/api/alerts/route.ts` | ✅ Done | CRUD for job alerts |
| `.env.local` | ✅ Done | `RAPIDAPI_KEY` placeholder added |

---

## What's Left

- [ ] Email digests (Supabase Edge Function or GitHub Action) — post-ship
- [ ] One-click "Apply" creates a `job_applications` row — post-ship
- [ ] Add `RAPIDAPI_KEY` to Vercel environment variables (user action required)
- [ ] `npm run check` before pushing

---

## Setup

To enable JSearch, add your RapidAPI key:

1. Sign up at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Subscribe to the Basic plan (~$10/mo, 500 req/mo)
3. Copy your key and add to `.env.local`:
   ```
   RAPIDAPI_KEY=your_key_here
   ```
4. Add the same key to Vercel → Project Settings → Environment Variables

Without the key, the API gracefully falls back to Adzuna-only.

---

## Notes / History

- **2026-04-03** — Indeed XML dead. Replaced with JSearch. Freshness colours, filters,
  localStorage, alerts API, dashboard Alerts tab all implemented.
