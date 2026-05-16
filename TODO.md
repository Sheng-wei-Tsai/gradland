# TODO — Gradland Feature Backlog

**Last updated:** 2026-04-22
**Product vision:** The definitive career platform for international IT graduates entering the Australian job market.
**Single source of truth for:** what is done, what is next, and why.

> **How to use this file:** See `DOCS.md` for the full documentation management guide.
> Before building anything, add it here first (AGENTS.md §16). After shipping, mark ✅ Done and date it.

---

## ✅ Done — Full Feature Inventory

### Infrastructure & CI/CD
- **Auth** — GitHub OAuth + Supabase SSR, RLS everywhere
- **Stripe** — checkout, portal, webhook, subscription gate
- **Pre-push quality gate** — `npm run check` (audit + build), GitHub Actions CI
- **Sitemap + robots.txt** — SEO ready
- **RSS feed** — `/feed.xml` — blog + digests + githot, auto-discovered
- **OG images** — site-wide + per blog post (`next/og`, 1200×630)
- **Analytics** — `/admin/analytics` — page views, countries, devices, AI growth suggestions
- **Test suite** — Vitest + 41 tests (8 files): API route auth, component behaviour, localStorage isolation ✅ *2026-04-20*
- **CI pipeline fix** — Node 22, missing icon files committed, TS errors in test files resolved, Vercel deploy unblocked ✅ *2026-04-21*

### Design System
- **Company Logo System** — `lib/companies.ts` (70 companies + aliases), `components/CompanyLogo.tsx` (4-tier fallback: Simple Icons → Logo.dev → Google favicons → initials), click-to-website on bare variant ✅ *2026-04-20*
- **CitySelector** — animated city dropdown with landmark subtitle fade, city-specific border/tint on hover, custom dropdown with CityIcon per option ✅ *2026-04-21*
- **EIcon / CityIcon** — `components/icons/EIcon.tsx` (34 ink-brush icons), `components/icons/CityIcon.tsx` (8 city mascot SVGs) ✅ *2026-04-21*
- **Yin-Yang Dark Mode Toggle** — smooth 180° spin, cross-fade fill colours, comic panel shadow ✅
- **Reading Progress Bar** — pure CSS `animation-timeline: scroll()` on blog posts ✅

### Blog & Content
- **Blog** — MDX posts, reading time, tag chips, AI badge on auto-generated posts
- **Daily AI Digest** — `/digest` — auto-generated daily summaries
- **GitHub Hot** — `/githot` — trending repos daily
- **Blog search + filters** — client-side, title + tag
- **Comments** — auth-gated, per-post, admin moderation

### Career Tools
- **Resume Analyser** — PDF upload, Claude AU recruiter prompt, score ring, radar chart, action items
- **Cover Letter Generator** — GPT-4o, 4-paragraph AU structure, streaming, inline edit
- **Job Search** — JSearch + Adzuna + Jora scraper, working rights filter, freshness colours, save/apply, animated CitySelector
- **Job Scraper** — `scripts/scrape-au-jobs.ts` — Jora HTML scraping, 9 keywords × 5 cities, daily GitHub Actions cron 6am AEST
- **Interview Prep v2** — Universal Questions, Reality Check (6-stage), Company Intel (10 companies), Post-Interview Toolkit (Summary/Email/Rejection/Negotiation tabs), Networking Hub at `/interview-prep/networking`
- **Gap Engine** — pgvector skill extraction from JDs, match % ring per job card, cached 7d in Supabase + localStorage, rate-limited 5/day ✅ *2026-04*
- **YouTube Learning** — 20 channels, Gemini study guide, quiz, transcript smart sampling

### AU Insights (all 10 tabs)
- **Company Tiers** — 8 tiers, scroll entrance, hover lift, CompanyLogo chips, ghost logo watermark ✅ *updated 2026-04-20*
- **IT Ecosystem** — Framer Motion redesign: scroll entrance, expandable analysis cards, animated money-flow arrows, 🇦🇺/🌏 company split ✅ *2026-04-21*
- **Visa Sponsors** — top 20 companies by 482 volume, CompanyLogo in rankings table ✅ *2026-04-20*
- **Company Compare** — multi-select, 8-row table, SVG radar chart, CompanyLogo in selector + table headers + legend ✅ *2026-04-20*
- **Grad Programs** — live status, deadlines, CompanyLogo, direct application links ✅ *2026-04-20*
- **Career Guide**, **Job Market Charts**, **Salary Checker**, **Skill Map**, **Visa Guide** — all live

### Dashboard & Tracking
- **Personalised Dashboard** — `PersonalisedHero`, readiness score widget, "Your next action" priority logic ✅
- **Visa Journey Tracker** — `/dashboard/visa-tracker` — 6-step 482 tracker, doc checklists, auto-save ✅
- **Readiness Score** — 0–100 ring (resume 25% + skills 25% + quiz 25% + interviews 25%), daily Supabase snapshot ✅

### Learning
- **5 skill paths** — Frontend, Fullstack, Backend, Data Engineer, DevOps/Cloud
- **Spaced repetition** — review intervals, browser notifications, Supabase cross-device sync
- **IBM Learning** — `/learn/ibm` curated content

### Admin
- **Admin panel** — `/admin` — users, comments, job applications stats
- **Admin analytics** — 30-day trends, top pages, countries, devices, AI growth suggestions

### Security (completed)
- Cookie-based session auth on all protected routes (replaced Bearer tokens) ✅ *2026-04-15*
- Fail-closed owner email (no hardcoded fallback) ✅ *2026-04-15*
- Input truncation on all AI routes: `roleTitle` (100 chars), `question` (500), `userAnswer` (800) ✅ *2026-04-21*
- `tsconfig.json` excludes `__tests__` — test type errors cannot block production builds ✅ *2026-04-21*

---

## 🔴 Priority 0 — Blocking Launch

### Production-Hardening Sprint — Phase B (Compliance + observability)
**Why:** AU Privacy Act compliance, outage visibility, account-deletion right (APP 13).

