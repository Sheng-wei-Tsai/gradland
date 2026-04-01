# Feature Roadmap — Henry Blog & Career Platform

> **How to use this file:** Check off items as you complete them. Work top-to-bottom within each section. Come back every session to know where you left off.

**Legend:** 🔴 High priority · 🟡 Medium priority · 🟢 Nice to have · ✅ Done

---

## Progress Snapshot

| Area | Done | Total |
|------|------|-------|
| 🎮 Interview Prep (gamified) | 0 | 1 |
| 💼 Job Search | 0 | 8 |
| 📄 Resume & Cover Letter | 0 | 6 |
| 🤖 AI Pipelines | 0 | 5 |
| 📚 Learning Platform | 0 | 4 |
| 🔐 Auth & Dashboard | 0 | 4 |
| 🏠 Site & UX | 0 | 5 |
| ✍️ Blog & Content | 0 | 4 |
| 🚀 Infrastructure | 0 | 4 |
| **Total** | **0** | **41** |

---

## 🎮 Interview Prep — Gamified Learning ← CURRENT

> See `context/current-feature.md` for full spec and implementation checklist.

- [ ] 🔴 **Build the full gamified interview prep feature**
  - Role selector grid: 8 Australian IT roles
  - Card deck: Discover → Understand → Example → Practice → AI Feedback
  - XP + level system, floating AI mentor chatbot, Supabase progress tracking

---

## 💼 Job Search — Australian Market

> Adzuna (`app/api/jobs/route.ts`) lags behind Seek/Indeed by hours–days. Need fresher sources.

- [ ] 🔴 **Add Indeed Publisher API as a second job source**
  - Register: `https://ads.indeed.com/jobroll/xmlfeed` (free)
  - Add `INDEED_PUBLISHER_ID` to env + GitHub Secrets
  - Merge results in `app/api/jobs/route.ts`, show "via Indeed" badge
  - Indeed refreshes AU listings hourly

- [ ] 🔴 **Show job posting freshness prominently**
  - Use `created` field from Adzuna + `formatDistanceToNow` (date-fns already installed)
  - Colour: green < 24h, amber 1–3 days, red > 3 days
  - File: `app/jobs/page.tsx`

- [ ] 🔴 **Implement job alerts UI** *(schema in `supabase/schema.sql` already exists)*
  - Add "Save this search" on `/jobs`, "Alerts" tab on `/dashboard`
  - Send email digests via Supabase Edge Functions or GitHub Action
  - Files: `app/jobs/page.tsx`, `app/dashboard/page.tsx`, `app/api/alerts/route.ts`

- [ ] 🟡 **Add salary range filter** — Adzuna supports `salary_min` / `salary_max`
- [ ] 🟡 **Add IT sub-category filter** — All / Developer / DevOps / Data / QA
- [ ] 🟡 **Persist search preferences to localStorage**
- [ ] 🟡 **One-click "Apply" → auto-create `job_applications` row** (status: applied)
- [ ] 🟢 **Add Seek.com.au deep-link** — `seek.com.au/{role}-jobs/in-{location}?dateRange=1`

---

## 📄 Resume & Cover Letter

- [ ] 🔴 **Switch cover-letter from GPT-4o-mini → Claude Sonnet** — file: `app/api/cover-letter/route.ts`
- [ ] 🔴 **Switch resume-match from GPT-4o-mini → Claude Sonnet** — file: `app/api/resume-match/route.ts`
- [ ] 🟡 **Allow resume data editing via UI** — currently hardcoded in `lib/resume-data.ts`
- [ ] 🟡 **"Interview Questions" generator** — covered by the gamified Interview Prep feature
- [ ] 🟢 **Improve PDF export** — replace `window.print()` with `@react-pdf/renderer`
- [ ] 🟢 **LinkedIn "Easy Apply" deep-link from resume page**

---

## 🤖 AI Pipelines & Content

- [ ] 🔴 **Add duplicate-detection to daily post pipeline** — skip if today's file exists — `scripts/run-post.ts`
- [ ] 🔴 **Eliminate OpenAI dependency after cover-letter + resume-match migrate to Claude**
- [ ] 🟡 **Add ArXiv direct API to digest** — same-day papers, `scripts/fetch-digest.ts`
- [ ] 🟡 **Add GitHub Hot to homepage tools grid + nav** — `app/page.tsx`, `components/Header.tsx`
- [ ] 🟢 **Add duplicate-detection to githot pipeline** — `scripts/run-githot.ts`

---

## 📚 Learning Platform

- [ ] 🔴 **Sync learning progress to Supabase** — `skill_progress` table exists but `PathTracker.tsx` only uses localStorage
- [ ] 🟡 **Show % complete per path on `/learn` index** — `app/learn/page.tsx`
- [ ] 🟡 **Add more career paths** — Data Engineer, DevOps/Cloud, ML Engineer — `lib/skill-paths.ts`
- [ ] 🟢 **Add learning streak indicator** — `app/learn/[path]/PathTracker.tsx`

---

## 🔐 Auth & Dashboard

- [ ] 🔴 **Expose `notes` field in job applications** — schema has it, UI doesn't — `app/dashboard/page.tsx`
- [ ] 🟡 **Add profile edit page** — migration 003 added `display_name` + `location`, no UI — `app/profile/page.tsx`
- [ ] 🟡 **Add Jobs + Dashboard + Interview to header nav** — `components/Header.tsx`
- [ ] 🟢 **Export applications as CSV** — `app/dashboard/page.tsx`

---

## 🏠 Site & UX

- [ ] 🔴 **Add `sitemap.xml` + `robots.txt`** — critical for SEO, currently missing — `app/sitemap.ts`, `app/robots.ts`
- [ ] 🟡 **Add Open Graph images** — blank card when sharing on LinkedIn/Twitter — `app/opengraph-image.tsx`
- [ ] 🟡 **Improve `/jobs` mobile layout** — cards instead of wide table on small screens
- [ ] 🟢 **Reading progress bar on blog posts** — `components/ReadingProgress.tsx`
- [ ] 🟢 **RSS feed** — `app/feed.xml/route.ts`

---

## ✍️ Blog & Content

- [ ] 🟡 **Cross-content full-text search** — extend blog search to digests + githot — `components/BlogList.tsx`
- [ ] 🟡 **"AI-generated" badge on auto posts** — `components/PostCard.tsx`
- [ ] 🟢 **Post series support** — `series` + `series_order` frontmatter
- [ ] 🟢 **Reading time on PostCard** — `reading-time` already installed

---

## 🚀 Infrastructure

- [ ] 🟡 **Pipeline failure alerting** — Discord webhook or email on GitHub Actions failure — `.github/workflows/daily-posts.yml`
- [ ] 🟡 **Dependabot** — `.github/dependabot.yml`
- [ ] 🟢 **Add `.env.example`** — all required keys listed for onboarding
- [ ] 🟢 **Fix Dependabot moderate security alert** — 1 flagged on the repo

---

*Last updated: 2026-03-28*
