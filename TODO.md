# TODO — Henry Blog Feature Backlog

Ordered highest → lowest priority. Maps to specs in `features/`.
Last updated: 2026-04-05

---

## 🏃 Sprint 1 — Ship quality (do this week)

### 1. Sitemap + robots.txt — `features/site-ux.md` ✅
**Why:** Google can't index the site without these. `app/sitemap.ts` and `app/robots.ts` are already untracked in git — check if they're written, wire them in.
- [x] `app/sitemap.ts` — all static pages + blog/digest/githot slugs
- [x] `app/robots.ts` — allow all, Sitemap directive
- [x] Verify `/sitemap.xml` and `/robots.txt` return 200 in production
- [ ] **Manual step:** Set `NEXT_PUBLIC_APP_URL=https://henrys-blog.vercel.app` in Vercel → Settings → Environment Variables (Production only)

### 2. Duplicate post detection — `features/ai-pipelines.md` ✅
**Why:** Cron runs twice a day → duplicate MDX files piling up. 15-minute fix.
- [x] `scripts/run-post.ts` — exits early if any file with today's date prefix exists in `content/posts/`
- [x] `scripts/run-githot.ts` — exits early if `content/githot/${today}.md` exists
- [x] `scripts/run-digest.ts` — exits early if `content/digests/${today}.md` exists
- [ ] **Manual:** Check all three content dirs for existing duplicates and delete them

### 3. Mobile: cover letter page broken at 375px — `features/site-ux.md` ✅
**Why:** Most AU job seekers browse on mobile. The main monetizable feature is unusable on iPhone.
- [x] Two-panel grid → single column stack on ≤ 768px (CSS moved to globals.css)
- [x] Fixed "Generate" bar pinned to bottom of viewport on mobile
- [x] Desktop button hidden on mobile, mobile bar hidden on desktop
- [ ] **Manual:** Test at 375px (iPhone SE) + 430px (iPhone 15 Pro Max) in Chrome DevTools

### 4. Interview prep polish — `features/interview-prep.md` ✅
**Why:** Session progress lost on refresh, score has no context. Breaks trust in the feature.
- [x] Save `completedStages` + `currentIndex` to `localStorage('interview-session-{roleId}')` — already implemented
- [x] Score benchmark bands in debrief (Exceptional / Strong / Interview-ready / Needs work) — already implemented
- [x] `Cmd+Enter` / `Ctrl+Enter` submits answer in PRACTICE stage (text + code)
- [x] Mobile sidebar hidden on ≤768px, progress dots shown — fixed inline `display:none` overriding CSS class

---

## 🔨 Sprint 2 — Higher quality output (next week)

### 5. Upgrade OpenAI model + cover letter polish — `features/resume-cover-letter.md`
**Why:** Currently using `gpt-4o-mini` — you're on OpenAI Pro, upgrade to the latest model on your plan for noticeably better output. Check `platform.openai.com/docs/models` for the current model name before starting.
- [ ] `app/api/cover-letter/route.ts` — upgrade model string, tighten system prompt (AU English, tone, length)
- [ ] `app/api/resume-match/route.ts` — same model upgrade
- [ ] Inline editing of generated cover letter (output textarea becomes editable after streaming completes)
- [ ] Copy button copies the edited version, not the original generated string
- [ ] Test streaming still works after model upgrade

### 6. Learning platform — Supabase sync — `features/learning-platform.md`
**Why:** Logged-in users lose all progress when they switch devices. The DB migration (`skill_progress` table) already exists — just wire up the writes.
- [ ] `PathTracker.tsx` reads initial state from `skill_progress` on mount (auth users)
- [ ] Every checkbox tick → upsert to Supabase
- [ ] `localStorage` kept as fallback for guests
- [ ] `/learn` index shows `X / Y topics` completion per path

### 7. Open Graph images — `features/site-ux.md`
**Why:** LinkedIn shares from the blog show a blank preview. LinkedIn is the primary growth channel for an AU dev blog.
- [ ] `app/opengraph-image.tsx` — default site OG (name + tagline + colour)
- [ ] `app/blog/[slug]/opengraph-image.tsx` — per-post OG with title + date

---

## 🚀 Sprint 3 — New value (week 3)