- [x] B1 — CSP/HSTS/security headers: already shipped in `proxy.ts` + `next.config.ts` ✅ *2026-05-08*
- [x] B2 — Sentry: `@sentry/nextjs` installed; `sentry.{client,server,edge}.config.ts` + `instrumentation.ts` created; wired into `app/error.tsx` + `app/api/log-error/route.ts`; env vars in `.env.example` ✅ *2026-05-09*
- [x] B3 — Account deletion: `supabase/030_soft_delete_profiles.sql`, `app/api/account/delete/route.ts` (cancels Stripe sub + deletes comments + soft-deletes profile), `app/dashboard/account/delete/page.tsx` (type DELETE to confirm), linked from profile settings + privacy page ✅ *2026-05-09*
- [x] B4 — Sub-processor list: added Google/YouTube, Adzuna, RapidAPI/JSearch, ScraperAPI, Sentry to `app/privacy/page.tsx` ✅ *2026-05-09*
- [x] B5 — Apply migrations in prod: run `030_soft_delete_profiles.sql`; set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` in Vercel env; smoke-test error capture; added `release` + `environment` tags to all three Sentry configs (uses Vercel system env vars `VERCEL_GIT_COMMIT_SHA` / `VERCEL_ENV`) ✅ *2026-05-10*

### Production-Hardening Sprint — Phase A (Stripe + abuse + data exposure)
**Why:** Audit (2026-05-09) found 5/8 Sprint 0 items unshipped. Phase A items directly block safe Stripe live activation.

- [x] A1 — Stripe webhook idempotency: `supabase/027_stripe_events.sql` + dedup guard in `app/api/stripe/webhook/route.ts` ✅ *2026-05-09*
- [x] A2 — Job-listing abuse gate: IP rate limit (5/hr) + optional auth in `app/api/stripe/job-listing/route.ts` ✅ *2026-05-09*
- [x] A3 — Stripe checkout origin allowlist: `ALLOWED_ORIGINS` env check in `app/api/stripe/checkout/route.ts` ✅ *2026-05-09*
- [x] A4 — RLS + view on `job_listings`: `supabase/028_job_listings_rls.sql` + `app/api/jobs/listings/route.ts` → query `public_job_listings` ✅ *2026-05-09*
- [x] A5 — Migration collision docs: `supabase/README.md` explaining 020 duplicate + rule that next free prefix is 030+ ✅ *2026-05-09*
- [x] A6 — Kill in-memory rate-limit Maps: `supabase/029_rate_limits.sql`, `lib/rate-limit-db.ts`, update `app/api/log-error/route.ts` + `app/api/track/route.ts` ✅ *2026-05-09*

### Stripe Production Launch + ABN Registration
**Blocked on:** external manual steps only. Code is 100% done.

**ABN (do first):**
- [ ] Check visa eligibility — 485/PR/Citizen = OK; 482/Student = check first
- [ ] Gather TFN + passport → apply at abr.gov.au (free, ~15 min)
- [ ] Open separate AU bank account (CommBank / Up / Wise) for business income

**Stripe activation (after ABN):**
- [ ] Activate live mode at dashboard.stripe.com — paste ABN, upload passport, add bank BSB
- [ ] Wait for "Charges enabled" + "Payouts enabled" (1–2 days)
- [ ] Create live product: `Gradland Pro` — `$14.99 AUD / month` → copy `price_…` ID
- [ ] Create live webhook → 5 events (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed)
- [ ] Swap 4 Vercel env vars to live keys (Production scope only, keep test for Preview)
- [ ] Smoke test: real card → verify `subscription_tier = 'pro'` in Supabase → refund yourself

**Files already done:** `app/api/stripe/webhook/route.ts`, `lib/subscription.ts`, `app/pricing/page.tsx`

### Production-Readiness Sprint 0 — 2026-05-06
**Blocking Stripe live activation. Audit + roadmap: `~/.claude/plans/can-you-scan-through-iridescent-sunrise.md`.**
**Why:** Audit (3 Explore agents + Vercel/GDPR 2026 references) found 8 P0 launch blockers: legal pages, cookie consent, CSP/HSTS middleware, Stripe webhook idempotency, unauth `job-listing` route, missing RLS on `job_listings`, zero observability, no refund policy. Code/design quality solid otherwise — AGENTS §15 tech-debt list mostly resolved.

**Day 1 — Compliance copy (P0)**
- [x] Create `app/privacy/page.tsx` — AU Privacy Act APP 1+5 disclosure; sub-processors (Stripe, Supabase, Anthropic, OpenAI, Logo.dev, Resend, Vercel) ✅ 2026-05-08
- [x] Create `app/terms/page.tsx` — service terms, AUP, dispute resolution, AU consumer law disclaimer ✅ 2026-05-08
- [x] Create `app/contact/page.tsx` — owner contact details + Resend-backed form ✅ 2026-05-08
- [x] Create `app/cookies/page.tsx` — categorised list (essential / analytics / preferences) + revoke instructions ✅ 2026-05-08
- [x] Edit `app/pricing/page.tsx` — refund + cancellation policy block (ACL §54 disclosure) ✅ 2026-05-08
- [x] Edit `components/Footer.tsx` (or create) — link to all 4 legal pages ✅ 2026-05-08
- [x] Edit `app/api/stripe/checkout/route.ts` — `consent_collection.terms_of_service: 'required'` + `custom_text.terms_of_service_acceptance.message` ✅ 2026-05-08

**Day 2 — Cookie consent + middleware (P0)**
- [x] Create `components/CookieConsent.tsx` — minimal banner, localStorage gate, granular essential/analytics/preferences toggles ✅ 2026-05-08
- [x] Edit `app/layout.tsx:92` — gate `Analytics` mount behind consent state ✅ 2026-05-08
- [x] Edit `app/api/track/route.ts` — short-circuit no-op when `cookies-consent` cookie not set to `analytics-true` ✅ 2026-05-08
- [x] Create `middleware.ts` — Node.js runtime via Fluid Compute; per-request CSP nonce, HSTS (`max-age=63072000; includeSubDomains; preload`), `frame-ancestors 'none'`, `form-action 'self'`, `Permissions-Policy: interest-cohort=()` ✅ 2026-05-08 (implemented as `proxy.ts` — Next.js 16 renamed middleware → proxy)
- [x] Edit `next.config.ts` — remove stale "CSP via middleware" comment now that middleware actually exists ✅ 2026-05-08

**Day 3 — Stripe idempotency + abuse guard (P0)**
- [x] Create `supabase/027_stripe_events.sql` — `(event_id text pk, event_type text, processed_at timestamptz default now())`; RLS deny-all (service-role only) ✅ 2026-05-08 (027 used — 025/026 already taken by network_messages/direct_messages)
- [x] Edit `app/api/stripe/webhook/route.ts:33` — INSERT event_id with `on conflict do nothing returning *`; if 0 rows affected, ack 200 and skip handler ✅ 2026-05-08
- [x] Edit `app/api/stripe/job-listing/route.ts` — gate behind session cookie OR hCaptcha; soft IP throttle (5 sessions/hour); `simple-email-regex` validation on `contactEmail`; `.slice()` truncation on all user fields ✅ 2026-05-08
- [x] Edit `app/api/stripe/checkout/route.ts:40` — `origin` allowlist (`ALLOWED_ORIGINS` env) ✅ 2026-05-08

**Day 4 — RLS + observability (P0)**
- [x] Create `supabase/028_job_listings_rls.sql` — enable RLS on `job_listings`; service-role write bypasses RLS; `public_job_listings` view (security_invoker=false) excludes `contact_email` for anon read of active/non-expired listings ✅ 2026-05-08 (026 taken by direct_messages, 027 taken by stripe_events → used 028)
- [x] Edit `app/api/jobs/listings/route.ts` — query `public_job_listings` view, not raw table ✅ 2026-05-08
- [x] Edit `app/api/admin/job-listings/route.ts` — keep service-role on raw table for admin ✅ 2026-05-08 (already correct: all three handlers use `createSupabaseService()` on `job_listings`; verified no changes needed)
- [x] `npm i @sentry/nextjs && npx @sentry/wizard@latest -i nextjs` — generates `instrumentation.ts` + `sentry.{client,server,edge}.config.ts` ✅ 2026-05-09
- [x] Edit `app/api/log-error/route.ts` — `Sentry.captureMessage(message, { level: 'error', extra: { digest, url } })` (captureMessage is correct for string-message client reports; captureException used in app/error.tsx for caught exceptions) ✅ 2026-05-09
- [x] Verify `error_logs` table exists in prod — route.ts inserts to `error_logs` table; apply migration if missing ✅ 2026-05-09

**Day 5 — Smoke + go-live**
- [x] `npm run check` clean ✅ 2026-05-08
- [ ] Deploy to Vercel preview; verify headers via `curl -I` (CSP, HSTS, frame-ancestors, form-action, Referrer-Policy, Permissions-Policy)
- [ ] Verify cookie banner blocks `/api/track` until consent
- [ ] Verify `/privacy`, `/terms`, `/contact`, `/cookies` return 200 + linked from footer + Stripe Checkout
- [ ] Stripe webhook replay test (`stripe events resend evt_…`) → confirm no duplicate `job_listings` row
- [ ] Anon-key SELECT on `job_listings` → fails RLS; SELECT on `public_job_listings` → returns rows minus `contact_email`
- [ ] Smoke-test Sentry: `throw new Error('smoke')` in a route → event in Sentry within 60s
- [ ] Lighthouse 4-page sweep (`/`, `/jobs`, `/pricing`, `/au-insights`): Performance ≥85, A11y ≥95, Best Practices ≥95, SEO ≥95
- [ ] Then: ABN + Stripe live activation per checklist above

**Effort:** L (5 working days). Day 1 (compliance copy) eats biggest chunk; Sentry wizard semi-automated; Day 3+4 are small-diff but require migrations + careful testing.

### Remaining Security Items
- [x] 2026-04-29 Add `.limit()` to unbounded queries in `app/api/comments/route.ts` + `app/api/alerts/route.ts`
- [x] 2026-04-29 Fix async `cookies()` in `alerts/route.ts` (Next.js 16 breaking change)
- [x] 2026-04-29 Stripe webhook signature validation tests — `app/api/stripe/webhook/route.test.ts`

---

## 🔴 Priority 1 — Retention Engine

### Readiness Score on Profile Page
- [x] 2026-04-29 Show the 0–100 score ring + breakdown on `/dashboard/profile`
- Small effort (S) — widget already exists as `ReadinessScore` component

### Visual System Design — Interactive Diagrams + Archive
**Why:** Turn passive diagram browsing into active learning. Each daily diagram now has a drag-and-drop step-reorder quiz to confirm understanding.
- [x] 2026-05-01 Fix Mermaid "Syntax error in text" SVG on every page — parse-first in `components/MermaidDiagram.tsx`; sanitize `\n` → `<br/>` in existing `content/diagrams/*.md`; harden `scripts/fetch-diagrams.ts` generator prompt
- [x] 2026-05-01 `/learn/diagrams` becomes interactive: card grid → per-diagram lesson page at `/learn/diagrams/[slug]` — view diagram → drag-and-drop step-reorder quiz → score + reveal
- [x] 2026-05-01 `/posts/diagram` becomes real archive (was `redirect()`) — chronological feed of daily + starter diagrams with filter chips, Open → `/posts/diagram/[slug]` detail, Take Quiz → `/learn/diagrams/[slug]`
- [x] 2026-05-01 New files: `lib/diagrams-quiz.ts` (step extraction), `components/StepReorderQuiz.tsx` (@dnd-kit), `app/learn/diagrams/[slug]/`, `app/posts/diagram/[slug]/`
- **Effort:** M (2–3 days)

### B2B Recruiter / Company Job Posting — `features/recruiter-portal.md`
**Why:** First B2B revenue lever. AU companies pay thousands to reach qualified international IT grads.
- [x] `/post-a-role` landing page ✅ 2026-05-01
- [x] 2026-05-01 Stripe checkout: $99 AUD per 30-day listing
- [x] 2026-05-01 `job_listings` Supabase table — company, role, description, url, expires_at
- [x] 2026-05-01 Featured listings at top of `/jobs` page with "Featured" badge
- [x] Admin approval queue + auto-expiry via Resend email ✅ 2026-05-01
- **Effort:** M (3–5 days)

---

## 🔴 Priority 2 — AI Quality & Infrastructure

### Gemini Multimodal for YouTube — `features/gemini-multimodal.md`
**Why:** Current YouTube study guides fail on videos without captions. Gemini watches the video directly.
- [x] Replace `youtube-transcript` + OpenAI with Gemini 1.5 Flash direct video URL input ✅ 2026-05-01
- [x] 2026-05-01 Gains: visual content (slides, code on screen), architecture diagrams, no caption dependency
- [x] Error handling for long videos (>2h) and music-only content ✅ 2026-05-01
- **Effort:** S (1–2 days)

### Vercel KV / Redis Caching — `features/vercel-kv-cache.md`
**Why:** AI calls hit Supabase for cache checks. Redis is 50× faster for hot-path lookups.
- [ ] Vercel KV set up via Marketplace (free tier: 256MB)
- [x] Study guide cache: KV → Supabase fallback ✅ 2026-05-01
- [x] Interview questions shared pool cache (same role = same questions, not per-user) ✅ 2026-05-02
- [x] Cover letter fragment cache by company+role key ✅ 2026-05-02
- **Effort:** S (1–2 days)

### Expand Test Coverage
**Current:** 41 tests. Target: critical paths covered.
- [x] 2026-05-01 `track` API route (currently swallows errors silently)
- [x] `gap-analysis` route (pgvector path) ✅ 2026-05-01
- [x] 2026-05-01 `cover-letter` route (streaming)
- [x] Stripe webhook events (checkout, renewal, cancellation) ✅ 2026-05-01
- [x] `AuthProvider` component ✅ 2026-05-01
- [x] `learn/diagram` route — 400 on missing fields + fence-stripping ✅ 2026-05-06
- [x] `admin/job-listings` route — 403 without admin, invalid action, DELETE UUID validation, extend Math.max fix ✅ 2026-05-06
- [x] `comments` + `comments/[id]` routes — GET 400 invalid slug/500 DB error, POST 401/400/201, PATCH 401/400/403/200, DELETE 401/200 (regular + admin)/403 on DB error [tests] ✅ 2026-05-06
- [x] `interview/chat`, `interview/evaluate`, `interview/mentor` routes — 401/403/429 auth gates, 400 on missing fields, 400 on invalid stage (mentor), 502 on OpenAI failure, streaming 200 on valid input, input truncation (evaluate: answer ≤ 2000 chars) [tests] ✅ 2026-05-06
- [x] 2026-05-07 `learn/quiz` route — 401/403/429 auth gates, 400 on missing fields, 503 when OPENAI_API_KEY missing, 200 from Supabase cache hit, 200 from OpenAI generation, videoTitle truncated to 200 chars [tests]
- [x] 2026-05-07 `learn/channel-videos` route — 400 on missing channelId, 503 when YOUTUBE_API_KEY missing, 404 when channel not found, 200 with videos array + null nextPageToken, private/deleted videos filtered, YouTube API error status forwarded, nextPageToken propagated, description truncated to 200 chars [tests]
- [x] 2026-05-07 `diagrams/generate` route — 401/403/429 auth gates, 400 on missing topic, 400 on topic < 3 chars, 500 when OPENAI_API_KEY missing, invalid type falls back to 'flowchart', topic truncated to 200 chars, markdown fence stripping, 200 returns `{ mermaid, type, topic }`, 502 on empty/throw from OpenAI [tests]
- [x] 2026-05-07 `learn/video-meta` route — 400 on missing videoId, 400 on invalid videoId format (not 11-char alphanumeric), 200 from Supabase cache hit (no RapidAPI call), 503 when RAPIDAPI_KEY missing, 404 on RapidAPI non-OK or empty id, 200 with mapped fields from RapidAPI, description truncated to 300 chars [tests] ✅ 2026-05-07
- [x] 2026-05-07 `learn/roadmap-image` route — 401/403/429 auth gates, 400 on missing role, 500 when OPENAI_API_KEY missing, invalid role/visaStatus/jobStage fall back to defaults, markdown fence stripping, 200 returns `{ mermaidCode, cacheKey }` with correct key format, 502 on empty/throw from OpenAI [tests] ✅ 2026-05-07
- [x] 2026-05-07 `learn/videos` route (IBM channel) — 503 when YOUTUBE_API_KEY missing, 404 when channel not found, 200 with videos array + null nextPageToken, nextPageToken propagated, pageToken query param forwarded to YouTube API, description truncated to 200 chars, 500 on fetch error [tests] ✅ 2026-05-07
- [x] 2026-05-07 `network/list` route — 200 returns all profiles when no filters, city filter applies `.eq('city',…)` for valid values and is ignored for invalid ones, visa filter applies `.eq('visa_type',…)` for valid values and ignored for invalid, role keyword filters in-memory (case-insensitive), returns 500 on DB error (`app/api/network/list/route.ts`) [tests] ✅ 2026-05-07
- [x] 2026-05-07 `network/messages/[profileId]` route — GET 400 on invalid UUID, GET 401 without session, GET 403 when no network profile, GET 200 with visibility filtering (deleted_by_sender/deleted_by_recipient), GET 500 on DB error; PATCH 400 invalid UUID, PATCH 401/403 auth gates, PATCH 200 marks thread read [tests] ✅ 2026-05-07
- [x] 2026-05-07 `diagrams/list`, `ai-usage`, `visa-news` routes — 200 with correct array/object shapes, `ai-usage` Cache-Control header present, empty-array edge case for filesystem-backed routes (`app/api/diagrams/list/route.ts`, `app/api/ai-usage/route.ts`, `app/api/visa-news/route.ts`) [tests] ✅ 2026-05-07
- [x] 2026-05-07 `stripe/checkout` + `stripe/portal` routes — 401 without session, 404 on portal when no stripe_customer_id, 200 returns `{ url }` from Stripe, new Stripe customer created when profile has no customer_id, subscription mode for checkout, billingPortal session for portal [tests] ✅ 2026-05-07
- **Effort:** M (3–5 days)

### Phone Remote Control (GitHub mobile + Telegram)
**Why:** Owner needs to dispatch tasks, trigger pipelines, and review status from their phone even when the Mac is off.
- **Files created:** `.github/workflows/phone-task.yml` — free-text task → Claude → PR (implement) or GitHub Issue (investigate); dispatched from GitHub mobile app Actions tab ✅ *2026-04-24*
- **Telegram:** existing plugin (`~/.claude/channels/telegram/`) verified live for interactive control when Mac is on ✅ *2026-04-24*
- **Bookmark targets (phone):** GitHub iOS → gradland → Actions → "Phone Task (Claude on demand)", "Claude Daily Developer", "Daily Posts", "Scrape AU IT Jobs"

---

## 🟡 Priority 3 — Growth

### Job Coverage Expansion — free ATS sources (2026-05-05)
**Why:** Compete with Seek/LinkedIn/Indeed. Each new ATS = more company boards = more unique listings, all free + legal (public APIs).
**PR 1 — Modern startup ATS** ✅ 2026-05-05:
- [x] `scripts/sources/workable.ts` — Workable v1 widget endpoint (mathspace +8 jobs verified)
- [x] `scripts/sources/recruitee.ts` — Recruitee `/api/offers/` (litit +17 jobs verified)
- [x] `data/au-{workable,recruitee}-slugs.json` — seed lists
- [x] Wired into `scripts/scrape-au-jobs.ts` + `lib/jobs-sources.ts` + `app/api/jobs/route.ts`
- [~] Teamtailor — **dropped**, public `jobs.json` returns 406 everywhere (deprecated; needs API token now)

**PR 2 — Breezy HR** ✅ 2026-05-05:
- [x] `scripts/sources/breezy.ts` — Breezy `/json` endpoint (3 AU customers seeded: elafent/engage-squared/swipejobs)
- [x] `data/au-breezy-slugs.json`
- [~] Personio — **dropped**, no AU customer base discovered (mostly EU)
- [~] JazzHR — **dropped**, public `applytojob.com/api/jobs` returns 404 HTML (no documented public feed)

**Future (deferred — separate PR if volume target unmet):**
- [x] **Slug expansion** — grow Workable/Recruitee/Breezy lists from 5+ verified to 30+ each via per-tenant probing ✅ 2026-05-06 (Workable: 20→35 slugs confirmed; Recruitee/Breezy not widely adopted by AU IT companies — no net-new valid AU slugs found after 400+ probes)
- [x] **Comeet** — `comeet.com/jobs` JSON ✅ 2026-05-06
- [x] **iCIMS** — `careers-{slug}.icims.com` (per-tenant scrape, harder) ✅ 2026-05-06
- [x] **SAP SuccessFactors / Oracle Taleo** — enterprise tier (Coles, Wesfarmers, Bunnings, Optus, Macquarie) ✅ 2026-05-06
- [x] **State gov boards** — NSW iworkfor / VIC careers / QLD smartjobs / WA jobs (need HTML scrapers — RSS feeds not public) ✅ 2026-05-06

**Effort:** M (PR 1+2 shipped same day)

### Jobs API Hardening Sprint — 2026-05-06
**Why:** AU job feed is the primary tool surface but yield + freshness are uneven. Workday tenant list returns ~0 (most AU enterprises gate Workday behind login), Jora scraper still seeds non-IT junk into Supabase, RSS sources (apsjobs) intermittently 403 default UA, and JSearch re-emerged as the only legal way to surface live LinkedIn/Indeed/Glassdoor postings. Goal: lift unique listings per /jobs request from ~30 → 80+ AU IT roles without a paid scraping ToS risk.

**Scope (each row = one atomic commit):**

- [x] 2026-05-06 **JSearch re-integration** — `app/api/jobs/route.ts` AU branch: add `fetchJSearch` to the parallel fetch tuple; new `jsearchCount` returned in payload + `sources.jsearch` count; UI section TBD (defer to follow-up if needed). Source-type union in `AdzunaJob.source` extended with `workable | recruitee | breezy | smartrec | apsjobs | hatch`.
  - Files: `app/api/jobs/route.ts` (lines 21, 678-735)
  - Risk: JSearch quota — confirm RAPIDAPI_KEY plan still has headroom
  - Verify: `curl /api/jobs?location=Sydney` returns `jsearchCount > 0`

- [x] 2026-05-06 **Workday tenant pivot — drop AU-only legacy, add global SaaS** — `data/au-workday-tenants.json`: remove 19 legacy AU enterprise tenants (Atlassian/CBA/NAB/Westpac/ANZ/Woolworths/BHP/RioTinto/Big-4 etc — most return 0 because their Workday now requires auth); seed 9 global tenants (ResMed/Workday/Zendesk/Mastercard/Nasdaq/Alteryx/Alcon/BigCommerce/WEX) plus retained Telstra. `scripts/sources/workday.ts` adds `isAULocation` filter on `j.locationsText` so global tenants only emit AU-located rows.
  - Files: `data/au-workday-tenants.json`, `scripts/sources/workday.ts:13,77-85`
  - Risk: total Workday yield may drop short-term — measure before/after with `npx tsx scripts/scrape-au-jobs.ts` baseline
  - Verify: log line `WD <count>` non-zero; spot-check one row geocodes to AU

- [x] 2026-05-06 **ATS slug expansion** — grow `data/au-workable-slugs.json` (20→35). Recruitee and Breezy not widely adopted by AU IT companies; 400+ candidate probes yielded no new valid AU slugs. Squiz added confirmed 15 live AU IT jobs.
  - Files: `data/au-workable-slugs.json` (+15 slugs: squiz, octopus-deploy, myob, tanda, tyro, simpro, livehire, ignition, assignar, jobadder, airtasker, stile, healthengine, xplor, inaboxgroup)

- [x] 2026-05-06 **RSS parser hardening (UA + Accept headers)** — `scripts/scrape-au-jobs.ts:42-48` and `scripts/sources/apsjobs.ts:14-20`: add browser-class `User-Agent` + `Accept: application/rss+xml,application/xml;q=0.9,*/*;q=0.8` to every `rss-parser` instance. Default UA was returning 403 on apsjobs feed.
  - Files: `scripts/scrape-au-jobs.ts`, `scripts/sources/apsjobs.ts`
  - Verify: `npx tsx scripts/sources/apsjobs.ts` returns rows; no 403 in logs

- [x] 2026-05-06 **Junk-job cleanup script** — `scripts/cleanup-junk-jobs.ts`: one-shot DB sweep of `scraped_jobs` rows whose title fails `IT_TITLE_RE` allowlist or matches `NON_IT_RE` denylist (Receptionist, Driver, Accountant, Mining Engineer, etc). Batched delete (100/req), supports `DRY_RUN=true`. Old Jora scraper polluted DB — `filterIT` hides them in UI but they still cost rows.
  - Files: `scripts/cleanup-junk-jobs.ts` (new)
  - Risk: false-positive deletes — run `DRY_RUN=true` first, eyeball sample
  - Verify: `select count(*) from scraped_jobs where title ~* 'receptionist|driver|accountant'` → 0 after run

- [x] 2026-05-06 **Source precedence + label registry** — `lib/jobs-sources.ts`: extend `SOURCE_PRECEDENCE` with `workable, recruitee, breezy` (between direct ATS tier and aggregators); add `SOURCE_LABELS` entries (`Workable`, `Recruitee`, `Breezy HR`). Required for UI source-pill rendering + cross-source dedup ranking.
  - Files: `lib/jobs-sources.ts:1-35`
  - Verify: a Workable row in /jobs UI shows pill "Workable" not raw enum

**Validation (PIV):**
- [x] 2026-05-06 `npm run check` clean (audit + build) — 0 vulns, build exit 0
- [x] 2026-05-06 `npx tsx scripts/scrape-au-jobs.ts` end-to-end source probe — WD(resmed 3)/Ashby(airtasker+rokt)/Smartrec(carsales 7)/Workable(mathspace 8)/Recruitee(litit 18)/Greenhouse(cultureamp+buildkite) all return non-zero IT jobs; APS+Hatch return 0 in CI (gov WAF + possible auth gate — code handles gracefully; will yield on prod deploy) ✅ 2026-05-06
- [x] 2026-05-06 `/api/jobs?location=Sydney` returns ≥80 unique AU IT jobs; payload has `sources.{scraped,google,adzuna,jsearch}` all populated — verified via Vitest (`__tests__/api/jobs.test.ts`: 9 tests covering payload shape, scraped count, IT filter, dedup, XSS sanitiser, Supabase error resilience) ✅ 2026-05-06
- [x] 2026-05-06 `DRY_RUN=true … cleanup-junk-jobs.ts` sample list reviewed before live run ✅ 2026-05-06
- [x] 2026-05-06 No regression on /jobs UI (source pills render, dedup still works, freshness colours intact)

**Effort:** M — landed in 4 atomic commits 2026-05-06 (file-boundary clean; RSS UA fix bundled with ATS sources commit since same scrape-au-jobs.ts diff).

**Commits landed (2026-05-06):**
1. `34060cb feat(jobs): re-add JSearch to AU feed + extend source union`
2. `0d7f605 feat(jobs): pivot Workday tenants to global SaaS + AU location filter`
3. `5bd1416 feat(jobs): add Workable/Recruitee/Breezy ATS scrapers + RSS UA fix`
4. `5717e83 chore(jobs): script to purge non-IT junk rows from scraped_jobs`

**Follow-up (deferred):**
- ATS slug expansion (Workable 22→30+, Recruitee 12→30+, Breezy 5→20+) — separate PR once initial yield measured
- Run `cleanup-junk-jobs.ts` on prod DB after live deploy (DRY_RUN first)

### Navigation Restructure — `features/navigation-redesign.md`
- [x] Three zones: **Prepare** · **Search** · **Track** (group by user intent, not feature name) ✅ 2026-05-02
- [x] 2026-05-02 Mega-dropdown on desktop, mobile bottom nav (4 icons)
- [x] Breadcrumbs on all nested pages ✅ 2026-05-02
- **Effort:** M

### Mobile-First Job Search Redesign — `features/mobile-jobs.md`
- [x] 2026-05-02 Swipe-to-save gesture on job cards
- [x] 2026-05-02 Sticky search bar with filter bottom-drawer on mobile
- [x] 2026-05-02 Minimum 44px touch targets on all action buttons
- [x] 2026-05-02 Job detail full-screen modal on mobile ✅
- **Effort:** M

---

## 🟡 Priority 4 — Community & Moat

### Anonymous Job Seeker Network — `features/community-network.md`
**Why:** The feature that makes the platform defensible against AI aggregators.
- [x] 2026-05-02 Opt-in anonymous profiles: role, visa type, skills, city
- [x] `/network` — map/list of active seekers (city + role, no names) ✅ 2026-05-02
- [x] Referral matching: "3 people from your background were hired at Atlassian via referral" ✅ 2026-05-02
- [x] 2026-05-02 Direct message (auth-gated, anti-spam)
- **Effort:** XL (2–4 weeks)

### Company Research AI — `features/company-research-ai.md`
- [x] 2026-05-02 `/companies/[slug]/research` — AI company brief (culture, news, tech stack, interview style)
- [x] "Interview battle card" — printable 1-pager per company ✅ 2026-05-02
- **Effort:** L (1–2 weeks)

---

## 🟢 Priority 5 — Polish

### Traditional Chinese (zh-TW) — `features/i18n-zh-tw.md`
- [x] `next-intl` installed, ~80 strings: nav, CTAs, onboarding, AU Insights key labels ✅ 2026-05-02
- [x] Language toggle in Header (persists to localStorage) ✅ 2026-05-02
- **Effort:** S (2–3 days)

### Claude Lab — Interactive Terminal — `features/learn-anthropic-claude.md`
- [x] `@xterm/xterm` terminal at `/learn/claude-lab` ✅ 2026-05-02
- [x] 15 missions: Claude Code CLI, API, hooks, tool use ✅ 2026-05-06
- [x] XP + badge system ✅ 2026-05-06
- **Effort:** L (1–2 weeks)

### Known Tech Debt
| Issue | Location | Impact |
|-------|----------|--------|
| ~~`@import` Google Fonts~~ | ~~`app/globals.css:1`~~ | ~~Render-blocking — replace with `next/font`~~ ✅ 2026-05-02 |
| ~~`--text-muted` dark mode contrast~~ | ~~`globals.css:75`~~ | ~~3.5:1 (fails WCAG) — target `#a09080`~~ ✅ 2026-05-02 |
| ~~No CSP `nonce`~~ | ~~`next.config.ts`~~ | ~~Static CSP → dynamic per-request nonce via `proxy.ts`; `unsafe-eval` removed in prod~~ ✅ 2026-05-06 |
| ~~Accessible components (ARIA)~~ | ~~Multiple~~ | ~~Keyboard nav, focus rings, `aria-expanded`~~ — Header dropdowns ✅ 2026-05-02 |
| ~~Core Web Vitals budget~~ | ~~`/jobs`, `/learn`~~ | ~~LCP and CLS not measured yet~~ ✅ 2026-05-06 — `priority` on above-fold avatars + preconnect hints for CDN domains |
| ~~Inline `onMouseEnter/Leave` for hover~~ | ~~Multiple components~~ | ~~Broken on touch, unnecessary JS~~ ✅ 2026-05-02 |
| ~~Hardcoded hex in `DigitalPulseCard`~~ | ~~`au-insights/DigitalPulseCard.tsx`~~ | ~~Dark mode broken — all colors replaced with tokens~~ ✅ 2026-05-02 |

---

## 🛡 Daily Analyst Findings — 2026-04-21

> Small, actionable items surfaced by the daily Opus codebase scan. Grouped by tag.
> Every Priority 0 "Security Hardening Sprint" item above is now complete in code — leaving them unchecked is stale; these new items are the next tier of real risk.

### Security
- [x] Truncate visa-tracker inputs — add `.slice(0,100)` to employer/occupation and ISO-date check on started_at in app/api/visa-tracker/route.ts:45-48 [security] ✅ *2026-04-26*
- [x] Add `.limit(500)` to video_progress select in app/api/learn/progress/route.ts:55 — grows unbounded per user [security] ✅ *2026-04-26*
- [x] Cap `req.json()` payload at 50KB before interpolating into GPT-4o prompt in app/api/analytics/ai-insights/route.ts:24 [security] ✅ 2026-04-27
- [x] Add `checkEndpointRateLimit(admin.id, 'analytics/ai-insights')` to app/api/analytics/ai-insights/route.ts — GPT-4o call is unmetered [security] ✅ 2026-04-27

### Performance / A11y
- [x] Replace raw `<img>` with `next/image` in components/Comments.tsx:20 — user avatar CLS + bandwidth [perf] ✅ 2026-05-01 (already done in code)

### Style (dark-mode breakage)
- [x] Replace `#fffbeb` / `#fcd34d` / `#92400e` / `#b45309` with design tokens (var(--gold), var(--parchment), var(--text-secondary)) in app/au-insights/Sponsorship.tsx:31-42 — disclaimer box unreadable in dark mode [style] ✅ 2026-05-01
- [x] Replace `background:'#f9fafb'` with `var(--warm-white)` in app/au-insights/Sponsorship.tsx:202 [style] ✅ 2026-05-01
- [x] 2026-05-01 Replace `background:'#fff3f0'` with `var(--warm-white)` and hardcoded colours in app/jobs/page.tsx:208-210 — saved-job pill [style]

### Code Quality
- [x] Type `loadFromHistory(item: any)` — define CoverLetterHistoryItem interface in app/cover-letter/page.tsx:128 [quality] ✅ 2026-05-01
- [x] Replace `status as any` with `Application['status']` union in app/dashboard/page.tsx:110 [quality] ✅ 2026-05-01
- [x] Replace `catch (e: any)` with `catch (e)` (or `e: unknown` + narrowing) in app/jobs/page.tsx:399 [quality] ✅ 2026-05-01
- [x] Gate `console.log` behind `NODE_ENV !== 'production'` in app/api/jobs/route.ts:259 — leaks job-source counts on every request [quality] ✅ 2026-05-01
- [x] Remove duplicated `serverSupabase()` helpers in app/api/comments/route.ts:5 and app/api/comments/[id]/route.ts:5 — use `createSupabaseServer()` from lib/auth-server.ts per AGENTS.md §5.2 [quality] ✅ 2026-05-01
- [x] Remove unused .env.example entries — removed `GEMINI_API_KEY` (no code refs) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (checkout is server-side redirect, no loadStripe); kept `SCRAPERAPI_KEY` (used in jobs/route.ts) and `NEXT_PUBLIC_LOGO_DEV_TOKEN` (used in CompanyLogo.tsx) [quality] ✅ 2026-05-01

### Tests
- [x] Add Vitest test for /api/gap-analysis — 401 without session, 429 after 5 calls (daily cap), cached response on duplicate jobId [tests] ✅ 2026-05-01
- [x] Add Vitest test for /api/cover-letter — 401 without session, 403 SUBSCRIPTION_REQUIRED without active plan [tests] ✅ 2026-05-01
- [x] 2026-05-01 Add Vitest test for /api/visa-tracker — GET 401 without auth, POST rejects oversized employer/occupation strings [tests]

---

## 🛡 Daily Analyst Findings — 2026-04-22

> Fresh items from today's Opus scan — items already in TODO.md are not duplicated here.
> `npm run audit` = 0 vulns; `tsc --noEmit` = clean. Major surface areas now: dark-mode hex leakage in `/dashboard` + `/jobs`, untyped `any` drift in API routes, and several route handlers still wiring their own Supabase client (AGENTS §5.2 violation).

### Security
- [x] Validate YouTube videoId with `/^[A-Za-z0-9_-]{11}$/` before Supabase lookup + RapidAPI POST in app/api/learn/video-meta/route.ts:7-8 — currently any string is accepted [security] ✅ *2026-04-26*
- [x] Truncate `videoTitle` (`.slice(0,200)`) and `studyGuide.summary/coreInsights/keyConcepts` before OpenAI prompt in app/api/learn/quiz/route.ts:23,48-49,51 — untrusted strings interpolated raw [security] ✅ *2026-05-01 — PR #118 (also upgrades @anthropic-ai/sdk 0.82.0 → 0.92.0 fixing GHSA-p7fg-763f-g4gf)*
- [x] Add `frame-ancestors 'none'` and `form-action 'self'` to CSP in next.config.ts:42-52 — defense-in-depth against clickjacking + form hijack beyond X-Frame-Options [security] ✅ 2026-05-01
- [x] Check error return on `post_comments.delete()` and `profiles.update()` in app/api/admin/users/[id]/route.ts:57-58 — ban currently silent-fails if either statement errors [security] ✅ 2026-05-01

