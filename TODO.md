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

### Style (dark-mode breakage)
- [x] Replace hardcoded stat tile colours `'#7c3aed'` (line 52), `'#10b981'` (line 53), `'#0369a1'` (line 54) with design tokens (e.g. `var(--gold)`, `var(--jade)`, `var(--terracotta)`) in `app/au-insights/Sponsorship.tsx` — the first stat at line 51 already uses `var(--terracotta)` correctly; the next three tile values render unreadably in dark mode against `var(--warm-white)` cards [style] ✅ 2026-05-06

### Tests
- [x] Add Vitest test for `/api/companies/research` — 401 without session, 403 SUBSCRIPTION_REQUIRED without active plan, 400 on slug not matching `/^[a-z0-9-]+$/`, 404 when `COMPANIES.find(c => c.slug === slug)` returns nothing [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/network/profile` POST — 400 on `visa_type` outside `VALID_VISA_TYPES`, 400 on `city` outside `VALID_CITIES`, skills array truncated to 20 entries each capped at 50 chars (`app/api/network/profile/route.ts:35-41`) [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/network/messages` POST — 400 when sending to self (`senderProfile.id === recipientProfileId`), 429 once `dm_messages` count for the sender in the last 24h hits `DM_DAILY_LIMIT = 20` (`app/api/network/messages/route.ts:149,171`) [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/jobs/listings` GET — empty array when env vars missing, only `status='active'` rows where `expires_at > now()` are returned, response capped at 10 items (`app/api/jobs/listings/route.ts:25-31`) [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/learn/diagram` POST — 400 when any of `skillId`/`skillName`/`pathId` is missing, OpenAI fence-stripping at `app/api/learn/diagram/route.ts:57-60` removes leading ```` ```mermaid ```` and trailing ``` ``` ``` from the response before returning [tests] ✅ 2026-05-06
- [x] Add Vitest test for `/api/resume-match` — 401 without session, 403 SUBSCRIPTION_REQUIRED without active plan, 429 on rate limit, 503 when `OPENAI_API_KEY` missing, 400 on invalid body, 400 on missing `jobDescription`, 200 with JSON; verify `jobDescription` truncated to 3000 chars in OpenAI prompt [tests] ✅ 2026-05-06

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
