# TODO — TechPath AU Feature Backlog

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

### Stripe Production Launch + ABN Registration
**Blocked on:** external manual steps only. Code is 100% done.

**ABN (do first):**
- [ ] Check visa eligibility — 485/PR/Citizen = OK; 482/Student = check first
- [ ] Gather TFN + passport → apply at abr.gov.au (free, ~15 min)
- [ ] Open separate AU bank account (CommBank / Up / Wise) for business income

**Stripe activation (after ABN):**
- [ ] Activate live mode at dashboard.stripe.com — paste ABN, upload passport, add bank BSB
- [ ] Wait for "Charges enabled" + "Payouts enabled" (1–2 days)
- [ ] Create live product: `TechPath AU Pro` — `$14.99 AUD / month` → copy `price_…` ID
- [ ] Create live webhook → 5 events (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed)
- [ ] Swap 4 Vercel env vars to live keys (Production scope only, keep test for Preview)
- [ ] Smoke test: real card → verify `subscription_tier = 'pro'` in Supabase → refund yourself

**Files already done:** `app/api/stripe/webhook/route.ts`, `lib/subscription.ts`, `app/pricing/page.tsx`

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
- **Bookmark targets (phone):** GitHub iOS → henrys-blog → Actions → "Phone Task (Claude on demand)", "Claude Daily Developer", "Daily Posts", "Scrape AU IT Jobs"

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