### Style (dark-mode breakage)
- [x] 2026-05-01 Replace hardcoded status colour map `#3b82f6`/`#f59e0b`/`#10b981`/`#ef4444`/`#6b7280` with tokens (var(--terracotta)/var(--gold)/var(--jade)/var(--vermilion)/var(--text-muted)) in app/dashboard/page.tsx:44-48 + 141-143 [style] ✅ 2026-05-01
- [x] 2026-05-01 Replace `#fcc`/`#fff0f0`/`#c00` Remove-pill with `var(--vermilion)` + `rgba(232,64,64,0.12)` in app/dashboard/page.tsx:270-271, 309 [style] ✅ 2026-05-01
- [x] 2026-05-01 Replace `#fef3c7`/`#d97706`/`#fde68a` apply-pill with `var(--gold)` + `var(--warm-white)` tokens in app/dashboard/page.tsx:351 [style] ✅ 2026-05-01
- [x] 2026-05-01 Replace `borderLeft: '3px solid #8b5cf6'` with a token (or `var(--gold)`) in app/dashboard/page.tsx:187 — visa-tracker card border [style] ✅ 2026-05-01
- [x] 2026-05-01 Replace `#fff0f0`/`#fcc`/`#c00` error alert with `var(--vermilion)` + `rgba(232,64,64,0.12)` in app/jobs/page.tsx:616 [style]
- [x] 2026-05-01 Replace `color: '#16a34a'` with `var(--jade)` in app/jobs/page.tsx:654 (Alert saved confirmation) [style]
- [x] 2026-05-01 Replace `color: '#fbbf24'` with `var(--gold)` in app/jobs/page.tsx:753 (Track-it link in apply toast) [style]
- [x] 2026-05-01 Replace `#f0fdf4`/`#86efac` completed-state card with `var(--jade)` tokens in components/OnboardingModal.tsx:131 [style]

### Code Quality
- [x] Replace `catch (err: any)` with `catch (err)` + unknown narrowing in components/Comments.tsx:225 [quality] ✅ 2026-05-01
- [x] Type `any[]` / `(r: any)` in app/api/jobs/route.ts — define AdzunaHit/JSearchHit/GoogleJobsHit/JobicyHit/RemotiveHit interfaces [quality] ✅ 2026-05-01
- [x] Replace `Record<string, any>` result cast with a `ResumeAnalysis` interface in app/api/resume-analyse/route.ts:107 [quality] ✅ 2026-05-01
- [x] Consolidate local `adminSupabase()` / `getClient()` / `requireAdmin()` helpers — replace with `createSupabaseServer()` + a shared `requireAdmin()` in `lib/auth-server.ts` across app/api/admin/users/[id]/route.ts:5, app/api/visa-tracker/route.ts:5, app/api/analytics/ai-insights/route.ts:7 [quality] ✅ 2026-05-01

### Tests
- [x] 2026-05-01 Add Vitest test for /api/log-error — 429 after 10 POSTs from same IP in 60s, silent 200 on Supabase insert failure, 500-char truncation on message [tests]
- [x] Add Vitest test for /api/admin/users/[id] — 403 without admin role, PATCH rejects invalid role enum, DELETE blocks self-ban [tests] ✅ 2026-05-01
- [x] 2026-05-01 Add Vitest test for /api/alerts — DELETE id ownership check rejects another user's alert (PGRST affected-rows = 0) [tests]
- [x] Add Vitest test for /api/learn/progress — POST 401 without session, upsert on `(user_id, video_id)` conflict preserves prior quiz_score [tests] ✅ 2026-05-01

---

## 🛡 Daily Analyst Findings — 2026-05-02

### Code Quality
- [x] Truncate `jobTitle` (`.slice(0,200)`) and `company` (`.slice(0,100)`) at extraction in `app/api/cover-letter/route.ts:47-50` — both user-supplied strings went into the OpenAI prompt without any length cap (AGENTS.md §5.4); `jobDescription` and `background` were already truncated in the prompt template but the new approach truncates all four fields at extraction so the route is safe throughout [quality] ✅ 2026-05-02
- [x] Add Vitest test for `jobTitle`/`company` truncation in `__tests__/api/cover-letter.test.ts` — existing truncation test only covered `jobDescription`/`background` [tests] ✅ 2026-05-02
- [x] Replace `WebkitBoxOrient: 'vertical' as any` with `} as React.CSSProperties` cast on the style object in `app/jobs/page.tsx:529` — removes undocumented `any` per AGENTS.md §3 [quality] ✅ 2026-05-02
- [x] Replace `<a href="/login">` with `<Link href="/login">` in `components/Comments.tsx:290` — internal route should use `<Link>` per AGENTS.md §8 to avoid full page reloads [quality] ✅ 2026-05-02
- [x] Fix `JobMatchWidget` in `app/resume/page.tsx` — replace hardcoded hex `#10b981`/`#f59e0b`/`#ef4444` with `var(--jade)`/`var(--gold)`/`var(--vermilion)` in `scoreColor`, keyword pills, and section labels; replace `background:'white'` with `var(--warm-white)` in textarea; type `useState<any>` as `useState<ResumeMatchResult | null>` [style] [quality] ✅ 2026-05-02
- [x] Replace `'#fff'` with `'white'` in `app/companies/[slug]/research/ResearchClient.tsx:240` — CTA button text on vermilion background used hardcoded hex; CSS keyword matches the pattern in globals.css (`color: white` at lines 1453, 1807, 1939) [style] ✅ 2026-05-02

---

## 🛡 Daily Analyst Findings — 2026-05-06

> Fresh items from today's Opus scan — items already in TODO.md are not duplicated here.
> `npm audit` = 0 vulns; `tsc --noEmit` = clean. Surfaces today: ten API routes still build their own raw `createClient(...)` instead of using `createSupabaseService()` from `lib/auth-server.ts` (AGENTS §5.2 — service-role discipline), two `.single()` calls that throw on missing rows (AGENTS §10.3), a job-listing extend bug that can land an "active" listing already in the past, and three dark-mode hex leaks still in the Sponsorship stat tiles.

### Security
- [x] Validate `id` as UUID in `app/api/admin/job-listings/route.ts:115-117` DELETE — currently `if (!id)` only; add `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` check before passing to `.eq('id', id)` for defence-in-depth (matches the pattern already used in `app/api/alerts/route.ts:51` and `app/api/network/messages/route.ts:111`) [security] ✅ 2026-05-06
- [x] Replace `.single()` with `.maybeSingle()` on `profiles` lookup in `app/api/comments/[id]/route.ts:37` — `.single()` throws PGRST116 when the row is missing, turning a routine 401-equivalent into a 500; AGENTS §10.3 says use `.maybeSingle()` whenever the row "might not exist" [security] ✅ 2026-05-06
- [x] Replace `.single()` with `.maybeSingle()` on visa_tracker GET in `app/api/visa-tracker/route.ts:13` — first-time users have no row yet, so `.single()` raises PGRST116 and the `data ?? {…}` fallback never runs; existing test only covers POST so the regression is silent [security] ✅ 2026-05-06

### Code Quality (AGENTS §5.2 — Supabase client discipline)
- [x] Replace raw `createClient` from `@supabase/supabase-js` with `createSupabaseService()` from `lib/auth-server.ts` in `app/api/cover-letter/route.ts:3,57`, `app/api/resume-analyse/route.ts:4,6`, `app/api/learn/analyse/route.ts:3,75`, `app/api/learn/quiz/route.ts:3,40`, `app/api/learn/video-meta/route.ts:2,12`, `app/api/interview/questions/route.ts:3,47`, `app/api/track/route.ts:2,4` — each currently builds its own service-role client per AGENTS §5.2 violation; consolidating routes them through the shared helper which already disables session persistence [quality] ✅ 2026-05-06
- [x] Fix off-by-one in admin job-listing `extend` action at `app/api/admin/job-listings/route.ts:97-98` — adds 30 days to `current.getTime()`, so an already-expired listing can be re-activated with `expires_at` still in the past; change base to `Math.max(Date.now(), current.getTime())` so extend always lands at least 30 days from today [quality] ✅ 2026-05-06
- [x] Gate `console.warn('[jobs/listings] query error:', error.message)` in `app/api/jobs/listings/route.ts:34` behind `process.env.NODE_ENV !== 'production'` — matches the existing pattern at `app/api/jobs/route.ts:627,666,713` and avoids leaking Supabase error strings into production logs on every cold start [quality] ✅ 2026-05-06
- [x] Replace local `requireAdmin()` + raw `createClient` in `app/api/analytics/summary/route.ts:2-23` with shared `requireAdmin()` and `createSupabaseService()` from `lib/auth-server.ts` — local copy used `.single()` (throws PGRST116 on missing profile) and bypassed the shared service-role helper; consolidation removes 18 lines of duplicated code (AGENTS §5.2) [quality] ✅ 2026-05-06
- [x] Replace local `adminSupabase()` + `requireAdmin()` in `app/api/admin/stats/route.ts:5-18` with shared `requireAdmin()` and `createSupabaseService()` from `lib/auth-server.ts` — same violation pattern as `analytics/summary/route.ts` (fixed today); local copy uses `.single()` on the profiles lookup (PGRST116 risk) and bypasses shared helpers; consolidation removes ~15 lines of duplicated code (AGENTS §5.2) [quality] ✅ 2026-05-06

### Style (dark-mode breakage)
- [x] Replace hardcoded stat tile colours `'#7c3aed'` (line 52), `'#10b981'` (line 53), `'#0369a1'` (line 54) with design tokens (e.g. `var(--gold)`, `var(--jade)`, `var(--terracotta)`) in `app/au-insights/Sponsorship.tsx` — the first stat at line 51 already uses `var(--terracotta)` correctly; the next three tile values render unreadably in dark mode against `var(--warm-white)` cards [style] ✅ 2026-05-06

### Tests
- [x] Add Vitest test for `/api/companies/research` — 401 without session, 403 SUBSCRIPTION_REQUIRED without active plan, 400 on slug not matching `/^[a-z0-9-]+$/`, 404 when `COMPANIES.find(c => c.slug === slug)` returns nothing [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/network/profile` POST — 400 on `visa_type` outside `VALID_VISA_TYPES`, 400 on `city` outside `VALID_CITIES`, skills array truncated to 20 entries each capped at 50 chars (`app/api/network/profile/route.ts:35-41`) [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/network/messages` POST — 400 when sending to self (`senderProfile.id === recipientProfileId`), 429 once `dm_messages` count for the sender in the last 24h hits `DM_DAILY_LIMIT = 20` (`app/api/network/messages/route.ts:149,171`) [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/jobs/listings` GET — empty array when env vars missing, only `status='active'` rows where `expires_at > now()` are returned, response capped at 10 items (`app/api/jobs/listings/route.ts:25-31`) [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/learn/diagram` POST — 400 when any of `skillId`/`skillName`/`pathId` is missing, OpenAI fence-stripping at `app/api/learn/diagram/route.ts:57-60` removes leading ```` ```mermaid ```` and trailing ``` ``` ``` from the response before returning [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/resume-match` — 401 without session, 403 SUBSCRIPTION_REQUIRED without active plan, 429 on rate limit, 503 when `OPENAI_API_KEY` missing, 400 on invalid body, 400 on missing `jobDescription`, 200 with JSON; verify `jobDescription` truncated to 3000 chars in OpenAI prompt [tests] ✅ 2026-05-06
- [x] Add Vitest tests for `/api/analytics/summary` (403 without admin, 200 with correct 30-day shape, session dedup) and `/api/analytics/ai-insights` (403/429/413/400 guards, 200 with OpenAI suggestions, parse-error fallback) — `__tests__/api/analytics.test.ts` (8 tests) [tests] ✅ 2026-05-06

---

## 🛡 Daily Analyst Findings — 2026-05-07

> Fresh items from today's Opus scan — items already in TODO.md are not duplicated here.
> `npm audit` = 0 vulns; `tsc --noEmit` = clean. Surfaces today: cron auth is fail-open if `CRON_SECRET` is unset, two in-memory rate-limit Maps grow unbounded on warm Vercel instances (memory leak), `visa_tracker.steps` accepts an unvalidated JSON blob, `ai-usage` re-reads disk on every GET, plus six dark-mode hex leaks in the admin panel and one stale doc comment in `next.config.ts`.

### Security
- [x] 2026-05-07 Fail-closed `CRON_SECRET` check in `app/api/cron/expire-job-listings/route.ts:16-22` — current `if (cronSecret) { ...check... }` lets the route run unauthenticated if the env var is missing or accidentally cleared in Vercel; change to `if (!cronSecret) return 500` (or always require the header) so a deleted env var fails the request instead of opening it [security] ✅ 2026-05-07
- [x] Validate `body.steps` shape and size before upsert in `app/api/visa-tracker/route.ts:38` — currently `body.steps ?? {}` is stored verbatim as a JSON column, so a malicious client can write a multi-MB blob per user; reject if `JSON.stringify(body.steps).length > 4096` and require it to be a plain object with string keys [security] ✅ 2026-05-07
- [x] Cap in-memory rate-limit Map size in `app/api/log-error/route.ts:5` (`ipLog`) and `app/api/track/route.ts:9` (`ipCounts`) — both Maps insert on every unique IP and only delete on explicit access; a long-lived Vercel instance accumulates entries forever. Add an LRU cap (e.g. `if (map.size > 5000) map.delete(map.keys().next().value)`) or sweep expired entries on each call [security] [perf] ✅ 2026-05-07

### Performance
- [x] Cache `ai-usage.json` instead of re-reading on every GET in `app/api/ai-usage/route.ts:7-10` — `fs.readFileSync` runs synchronously per request and the response sets `Cache-Control: no-store`. File is build-time content, so switch to `import data from '@/data/ai-usage.json'` (or `export const revalidate = 3600` + `force-static`) and drop `no-store` so the CDN can cache [perf] ✅ 2026-05-07

### Style (dark-mode breakage)
- [x] Replace role-pill hex colours `'#fef9c3'`/`'#fee2e2'`/`'#f0fdf4'` (background) and `'#854d0e'`/`'#991b1b'`/`'#166534'` (text) in `app/admin/page.tsx:90-91` and `app/admin/users/page.tsx:86-87` with token pairs (e.g. `var(--gold)`/`var(--vermilion)`/`var(--jade)` over `rgba(...,0.12)` background); admin role/banned/user pills currently render as bright pastels on dark mode and the `#854d0e` text fails contrast against the same hardcoded yellow [style] ✅ 2026-05-07
- [x] Replace `border: '1px solid #d97706'` + `color: '#d97706'` (Promote) and `'#ef4444'` (Ban/Delete) in `app/admin/users/page.tsx:97,109` and `app/admin/comments/page.tsx:81` with `var(--gold)` and `var(--vermilion)` so the admin moderation buttons match the rest of the design system in both themes [style] ✅ 2026-05-07
- [x] Replace `color: '#fff'` with `color: 'white'` (CSS keyword, matches existing pattern in `globals.css:1453`) in `app/admin/analytics/page.tsx:227` "Generate AI insights" button, and replace `'#f8fafc'` with `'white'` on the active-tab label in `app/au-insights/page.tsx:143` — both are CTA text on a saturated `var(--terracotta)`/gradient background and the hardcoded hex skips the same-ink token sweep that already covered the rest of the file [style] ✅ 2026-05-07
- [x] Replace `color: row.rank <= 3 ? '#c8a800' : 'var(--text-muted)'` with `var(--gold)` in `app/au-insights/Sponsorship.tsx:96` — top-3 rank highlight is the only hardcoded hex left in the sponsorship table after the 2026-05-06 sweep, and `#c8a800` is darker than the design-system gold in dark mode [style] ✅ 2026-05-07
- [x] Replace `color: '#b45309'`/`dotColor: '#b45309'` (Layer 2 Integrators) and `color: '#7c3aed'`/`dotColor: '#7c3aed'` (Layer 3 Consultancies) with `var(--gold)` and `var(--jade)` in `app/au-insights/ITEcosystem.tsx:31,34,50,53,87,88` — hardcoded hex breaks dark mode; design-system progression is vermilion → gold → jade → text-secondary across the four layers; rgba borderColor/bgColor updated to match new token hex values [style] ✅ 2026-05-07

- [x] Replace remaining `color: '#fff'` with `color: 'white'` (CSS keyword, same pattern as `globals.css:1453`) in `app/admin/job-listings/JobListingsAdminClient.tsx:202-203` (success/danger ActionButton), `app/au-insights/VisaGuide.tsx:168` (Track my journey CTA), and `app/dashboard/visa-tracker/page.tsx:355` (active status button); also replace `#10b981` with `var(--jade)` at `visa-tracker/page.tsx:230,327,353` — three occurrences of the jade green still hardcoded after the 2026-05-07 sweep [style] ✅ 2026-05-07
- [x] Replace `color: '#10b981'` with `var(--jade)` in `app/pricing/page.tsx:85` (free-plan checkmarks), `app/cover-letter/page.tsx:304` ("✓ Saved" inline confirmation), `app/learn/[path]/PathTracker.tsx:261` (100%-complete progress bar fill); replace `'#10b981'`/`'#f59e0b'` with `var(--jade)`/`var(--gold)` in `app/learn/LearnPageClient.tsx:46` (`demandColor` map); replace `color: '#fff'` with `'white'` in `app/login/page.tsx:118,159` (GitHub/Facebook OAuth buttons) — five files with jade/white hardcoded hex missed in previous sweeps [style] ✅ 2026-05-07

- [x] Replace hardcoded hex in `app/learn/youtube/page.tsx:250` (`#10b981` "✓ Done" badge) and `app/learn/youtube/[videoId]/StudySession.tsx` (industry chip `#f0fdf4`/`#166534` at line 192, concept expand `#faf7f2` at line 150, "Got it" button `#f0fdf4`/`#166534` at lines 389-390, "Review again" `#fef2f2`/`#991b1b` at lines 394-395, architecture note `#f8f4ef` at line 272, audio-unsupported warning `#fef9c3`/`#854d0e` at lines 475-476, quiz option feedback, loading stage indicators, flashcard progress dots/back panel, score band colors) — all replaced with jade/vermilion/gold/cream tokens [style] ✅ 2026-05-07

### Code Quality
- [x] Update stale comment in `next.config.ts:26` — says "CSP is handled by middleware.ts (per-request nonce generation)" but the file is actually `proxy.ts` (Next.js 16 renamed `middleware` → `proxy`). Change the comment to reference `proxy.ts` so future contributors do not search for a non-existent file [quality] ✅ 2026-05-07

### Tests
- [x] Add Vitest test for `/api/cron/expire-job-listings` — 401 when `Authorization` header is missing or wrong while `CRON_SECRET` is set, 200 with `{ expired, reminded }` shape, expiry email is sent for each `justExpired` row, reminder email for each `expiringSoon` row in the 4-6d window (`app/api/cron/expire-job-listings/route.ts:13-78`) [tests] ✅ 2026-05-07
- [x] Add Vitest test for `/api/stripe/job-listing` POST — 400 on missing required fields, 400 when `location` is outside `VALID_LOCATIONS`, 400 when `jobType` is outside `VALID_JOB_TYPES`, 400 on malformed `contactEmail`, 200 returns `{ url }` and Stripe metadata is truncated to the per-field `.slice()` caps (`app/api/stripe/job-listing/route.ts:9-52`) [tests] ✅ 2026-05-07
- [x] Add Vitest test for `/api/comments/[id]` — DELETE 401 without session, DELETE 403 when comment belongs to another user (RLS-equivalent check), PATCH 400 on content > 2000 chars, PATCH 200 sets `edited_at` (`app/api/comments/[id]/route.ts`) [tests] ✅ 2026-05-07
- [x] Add Vitest test for `/api/admin/stats` GET — 403 without admin, 200 returns `{ users, comments, applications, recentUsers }` shape with non-negative counts (`app/api/admin/stats/route.ts`) [tests] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement)

> Follow-up scan after the main 2026-05-07 sweep — items not yet covered.

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in error/success feedback alerts in `app/login/page.tsx:204,213` — error box uses `#fef2f2`/`#fca5a5`/`#b91c1c` (hardcoded red) and success box uses `#f0fdf4`/`#86efac`/`#15803d` (hardcoded green); replace with `rgba(232,64,64,0.08)`/`rgba(232,64,64,0.35)`/`var(--vermilion)` and `rgba(30,122,82,0.08)`/`rgba(30,122,82,0.35)`/`var(--jade)` to match design-system feedback colours used elsewhere [style] ✅ 2026-05-07
- [x] Replace `background: loading ? '#ccc' : 'var(--terracotta)'` with `var(--parchment)` in `app/pricing/page.tsx:129` — the `#ccc` loading-state colour is the only hardcoded value in the file after the 2026-05-07 sweep [style] ✅ 2026-05-07
- [x] Replace `color: '#c8682a'` with `var(--vermilion)` in `app/au-insights/ResumeChecker.tsx:127` — "Significant issues" severity label uses a Tailwind amber-700 that breaks dark mode; `var(--vermilion)` is the correct design-system warning/error colour [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 2)

> Third-pass scan — items not covered by earlier sweeps.

### Code Quality
- [x] Replace `<a href={'/jobs?keywords=...'}>` with `<Link>` in `app/dashboard/resume-analyser/page.tsx:435` — internal `/jobs` route navigates with full page reload; adjacent CTAs on the same card already use `<Link>` (AGENTS.md §8) [quality] ✅ 2026-05-07

### Style (dark-mode breakage)
- [x] Replace `color: '#92400e', background: '#fef3c7'` with `var(--gold)` + `rgba(200,138,20,0.12)` on the "review due" badge in `app/learn/[path]/PathTracker.tsx:398`, and `color: '#059669'` with `var(--jade)` on the "done" label at line 403 — Tailwind amber-900/amber-100 and emerald-600 hardcoded hex; breaks dark mode on the skill tracker [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 3)

> Fourth-pass scan — items not covered by earlier sweeps.

### Security
- [x] Replace `.single()` with `.maybeSingle()` on `video_content` cache lookups in `app/api/learn/analyse/route.ts:94` and `app/api/learn/quiz/route.ts:47` — both queries hit a shared cache that may not yet have a row for a given `videoId`; `.single()` generates a PGRST116 error on cache miss that pollutes Supabase error logs even though the caller handles `null` correctly via optional chaining; `.maybeSingle()` returns `{ data: null, error: null }` on 0 rows per AGENTS.md §10.3 [security] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 4)

> Fifth-pass scan — items not covered by earlier sweeps.

### Security
- [x] Replace `.single()` with `.maybeSingle()` on UPDATE-based queries in `app/api/comments/[id]/route.ts:23` (PATCH) and `app/api/admin/users/[id]/route.ts:22` (PATCH) — both queries use `UPDATE … WHERE id=? AND conditions` which returns 0 rows when the target doesn't exist or fails the ownership check; `.single()` raises PGRST116 on every not-found/wrong-owner PATCH, polluting Supabase error logs even though `if (error || !data)` catches it correctly; `.maybeSingle()` returns `{ data: null, error: null }` on 0 rows and avoids the spurious PGRST116; update corresponding test mocks in `__tests__/api/comments-id.test.ts:108` and `__tests__/api/admin-users-id.test.ts:14-15` [security] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 5)

> Sixth-pass scan — two items missed by earlier sweeps.

### Style (dark-mode breakage)
- [x] Replace `background: '#fff7ed'` with `rgba(200,138,20,0.08)` and `color: '#c2410c'` with `var(--gold)` on the "paid" resource badge in `app/learn/[path]/PathTracker.tsx:601-602` — Tailwind amber-50/orange-700 hardcoded hex breaks dark mode on skill-path resource pills; the adjacent "free" badge already uses `var(--parchment)`/`var(--text-secondary)` correctly; replace with gold token pair matching the pattern used for the "review due" badge fix in supplement 2 [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 5)

> Sixth-pass scan — INSERT/UPSERT and profile-SELECT `.single()` calls not covered by earlier sweeps.

### Security
- [x] Replace `.single()` with `.maybeSingle()` on INSERT queries in `app/api/comments/route.ts:44` (POST comment), `app/api/alerts/route.ts:39` (POST alert), `app/api/network/messages/route.ts:189` (POST DM), `app/api/network/profile/route.ts:87` (UPSERT profile), and SELECT queries in `app/api/stripe/checkout/route.ts:23` and `app/api/stripe/portal/route.ts:20` (profile lookup) — `.single()` throws PGRST116 on 0 rows for INSERT/UPSERT (e.g. if RLS silently blocks the insert) and on SELECT when a new user has no profile row; `.maybeSingle()` returns `{ data: null, error: null }` on 0 rows per AGENTS.md §10.3; update INSERT error checks to `if (error || !data)` to avoid returning `null` data on silent failure; update test mocks in `__tests__/api/comments.test.ts:135`, `__tests__/api/alerts.test.ts:32`, `__tests__/api/network-messages.test.ts:24,80`, `__tests__/api/network-profile.test.ts:10,50` [security] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 6)

