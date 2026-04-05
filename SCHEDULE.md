# Henry Blog — Product Roadmap & Daily Schedule

**PM:** Claude (Senior PM mode)
**Developer:** Henry Tsai (solo)
**Assumption:** 4–5 focused hours per day. Adjust if you have less — compress the tasks, don't skip the testing days.
**Start date:** 2026-04-07 (Monday)

> **Rule:** Finish each day's task before starting the next. Half-done features are worse than not started. When in doubt, ship less and ship it properly.

---

## Sprint 1 — Ship Quality
**Goal:** Fix the cracks that make the product feel unfinished to a real user.
**Duration:** Mon 7 Apr → Fri 11 Apr

---

### Mon 7 Apr — SEO foundations
**Est. effort:** 2–3 hours

`app/sitemap.ts` and `app/robots.ts` are already untracked in git — they may already be written. Check first, then wire in.

- [ ] Check if `app/sitemap.ts` + `app/robots.ts` exist and are correct
- [ ] If not written: `sitemap.ts` should include all static routes + dynamic blog/digest/githot slugs
- [ ] `robots.ts` — allow all crawlers, add `Sitemap:` directive pointing to production URL
- [ ] Run `npm run check` locally — verify `/sitemap.xml` and `/robots.txt` return 200
- [ ] Deploy and verify on production Vercel URL

**Done when:** Google Search Console can fetch your sitemap without errors.

---