### 8. Resume Career Coach v1 — `features/resume-career-coach.md`
**Why:** Highest-value new feature. Tools like Jobscan charge $50/month for this. With AU localisation + Claude, you can offer it as part of your paid tier.
- [ ] Resume upload (PDF or paste text)
- [ ] JD input textarea
- [ ] Claude gap analysis → structured report: matched skills, missing skills, specific action items
- [ ] Supabase cache layer (don't re-analyse same JD twice)
- [ ] Gate behind subscription (Pro tier)

### 9. Learning platform — streaks + more paths — `features/learning-platform.md`
**Why:** Streaks turn a checklist into a habit. Once Supabase sync is done (Sprint 2), streaks are a small addition.
- [ ] Daily streak counter in Supabase (`last_active_date` + `streak_days`)
- [ ] Streak display on `/learn` index
- [ ] Data Engineer path (8+ topics)
- [ ] DevOps/Cloud path (8+ topics)

---

## 🟡 Medium Priority (queue for later)

### 10. Blog search + AI badge — `features/blog-content.md`
**Why:** Returning visitors can't find older posts. Growing content = growing need for search.
- [ ] Client-side search/filter on `/blog` (filter by title/tag, no backend needed)
- [ ] "AI-generated" badge on automated digest/githot posts
- [ ] Estimated reading time per post (already have `reading-time` package installed)

### 11. Interview prep — company career links — `features/interview-prep.md`
**Why:** Company pills are decorative. Users expect them to navigate to actual AU careers pages.
- [ ] Map companies to AU careers page URLs in `lib/interview-roles.ts`
- [ ] Pills → `<a target="_blank">` links

### 12. Jobs — working rights filter — `features/job-search.md`
**Why:** 485 visa holders + international grads need to filter for sponsorship-friendly roles.
- [ ] "Full Working Rights Only" toggle → appends to keyword query
- [ ] Filter persisted to localStorage

### 13. AI Pipelines — ArXiv digest + GitHub Hot nav — `features/ai-pipelines.md`
- [ ] `scripts/run-digest.ts` — add ArXiv same-day papers, timeout 10s, fail gracefully
- [ ] GitHub Hot added to header nav

### 14. Post cover images — `features/post-cover-images.md`
- [ ] Auto-select or generate cover images for blog posts in feed

---

## 🌏 Showcase Features (build when foundations are solid)

### 15. Claude Lab — interactive terminal learning — `features/learn-anthropic-claude.md`
**Why:** Flagship showpiece feature — gamified terminal with xterm.js, 15 missions covering Anthropic + Claude Code + AI workflows. High build cost, high wow factor.
- [ ] Install `@xterm/xterm` + `@xterm/addon-fit`
- [ ] `ClaudeLab.tsx` — xterm mount in Next.js Client Component
- [ ] `commandParser.ts` — command state machine
- [ ] `missions.ts` — 15 mission definitions
- [ ] `fakeFs.ts` — fake filesystem for `ls`, `cat`, `pwd`
- [ ] `/api/learn/claude-lab` — Claude API proxy, rate-limited
- [ ] XP / badges / streak system
- [ ] Link from `/learn` page

### 16. Traditional Chinese translation — `features/i18n-zh-tw.md`
**Why:** Serves Taiwanese/HK Brisbane community. ~80 strings, `next-intl` library.
- [ ] Install `next-intl`
- [ ] `messages/en.json` + `messages/zh-TW.json`
- [ ] `LangToggle.tsx` component (mirrors ThemeToggle pattern)
- [ ] Wire into Header + all pages

---

## 🟢 Nice to Have

### 17. Session share card — `features/interview-prep.md`
- [ ] PNG card on interview session complete (role, score, date) → LinkedIn share

### 18. RSS feed — `features/site-ux.md`
- [ ] `app/feed.xml/route.ts` → RSS 2.0 for blog + digests

### 19. Reading progress bar — `features/site-ux.md`
- [ ] Thin scroll-progress bar at top of blog post pages

---

## ✅ Done

- **Job search:** JSearch (Google for Jobs) replaces dead Indeed feed
- **Job search:** Freshness colours (green/amber/red per age)
- **Job search:** Salary range + IT category filters
- **Job search:** localStorage preference persistence
- **Job search:** Save Search → `job_alerts` table + `/api/alerts` CRUD
- **Job search:** One-click Apply → `job_applications` row + "Track it →" toast
- **Job search:** Default search fires on page load (no dead empty state)
- **Job search:** Quick-start pills (Graduate Developer, Junior Full Stack etc.)
- **Dashboard:** Alerts tab (view + delete saved searches)
- **Dashboard:** "Prep for Interview" CTA when application status → interview
- **Interview prep:** Streaming Alex mentor narration + question sidebar
- **About page:** Petcho virtual pet (Claude Code buddy)
- **Site metadata:** Title + description updated for SEO + recruiter trust
- **Auth:** GitHub OAuth + Supabase SSR (proxy.ts replacing middleware.ts)
- **Auth:** Login page — loading states, card layout, Suspense wrapper
- **Mobile nav:** Jobs tab, Me/avatar tab, reorganised More sheet
- **Theme:** Light mode default + localStorage persistence
- **Theme:** Yin-yang rolling animation on toggle (Web Animations API)
- **Theme:** Dropdown tab contrast fixed (CSS variable background)
- **Typography:** h1/h2 consistent Lora serif throughout
- **TamaAussie:** Redesigned as landscape WezTerm-style terminal interface
- **Pre-push quality gate:** `npm run check` hook (npm audit + next build)
- **Features specced:** i18n-zh-tw, learn-anthropic-claude (Claude Lab terminal)

---

## Honest priority rationale

The product has strong bones — job search works, interview prep mostly works, cover letter is live with Stripe gating. The gap between "working" and "professional" is:

1. **SEO** — no indexing = no organic growth (Sprint 1)
2. **Mobile polish** — broken on the device most users have (Sprint 1)
3. **Data quality** — latest OpenAI model > gpt-4o-mini for the core value prop (Sprint 2, staying on OpenAI Pro plan)
4. **Persistence** — progress lost on device switch undermines trust (Sprint 2)
5. **New value** — Resume Career Coach is the next monetizable feature (Sprint 3)