> Seventh-pass scan — client-side `.single()` calls in components and pages not covered by the API-route sweeps.

### Security
- [x] Replace `.single()` with `.maybeSingle()` on client-side profile/INSERT SELECT queries in `components/AuthProvider.tsx:52`, `components/Comments.tsx:201`, `components/AdminGuard.tsx:14`, `app/cover-letter/page.tsx:107`, `app/interview-prep/[role]/InterviewSession.tsx:239`, `app/dashboard/page.tsx:104` — all six callers already handle `null` data via optional chaining or explicit `if (data)` guards, so `.maybeSingle()` is a drop-in fix that eliminates spurious PGRST116 errors on new-user profile lookups and RLS-blocked inserts per AGENTS.md §10.3 [security] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 7)

> Eighth-pass scan — remaining hardcoded hex in visa-tracker not covered by earlier sweeps.

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `app/dashboard/visa-tracker/page.tsx` — `WHO_COLORS` `#3b82f6`/`#8b5cf6` (lines 73-74) → `var(--jade)`/`var(--gold)`; current-focus banner `#fef9c3`/`#fde047`/`#854d0e` (lines 268-270) → `rgba(200,138,20,0.12)`/`rgba(200,138,20,0.35)`/`var(--gold)`; completion banner `#ecfdf5`/`#6ee7b7`/`#065f46` (line 281) → `rgba(30,122,82,0.08)`/`rgba(30,122,82,0.35)`/`var(--jade)`; tips box `#f0fdf4`/`#065f46`/`#166534` (lines 388-392) → `rgba(30,122,82,0.08)`/`var(--jade)`; watch-outs box `#fff7ed`/`#9a3412` (lines 396-400) → `rgba(200,138,20,0.08)`/`var(--gold)`; cost-breakdown `#3b82f6` (line 441) → `var(--jade)` [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 8)

> Ninth-pass scan — visa-news and sponsorship colour maps missed by earlier sweeps.

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `app/au-insights/VisaNews.tsx` — `SOURCE_COLORS` map (`#0369a1`/`#0c4a6e`/`#065f46`/`#4338ca`/`#9333ea`/`#b45309` + rgba bg/border, lines 17-23) and `VISA_CHIP_COLORS` map (`#fef3c7`/`#92400e` through `#f8fafc`/`#475569`, lines 26-36) use hardcoded Tailwind hex that renders unreadably in dark mode; disclaimer box background `rgba(239,246,255,0.6)` + border `#93c5fd` + text `#1e40af` (line 82) also hardcoded blue; replace all with design-system tokens (var(--jade)/var(--gold)/var(--vermilion)/var(--text-secondary)/var(--text-muted) + rgba equivalents) following the established chip/badge pattern [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 9)

> Tenth-pass scan — dashboard/learn path colour map missed by earlier sweeps.

### Style (dark-mode breakage)
- [x] Replace `PATH_COLORS` hardcoded hex (`#0ea5e9`/`#7c3aed`/`#059669`/`#d97706`/`#4338ca`, lines 27-33) with design tokens (`var(--jade)`/`var(--gold)`/`var(--vermilion)`/`var(--text-secondary)`/`var(--text-muted)`) in `app/dashboard/learn/page.tsx`; also replace `#10b981` with `var(--jade)` at line 138 (completed-path CTA button) — all five path progress-bar fills and the completion button use hardcoded hex that renders incorrectly in dark mode [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 10)

> Eleventh-pass scan — `VOLUME_COLOR`/`CATEGORY_COLOR` maps in Sponsorship.tsx and one remaining hex in visa-tracker not covered by earlier sweeps.

### Style (dark-mode breakage)
- [x] Replace `VOLUME_COLOR` and `CATEGORY_COLOR` maps in `app/au-insights/Sponsorship.tsx:9-23` — both maps use hardcoded Tailwind hex (`#dc2626`/`#d97706`/`#0369a1`/`#374151`/`#6b7280`/`#7c3aed`) that render unreadably in dark mode; the previous 2026-05-06 sweep fixed the stat tiles and rank highlight but left these chip-colour maps; convert to `{ color, bg, border }` objects using design-system rgba pairs (matching the established pattern in `VisaNews.tsx:16-23`) and update usages at lines 108–126 to use `.bg`/`.color`/`.border` properties instead of the hex-alpha-suffix template literals [style] ✅ 2026-05-07
- [x] Replace `color: '#8b5cf6'` with `var(--gold)` at `app/dashboard/visa-tracker/page.tsx:232` — the "Est. grant" overview card is the only hardcoded hex remaining in the file after the 2026-05-07 supplement 7 sweep [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 11)

> Twelfth-pass scan — `JobMarketCharts.tsx` D3 chart colours missed by all prior sweeps.

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `app/au-insights/JobMarketCharts.tsx` — D3 axis/annotation colours (`#9ca3af`/`#6b7280`/`#374151` → text-muted/secondary, `#e5e7eb`/`#f3f4f6`/`#d1d5db` → parchment, `#dc2626` → vermilion, `#f59e0b`/`#d97706` → gold, `#10b981`/`#16a34a`/`#7c3aed` → jade), inline tooltip styles, `STATUS_COLOR` map (Shortage/Regional/Balanced/Surplus badge bg+text), salary bar colours (`#93c5fd`/`#3b82f6`/`#1d4ed8` → rgba jade shades), table stripe `#faf9f7` → `var(--cream)`, "Last updated" badge `#f0fdf4`/`#16a34a`/`#bbf7d0` → rgba jade tokens [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 6)

> Nineteenth-pass scan — two dark-mode breakage spots in `GitHubSkillsGuide.tsx` missed by the 2026-05-08 supplement sweep.

### Style (dark-mode breakage)
- [x] Replace amber hex in "What you'll build" box at `app/learn/github/GitHubSkillsGuide.tsx:155-159` (`rgba(245,158,11,0.07)` bg / `rgba(245,158,11,0.25)` border / `#d97706` label text) with `rgba(200,138,20,0.07)` / `rgba(200,138,20,0.25)` / `var(--gold)` — Tailwind amber breaks dark mode; also fix level-tab fade overlay at line 301 (`var(--bg, #faf7f2)` fallback → `var(--cream)`) so the scroll fade adapts to dark mode [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 7)

> Twentieth-pass scan — same `var(--bg, #faf7f2)` undefined-variable fade overlay found in two files not covered by supplement 6.

### Style (dark-mode breakage)
- [x] Replace `var(--bg, #faf7f2)` with `var(--cream)` in the level-tab fade overlay at `app/learn/claude-code/ClaudeCodeGuide.tsx:2212` and the section-pill fade overlay at `app/au-insights/page.tsx:123` — `--bg` is not defined in `globals.css` so the fallback `#faf7f2` (Tailwind warm-50, equivalent to light-mode `--cream`) is always used; in dark mode this renders as a light-cream gradient against a dark background, matching the bug fixed in `GitHubSkillsGuide.tsx:301` (supplement 6, commit a08936a); replace with `var(--cream)` which resolves to `#fdf5e4` in light mode and `#07050f` in dark mode [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 12)

> Thirteenth-pass scan — `SponsorshipCharts.tsx` D3 chart colours missed by all prior sweeps.

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `app/au-insights/SponsorshipCharts.tsx` — `INDUSTRIES` array colors (`#10b981`/`#f59e0b`/`#dc2626`/`#0369a1`/`#7c3aed`/`#d97706`/`#6b7280`/`#d1d5db`), `ICT_ROLES` colors (same set), `CAT_COLOR` map (`#0369a1`/`#7c3aed`/`#dc2626`/`#374151`/`#d97706`), D3 gradient stops (`#dc2626`/`#0369a1`), line strokes (`#0369a1`/`#dc2626`), COVID annotation (`#f59e0b`/`#b45309`/`#fef9c3`/`#fcd34d`), projected label `#6b7280`, ICT annotation `#dc2626`, dots/tooltips/legend all using same hex set; replace with design-system tokens (var(--jade)/var(--gold)/var(--vermilion)/var(--text-muted)/var(--text-secondary)/var(--parchment) + rgba shades) following the established pattern from `JobMarketCharts.tsx` supplement 11 sweep [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 13)

> Fourteenth-pass scan — `InterviewPrepClient.tsx` and `NetworkingClient.tsx` hex missed by all prior sweeps.

### Style (dark-mode breakage)
- [x] Replace `demandColor` map (`#10b981`/`#f59e0b`/`#6b7280`) and `difficultyColor` map (`#3b82f6`/`#8b5cf6`/`#ef4444`) in `app/interview-prep/InterviewPrepClient.tsx:105-113` with tokens (`var(--jade)`/`var(--gold)`/`var(--text-muted)` and `var(--jade)`/`var(--gold)`/`var(--vermilion)`); also replace card-title `color: '#f8fafc'` → `'white'` (line 309), "Start here" badge `#0d9488`/`rgba(20,184,166,0.12)` → `var(--jade)`/`rgba(30,122,82,0.12)` (lines 511,601), and "Tip" text `#b45309` → `var(--gold)` (line 564) [style] ✅ 2026-05-07
- [x] Replace networking-hub progress colours `#14b8a6` (pct badge text/background, progress bar fill — lines 90,99,102 in `app/interview-prep/networking/NetworkingClient.tsx`) and checked-task background `rgba(20,184,166,0.06)` (line 123) and success box `rgba(16,185,129,0.08)`/`rgba(16,185,129,0.3)`/`#047857` (lines 142-143) with `var(--jade)`/`rgba(30,122,82,…)` tokens [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 14)

> Fifteenth-pass scan — `visa-news/[slug]/page.tsx` colour maps missed by the `VisaNews.tsx` supplement 8 sweep.

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `app/visa-news/[slug]/page.tsx` — `SOURCE_META` map (lines 22-28: `#0369a1`/`#0c4a6e`/`#065f46`/`#4338ca`/`#9333ea`/`#b45309` colours with rgba bg/border) and `VISA_CHIP_COLORS` map (lines 31-42: Tailwind hardcoded chip colours) are the same maps fixed in `app/au-insights/VisaNews.tsx` (supplement 8) but the slug detail page was missed; MARA disclaimer banner (lines 103-105: `rgba(239,246,255,0.8)` bg/`#93c5fd` border/`#1e40af` text/`#1d4ed8` link) also uses hardcoded blue; replace all with design-system tokens following the exact pattern established in `VisaNews.tsx:16-36,84,88` [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-07 (supplement 15)

> Sixteenth-pass scan — `app/learn/ibm/page.tsx` hardcoded hex missed by all prior sweeps.

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `app/learn/ibm/page.tsx` — `ScoreBadge` uses `#10b981`/`#f59e0b`/`#ef4444` with `${color}18` alpha trick (lines 48,50); quiz-done `band.color` uses same three hex (lines 91-93); quiz option feedback uses `#f0fdf4`/`#86efac` (correct) and `#fef2f2`/`#fca5a5` (wrong) at lines 131-132; concept-expand background `#fafaf8` (line 186); architecture-note background `#f8f4ef` (line 206); Australian Context box `#eff6ff`/`#bfdbfe`/`#1d4ed8`/`#1e3a8a` (lines 212-214); error text `#dc2626` (line 373); "Done" badge `#10b981` (line 426) — replace all with design-system tokens (var(--jade)/var(--gold)/var(--vermilion)/var(--cream) + rgba pairs) following established patterns [style] ✅ 2026-05-07

---

## 🛡 Daily Analyst Findings — 2026-05-08

> Today's Opus scan — `npm audit` = 0 vulns; `tsc --noEmit` = clean. Five YouTube/digest/admin/github surfaces still leak Tailwind hex, plus a defence-in-depth UUID gap on the admin job-listings PATCH route. The earlier 16 supplement passes covered most components but missed `app/learn/youtube/[videoId]/StudySession.tsx` (3 spots), `app/learn/youtube/page.tsx`, `app/learn/github/GitHubSkillsGuide.tsx`, `app/digest/page.tsx`, `app/admin/analytics/page.tsx`, and `app/career-edge/[slug]/page.tsx`.

### Security
- [x] Validate `body.id` as UUID in `app/api/admin/job-listings/route.ts:48` PATCH handler before passing to `.eq('id', body.id)` at lines 58, 67, 75, 92, 103 — DELETE handler already validates with `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)` at line 119 but PATCH only checks `!body?.id`; admin gate makes this defence-in-depth, but an admin typo or compromised admin session could send malformed ids that hit Postgres with a vague type error rather than a clean 400 [security] ✅ 2026-05-08

### Style (dark-mode breakage)
- [x] Replace `ScoreBadge` hex in `app/learn/youtube/page.tsx:50` (`#10b981`/`#f59e0b`/`#ef4444`) with `var(--jade)`/`var(--gold)`/`var(--vermilion)`; replace URL-form error border `#fca5a5` at line 165 with `var(--vermilion)` and error text `#dc2626` at line 179 with `var(--vermilion)` — Tailwind hex breaks dark mode on the YouTube learning landing [style] ✅ 2026-05-08
- [x] Replace Australian Context box hex in `app/learn/youtube/[videoId]/StudySession.tsx:207-212` (`#eff6ff` bg / `#bfdbfe` border / `#1d4ed8` label / `#1e3a8a` body) and "Save to NotebookLM" button hex at lines 1207-1208 + 1317 (`#bfdbfe` border / `#eff6ff` bg / `#1d4ed8` text) with `rgba(30,122,82,0.08)` / `rgba(30,122,82,0.25)` / `var(--jade)` (or `var(--gold)` rgba pair) — same fix pattern as supplement 15 IBM Australian Context box; also replace disabled-button greys `#e5e7eb`/`#9ca3af` at lines 822-823 with `var(--parchment)` and `var(--text-muted)` [style] ✅ 2026-05-08
- [x] Replace done-state hex in `app/learn/github/GitHubSkillsGuide.tsx:95-98, 109, 209-210` (`#d1fae5` bg / `#10b981` text+border / `#059669` text on isDone level pill) with `rgba(30,122,82,0.12)` and `var(--jade)`; keep `#1f883d` GitHub brand green at lines 38, 194, 264, 289 (vendor brand, intentional) and `#d97706` at line 159 unchanged or replace with `var(--gold)` if matching the design system rather than the GitHub palette [style] ✅ 2026-05-08
- [x] Replace Information Age live feed badge hex in `app/digest/page.tsx:46-47, 59, 77` (`#eff6ff` bg / `#0369a1` text / `#bfdbfe` border + 3px left border) with `rgba(30,122,82,0.08)` / `var(--jade)` / `rgba(30,122,82,0.25)` — Tailwind sky-50/700/300 break dark mode on the ACS Information Age section header and 3px-left-border list cards [style] ✅ 2026-05-08
- [x] Replace `color="#a78bfa"` with `var(--gold)` or `var(--terracotta)` on the Countries `BarRow` in `app/admin/analytics/page.tsx:194` — adjacent referrer + device BarRows already use `var(--jade)` (line 182) and `var(--gold)` (line 208) tokens; the Tailwind violet-400 on Countries breaks the design-system palette in both modes [style] ✅ 2026-05-08
- [x] Replace literal-hex design-token values with `var()` in `app/career-edge/[slug]/page.tsx:22-25` PILLAR_META map (`#c0281c`→`var(--vermilion)`, `#1e7a52`→`var(--jade)`, `#c88a14`→`var(--gold)`, `#7a5030`→`var(--text-muted)`); replace off-token `#7a3030` at line 26 with `var(--vermilion)` and `#3d5a80` at line 27 with `var(--text-secondary)` — current literal hex are hardcoded LIGHT-mode token values that don't adapt to dark mode [style] ✅ 2026-05-08

### Tests
- [x] Add Vitest test for `/api/admin/job-listings` PATCH — 400 on malformed `body.id` (e.g., `"not-a-uuid"` or empty string) once the UUID validation lands; existing DELETE test at `__tests__/api/admin-job-listings.test.ts` already covers the same pattern for the DELETE branch [tests] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 1)

> Sixteenth-pass scan — `app/interview-prep/networking/page.tsx` teal hex missed by supplement 13 which only fixed `NetworkingClient.tsx`.

### Style (dark-mode breakage)
- [x] Replace teal hex in `app/interview-prep/networking/page.tsx` — checklist `☐` icons use `#14b8a6` (lines 67,114,129,200), GitHub info box uses `rgba(20,184,166,0.07)`/`rgba(20,184,166,0.25)`/`#0f766e` (lines 136-137), meetup arrow uses `#14b8a6` (line 200), numbered list badges use `rgba(20,184,166,0.12)`/`#0d9488` (line 244); meetup-strategy box uses `#b45309` (line 208) — same teal/amber palette fixed in `NetworkingClient.tsx` (supplement 13) but the server-rendered `page.tsx` was missed; replace all with `var(--jade)`/`rgba(30,122,82,…)` and `var(--gold)` [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 2)

> Seventeenth-pass scan — `app/interview-prep/[role]/InterviewSession.tsx` hardcoded hex missed by all prior sweeps (supplement 13 fixed `InterviewPrepClient.tsx` and `NetworkingClient.tsx` but not the session screen itself).

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `app/interview-prep/[role]/InterviewSession.tsx` — `TYPE_BADGE` map `#1D6FA4`/`#2D6A4F`/`#C8922A` (lines 48-50) → `var(--jade)`/`var(--jade)`/`var(--gold)`; resume-session banner `#eff6ff`/`#bfdbfe`/`#2563eb` (lines 594,597) → jade rgba tokens; sidebar status dot `#2D6A4F` (line 653) → `var(--jade)`; stage-context badge (line 707) → jade/gold tokens; MCQ correct feedback `#2D6A4F18`/`#2D6A4F` (line 744) → jade; MCQ debrief result `#2D6A4F15`/`#2D6A4F` (lines 849,852) → jade; assessment band colors `#059669`/`#10b981`/`#2563eb`/`#3b82f6`/`#d97706`/`#f59e0b`/`#dc2626`/`#ef4444` (lines 899-904) → jade/jade/gold/vermilion; Alex follow-up box `rgba(20,184,166,0.06)`/`rgba(20,184,166,0.3)`/`#14b8a6` (lines 932-935) → jade rgba; avg score `#2D6A4F`/`#C8922A` (lines 1174,1192) → jade/gold; revisit-questions box `#fff7ed`/`#fed7aa`/`#c2410c`/`#9a3412` (lines 1205-1208) → gold rgba; copy buttons `#2D6A4F` (lines 1246,1278,1335) → `var(--jade)`; negotiation yes/no `#2D6A4F` (line 1323) → `var(--jade)`; AU etiquette box `rgba(20,184,166,0.07)`/`rgba(20,184,166,0.25)`/`#0f766e` (lines 1250-1251) → jade rgba [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 3)

> Eighteenth-pass scan — `app/learn/claude-code/ClaudeCodeGuide.tsx` done-state and tip-label hex missed by all prior sweeps.