### Tue 8 Apr — Duplicate post detection + pipeline cleanup
**Est. effort:** 1–2 hours (quick win, don't over-engineer)

- [ ] `scripts/run-post.ts` — add `if (existsSync(filepath)) { console.log('already exists, skipping'); process.exit(0); }` guard at top before any API calls
- [ ] `scripts/run-digest.ts` — same guard pattern
- [ ] `scripts/run-githot.ts` — same guard pattern
- [ ] Run each script twice locally, confirm second run exits cleanly with no duplicate file
- [ ] Check `content/posts/` for any existing duplicates, delete them manually

**Done when:** Running any pipeline script twice produces exactly one output file.

**Remaining time today:** Start reading `app/cover-letter/page.tsx` for tomorrow's mobile fix.

---

### Wed 9 Apr — Mobile cover letter fix
**Est. effort:** 3–4 hours

- [ ] Read the current `app/cover-letter/page.tsx` fully before touching anything
- [ ] Identify the two-column grid container — replace with CSS that stacks at ≤ 768px
- [ ] Input panel goes on top, output panel below on mobile
- [ ] "Generate Cover Letter" button: sticky at bottom of viewport on mobile (`position: sticky` or fixed bar)
- [ ] Test at 375px (iPhone SE), 390px (iPhone 15), 430px (iPhone 15 Pro Max) in Chrome DevTools
- [ ] Test at 768px (iPad portrait) — should be single column
- [ ] Test at 1024px+ — must still be side-by-side (desktop unchanged)
- [ ] `npm run check`

**Done when:** You can generate a cover letter comfortably on an iPhone SE without horizontal scrolling.

---

### Thu 10 Apr — Interview prep: session persistence + score benchmarks
**Est. effort:** 3–4 hours

- [ ] Read `app/interview-prep/[role]/InterviewSession.tsx` fully before touching
- [ ] Save `completedStages` + `currentQuestionIndex` to `localStorage('interview-session-{roleId}')` on every state change
- [ ] On mount: restore from localStorage if key exists (resume from where they left off)
- [ ] Clear localStorage key when session is fully complete
- [ ] Add score benchmark bands to the DEBRIEF display:
  - 0–39 → "Needs more prep — review the material and try again"
  - 40–59 → "Getting there — you understand the concepts but need more depth"
  - 60–74 → "Interview-ready — solid answer, a few gaps to tighten"
  - 75–89 → "Strong — confident and well-structured"
  - 90–100 → "Excellent — you nailed it"
- [ ] Test: answer a question, close tab, reopen → progress restored
- [ ] Test: complete session → localStorage key cleared

**Done when:** Closing and reopening the browser tab doesn't lose your place.

---

### Fri 11 Apr — Interview prep: keyboard shortcut + mobile sidebar + Sprint 1 QA
**Est. effort:** 2–3 hours work + 1 hour QA

**Morning — finish interview prep:**
- [ ] `Cmd+Enter` (Mac) + `Ctrl+Enter` (Windows/Linux) submits answer in PRACTICE stage — add `onKeyDown` handler to the textarea
- [ ] Mobile sidebar at 375px: show progress dots only (not full question text labels)
- [ ] Test full session end-to-end on mobile

**Afternoon — Sprint 1 QA:**
- [ ] Walk through every feature touched this week as a fresh user would
- [ ] `/sitemap.xml` works in production
- [ ] Cover letter on iPhone SE — no broken layout
- [ ] Interview session survives tab close/reopen
- [ ] Score shows benchmark band
- [ ] `Cmd+Enter` submits
- [ ] `npm run check` passes clean
- [ ] **Deploy to production**

**Done when:** Sprint 1 is live on Vercel and you'd be comfortable sharing the URL with a recruiter.

---

## Sprint 2 — Higher Quality Output
**Goal:** The core AI features produce better results and data doesn't disappear between devices.
**Duration:** Mon 14 Apr → Fri 18 Apr

---

### Mon 14 Apr — Upgrade OpenAI model + cover letter polish
**Est. effort:** 2–3 hours

> Keeping OpenAI — you're on Pro plan, use the allocation. Just upgrade the model string.
> Check `platform.openai.com/docs/models` for the latest model name before starting.

- [ ] Read `app/api/cover-letter/route.ts` fully
- [ ] Find the model string (currently `gpt-4o-mini`) — upgrade to latest available OpenAI model on your plan (e.g. `gpt-4o`, `gpt-4.1-mini`, or whatever is current — verify at platform.openai.com/docs/models)
- [ ] Tighten the system prompt — be explicit about tone, length, AU English spelling
- [ ] Test streaming still works after model upgrade
- [ ] Test edge cases: empty JD, very long JD, special characters
- [ ] `npm run check`

**Done when:** Cover letter output is noticeably better quality than before.

---

### Tue 15 Apr — Upgrade resume match model + inline editing
**Est. effort:** 3–4 hours

- [ ] Read `app/api/resume-match/route.ts` fully
- [ ] Upgrade model string to match cover letter route
- [ ] Test resume match end-to-end with a real job description
- [ ] Cover letter page: add inline editing of the generated letter — output `<textarea>` is `readOnly` during streaming, becomes editable when stream completes
- [ ] Copy button copies the current edited value, not the original generated string
- [ ] `npm run check`

**Done when:** You can generate a cover letter, edit a sentence, and copy the edited version.

---

### Wed 16 Apr — Learning platform: Supabase sync (read path)
**Est. effort:** 3–4 hours

- [ ] Read `components/PathTracker.tsx` (or wherever progress is stored) fully
- [ ] Read `supabase/003_auth_and_learn.sql` — understand the `skill_progress` table schema
- [ ] On component mount (if user is logged in): fetch user's `skill_progress` rows from Supabase for this path
- [ ] Merge Supabase state with localStorage state (Supabase wins on conflict)
- [ ] If user is not logged in: fall through to localStorage as before
- [ ] Test: log in, check a topic, log out, log in on a different browser — progress should be there

---

### Thu 17 Apr — Learning platform: Supabase sync (write path) + progress %
**Est. effort:** 3–4 hours

- [ ] Every checkbox tick → upsert to `skill_progress` (if logged in)
- [ ] Upsert should be non-blocking — don't await on the checkbox click, fire-and-forget with error logging
- [ ] `/learn` index page: show completion count per path — `X / Y topics` pulled from Supabase (auth) or localStorage (guest)
- [ ] Test full flow: log in → check topics → refresh → topics still checked → check on mobile → same state
- [ ] `npm run check`

---

### Fri 18 Apr — Open Graph images + Sprint 2 QA + deploy
**Est. effort:** 2–3 hours work + 1 hour QA

**Morning — OG images:**
- [ ] `app/opengraph-image.tsx` — default site OG: name, tagline, terracotta/brown colour scheme, no external fonts (use system fonts for Edge runtime)
- [ ] `app/blog/[slug]/opengraph-image.tsx` — per-post OG: post title, date, "henrytsai.dev" label
- [ ] Test by pasting a blog URL into [opengraph.xyz](https://www.opengraph.xyz) or LinkedIn post inspector

**Afternoon — Sprint 2 QA + deploy:**
- [ ] Cover letter generates with Claude (check network tab — should hit `/api/cover-letter`)
- [ ] Edited cover letter copies correctly
- [ ] Learning progress syncs across two browsers when logged in
- [ ] OG image previews correctly on LinkedIn
- [ ] `npm run check` passes
- [ ] **Deploy to production**

---

## Sprint 3 — New Value
**Goal:** Ship the next monetizable feature. Make the learning platform habit-forming.
**Duration:** Mon 21 Apr → Fri 25 Apr

---

### Mon 21 Apr — Resume Career Coach: DB + API skeleton
**Est. effort:** 3–4 hours

- [ ] Read `features/resume-career-coach.md` fully before writing a line of code
- [ ] Write + run DB migration: `supabase/009_resume_coach.sql` — table for cached JD analyses
- [ ] `app/api/resume-coach/route.ts` — skeleton: accepts `{ resumeText, jobDescription }`, returns structured JSON
- [ ] Design the Claude prompt: return structured JSON with `{ matchedSkills[], missingSkills[], actionItems[], overallScore, summary }`
- [ ] Test prompt in Claude.ai first — iterate until output is clean and structured
- [ ] Wire up the API route with the finalised prompt

---

### Tue 22 Apr — Resume Career Coach: streaming analysis
**Est. effort:** 3–4 hours

- [ ] Switch to streaming response so the user sees analysis appear progressively
- [ ] Parse structured sections as they stream (or stream as markdown, format on complete)
- [ ] Add rate limiting: max 5 analyses per user per day (don't let the Anthropic bill blow out)
- [ ] Add Supabase cache: if same JD hash + same resume hash → return cached result, skip Claude call
- [ ] Test with 3 different resume + JD combinations
- [ ] Verify cached result is returned on second identical request

---

### Wed 23 Apr — Resume Career Coach: frontend UI
**Est. effort:** 4–5 hours

- [ ] `/resume` page — read current page first, understand what exists
- [ ] Two inputs: resume text (textarea, large) + job description (textarea, large)
- [ ] "Analyse Match" button → shows streaming output
- [ ] Output sections: Overall Score (big number) → Matched Skills → Missing Skills → Action Items
- [ ] Each Action Item should be specific: "Add 'Docker' to your skills section", not "improve your skills"
- [ ] Mobile: inputs stack, output below, button sticky
- [ ] Gate behind subscription check (reuse `requireSubscription()` pattern from cover letter)

---

### Thu 24 Apr — Resume Career Coach: polish + gate + Sprint 3 partial deploy
**Est. effort:** 3 hours work + 1 hour QA

- [ ] Unauthenticated users → prompt to sign in
- [ ] Non-subscribed users → show paywall with Stripe checkout link
- [ ] Save analysis history to Supabase (last 10, shown in a history dropdown — same pattern as cover letter)
- [ ] Test the full paid flow: sign up → subscribe → analyse → see result → second identical request hits cache
- [ ] `npm run check`

---

### Fri 25 Apr — Learning streaks + Data Engineer path + Sprint 3 QA + deploy
**Est. effort:** 3–4 hours

- [ ] Add `streak_days` + `last_active_date` to `profiles` (migration)
- [ ] Update Supabase sync: on any skill progress write, if `last_active_date` ≠ today → increment streak, update `last_active_date`
- [ ] Show streak on `/learn` page header: "🔥 5 day streak"
- [ ] Write Data Engineer path in `lib/skill-paths.ts` (8 topics: SQL → Python → Spark → dbt → Airflow → Cloud Storage → Data Modelling → Portfolio Project)
- [ ] `npm run check`
- [ ] **Deploy Sprint 3 to production**

---

## Sprint 4 — Polish + Medium Priority Items
**Duration:** Mon 28 Apr → Fri 2 May

| Day | Task | Est. |
|-----|------|------|
| Mon 28 Apr | Blog search (client-side filter on `/blog`) + reading time display | 3h |
| Tue 29 Apr | Company career links on interview prep role cards | 2h |
| Tue 29 Apr | Working rights filter on jobs page | 2h |
| Wed 30 Apr | DevOps/Cloud learning path (8 topics) | 3h |
| Thu 1 May | OG images for digest + githot pages | 2h |
| Thu 1 May | RSS feed (`/feed.xml`) | 2h |
| Fri 2 May | QA sprint 4 items + deploy | 3h |

---

## Sprint 5 — Claude Lab Terminal (Showcase Feature)
**Duration:** Mon 5 May → Fri 16 May (2 weeks)

> This is the biggest build. Only start when Sprints 1–4 are done and the foundations are solid.

| Day | Task |
|-----|------|
| Mon 5 May | Install xterm.js, verify it mounts in Next.js Client Component |
| Tue 6 May | `ClaudeLab.tsx` — terminal renders, accepts input, echoes output |
| Wed 7 May | `commandParser.ts` — `help`, `missions`, `clear`, `status` |
| Thu 8 May | `fakeFs.ts` — `ls`, `cat`, `pwd` with educational content |
| Fri 9 May | Write missions 01–05 (Prompt Engineering track) |
| Mon 12 May | `/api/learn/claude-lab` — Claude API proxy, rate-limited |
| Tue 13 May | Wire `claude --system "..." --message "..."` command → real Claude call |
| Wed 14 May | Write missions 06–10 (Claude Code track) |
| Thu 15 May | Write missions 11–15 (AI Workflows track) + XP/badge/streak system |
| Fri 16 May | `/learn/claude` page (XP bar + badge grid framing the terminal) + link from `/learn` + full QA + deploy |

---

## Sprint 6 — i18n Traditional Chinese
**Duration:** Mon 19 May → Wed 21 May (3 days)

| Day | Task |
|-----|------|
| Mon 19 May | Install `next-intl`, set up `NextIntlClientProvider`, create `messages/en.json` with all ~80 strings |
| Tue 20 May | Create `messages/zh-TW.json` (translate all strings — use Claude, then verify with a native speaker) |
| Wed 21 May | Build `LangToggle.tsx`, wire into Header, test all pages, deploy |

---

## Key rules to keep the schedule real

1. **Don't start a new sprint until the previous one is deployed.** Half-finished sprints mean regressions you'll debug for weeks.

2. **`npm run check` before every end-of-day commit.** The pre-push hook will enforce it anyway, but don't leave yourself with a broken build overnight.

3. **If a task takes longer than estimated, drop the last item of that sprint** — don't compress QA days. QA is not optional.

4. **Each sprint ends with a production deploy.** Not "almost ready". Deployed, URL shared, tested on the real Vercel environment.

5. **Don't jump ahead to Claude Lab** until Sprints 1–3 are shipped. It's tempting but the foundations (mobile, SEO, Claude migration, data persistence) are what make the product trustworthy.

---

## Progress tracker

| Sprint | Target date | Status |
|--------|-------------|--------|
| Sprint 1 — Ship quality | Fri 11 Apr | ✅ Done |
| Sprint 2 — Higher quality output | Fri 18 Apr | 🔲 Not started |
| Sprint 3 — New value | Fri 25 Apr | 🔲 Not started |
| Sprint 4 — Polish | Fri 2 May | 🔲 Not started |
| Sprint 5 — Claude Lab terminal | Fri 16 May | 🔲 Not started |
| Sprint 6 — i18n | Wed 21 May | 🔲 Not started |