### Style (dark-mode breakage)
- [x] Replace done-state hex in `app/learn/claude-code/ClaudeCodeGuide.tsx` — lesson number circle `#d1fae5` bg / `#10b981` color+border (lines 2282-2285), lesson title `#10b981` on isDone (line 2294), Pro tip label `#d97706` (line 2354), mark-complete button `#d1fae5` bg / `#059669` text on isDone (lines 2377-2378), CopyButton copied-state `#10b981` (line 2073) — all Tailwind hex that break dark mode; replace with `rgba(30,122,82,0.12)`/`var(--jade)` for jade done-state and `var(--gold)` for tip label; keep `#0f1117`/`#e2e8f0` (terminal code block — intentionally dark) and `level.color` in LEVELS data (used for dynamic alpha computation) [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 4)

> Nineteenth-pass scan — `/api/interview/share-card` OG image route has zero test coverage despite having parameter-clamping logic; all other API routes now have tests.

### Tests
- [x] Add Vitest test for `GET /api/interview/share-card` — mock `ImageResponse` from `next/og` (requires Edge runtime APIs), verify: 200 with no params (defaults), 200 with all valid params, `ImageResponse` called with `{ width: 1200, height: 630 }`, non-crashing on score > 100 / score < 0 / level out-of-range, role truncated to 60 chars, levelTitle truncated to 30 chars (`app/api/interview/share-card/route.tsx`) [tests] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 5)

> Twentieth-pass scan — Mind Map SVG in `StudySession.tsx` uses dark brown text and light-gray strokes that break dark mode.

### Style (dark-mode breakage)
- [x] Replace `#3b1f0e` inactive-node text fill and `#e5e7eb` connector/border strokes in the Mind Map component at `app/learn/youtube/[videoId]/StudySession.tsx:591,614,618` — `#3b1f0e` dark brown is invisible on dark `var(--warm-white)` (`#0f0b1a`) background; `#e5e7eb` light-gray on dark `#0f0b1a` is too prominent and inconsistent with the design system; replace with `var(--ink)` for text fill and `var(--text-muted)` for strokes so both adapt to light/dark themes [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 12)

> Twenty-seventh-pass scan — four `#ccc` disabled/inactive colour instances in `app/learn/youtube/[videoId]/StudySession.tsx` missed by all prior sweeps including the 2026-05-08 sweep that fixed `#9ca3af` → `var(--text-muted)` at lines 822-823.

### Style (dark-mode breakage)
- [x] Replace `color: '#ccc'` with `var(--text-muted)` in disabled/inactive states in `app/learn/youtube/[videoId]/StudySession.tsx` — flashcard Prev/Next button disabled colour at lines 370/379 (`idx === 0` / `idx === total - 1` conditions), inactive stage-indicator label at line 984 (the final `'#ccc'` in the done/active/inactive ternary), and disabled tab colour at line 1285 (`!guide && tab.id !== 'guide'` condition); the 2026-05-08 sweep replaced `#9ca3af` with `var(--text-muted)` at lines 822-823 using the same pattern but missed these four; in dark mode `#ccc` (light-grey) has ~12:1 contrast on `var(--warm-white)` = `#0f0b1a`, making disabled buttons appear nearly enabled; `var(--text-muted)` = `#a09080` in dark mode gives ~5.7:1 — clearly readable but appropriately dimmer than enabled (`var(--brown-dark)` which inverts to `#f0e6d0`) [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 9)

> Twenty-first-pass scan — delete/error button hex in `components/Comments.tsx` missed by all prior sweeps.

### Style (dark-mode breakage)
- [x] Replace `color: '#ef4444'` with `var(--vermilion)` on the Delete button (line 140) and confirm "Yes, delete" button (line 148) in `components/Comments.tsx`, and replace `color: '#dc2626'` with `var(--vermilion)` on the post-error paragraph (line 283) — Tailwind red-500/600 break dark mode; the design-system error/danger colour is `var(--vermilion)` used throughout the codebase [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 10)

> Twenty-second-pass scan — source badge and topic-bullet hardcoded hex in `components/PostCard.tsx` missed by all prior sweeps (VisaNews.tsx and visa-news/[slug]/page.tsx fixed the same colours already).

### Style (dark-mode breakage)
- [x] Replace hardcoded hex in `components/PostCard.tsx` — `SOURCE_STRIPE` map uses `#6366f1`/`#a78bfa` (digest), `#f97316`/`#fbbf24` (githot), `#4285f4`/`#34a853` (ai-news), `#0369a1`/`#0ea5e9` (visa-news) in accent stripe gradients; source badge text/bg/border uses the same hex at lines 86, 93, 109; topic-bullet number dots repeat the same colours at line 134; replace all with design-system token pairs (`var(--gold)`, `var(--vermilion)`, `var(--jade)` + rgba equivalents) following the established pattern from `VisaNews.tsx:16-23` and `visa-news/[slug]/page.tsx:22-36`; keep `COMPANY_BADGE` vendor-brand hex (Anthropic/OpenAI/Google) as intentional external-brand colours [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 11)

> Twenty-third-pass scan — `lib/subscription.ts` `.single()` call missed by all prior API-route and component sweeps.

### Security
- [x] Replace `.single()` with `.maybeSingle()` on profiles lookup in `lib/subscription.ts:57` (`getSubscriptionStatus`) — every paid AI route calls `requireSubscription()` → `getSubscriptionStatus()` which uses `.single()` on the profiles table; a user with no profile row (e.g. auth trigger failed or new signup edge case) raises PGRST116 even though `if (!data)` catches the result correctly; `.maybeSingle()` returns `{ data: null, error: null }` on 0 rows per AGENTS.md §10.3, eliminating spurious error log noise [security] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-08 (supplement 12)

> Twenty-fourth-pass scan — shimmer skeleton gradient in `HomepageHero.tsx` and `PersonalisedHero.tsx` uses `#f5ece0` as the midpoint highlight, which is a light-cream hardcoded hex. In dark mode `var(--parchment)` resolves to `#1a1430` but the midpoint stays light, causing the shimmer to flash bright in dark mode (same class of bug as `var(--bg, #faf7f2)` fixed in supplements 6+7).

### Style (dark-mode breakage)
- [x] Replace `#f5ece0` shimmer midpoint with `var(--warm-white)` in `components/HomepageHero.tsx:10` and `components/PersonalisedHero.tsx:24,333` — the gradient `linear-gradient(90deg, var(--parchment) 25%, #f5ece0 50%, var(--parchment) 75%)` uses a hardcoded light-cream hex as the highlight stop; in dark mode `--parchment` is `#1a1430` but `#f5ece0` stays light-beige, making the skeleton flash bright; `var(--warm-white)` (`#fffef6` light / `#0f0b1a` dark) keeps the shimmer subtle and adaptive in both themes [style] ✅ 2026-05-08

---

## 🛡 Daily Analyst Findings — 2026-05-09

> Today's Opus scan — `npm audit` = 0 vulns; `tsc --noEmit` = clean; all API routes have tests (the earlier "no test" hits were path-pattern false positives — `stripe/webhook` has co-located `route.test.ts`, `comments/[id]` and `admin/users/[id]` have `__tests__/api/comments-id.test.ts` and `admin-users-id.test.ts`). Codebase is in launch-ready shape after 24 supplement sweeps. Three small dark-mode/style residues remain after all prior sweeps: a contribution-heatmap intensity scale that hardcodes light-mode vermilion in both rgba and hex form, a contact-form disabled-button grey, and two OAuth Spinner colours still using `'#fff'` instead of the `'white'` CSS keyword that the rest of the codebase standardised on per the 2026-05-07 supplement sweep.

### Style (dark-mode breakage)
- [x] Replace heatmap intensity scale `rgba(192,40,28,0.04|0.09|0.28|0.55|0.78)` and `'#c0281c'` at `components/PostHeatmap.tsx:20-25` (and the `rgba(192,40,28,0.4)` legend border at line 326) with `var(--vermilion)`-based equivalents — the literal `192,40,28` is the LIGHT-mode `--vermilion` value (`#c0281c`) which stays dim against the dark `#0f0b1a` background in dark mode; either define five new `--heatmap-{0..4}` CSS vars in `globals.css` or use `color-mix(in srgb, var(--vermilion) NN%, transparent)` so the heatmap adapts; legend swatches at line 326 use the same hardcoded rgba [style] ✅ 2026-05-09
- [x] Replace `background: sending ? '#ccc' : 'var(--terracotta)'` with `var(--parchment)` at `app/contact/ContactForm.tsx:131` — same hardcoded light-grey disabled state pattern that supplement 1 already fixed in `app/pricing/page.tsx:129` (`#ccc` → `var(--parchment)`); contact-form submit button currently flashes light-grey in dark mode while every other button in the codebase uses `var(--parchment)` [style] ✅ 2026-05-09
- [x] Replace `<Spinner color="#fff" />` with `<Spinner color="white" />` at `app/login/page.tsx:122` (GitHub button) and `app/login/page.tsx:162` (Facebook button) — matches the `'#fff'` → `'white'` CSS keyword sweep already applied across the codebase per supplements 1–11; `globals.css:1453` and several CTA buttons use the keyword form, so the OAuth spinners should follow the same convention for consistency [style] ✅ 2026-05-09

---

## 🛡 Daily Analyst Findings — 2026-05-09 (supplement 1)

> Twenty-fifth-pass scan — `app/learn/youtube/[videoId]/page.tsx` raw `createClient` missed by the 2026-05-06 AGENTS §5.2 sweep.

### Code Quality
- [x] Replace raw `createClient` from `@supabase/supabase-js` with `createSupabaseService()` from `lib/auth-server.ts` in `app/learn/youtube/[videoId]/page.tsx:2,13,42` — `generateMetadata` and the page default export each build their own client with `SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY` fallback; same violation as the ten routes fixed on 2026-05-06; using the shared helper removes the manual `??` fallback and disables session persistence consistently (AGENTS §5.2) [quality] ✅ 2026-05-09

---

## 🛡 Daily Analyst Findings — 2026-05-09 (supplement 2)

> Twenty-sixth-pass scan — `app/api/contact/route.ts` unbounded Map and missing test coverage missed by all prior sweeps.

### Security
- [x] Cap in-memory rate-limit Map size in `app/api/contact/route.ts:9` (`ipLog`) — same unbounded growth pattern fixed in `app/api/log-error/route.ts:5` (`ipLog`) and `app/api/track/route.ts:9` (`ipCounts`) on 2026-05-07; add `if (!existing && ipLog.size >= 5000) ipLog.delete(ipLog.keys().next().value!)` guard before `ipLog.set(ip, recent)` so a long-lived Vercel instance accumulates at most 5000 entries; also extract `ipLog.get(ip)` to a local `existing` variable to avoid a double lookup [security] [perf] ✅ 2026-05-09

### Tests
- [x] Add Vitest test for `/api/contact` POST — 400 on invalid JSON, 400 on missing/invalid email, 400 on message < 10 chars, 429 on 6th request from same IP within 1 hour, 200 with `{ ok: true, transport: 'none' }` when `RESEND_API_KEY` is unset, 200 on successful Resend send, 502 when Resend throws, unknown `topic` falls back to `'general'` (`app/api/contact/route.ts`) [tests] ✅ 2026-05-09

---

## 🛡 Daily Analyst Findings — 2026-05-10

### Tests
- [x] Add Vitest test for `POST /api/account/delete` — 401 without session, 200 soft-deletes profile + deletes comments + signs out for free user, 200 cancels active Stripe subscription for pro user before soft-deleting, Stripe cancel failure does not block deletion (still returns 200 ok), `deleted_at` timestamp set on profile update (`app/api/account/delete/route.ts`) [tests] ✅ 2026-05-10

### Style (dark-mode breakage)
- [x] Replace `background: '#C0281C'` with `var(--vermilion)` on the GRAB button in `components/BoulderingGame.tsx:319` — hardcoded light-mode vermilion literal breaks dark-mode rendering; every other CTA in the codebase uses `var(--vermilion)` [style] ✅ 2026-05-10
- [x] Replace hardcoded Tailwind gray hex in `app/resume/page.tsx` body — card background `'white'` (line 187) → `var(--warm-white)`, and body text colours `#111827`/`#374151`/`#4b5563`/`#6b7280`/`#9ca3af` (lines 248, 261, 282, 288, 290, 295, 315, 318, 321, 323) → design tokens (`var(--ink)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`) so the resume card adapts to dark mode; section headings, tag pills, and the JobMatchWidget already use tokens correctly [style] ✅ 2026-05-10

### Code Quality (AGENTS §5.2 — Supabase client discipline)
- [x] Replace raw `createClient` from `@supabase/supabase-js` with `createSupabaseServer()` from `lib/auth-server.ts` in `app/api/jobs/route.ts:2,383` (`fetchScrapedJobs`) — the function builds its own anon-key client instead of using the shared SSR helper; same violation pattern fixed across ten routes on 2026-05-06; update test mock in `__tests__/api/jobs.test.ts:15-17` from `vi.mock('@supabase/supabase-js')` to `vi.mock('@/lib/auth-server', { createSupabaseServer: vi.fn().mockResolvedValue(...) })` [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 1)

> Supplement scan — `GRAD_BY_FIELD` chart-bar colours in `app/au-insights/data/job-market.ts` missed by the 2026-05-07 supplement 11 sweep of `JobMarketCharts.tsx`. That sweep fixed D3 axis/annotation colours and the STATUS_COLOR map but left the data array's `color` field untouched. The `#374151` (Education, dark charcoal) and `#6b7280` (Science, gray) bars are near-invisible on the dark `#07050f` background; the others are off-token Tailwind hex.

### Style (dark-mode breakage)
- [x] Replace hardcoded Tailwind hex in `GRAD_BY_FIELD` color fields at `app/au-insights/data/job-market.ts:137-143` — `#dc2626`→`var(--vermilion)`, `#0369a1`→`var(--jade)`, `#10b981`→`var(--gold)`, `#d97706`→`rgba(30,122,82,0.55)`, `#7c3aed`→`rgba(200,138,20,0.65)`, `#6b7280`→`rgba(192,40,28,0.55)`, `#374151`→`var(--text-muted)`; D3 already reads these as SVG fill attributes (verified: `JobMarketCharts.tsx:409` calls `.attr('fill', d => d.color)` and the same chart already uses `var(--parchment)`/`var(--text-muted)` in axis calls at lines 396-414); follows the exact pattern established in `SponsorshipCharts.tsx:27-43` for INDUSTRIES/ICT_ROLES color arrays [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 2)

### Style (dark-mode breakage)
- [x] Replace `BANDS` hardcoded Tailwind hex (`#10b981`/`#22c55e`/`#f59e0b`/`#f97316`/`#ef4444`) with design tokens (`var(--jade)`/`var(--jade)`/`var(--gold)`/`var(--gold)`/`var(--vermilion)`) in `app/api/readiness-score/route.ts:9-13` — the `bandColor` field is returned in the API response and used in `ReadinessScore.tsx` as SVG `stroke` attribute and CSS `color`/`background` inline styles; hardcoded Tailwind hex renders incorrectly in dark mode (jade-500 `#10b981` is dimmer than `var(--jade)` which resolves to `#3ec880` in dark mode); CSS custom properties are valid in both SVG presentation attributes and CSS inline styles [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 3)

> Supplement scan — non-design-system rgba values and `accent` hex missed by supplement 3 (ClaudeCodeGuide) and supplement 13 (InterviewPrepClient/NetworkingClient). The earlier sweeps fixed named hex values but left rgba equivalents using the same Tailwind rgb tuples, plus the TRACKS `accent` and `dotColor` fields.

### Style (dark-mode breakage)
- [x] Replace non-design-system rgba values in `app/learn/claude-code/ClaudeCodeGuide.tsx:2072,2353` — CopyButton copied-state background uses `rgba(16,185,129,0.15)` (jade-500 rgb) → `rgba(30,122,82,0.15)` (jade token rgb); "Pro tip" box background/border uses `rgba(245,158,11,0.07)`/`rgba(245,158,11,0.25)` (amber-400 rgb) → `rgba(200,138,20,0.07)`/`rgba(200,138,20,0.25)` (gold token rgb); supplement 3 fixed `#10b981` and `#d97706` text colors but missed the rgba bg/border companion values [style] ✅ 2026-05-10
- [x] Replace TRACKS `accent`/`dotColor` hardcoded hex in `app/interview-prep/InterviewPrepClient.tsx:91,96,125-162,224-233,300,327,493,495` — `ProgressPill` uses `${accent}20` background template (breaks with CSS vars); refactor to `color`+`bg` props; update TRACKS objects: `#10b981`→`var(--jade)`/`rgba(30,122,82,...)`, `#f59e0b`→`var(--gold)`/`rgba(200,138,20,...)`, `#818cf8`→`var(--vermilion)`/`rgba(192,40,28,...)`, `#14b8a6`→`var(--jade)`/`rgba(30,122,82,...)`; also replace "Start here" gradient rgba at line 493,495; supplement 13 fixed `demandColor`/`difficultyColor` maps but missed TRACKS [style] ✅ 2026-05-10
- [x] Replace `weekColors` array in `app/interview-prep/networking/NetworkingClient.tsx:58,113,128` — `['#14b8a6','#818cf8','#f59e0b','#10b981']` uses `${weekColors[wi]}20` alpha-append pattern; replace with `weekPalette` array of `{color, bg, accentHex}` objects using jade/vermilion/gold tokens; supplement 13 fixed success-box/progress-bar but missed the week badge colours [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 4)

> Supplement scan — `LEVELS` color/bg hardcoded Tailwind hex in `ClaudeCodeGuide.tsx` missed by supplement 3. The supplement 3 sweep fixed the CopyButton rgba and Pro-tip box rgba, but left the LEVELS data array (`color`/`bg` fields) using Tailwind hex. These are used extensively in JSX via template-literal alpha-appending (e.g. `${level.color}60`) which is incompatible with CSS vars — same pattern fixed in `InterviewPrepClient.tsx` (TRACKS) and `NetworkingClient.tsx` (weekColors) in supplement 3.

### Style (dark-mode breakage)
- [x] Replace `color`/`bg` hardcoded Tailwind hex in `LEVELS` array at `app/learn/claude-code/ClaudeCodeGuide.tsx:33,277,605,1003,1443` — Foundation `#10b981`/`#d1fae5`, Core Skills `#f59e0b`/`#fef3c7`, Power User `#ef4444`/`#fee2e2`, Agents `#8b5cf6`/`#ede9fe`, Master `#d97706`/`#fef3c7`; add `colorRgb: string` to `Level` interface; replace template-literal alpha-append patterns at lines 2268,2271,2307,2345,2394 with `rgba(${level.colorRgb},X)` forms; map to jade/gold/vermilion tokens matching the TRACKS fix pattern [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 5)

> Supplement scan — `app/au-insights/companies/[slug]/page.tsx` missed by all prior Next.js-16 async-params sweeps. Every other dynamic-route page (`blog/[slug]`, `learn/[path]`, `learn/youtube/[videoId]`, `visa-news/[slug]`, etc.) already uses `Promise<{ slug: string }>` typing and `await params` — this is the sole remaining file using the old synchronous pattern, violating AGENTS.md §3.

### Code Quality (AGENTS §3 — Next.js 16 async params)
- [x] Await `params` in `app/au-insights/companies/[slug]/page.tsx` — `generateMetadata` (line 10) and `CompanyPage` (line 43) both type `params` as `{ slug: string }` (non-Promise) and access `.slug` directly; change both signatures to `{ params: Promise<{ slug: string }> }`, make both functions `async`, and destructure with `const { slug } = await params` before the `COMPANIES.find(...)` call — matches the exact pattern used in `app/blog/[slug]/page.tsx:29-30,56-57` and `app/learn/[path]/page.tsx:9-10,19-20` [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 6)

> Supplement scan — `app/au-insights/SkillMap.tsx:240` uses `<a href="/au-insights/companies/${slug}">` for an internal route, causing a full page reload instead of client-side navigation. Every other internal link in the au-insights section uses `<Link>` from `next/link` per AGENTS.md §8. This is the sole remaining `<a href>` internal-route violation after the 2026-05-02 sweep that fixed `Comments.tsx` and `GettingStartedChecklist.tsx`.

### Code Quality (AGENTS §8 — internal navigation)
- [x] Replace `<a href={...}>` with `<Link>` in `app/au-insights/SkillMap.tsx:240` — company slug chips under "Best companies for {role}" render as raw `<a>` tags pointing to `/au-insights/companies/${slug}`; add `import Link from 'next/link'` and swap `<a>` → `<Link>` (drop `transition` inline style, which works in CSS but is fine on Link too); matches pattern used in `app/au-insights/VisaNews.tsx:100-104` and `app/au-insights/companies/[slug]/page.tsx:122-129` [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 7)

> Supplement scan — `lib/github-skills.ts` GITHUB_LEVELS `color`/`bg` fields use hardcoded Tailwind hex (`#059669`/`#d97706`/`#7c3aed`/`#0ea5e9`/`#dc2626`/`#4338ca`) with `rgba(r,g,b,0.07)` backgrounds using the same raw rgb tuples. `GitHubSkillsGuide.tsx` uses template-literal alpha appending (`${levelColor}60`, `${levelColor}18`, `${levelColor}25`, `${levelColor}0d`, `${levelColor}30`, `${level.color}40`) which is incompatible with CSS variables — same class of bug fixed in `ClaudeCodeGuide.tsx` (supplement 4) and `InterviewPrepClient.tsx` (supplement 3). GitHub brand green `#1f883d` at lines 38, 194, 264, 274, 277, 280, 289 is intentional vendor colour and must be kept.

### Style (dark-mode breakage)
- [x] Replace `color`/`bg` hardcoded Tailwind hex in `GITHUB_LEVELS` at `lib/github-skills.ts:33-34,111-112,206-207,318-319,532-533,627-628` — Foundation `#059669`→`var(--jade)`, Collaboration `#d97706`→`var(--gold)`, Actions `#7c3aed`→`var(--vermilion)`, Copilot `#0ea5e9`→`var(--jade)`, Security `#dc2626`→`var(--vermilion)`, Advanced `#4338ca`→`var(--gold)`; add `colorRgb: string` to `GitHubLevel` interface; update `bg` to `rgba(colorRgb, 0.08)`; in `GitHubSkillsGuide.tsx` add `levelColorRgb` prop to `CourseCard` and replace template-literal alpha-append patterns (`${levelColor}60`→`rgba(${levelColorRgb},0.38)`, `${levelColor}18`→`rgba(${levelColorRgb},0.09)`, `${levelColor}25`→`rgba(${levelColorRgb},0.15)`, `${levelColor}0d`→`rgba(${levelColorRgb},0.05)`, `${levelColor}30`→`rgba(${levelColorRgb},0.19)`, `${level.color}40`→`rgba(${level.colorRgb},0.25)`) — matches pattern from ClaudeCodeGuide supplement 4; keep `#1f883d` GitHub brand at lines 38-40,194,264,274,277,280,289 [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 8)

> Supplement scan — `demandColor`/`difficultyColor` template-literal alpha-append in `app/interview-prep/InterviewPrepClient.tsx:520,523` produces invalid CSS after the supplement 13 fix replaced hex values with CSS variables. `${difficultyColor[role.difficulty]}15` now renders as `var(--jade)15` (invalid) instead of the intended hex-alpha. The supplement 3 sweep fixed the same class of bug for TRACKS/TOOL_CARDS `dotColor` but missed these two standalone color maps at lines 105–113.

### Code Quality / Style
- [x] Fix broken template-literal alpha-append at `app/interview-prep/InterviewPrepClient.tsx:520,523` — `\`${difficultyColor[role.difficulty]}15\`` and `\`${demandColor[role.demand]}15\`` produce invalid CSS (`var(--jade)15`) since supplement 13 replaced hex with CSS vars; add parallel `difficultyBg`/`demandBg` maps using design-system rgba pairs (`rgba(30,122,82,0.08)` for jade, `rgba(200,138,20,0.08)` for gold, `rgba(192,40,28,0.08)` for vermilion, `rgba(122,80,48,0.08)` for text-muted) and replace the broken template literals with map lookups [quality] [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 9)

> Supplement scan — `demandColor` template-literal alpha-append in `app/learn/LearnPageClient.tsx:300` produces invalid CSS after a previous sweep replaced hex values with CSS variables. `${demandColor[path.demand]}20` now renders as `var(--jade)20` (invalid) — same class of bug fixed in `InterviewPrepClient.tsx` (supplement 8) and `NetworkingClient.tsx` (supplement 3).

### Code Quality / Style
- [x] Fix broken template-literal alpha-append at `app/learn/LearnPageClient.tsx:300` — `\`${demandColor[path.demand]}20\`` produces invalid CSS (`var(--jade)20`) since `demandColor` uses CSS vars; add parallel `demandBg` map using design-system rgba pairs (`rgba(30,122,82,0.12)` for jade/Very High, `rgba(200,138,20,0.12)` for gold/High, `rgba(122,80,48,0.12)` for text-muted/Medium) and replace the broken template literal with map lookup; `acc.border`/`acc.accent` at lines 290/294/304 are hex from PATH_ACCENTS and remain valid [quality] [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 10)

> Supplement scan — `tierColor` CSS-var alpha-append in two company-profile files and `WHO_COLORS` alpha-append in visa-tracker missed by all prior supplement sweeps. The earlier supplement 5 sweep (`companies/[slug]/page.tsx`) fixed async params but left `tierColor = 'var(--gold)'` with `\`${tierColor}15\``/`\`${tierColor}40\`` template literals (invalid CSS). `ResearchClient.tsx` has the same `tierColor` pattern. `visa-tracker/page.tsx:319` has `\`${WHO_COLORS[step.who]}18\`` — `WHO_COLORS` was fixed from raw hex to CSS vars in supplement 7 but the alpha-append was not updated. Also `roundColor[...].text` is a CSS var and `\`1px solid ${rc.text}30\`` at `page.tsx:305` is invalid.

### Style / Code Quality
- [x] Fix broken template-literal alpha-append in `app/au-insights/companies/[slug]/page.tsx:76-77,305` and `app/companies/[slug]/research/ResearchClient.tsx:248-249` — replace `tierColor` string with `tierPalette` object `{color, bg, border}` using explicit rgba pairs; fix `roundColor` type to include `border: string` field and replace `\`1px solid ${rc.text}30\`` with `rc.border`; in `app/dashboard/visa-tracker/page.tsx:319` add `WHO_BG` map and replace `\`${WHO_COLORS[step.who]}18\`` with `WHO_BG` lookup [style] [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 11)

> Twelfth-pass scan — `app/learn/LearnPageClient.tsx` uses `color: '#f8fafc'` (Tailwind slate-50) for white text on dark gradient path cards at lines 302, 323, and 456 — the same near-white hex that was standardised to the `'white'` CSS keyword across admin, au-insights, login, and interview pages in prior sweeps. Lines 312, 322, 459 use `rgba(248,250,252,0.7/0.45)` and `#94a3b8` (slate-400) on the same intentionally-dark cards; the rgba values should be migrated to `rgba(255,255,255,...)` and the slate-400 text to `var(--text-muted)` for consistency.

### Style (dark-mode breakage / standardisation)
- [x] Replace `color: '#f8fafc'` with `'white'` at `app/learn/LearnPageClient.tsx:302,323,456`; replace `rgba(248,250,252,0.7)` → `rgba(255,255,255,0.7)` (line 312), `rgba(248,250,252,0.45)` → `rgba(255,255,255,0.45)` (line 322), and `color: '#94a3b8'` → `rgba(255,255,255,0.6)` (lines 453,459) — all text is on intentionally-dark gradient cards; normalising the slightly-off-white `#f8fafc`/`rgba(248,250,252,...)` to pure `'white'`/`rgba(255,255,255,...)` follows the exact pattern from 2026-05-07 sweeps [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 13)

> Supplement scan — three `select('*')` calls violating AGENTS.md §10.3 ("never `select('*')` in production queries") found after all prior sweeps: `app/api/gap-analysis/route.ts:110` fetches a 7-column cache row but only reads 5 fields; `app/api/alerts/route.ts:11` returns all `job_alerts` columns to the client including `user_id` which the `JobAlert` client type does not include; `app/dashboard/page.tsx:77` repeats the same `job_alerts select('*')` pattern client-side.

### Code Quality (AGENTS §10.3 — query hygiene)
- [x] Replace `select('*')` with specific column selections in `app/api/gap-analysis/route.ts:110` (`match_percent,matched_skills,missing_skills,all_jd_skills,recommended_paths` — the only five fields read from `cached` at lines 119-124), `app/api/alerts/route.ts:11` (`id,keywords,location,full_time,frequency,created_at` — matches `JobAlert` client type, excludes unused `user_id`), and `app/dashboard/page.tsx:77` (same six-column set for the client-side `job_alerts` query) [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 14)

> Follow-up scan — supplement 13 fixed `job_alerts select('*')` at `app/dashboard/page.tsx:77` but missed the two adjacent queries on lines 75-76: `saved_jobs` and `job_applications` both still use `select('*')`. The dashboard renders only 7 of 12 `SavedJob` columns (`id,job_id,title,company,location,salary,url`) and 7 of 10 `JobApplication` columns (`id,job_id,title,company,url,status,applied_at`); the remaining columns (`description,category,contract_type,created_at` / `notes,updated_at,user_id`) are transferred over the wire on every dashboard load but never read.

### Code Quality (AGENTS §10.3 — query hygiene)
- [x] Replace `select('*')` with specific column selections in `app/dashboard/page.tsx:75` (`id,job_id,title,company,location,salary,url` — the seven fields rendered in the Saved Jobs tab and passed to `addToTracker`; excludes unused `description,category,contract_type,created_at,user_id`) and `app/dashboard/page.tsx:76` (`id,job_id,title,company,url,status,applied_at` — the seven fields rendered in the Applications tab and used for status filtering; excludes unused `notes,updated_at,user_id`) [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 15)

> Supplement scan — three client-side Supabase queries in `app/dashboard/page.tsx` and one in `app/learn/LearnPageClient.tsx` are missing `.limit()`, violating AGENTS.md §10.3 ("Always add `.limit(N)` — never run unbounded queries"). Supplement 13 and 14 fixed the `select('*')` violations on these same lines but left them unbounded. A user accumulating hundreds of saved jobs or applications would transfer all rows on every dashboard load.

### Code Quality (AGENTS §10.3 — query hygiene)
- [x] Add `.limit()` to unbounded client-side queries: `app/dashboard/page.tsx:75` `saved_jobs` → `.limit(200)`, `app/dashboard/page.tsx:76` `job_applications` → `.limit(200)`, `app/dashboard/page.tsx:77` `job_alerts` → `.limit(50)`, and `app/learn/LearnPageClient.tsx:101` `user_active_paths` → `.limit(20)` — all four are filtered by `user_id` but have no row cap; AGENTS §10.3 requires a limit on every query; 200/200/50/20 are generous practical ceilings (the UI renders all rows so an arbitrary cap avoids silent data truncation in normal use while bounding worst-case payload size) [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 16)

> Supplement scan — three bare `.select()` calls (equivalent to `select('*')`) found in INSERT responses not covered by supplements 13–15. Supplement 13 fixed the GET query at `alerts/route.ts:11` but missed the POST INSERT response at line 38; supplements 14–15 fixed `dashboard/page.tsx` GET queries but missed the `addToTracker` INSERT response at line 104. `cover-letter/page.tsx:107` was not covered by any prior sweep.

### Code Quality (AGENTS §10.3 — query hygiene)
- [x] Replace bare `.select()` (equivalent to `select('*')`) with specific columns on INSERT responses: `app/api/alerts/route.ts:38` → `.select('id,keywords,location,full_time,frequency,created_at')` (matches `JobAlert` client type, excludes `user_id/active/last_run_at`); `app/cover-letter/page.tsx:107` → `.select('id,job_title,company,cover_letter,created_at')` (matches `CoverLetterHistoryItem` exactly, excludes `user_id/job_description`); `app/dashboard/page.tsx:104` → `.select('id,job_id,title,company,url,status,applied_at')` + cast `data as unknown as JobApplication` (matches columns returned by the GET query fixed in supplement 14, excludes `notes/updated_at/user_id` which are null/default on fresh insert and not rendered immediately) [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 17)

> Supplement scan — three client-side Supabase queries still missing `.limit()` after supplements 13–16 (AGENTS §10.3). `app/learn/[path]/PathTracker.tsx:101-105` and `app/learn/PathProgress.tsx:27-31` both query `skill_progress` filtered by user+path with no row cap; `app/jobs/page.tsx:695-700` queries `saved_jobs` for job IDs with no cap (the dashboard GET query on this table had `.limit(200)` added in supplement 15 but the jobs page client-side query was not included in that fix).

### Code Quality (AGENTS §10.3 — query hygiene)
- [x] Add `.limit()` to unbounded `skill_progress` and `saved_jobs` queries: `app/learn/[path]/PathTracker.tsx:105` → `.limit(100)` (each path has ≤50 skills; 100 is a generous safe cap), `app/learn/PathProgress.tsx:30` → `.limit(100)` (same reasoning), `app/jobs/page.tsx:698` → `.limit(200)` (matches the cap on the dashboard saved_jobs query added in supplement 15) [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 18)

> Supplement scan — `weekPalette` in `app/interview-prep/networking/NetworkingClient.tsx:59-62` includes `accentHex` fields with hardcoded light-mode hex values (`#1e7a52`, `#c0281c`, `#c88a14`) used for the checkbox `accentColor` CSS property at line 133. The supplement 3 sweep replaced `weekColors` with `weekPalette` using design tokens but introduced `accentHex` as a workaround, not realising `accentColor` supports CSS custom properties (`var()`) directly.

### Style (hardcoded hex)
- [x] Remove `accentHex` fields from `weekPalette` in `app/interview-prep/networking/NetworkingClient.tsx:59-62` and replace `accentColor: weekPalette[wi].accentHex` with `accentColor: weekPalette[wi].color` at line 133 — `accentColor` supports CSS custom properties so `var(--jade)`/`var(--vermilion)`/`var(--gold)` are valid and adapt to dark mode; the hardcoded hex values are light-mode token literals that stay bright against the dark `#0f0b1a` background [style] ✅ 2026-05-10

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 19)

> Supplement scan — `app/dashboard/learn/page.tsx` has two unbounded Supabase queries missed by supplements 15 and 17. Supplement 15 added `.limit()` to `LearnPageClient.tsx:101` `user_active_paths → .limit(20)`, and supplement 17 added `.limit(100)` to `PathTracker.tsx:105` and `PathProgress.tsx:30` `skill_progress` queries — but the dashboard learn page (a separate `'use client'` component) was not included in either sweep.

### Code Quality (AGENTS §10.3 — query hygiene)
- [x] Add `.limit()` to unbounded queries in `app/dashboard/learn/page.tsx` — `user_active_paths` at line 47 → `.limit(20)` (consistent with `LearnPageClient.tsx` supplement 15 cap; there are only 5 skill paths so this is a safe ceiling), `skill_progress` at line 56 → `.limit(100)` (consistent with `PathTracker.tsx` supplement 17 cap; each path has ≤50 skills so 100 is a generous ceiling) [quality] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 20)

> Supplement scan — `app/learn/claude-lab/page.tsx` and `app/learn/claude-lab/ClaudeLabShell.tsx` use hardcoded dark-mode token literals instead of CSS custom properties. The terminal page intentionally uses a fixed dark background (`#07050f`/`#0f0b1a`) but the foreground colours (`#e84040`/`#f0b830`/`#3ec880`/`#c8b090`/`#786858`) are hardcoded dark-mode equivalents of design tokens rather than the tokens themselves. `#786858` is the old insufficient `--text-muted` dark value (3.5:1 contrast, flagged in AGENTS §7.2); the updated target is `#a09080` via `var(--text-muted)`. All other hex values also have CSS-var equivalents.

### Style (dark-mode / design-token standardisation)
- [x] Replace hardcoded dark-mode hex in `app/learn/claude-lab/page.tsx` and `app/learn/claude-lab/ClaudeLabShell.tsx` — traffic-light dots `#e84040`→`var(--vermilion)`, `#f0b830`→`var(--gold)`, `#3ec880`→`var(--jade)` (page.tsx:35-37); title text `#c8b090`→`var(--text-secondary)` (page.tsx:41); back-link text `#786858`→`var(--text-muted)` (page.tsx:51); loading-state text `#786858`→`var(--text-muted)` (ClaudeLabShell.tsx:18) — the fixed dark background (`#07050f`/`#0f0b1a`) is intentional terminal chrome and need not change; replacing foreground hex with tokens gives correct colours in both themes and benefits from any future token updates [style] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 21)

> Supplement scan — `__tests__/api/readiness-score.test.ts` has only 401 coverage (two identical tests both returning `user: null`). No test verifies the 200 happy-path shape, so the BANDS CSS-var fix from 2026-05-10 supplement 2 (`bandColor: 'var(--jade)'` etc.) has zero regression protection. All other route test files include at least one 200-path test.

### Tests
- [x] Add Vitest tests for `GET /api/readiness-score` — 200 with `score=0`, `bandColor` matches `/^var\(--/` (verifies BANDS token fix from supplement 2), `components` object has all four keys (`resume`/`skills`/`interview`/`quiz`) each with numeric `score` and string `detail`, `boostAction` has `label`/`href`/`gain` fields; use `mockResolvedValueOnce` on `createSupabaseServer` to return a valid user while keeping the existing zero-data mock for all DB queries (`__tests__/api/readiness-score.test.ts`) [tests] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 22)

> Supplement scan — `__tests__/api/dashboard-summary.test.ts` has only 401 coverage (two identical tests both returning `user: null`). No test verifies the 200 happy-path shape, visa-step extraction logic, or application/interview counting. Same gap fixed yesterday for `readiness-score` (supplement 21). All other multi-path route test files include at least one 200-path test.

### Tests
- [x] Add Vitest tests for `GET /api/dashboard/summary` — 200 with full `DashboardSummary` shape for a zero-data user (all null / 0), 200 with in-progress visa step extracted from `steps` object (`{ step: 3, status: 'in_progress', startedAt }` shape), 200 with `applicationCount` and `interviewCount` counting from `job_applications` rows; restructure mock to extract `mockGetUser` + `mockFrom` refs at module scope so tests can override per-call (`__tests__/api/dashboard-summary.test.ts`) [tests] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 23)

> Supplement scan — `__tests__/api/visa-tracker.test.ts` has only 401 coverage for GET (one test returning `user: null`). No test verifies the 200 happy-path: the default empty object returned when no tracker row exists, or the actual data returned when a row is found. Same gap fixed for `readiness-score` (supplement 21) and `dashboard-summary` (supplement 22). Additionally, the mock chain defines `single` but the GET route calls `.maybeSingle()` — a mismatch that would throw if the mock were exercised past the 401 guard.

### Tests
- [x] Add Vitest tests for `GET /api/visa-tracker` — 200 returns default `{ employer: '', occupation: '', started_at: null, steps: {} }` when no row exists (`.maybeSingle()` returns `null`), 200 returns actual row data when row exists; update mock chain to include `maybeSingle` alongside `single` (`__tests__/api/visa-tracker.test.ts`) [tests] ✅ 2026-05-10

---

## 🛡 Daily Analyst Findings — 2026-05-10 (supplement 24)

> Supplement scan — `__tests__/api/learn-analyse.test.ts` mocks `@supabase/supabase-js` `createClient` but the route uses `createSupabaseService()` from `lib/auth-server.ts` (AGENTS §5.2 fix was applied to the route on 2026-05-06 but the test was not updated). The stale mock is dead code — the Supabase chain is never exercised. Additionally, the `sbChain` defines `single` but the route calls `.maybeSingle()`, and there are no 200 happy-path tests for the KV cache hit or Supabase cache hit paths. Same gap pattern fixed for `readiness-score` (supplement 21), `dashboard-summary` (supplement 22), and `visa-tracker` (supplement 23).

### Tests
- [x] Fix `__tests__/api/learn-analyse.test.ts` — replace stale `vi.mock('@supabase/supabase-js')` with `createSupabaseService` in the existing `vi.mock('@/lib/auth-server')` block; add `vi.mock('@/lib/kv')` with `mockKvGet`/`mockKvSet`; update `sbChain` to use `maybeSingle` instead of `single`; add 200 test for KV cache hit (returns cached JSON without calling Supabase), 200 test for Supabase cache hit (KV miss → Supabase returns `{ study_guide: { essay, summary } }` → 200 without calling Gemini) [tests] ✅ 2026-05-11

---

## 🛡 Daily Analyst Findings — 2026-05-11

> Daily scan — four small, independently-revertable fixes spanning §10.3 query hygiene, §5.4 input validation, §5.4 HTML escaping, and §6 caching. Each is unrelated to the others; commit separately.

### Code Quality (AGENTS §10.3 — query hygiene)
- [x] Add `.limit(200)` to unbounded `skill_progress` query in `app/api/gap-analysis/route.ts:131` — `.from('skill_progress').select('skill_id, status').eq('user_id', user.id).in('status', [...])` has no row cap, violating AGENTS §10.3 ("Always add `.limit(N)` — never run unbounded queries"); supplement 17 fixed the same skill_progress pattern in `learn/[path]/PathTracker.tsx:105` and `PathProgress.tsx:30` with `.limit(100)` and supplement 19 fixed `dashboard/learn/page.tsx:56` but the API route was missed in both sweeps; use `.limit(200)` since gap-analysis sums across all paths (a user with 4 active paths × ~50 skills each = 200; safe ceiling vs the per-path 100 cap) [quality] ✅ 2026-05-11

### Security (AGENTS §5.4 — input validation)
- [x] Validate UUID format on path param `id` in `app/api/comments/[id]/route.ts:5,30` — both PATCH (line 5) and DELETE (line 30) destructure `id` from path params and pass it directly to `.eq('id', id)` without format validation; matches the strict UUID guard pattern already used in `app/api/alerts/route.ts:51` (`!/^[0-9a-f-]{36}$/.test(id)`) and `app/api/admin/job-listings/route.ts:51,122` (full UUID regex); add `if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })` immediately after `const { id } = await params` in both handlers; today's behaviour leaks Supabase errors as a generic 403 "Not found or forbidden" when a malformed id is passed and wastes a DB round-trip [security] ✅ 2026-05-11

### Security (AGENTS §5.4 — HTML escaping in admin emails)
- [x] Escape `${ip}`, `${name}`, and `${email}` before HTML interpolation in `app/api/contact/route.ts:81,83` ✅ 2026-05-11 — `escapedMessage` (line 86) is properly escaped via `.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')`, but the same template literal interpolates `ip` (attacker-controlled via `x-forwarded-for`), `name` (user-supplied, only sliced/trimmed), and `email` (validated against `EMAIL_RE` which doesn't forbid `<>` characters at lookbehind boundaries) without escaping; recipient is admin-only (`admin@gradland.au`) so impact is limited to the inbox owner, but unescaped HTML lets attackers inject `<a href="https://phish.example">click</a>` into admin emails (phishing surface) or break the email rendering; extract the existing escape logic into `function escapeHtml(s: string)` at module scope, apply to `ip`/`name`/`email` before interpolation, keep `escapedMessage` using the same helper [security]

### Performance (AGENTS §6 — caching)
- [x] Add `Cache-Control` header to `app/api/visa-news/route.ts:5` ✅ 2026-05-11 — the route returns `getAllVisaNews()` (filesystem markdown read) on every request with no cache header, while the structurally identical `app/api/ai-usage/route.ts:5-7` already returns `headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }`; visa-news content updates once per day via the `visa-news` workflow so a 1-hour edge cache + 24-hour stale-while-revalidate matches the data freshness requirement; change `return NextResponse.json(posts)` to `return NextResponse.json(posts, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })` [perf]

## 🛡 Daily Analyst Findings — 2026-05-11 (supplement 1)

### Security (AGENTS §5.4 — input validation)
- [x] Add UUID format validation on path param `id` in `app/api/admin/users/[id]/route.ts` PATCH and DELETE — both handlers destructure `id` from path params and pass it directly to `.eq('id', id)` without format validation; matches the UUID guard pattern already in `app/api/comments/[id]/route.ts:4,8,34`, `app/api/network/messages/[profileId]/route.ts:6,14,64`, and `app/api/admin/job-listings/route.ts:51,122`; add `const UUID_RE = /^[0-9a-f]{8}-...-[0-9a-f]{12}$/i` and check immediately after `const { id } = await params` in both handlers; also update `__tests__/api/admin-users-id.test.ts` to use valid UUIDs in all test IDs and add 2 new tests covering the 400 UUID-invalid path [security] ✅ 2026-05-11

---

## 🛡 Daily Analyst Findings — 2026-05-11 (supplement 2)

### Tests (stale Supabase mock — module-boundary pattern)
- [x] Fix stale `vi.mock('@supabase/supabase-js')` in four test files whose routes were migrated to `createSupabaseService()` from `lib/auth-server.ts` on 2026-05-06 but whose tests were not updated — same pattern fixed in `__tests__/api/learn-analyse.test.ts` (supplement 24, 2026-05-10); replace `vi.mock('@supabase/supabase-js', () => ({ createClient: ... }))` with `vi.mock('@/lib/auth-server', () => ({ createSupabaseService: vi.fn().mockReturnValue({ from: mockFrom }) }))` in: `__tests__/api/track.test.ts:7-11`, `__tests__/api/cover-letter.test.ts:35-37`, `__tests__/api/interview-questions.test.ts:41-43`, `__tests__/api/resume-analyse.test.ts:23-25`; mocking at the module boundary (auth-server) rather than the internal dependency (supabase-js) means a future refactor of the shared helper won't silently break test mocks [tests] [quality] ✅ 2026-05-11

## 🛡 Daily Analyst Findings — 2026-05-11 (supplement 3)

### Tests (missing Cache-Control assertion)
- [x] Add Cache-Control assertion to `GET /api/visa-news` test in `__tests__/api/public-read-routes.test.ts` ✅ 2026-05-11 — the `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` header was added in commit `17fc2d7` but the test file was not updated; the structurally identical `ai-usage` route already has this assertion at lines 70-75 of the same file (`expect(cacheControl).toContain('s-maxage=3600')` + `stale-while-revalidate=86400`); add a third `it` block under `describe('GET /api/visa-news')` following the exact same pattern [tests]

## 🛡 Daily Analyst Findings — 2026-05-11 (supplement 4)

### Security (dependency — 13 high-severity CVEs in next 16.0.0–16.2.5)
- [x] Upgrade `next` from 16.2.4 → 16.2.6 via `npm audit fix` — `npm audit --audit-level=moderate` reports 1 high-severity finding covering 13 advisories (DoS via Server Components/Cache/image optimisation, XSS via CSP nonce + beforeInteractive scripts, SSRF via WebSocket upgrades, cache poisoning, middleware/proxy bypass variants); patch 16.2.6 fixes all 13; no API changes needed — patch bump only (`@next/env`, `@next/swc-linux-x64-*` updated in lockfile); run `npm audit fix`, verify tests + build green [security] ✅ 2026-05-11

---

## 🛡 Daily Analyst Findings — 2026-05-11 (supplement 5)

### Tests (missing HTML-escape assertion)
- [x] Add Vitest test verifying `escapeHtml` is applied to `name` and `ip` before HTML insertion in `__tests__/api/contact.test.ts` ✅ 2026-05-11 — the 2026-05-11 security fix (commit `1bcd075`) added `escapeHtml()` to `ip`, `name`, and `email` before interpolation into the Resend HTML body (`app/api/contact/route.ts:85,87`) but the test file was not updated; add one `it` block: send a POST with `name: '<script>alert(1)</script>'` and `x-forwarded-for: '127.0.0.1<img/src=x>'`, assert `mockSend.mock.calls[0][0].html` contains `&lt;script&gt;` and `&lt;img/src=x&gt;` and does NOT contain the raw `<script>` or `<img/src=x>` strings; verifies the XSS defence-in-depth fix has regression protection [tests]

---

## 🛡 Daily Analyst Findings — 2026-05-11 (supplement 6)

### Security (AGENTS §5.4 — HTML escaping in transactional emails)
- [x] Escape `opts.title` and `opts.company` before HTML interpolation in `lib/email.ts` ✅ 2026-05-11 — all four email helpers (`sendJobListingConfirmation`, `sendJobListingApproved`, `sendJobListingRenewalReminder`, `sendJobListingExpired`) interpolate user-supplied `company` (sliced to 100 chars in `app/api/stripe/job-listing/route.ts:53`) and `title` (sliced to 200 chars) directly into Resend HTML email bodies without escaping; a job poster can craft `company: '<img src="https://tracker.example/x.png"/>'` to embed tracking pixels or `title: '<a href="https://phish.example">click</a>'` to inject phishing links into the transactional emails they receive; apply the same pattern established in `app/api/contact/route.ts:32-34` (`function escapeHtml`) — add `escapeHtml()` helper at module scope in `lib/email.ts` and call it on `opts.title` and `opts.company` before template literal interpolation in all four functions [security]

---

## 🛡 Daily Analyst Findings — 2026-05-11 (supplement 7)

> Supplement scan — `lib/email.ts` received HTML escaping in commit `a84b776` for `opts.title` and `opts.company` (supplement 6) but has no regression test. By parity, supplement 5 added a test for the parallel contact-route escaping fix; the same coverage should exist for the four transactional email helpers.

### Tests
- [x] Add Vitest tests for HTML escaping in `lib/email.ts` — call each of the four helpers (`sendJobListingConfirmation`, `sendJobListingApproved`, `sendJobListingRenewalReminder`, `sendJobListingExpired`) with `title: '<script>alert(1)</script>'` and `company: '<img/src=x onerror=alert(2)>'`; assert `mockSend.mock.calls[0][0].html` contains `&lt;script&gt;` and `&lt;img/src=x` and does NOT contain the raw tags; also verify no-op when `RESEND_API_KEY` is unset; mirrors pattern from `__tests__/api/contact.test.ts:108-118`; new file: `__tests__/lib/email.test.ts` [tests] ✅ 2026-05-11

---

## 🛡 Daily Analyst Findings — 2026-05-12

> Daily scan — six small fixes spanning AGENTS §5.2 (Supabase client discipline), §5.4 (input validation), and the missed-route pattern from Sprint 0 A6 (in-memory rate-limit Maps). `npm audit` = 0 vulns; `tsc --noEmit` = clean. The `app/api/contact/route.ts` ipLog Map is the only remaining route-level in-memory rate limiter; Sprint 0 A6 (2026-05-09) migrated `log-error` and `track` but missed `contact`. Separately, `app/api/learn/progress/route.ts` is the last route still inlining `createServerClient` from `@supabase/ssr` instead of using `createSupabaseServer()` from `lib/auth-server.ts` — the 2026-05-06 sweep only caught raw `createClient` (service-role) usages and missed the SSR variant. The same file also has four input-validation gaps that the prior `learn/video-meta` and `learn/quiz` truncation fixes did not extend to.

### Security (AGENTS §5.6 — kill in-memory rate-limit Maps)
- [x] Migrate `app/api/contact/route.ts:9-28` from in-memory `ipLog` Map + `checkRateLimit()` to `checkRateLimit` from `lib/rate-limit-db.ts` — same Sprint 0 A6 pattern that landed for `app/api/log-error/route.ts` and `app/api/track/route.ts` on 2026-05-09; `contact` was missed because the audit grep only checked routes flagged in the original audit. In-memory Maps don't survive Vercel Fluid Compute instance recycles or share state across regions, so the 5/hr/IP cap is effectively per-instance and bypassable by hitting different regions; replace `ipLog`/`getIp`/`checkRateLimit` (lines 9-28) with `const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'; const limited = await checkRateLimit('contact:' + ip, 3600, 5); if (limited) return NextResponse.json({...}, { status: 429 });`; keep the same 429 error message; remove the unused `getIp` helper [security] ✅ 2026-05-12

### Code Quality (AGENTS §5.2 — Supabase client discipline)
- [x] Replace inline `createServerClient` from `@supabase/ssr` in `app/api/learn/progress/route.ts:6-11,40-45` with shared `createSupabaseServer()` from `lib/auth-server.ts` — AGENTS §5.2 violation; the 2026-05-06 sweep (analytics/summary, admin/stats) and 2026-05-08 sweep (learn/youtube/[videoId]/page.tsx) targeted `createClient` from `@supabase/supabase-js` and missed this `@supabase/ssr` variant; remove the `createServerClient`/`cookies` imports and replace each block with `const sb = await createSupabaseServer();` matching the pattern in `app/api/visa-tracker/route.ts:5-6` and every other route in this codebase [quality] ✅ 2026-05-12

### Security (AGENTS §5.4 — input validation)
- [x] Validate `videoId` format and truncate `videoTitle` in `app/api/learn/progress/route.ts:19-20` POST handler — `videoId` is upserted as a primary key without format validation; matches the `learn/video-meta` validation already in production (`if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return 400`); also add `.slice(0, 200)` to `videoTitle` matching the `learn/quiz` pattern (videoTitle truncated to 200 chars per supplement 2026-05-07); both currently flow raw user input straight to Supabase upsert [security] ✅ 2026-05-12
- [x] Validate `quizScore` (0–100 integer) and coerce `completed` to Boolean in `app/api/learn/progress/route.ts:28-29` POST handler — `body.quizScore` is destructured as `number | undefined` but never bounded (an attacker can store `quiz_score: 999999` or `Number.NaN`); use `typeof quizScore === 'number' && Number.isFinite(quizScore) ? Math.max(0, Math.min(100, Math.round(quizScore))) : null` before the `update.quiz_score = …` assignment; `completed` is already typed `boolean | undefined` but `update.completed = completed` can store any non-undefined truthy value — coerce with `Boolean(completed)` [security] ✅ 2026-05-12
- [x] Validate `parent_id` UUID format in `app/api/comments/route.ts:35` POST handler — `body.parent_id ?? null` flows directly to insert; if non-UUID provided, Postgres rejects with a generic 500 `error: 'Failed to post comment'` instead of a clean 400 (and wastes a DB round-trip); add `const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;` at module scope and `if (parent_id !== null && (typeof parent_id !== 'string' || !UUID_RE.test(parent_id))) return NextResponse.json({ error: 'Invalid parent_id' }, { status: 400 });` after line 35; matches the strict UUID guard pattern already used in `app/api/comments/[id]/route.ts:4,8,34` and `app/api/network/messages/[profileId]/route.ts:6,14,64` [security] ✅ 2026-05-12
- [x] Validate YouTube `channelId` format in `app/api/learn/channel-videos/route.ts:22,26` — `channelId` is interpolated raw into the `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}` URL via template literal at lines 12 and 38 without format validation; an attacker who hits this endpoint with `channelId=foo%26alt=json%26prettyPrint=true` can inject extra YouTube API query parameters (the `&` becomes a real param separator after URL encoding); add `if (!/^[A-Za-z0-9_-]{18,30}$/.test(channelId)) return NextResponse.json({ error: 'Invalid channelId' }, { status: 400 });` immediately after the existing `if (!channelId)` check at line 26; YouTube channel IDs are 24 chars in practice (UC + 22) but allow a small range for forwards-compat [security] ✅ 2026-05-12

## 🛡 Daily Analyst Findings — 2026-05-12 (supplement 1)

> Supplement scan — `__tests__/api/learn-progress.test.ts` still mocks `@supabase/ssr`'s `createServerClient` and `next/headers`'s `cookies` even though the route was migrated to `createSupabaseServer()` from `lib/auth-server.ts` in commit `47874c0`. The mocks happen to intercept calls through the transitive dependency chain, so tests pass, but the test is coupled to the internal implementation of `lib/auth-server.ts` rather than the public interface. Same class of bug fixed in `0c6abc4` (2026-05-11) for four other test files.

### Tests (stale Supabase mock — module-boundary pattern)
- [x] Fix stale `vi.mock('@supabase/ssr')` + `vi.mock('next/headers')` in `__tests__/api/learn-progress.test.ts` — route was migrated to `createSupabaseServer()` from `lib/auth-server.ts` in commit `47874c0` but the test was not updated; replace both stale mocks with `vi.mock('@/lib/auth-server', () => ({ createSupabaseServer: vi.fn().mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom }) }))` using `mockResolvedValue` (async function); follows exact pattern from `__tests__/api/track.test.ts:7-11` and the four files fixed in `0c6abc4` [tests] [quality] ✅ 2026-05-12

## 🛡 Daily Analyst Findings — 2026-05-12 (supplement 2)

### Security (AGENTS §5.4 — input validation)
- [x] Validate `videoId` format and truncate `videoTitle`/`channelTitle` in `app/api/learn/analyse/route.ts:58-59` — `videoId` was only checked for truthiness (`if (!videoId)`), not format; `videoTitle` and `channelTitle` were interpolated raw into the Gemini prompt (line 106) and stored in the Supabase upsert (lines 178-179) without any length cap; matches the `learn/video-meta` validation pattern (`/^[A-Za-z0-9_-]{11}$/`) and the `learn/quiz` + `learn/progress` truncation pattern (`.slice(0, 200)`); add 2 new tests: 400 on malformed videoId, and KV-hit 200 confirming truncated strings are accepted (`__tests__/api/learn-analyse.test.ts`) [security] ✅ 2026-05-12

---

## 🛡 Daily Analyst Findings — 2026-05-12 (supplement 3)

> Supplement scan — three route handlers call `req.json()` without a try-catch or `.catch()`, so malformed JSON bodies throw a SyntaxError that propagates to Next.js and produces a 500 rather than the correct 400. The pattern was fixed in `interview/chat`, `interview/evaluate`, `interview/mentor`, `interview/questions`, `learn/analyse`, `learn/quiz`, `learn/progress` (today's commit), `cover-letter`, `contact`, and others via `.catch(() => null)` or `try/catch`, but three handlers were missed.

### Code Quality (input validation — graceful JSON parse failure)
- [x] Guard `req.json()` against malformed JSON in `app/api/comments/route.ts:33` (POST), `app/api/comments/[id]/route.ts:13` (PATCH), and `app/api/admin/users/[id]/route.ts:13` (PATCH) — all three call bare `await req.json()` without error handling; add `.catch(() => null)` + null guard returning 400 on each; add `returns 400 for unparseable request body` test to `__tests__/api/comments.test.ts`, `__tests__/api/comments-id.test.ts`, and `__tests__/api/admin-users-id.test.ts` [quality] ✅ 2026-05-12

---

## 🛡 Daily Analyst Findings — 2026-05-12 (supplement 4)

> Supplement scan — two small security guards in API routes missed by all prior sweeps: the UUID validation regex in `app/api/alerts/route.ts` is looser than the pattern established everywhere else in the codebase, and `app/api/resume-analyse/route.ts` calls `req.formData()` without any error handling so a malformed multipart request produces a 500 instead of a clean 400.

### Security (AGENTS §5.4 — input validation)
- [x] Tighten UUID regex in `app/api/alerts/route.ts:51` DELETE handler — current pattern `/^[0-9a-f-]{36}$/` accepts any 36-character string of hex digits and dashes (e.g. `------------------------------------` or `aaa-aaaa-aaaa-aaaa-aaaaaaaaaaaaaaaa` with wrong hyphen placement), whereas the strict pattern used in `app/api/comments/[id]/route.ts:4,8,34`, `app/api/admin/job-listings/route.ts:51,122`, and `app/api/admin/users/[id]/route.ts` is `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`; replace the loose regex with the strict pattern so `8-4-4-4-12` structure is enforced before the id reaches Postgres; existing test at `__tests__/api/alerts.test.ts:120` (`id=not-a-real-uuid`) still passes — no test update needed [security] ✅ 2026-05-12
- [x] Guard `req.formData()` against parse failure in `app/api/resume-analyse/route.ts:86` — bare `await req.formData()` throws a `TypeError` when the request is not multipart/form-data (e.g. content-type mismatch or missing boundary); the thrown error propagates to Next.js and returns a 500 instead of 400; change to `await req.formData().catch(() => null)` + null guard returning `{ error: 'Invalid request body' }` 400, matching the pattern used for `req.json()` throughout the codebase; add one `it` block to `__tests__/api/resume-analyse.test.ts` that spies on `req.formData` with `mockRejectedValue(new TypeError('invalid form data'))` and asserts `res.status === 400` [security] ✅ 2026-05-12

---

## 🛡 Daily Analyst Findings — 2026-05-12 (supplement 5)

> Supplement scan — `lib/rate-limit-db.ts` has no unit tests. Every API route that calls `checkRateLimit` mocks the entire module (`vi.mock('@/lib/rate-limit-db')`), so the implementation itself is never exercised by the test suite. The function has three distinct paths: success (returns `count > limit`), DB error (fails-open → `false`), and exception (try/catch → `false`). Missing coverage means a refactor of the Supabase RPC call or the bucket logic could silently break the rate-limiter across all protected routes (`contact`, `log-error`, `track`, `stripe/job-listing`, `analytics/ai-insights`).

### Tests
- [x] Add Vitest unit tests for `lib/rate-limit-db.ts` — mock `createSupabaseService` from `lib/auth-server` and its `.rpc()` chain; test: (1) `count <= limit` → returns `false` (not limited), (2) `count > limit` → returns `true` (over limit), (3) DB error on RPC → returns `false` (fails-open), (4) thrown exception → returns `false` (fails-open); verify the `p_key` and `p_bucket` args passed to `.rpc('increment_rate_limit', ...)` are correct; new file: `__tests__/lib/rate-limit-db.test.ts` [tests] ✅ 2026-05-12

---

## 🛡 Daily Analyst Findings — 2026-05-12 (supplement 6)

> Supplement scan — `lib/subscription.ts` is the security gateway called by every paid AI route but has no unit tests. Every API route test mocks it via `vi.mock('@/lib/subscription')`, so the implementation itself is never exercised. The five functions have distinct paths: `getSubscriptionStatus` has 4 branches (no row, admin, pro-active, pro-expired, free), `checkRateLimit` has 2 (within/over), `checkEndpointRateLimit` has 3 (no limit defined, within, over), `recordUsage` inserts a row, and `requireSubscription` has 5 outcomes (401/owner-bypass/403/429/200). A refactor of any branch silently invalidates the rate-limiting guarantee across all paid routes.

### Tests
- [x] Add Vitest unit tests for `lib/subscription.ts` — mock `createSupabaseServer`, `createSupabaseService`, and response helpers from `lib/auth-server`; fluent Supabase chain mocks for `profiles` (`.select().eq().maybeSingle()`) and `api_usage` (`.select().eq().gte()` + `.insert()`); 17 tests covering all branches of `getSubscriptionStatus` (no row/admin/pro-lifetime/pro-future/pro-expired/free), `checkRateLimit` (within/over 100), `checkEndpointRateLimit` (no limit/within/over), `recordUsage` (insert shape), `requireSubscription` (401/owner-bypass/403/200-pro/429-pro); new file: `__tests__/lib/subscription.test.ts` [tests] ✅ 2026-05-12

---

## 🛡 Daily Analyst Findings — 2026-05-13

> Daily scan — three small fixes spanning stale brand text on every social-shareable OG image, sanitizer gaps in user-supplied job HTML, and an internal error-message leak. `npm audit` = 0 vulns; `tsc --noEmit` = clean. The "TECHPATH AU" string on the interview share card is the highest-impact item: every user who shares their result publishes the wrong brand to LinkedIn/X/etc. The pre-rebrand string survived every prior sweep because the file is `.tsx` rendered into a PNG via `ImageResponse`, so a text-search for visible UI strings never surfaced it.

### Quality (stale brand on social share)
- [x] Replace `TECHPATH AU` with `GRADLAND` in `app/api/interview/share-card/route.tsx:36` — the `ImageResponse` OG card rendered for every interview-result share still displays the pre-rebrand brand string; this is the public-facing artefact every user posts to LinkedIn/X when they hit the "Share on LinkedIn" / "Download card" buttons in `app/interview-prep/[role]/InterviewSession.tsx:1216-1229`; also update `download={`techpath-au-${role.id}-${avgScore}.png`}` to `download={`gradland-${role.id}-${avgScore}.png`}` at `app/interview-prep/[role]/InterviewSession.tsx:1218` so the saved file matches; leave `LS_KEY = 'techpath_enrolled_paths'` at `app/learn/LearnPageClient.tsx:11` alone — that is a localStorage key and renaming would silently un-enrol every existing user from their saved paths [quality] ✅ 2026-05-13

### Security (jobs HTML sanitizer — incomplete `javascript:` URL coverage)
- [x] Cover single-quoted and unquoted `javascript:` URLs in `sanitizeJobHtml()` at `app/api/jobs/route.ts:540-551` — the output is rendered via `dangerouslySetInnerHTML` in `app/jobs/page.tsx:317` (`<div className="job-description-html" dangerouslySetInnerHTML={{ __html: job.description }} />`), so any gap in the sanitizer is a stored-XSS sink fed by third-party job feeds (Adzuna/JSearch/scraped HTML); current `.replace(/href="javascript:[^"]*"/gi, 'href="#"')` at line 549 only matches double-quoted hrefs; add `.replace(/href='javascript:[^']*'/gi, "href='#'")` and `.replace(/href=javascript:\S*/gi, 'href="#"')` (unquoted variant — HTML5 attributes can be unquoted up to whitespace); also extend to `src=` for completeness since `<img>` is not in the stripped-tag denylist on line 546; add 2 regression tests to `__tests__/api/jobs.test.ts` covering both single-quoted and unquoted `javascript:` payloads [security] ✅ 2026-05-13

### Quality (info disclosure — raw error message)
- [x] Stop returning raw error messages to the client in `app/api/learn/channel-videos/route.ts:89` — the catch block does `return NextResponse.json({ error: (err as Error).message }, { status: 500 })`, which leaks internal details (stack-style strings, Supabase error codes, fetch failure reasons) to any unauthenticated caller; replace with the bare-catch pattern used in `app/api/companies/research/route.ts:131-133` (`} catch { return NextResponse.json({ error: 'Failed to load channel videos' }, { status: 500 }); }`); Sentry already captures the unhandled exception via the global instrumentation so observability is unaffected; update `__tests__/api/learn-channel-videos.test.ts` to assert the generic message string instead of the dynamic one [quality] ✅ 2026-05-13

## 🛡 Daily Analyst Findings — 2026-05-13 (supplement 1)

> Follow-up scan — `app/api/learn/videos/route.ts` (IBM channel) has the same raw-error-message leak fixed today in `app/api/learn/channel-videos/route.ts` (commit `623098e`). Both routes catch exceptions in an outer try/catch and return `(err as Error).message` as the 500 body, exposing fetch-failure reasons, DNS errors, and YouTube API internals to any caller. The test at `__tests__/api/learn-videos.test.ts:128` asserts `expect(body.error).toMatch(/Network failure/)` — tying the test to the raw message rather than a stable contract.

### Quality (info disclosure — raw error message)
- [x] Stop returning raw error messages to the client in `app/api/learn/videos/route.ts:66` — the catch block does `return NextResponse.json({ error: (err as Error).message }, { status: 500 })`, which leaks internal details (fetch failure reasons, DNS errors, YouTube API internals) to any caller; replace with the bare-catch pattern used in `app/api/learn/channel-videos/route.ts:89` and `app/api/companies/research/route.ts:131-133` (`} catch { return NextResponse.json({ error: 'Failed to load IBM channel videos' }, { status: 500 }); }`); Sentry already captures the unhandled exception via the global instrumentation so observability is unaffected; update `__tests__/api/learn-videos.test.ts:128` to assert the generic message string instead of the dynamic `/Network failure/` pattern [quality] ✅ 2026-05-13

## 🛡 Daily Analyst Findings — 2026-05-13 (supplement 2)

> Supplement scan — three more routes return raw error messages in 500 responses, leaking Supabase error details and OpenAI failure reasons to authenticated callers. The pattern matches the two fixes shipped today (`learn/channel-videos` commit `623098e`, `learn/videos` commit `cf87e6a`). All three existing tests only assert `res.status === 500` with no body assertion, so the message can be genericised without touching tests.

### Quality (info disclosure — raw error messages in three user-facing routes)
- [x] Stop returning raw error messages to clients in `app/api/learn/quiz/route.ts:112`, `app/api/learn/progress/route.ts:36`, and `app/api/visa-tracker/route.ts:58` — quiz catch block leaks `(err as Error).message` (OpenAI/JSON-parse details); progress and visa-tracker leak `error.message` from Supabase upsert failures; replace with static strings `'Quiz generation failed'`, `'Failed to save progress'`, and `'Failed to save tracker'` respectively; no test updates needed as no test asserts the 500 body message [quality] ✅ 2026-05-13

## 🛡 Daily Analyst Findings — 2026-05-13 (supplement 3)

> Supplement scan — `app/api/admin/job-listings/route.ts` returns raw `error.message` / `fetchError.message` strings in seven 500 responses across GET, PATCH (reject/approve/extend), and DELETE handlers. The route is admin-gated (`requireAdmin()`) so only the platform operator sees these messages, but leaking Supabase error details is inconsistent with the pattern established by today's sweeps of `channel-videos`, `learn/videos`, `learn/quiz`, `learn/progress`, and `visa-tracker`. No existing test asserts on any 500-body message in this file.

### Quality (info disclosure — raw error messages in admin job-listings route)
- [x] Stop returning raw error messages to the client in `app/api/admin/job-listings/route.ts` — GET at line 34 leaks `error.message` on DB list failure; PATCH reject at line 62, approve-fetch at line 72, approve-update at line 79, extend-fetch at line 97, extend-update at line 107 each leak `error.message`/`fetchError.message`; DELETE at line 128 leaks `error.message`; replace all seven with static strings (`'Failed to load job listings'`, `'Failed to delete listing'`, `'Failed to load listing'`, `'Failed to approve listing'`, `'Failed to extend listing'`); Sentry captures the unhandled DB error via global instrumentation so observability is unaffected; no test updates needed [quality] ✅ 2026-05-13

## 🛡 Daily Analyst Findings — 2026-05-13 (supplement 4)

> Follow-up scan — two raw-error-message leaks missed by the 2026-05-13 supplement sweep. The supplement 3 pass covered `admin/job-listings` but left `app/api/cron/expire-job-listings/route.ts:37` (Supabase error message in 500 response — only seen by the GitHub Actions cron caller but inconsistent with the pattern) and `app/api/learn/channel-videos/route.ts:53` (YouTube API `err?.error?.message` forwarded to the authenticated caller in the non-OK path — the catch block at line 89 was fixed in the main 2026-05-13 scan but the non-OK branch at line 53 was missed). Both need to be replaced with static strings and their test assertions updated.

### Quality (info disclosure — raw error messages in cron and channel-videos routes)
- [x] Stop returning raw error messages to the client in `app/api/cron/expire-job-listings/route.ts:37` and `app/api/learn/channel-videos/route.ts:53` — cron route returns `expireError.message` (Supabase error) in the 500 path; channel-videos route returns `err?.error?.message ?? 'YouTube API error'` (YouTube API error detail) in the non-OK path; replace with `'Failed to expire job listings'` and `'YouTube API error'` (the existing fallback, now always used); update `__tests__/api/cron-expire-job-listings.test.ts:230` from `toBe('Constraint violation')` to `toBe('Failed to expire job listings')` and `__tests__/api/learn-channel-videos.test.ts:208` from `toMatch(/Quota exceeded/)` to `toBe('YouTube API error')` [quality] ✅ 2026-05-13

## 🛡 Daily Analyst Findings — 2026-05-13 (supplement 5)

> Supplement scan — four interview route handlers return `err.message` directly to clients in 502 responses. The main 2026-05-13 sweep fixed `learn/channel-videos`, `learn/videos`, `learn/quiz`, `learn/progress`, `visa-tracker`, `admin/job-listings`, and `cron/expire-job-listings` but missed the four `app/api/interview/` routes that share the pattern `const msg = err instanceof Error ? err.message : 'static fallback'; return new Response(JSON.stringify({ error: msg }), { status: 502 })`. These routes are auth-gated (`requireSubscription`) so only authenticated users see the leaked OpenAI/network error details, but it is inconsistent with the hardened pattern across the rest of the codebase.

### Quality (info disclosure — raw error messages in interview routes)
- [x] Stop returning raw error messages to clients in `app/api/interview/chat/route.ts:68`, `app/api/interview/evaluate/route.ts:96`, `app/api/interview/questions/route.ts:141`, and `app/api/interview/mentor/route.ts:135` — all four use `err instanceof Error ? err.message : 'static fallback'` as the 502 body; replace with static strings (`'Chat failed'`, `'Evaluation failed'`, `'Failed to generate questions'`, `'Failed to generate narration'`); drop unused `msg` variable and `console.error` call, using bare `} catch {` matching the pattern in `app/api/learn/videos/route.ts:65`; update 4 test assertions in `interview-ai-routes.test.ts` and `interview-questions.test.ts` [quality] ✅ 2026-05-13

## 🛡 Daily Analyst Findings — 2026-05-13 (supplement 6)

> Supplement scan — `app/api/learn/analyse/route.ts:167` streaming error handler leaks raw Gemini error messages in the `else` fallback branch. The main 2026-05-13 sweep fixed nine routes returning `(err as Error).message` or `error.message` in response bodies, but missed this streaming-path variant where `friendly = raw` sends the actual Gemini internal error to the authenticated caller via the stream. Known error patterns (too-long, audio-only) are mapped to user-friendly messages; the `else` branch should do the same.

### Quality (info disclosure — raw Gemini error in streaming fallback)
- [x] Replace `friendly = raw` with a static fallback in `app/api/learn/analyse/route.ts:167` — the `else` branch in the streaming error handler sends the raw Gemini error message to authenticated callers; known patterns (too-long, audio-only) already map to friendly strings; unknown errors should fall back to `'Video analysis failed. Please try again or try a different video.'` to match the hardened pattern across the rest of the codebase [quality] ✅ 2026-05-13

## 🛡 Daily Analyst Findings — 2026-05-13 (supplement 7)

### Style (admin error displays)
- [x] Replace `color: 'red'` with `var(--vermilion)` on error `<p>` elements in `app/admin/page.tsx:27`, `app/admin/comments/page.tsx:44`, `app/admin/users/page.tsx:58`, and `app/admin/analytics/page.tsx:106` — the CSS keyword `red` is off-brand and does not adapt to the design system's dark-mode vermilion (`#e84040`); every other error/danger colour in the codebase uses `var(--vermilion)` (e.g. `Comments.tsx:140,148`, `contact/ContactForm.tsx`, `login/page.tsx`) [style] ✅ 2026-05-13

---

## 🛡 Daily Analyst Findings — 2026-05-14

> Daily scan — `npm audit` = 0 vulns; `tsc --noEmit` = clean; 53 API routes, all auth-gated routes have tests. Three findings target a real-world abuse surface: three public-facing routes call third-party metered APIs (YouTube Data API, RapidAPI) without rate limiting, so a botnet can burn the daily quota in minutes and break the `/learn/youtube` and `/learn/ibm` features for legitimate users. One small XSS-sanitizer gap (unquoted `onclick=` attributes) and one `.env.example` documentation drift on `KV_REST_API_*` round out the list. The AGENTS.md tech-debt table is also significantly stale — most items listed as "do not replicate" have been fixed in prior sweeps but the doc was never updated.

### Security (public AI/external-API routes — rate-limit gap)
- [x] Add IP-based `checkRateLimit` (from `lib/rate-limit-db.ts`) to `app/api/learn/channel-videos/route.ts:21` — currently unauthenticated; fetches YouTube Data API on every cache-miss request (1 quota unit per `playlistItems` call + 1 per `channels` first-time-per-channel call); a botnet sending 10k requests/hour with random `channelId` values exhausts the daily YouTube quota (10k units default) in <1 hour and breaks `/learn/youtube` for legitimate users; same `getIp + checkRateLimit('learn/channel-videos:' + ip, 3600, 60)` pattern used in `app/api/contact/route.ts:9-28`; cap 60/hr/IP is generous for a UI that issues at most one call per channel visit [security] ✅ 2026-05-15
- [x] Add IP-based `checkRateLimit` to `app/api/learn/videos/route.ts:53` (IBM channel route) — same pattern + risk as `channel-videos`; only one channel (`UCKWaEZ-_VweaEx1j62do_vQ`) is fetched but every request still hits YouTube quota; use key `'learn/videos:' + ip`, 60/hr cap [security] ✅ 2026-05-15
- [x] Add IP-based `checkRateLimit` to `app/api/learn/video-meta/route.ts:6` for the RapidAPI cache-miss path — Supabase cache hit is free, but on miss the route calls `youtube138.p.rapidapi.com` (paid quota); an attacker sending requests with random valid 11-char videoIds (~64^11 namespace) bypasses cache every time and burns the RapidAPI plan; add `checkRateLimit('learn/video-meta:' + ip, 3600, 30)` immediately before the RapidAPI fetch at line 34 (after cache check so legitimate cache hits remain unmetered) [security] ✅ 2026-05-15

### Security (XSS sanitizer — unquoted attribute gap)
- [x] Cover unquoted event-handler attributes in `sanitizeJobHtml()` at `app/api/jobs/route.ts:547-548` — current pattern `.replace(/\s+on\w+="[^"]*"/gi, '')` + single-quoted variant strips quoted `onclick="…"` and `onclick='…'` but not unquoted `<a onclick=alert(1) href="...">` which HTML5 permits up to whitespace; the output is rendered via `dangerouslySetInnerHTML` in `app/jobs/page.tsx:317`; add `.replace(/\s+on\w+=\S+/gi, '')` after the existing two replaces (place LAST so it doesn't break the quoted variants matching `\S+` greedily — order matters); add 1 regression test to `__tests__/api/jobs.test.ts` covering an unquoted `onclick=alert(1)` payload (mirrors the single-quoted/unquoted `javascript:` URL tests added in commit `1c05e32`) [security] ✅ 2026-05-15

### Documentation (env-var drift in .env.example)
- [x] Add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to `.env.example` — `lib/kv.ts:7-8` reads both env vars (used by `app/api/learn/analyse/route.ts`, `app/api/learn/quiz/route.ts`, `app/api/cover-letter/route.ts`, `app/api/interview/questions/route.ts` cache layers) but they are absent from `.env.example`; a fresh contributor running `cp .env.example .env.local` gets the no-op KV path silently with no indication that caching is disabled; add a `# ── Cache (Vercel KV) ──` section after the Logo CDN block following the same comment style as the other sections; both keys come from `vercel kv` Marketplace integration [quality] ✅ 2026-05-16

### Documentation (AGENTS.md tech-debt table stale)
- [x] Refresh `AGENTS.md` §15 "Known Tech Debt" table — most entries are stale because the fixes shipped in prior sweeps but the doc was never updated. Remove or mark as resolved: `@import` Google Fonts (fixed 2026-05-02 — `app/globals.css` now uses `next/font` per §6.2), `images: { unoptimized: true }` (fixed — `next.config.ts:7-22` now sets `remotePatterns`), `<img>` tags in PersonalisedHero/Header (fixed — verified no `<img>` usages remain in app/components per current grep), `<a href>` for internal routes in PersonalisedHero/GettingStartedChecklist (fixed 2026-05-02), `--text-muted: #786858` in dark mode (fixed — `globals.css:113` now `#a09080`), missing `middleware.ts` (shipped as `proxy.ts` per 2026-05-08 Sprint 0 B1), No CSP headers (shipped in `proxy.ts` 2026-05-06), Inline `onMouseEnter/Leave` (fixed 2026-05-02). Keep `export const dynamic = 'force-dynamic'` row only if a homepage instance still sets it (`app/page.tsx` now uses `revalidate = 3600` per current read — also stale; remove this row too). Also update §7.2 to drop the `--text-muted: #786858` warning that no longer applies. Net effect: trims a 9-row "do not replicate" table that is now mostly false alarms, restoring AGENTS.md as a trustworthy guide for new agents [quality] [docs] ✅ 2026-05-16

## 🛡 Daily Analyst Findings — 2026-05-16

### Correctness (AGENTS §10.3 — push filter to the database)
- [x] Move the `role` filter from JS to the DB in `app/api/network/list/route.ts:39-44` — the route fetches up to 200 most-recently-updated profiles via `.limit(200)`, then filters in JS using `p.role_title.toLowerCase().includes(needle)`. This is a **correctness bug, not just perf**: a search like `?role=python` only returns matches from the most recent 200 profiles updated, so older but still-active Python devs are invisible to the search. Replace the JS `.filter()` with a server-side predicate before `.limit(200)`: `query = query.ilike('role_title', '%' + escapeLikeNeedle(role) + '%')` where `escapeLikeNeedle` escapes `%`, `_`, and `\` (PostgreSQL `ILIKE` wildcards) — needed because `role` comes from user input and is already truncated to 100 chars at line 14. Drop the post-fetch `.filter()` loop. Net effect: full coverage of the profile pool and one less array iteration on every search [perf] [quality] ✅ 2026-05-16

### Tests (mutation routes with auth/ownership checks)
- [x] Add Vitest test for `app/api/comments/[id]/route.ts` — cover (1) PATCH returns 400 on non-UUID `id`, (2) PATCH returns 401 without session, (3) PATCH returns 403 when `user.id !== comment.user_id` (the `.eq('user_id', user.id)` ownership scope at line 25 is the security boundary — a regression here would let any logged-in user edit any comment), (4) DELETE returns `ok: true` when the caller is admin (`profiles.role === 'admin'`) deleting another user's comment. Mirror the mock pattern in `__tests__/api/comments.test.ts` for the parent route [tests] ✅ 2026-05-16
- [x] Add Vitest test for `app/api/admin/users/[id]/route.ts` — cover (1) PATCH returns 403 when caller is not admin (verify `requireAdmin()` gate), (2) PATCH returns 400 on `role` value outside `['user','admin']`, (3) DELETE returns 400 when admin tries to ban themselves (line 38-40 self-ban guard), (4) DELETE deletes the user's comments AND sets `role='banned'` in one happy-path test. This is the only mutation endpoint that can change platform roles and is currently zero-test [tests] ✅ 2026-05-16

## 🛡 Daily Analyst Findings — 2026-05-16 (supplement 1)

> Supplement scan — `lib/sponsor-detect.ts` added in commit `b54eafa` has zero unit test coverage. It is a pure function with 6 positive and 7 negative regex patterns used to heuristically detect visa-sponsorship mentions across all job sources (Adzuna, Google Jobs, JSearch, Remotive, Jobicy). Every call site mocks `@/lib/sponsor-detect` entirely so the actual regexes are never exercised by the test suite. A typo or conflicting pattern in POSITIVE/NEGATIVE would silently produce wrong `sponsor_signal` values on every `/api/jobs` response.

### Tests
- [x] Add Vitest unit tests for `lib/sponsor-detect.ts` — test: (1) returns `false` for `null`/`undefined`/empty string, (2) returns `true` when text matches a POSITIVE pattern (`'will sponsor visa'`, `'482 visa sponsorship available'`, `'accredited sponsor'`), (3) returns `false` when NEGATIVE overrides a POSITIVE match (`'no visa sponsorship available'`), (4) returns `false` when only a NEGATIVE pattern matches (`'Australian citizens only'`), (5) returns `false` when no pattern matches (`'competitive salary'`), (6) NEGATIVE `'citizens and permanent residents only'` overrides any POSITIVE; new file: `__tests__/lib/sponsor-detect.test.ts` [tests] ✅ 2026-05-16

---

## 🛡 Daily Analyst Findings — 2026-05-16 (supplement 2)

> Supplement scan — `__tests__/api/network-list.test.ts` tests the happy-path `.ilike()` call with clean alphanumeric input (`'software'`, `'accountant'`) but has zero coverage for the `escapeLikeNeedle` function added in commit `80f5d15`. PostgreSQL ILIKE treats `%` and `_` as wildcards and `\` as an escape prefix, so a user-supplied `role=%` would expand to `%%%` (matches everything) without escaping. The function is correct but untested — a future refactor could silently break the escaping and let users bypass the search filter with a wildcard role query.

### Tests
- [x] Add two regression tests for `escapeLikeNeedle` in `__tests__/api/network-list.test.ts` — (1) role containing `%` is escaped: `role=%py` → `.ilike('role_title', '%\\%py%')`, (2) role containing `_` is escaped: `role=java_dev` → `.ilike('role_title', '%java\\_dev%')`; both assert on `chainRef.ilike` call args following the pattern at line 88–90 of the existing test file [tests] ✅ 2026-05-16

---

## 📊 Priority Rationale

| # | Feature | Retention | Revenue | Differentiation | Effort |
|---|---------|-----------|---------|-----------------|--------|
| 0 | Stripe live launch | — | ★★★★★ | — | External only |
| 1 | B2B job posting | — | ★★★★★ | ★★★ | M |
| 2 | Gemini multimodal | ★★★ | — | ★★★★ | S |
| 3 | Redis caching | ★★★ | ★★ | — | S |
| 4 | Nav restructure | ★★★ | — | ★★ | M |
| 5 | Mobile jobs UX | ★★★★ | — | ★★ | M |
| 6 | Community network | ★★★★★ | ★★★★ | ★★★★★ | XL |
| 7 | Company research AI | ★★★★ | ★★★ | ★★★★ | L |

S = 1–2 days · M = 3–5 days · L = 1–2 weeks · XL = 2–4 weeks

---

## Employer-Impressiveness Checklist

- [x] SSR with streaming AI responses
- [x] Row-Level Security on all user data
- [x] CI gate (audit + tests + build) before every deploy
- [x] Proper cookie-based auth (no client-side secrets)
- [x] Analytics without third-party trackers
- [x] pgvector (gap engine)
- [x] Test suite (41 tests, 8 files)
- [x] Test coverage on all critical paths (Stripe, streaming, auth) — resume-analyse tests added ✅ 2026-05-02
- [ ] Edge caching strategy (Vercel KV)
- [x] Accessible components (ARIA, keyboard nav) ✅ 2026-05-06
- [x] Core Web Vitals green (Lighthouse ≥ 90) ✅ 2026-05-06
- [x] TypeScript strict mode — no `any` without justification ✅ 2026-05-06
- [x] Error boundary on every page ✅ 2026-05-02
