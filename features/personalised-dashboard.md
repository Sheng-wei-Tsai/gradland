# Feature: Personalised Dashboard Homepage

**Priority:** 🔴 P1 — Retention Engine
**Status:** 🔲 Not started
**Effort:** Medium (3–4 days)
**Started:** —
**Shipped:** —

---

## Problem

Logged-in users land on `/` and see a blog. Their most important next action is never "read a blog post." It is:
- "Nominate your step 3 visa — your employer lodged 2 weeks ago"
- "3 jobs at Atlassian match your data engineer profile"
- "Your TypeScript review is due today"
- "You haven't updated your resume in 14 days — AU job market moves fast"

The homepage has zero awareness of who the user is or what they need. This is the single biggest retention failure.

---

## Goal

**Logged-in users:** `/` becomes a personalised career dashboard. Still shows blog below the fold (good for SEO), but above the fold shows their specific status and next action.

**Logged-out users:** Targeted hero — not generic SaaS copy. Specific, emotional, direct: speaks to the exact pain of being an international grad trying to break into Australian IT.

---

## Logged-In Homepage Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Good morning, Henry.  [avatar]           Readiness: [82 ──●──]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📍 YOUR NEXT ACTION                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔄 Visa Tracker: Step 3 (Nomination) — in progress         │  │
│  │ Your employer typically takes 4–8 weeks. Started 2 Apr.    │  │
│  │ [View tracker →]                              Est: May 2026 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ⚡ TODAY                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐│
│  │ 📚 Review due    │  │ 💼 3 new jobs    │  │ 🎯 Resume        ││
│  │ TypeScript       │  │ matching your    │  │ 14 days old —    ││
│  │ (6 days since    │  │ Data Engineer    │  │ update before    ││
│  │ last review)     │  │ profile          │  │ applying         ││
│  │ [Review →]       │  │ [See jobs →]     │  │ [Analyse →]      ││
│  └──────────────────┘  └──────────────────┘  └──────────────────┘│
│                                                                  │
│  📊 YOUR PROGRESS                                                │
│  Applications: 12  ·  Interviews: 2  ·  Skills mastered: 8/24   │
│  [Full dashboard →]                                              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Latest from the blog                                            │
│  ... (existing blog posts below)                                 │
└──────────────────────────────────────────────────────────────────┘
```

### "Next Action" logic (priority order):
1. **Visa step in progress** — if `visa_tracker.steps[n].status === 'in_progress'`
2. **Skill review due** — if any `skill_progress.next_review_at` < now
3. **Resume stale** — if `resume_analyses` last record > 14 days ago
4. **Jobs matched** — always show (call `/api/jobs` with onboarding role, 3 results)
5. **Complete onboarding** — if `onboarding_completed === false`

Only show the TOP ONE as the hero "next action" card. Others appear in the "Today" strip.

---

## Logged-Out Homepage Layout

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Getting your first IT job in Australia                         │
│   is harder than it should be.                                   │
│                                                                  │
│   We built the tools you actually need:                          │
│   visa tracking, company intel, interview prep,                  │
│   skill paths — all for international grads.                     │
│                                                                  │
│   [Start for free →]          [See how it works ↓]              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  📊 This week's AU IT market                                     │
│  2,847 open roles  ·  Top hiring: Atlassian, Canva, REA Group   │
│  Most in-demand: TypeScript, Python, AWS, Kubernetes             │
├──────────────────────────────────────────────────────────────────┤
│  What you get                                                    │
│  [Resume Analyser]  [Interview Prep]  [Visa Tracker]            │
│  [Gap Engine]       [Learning Paths]  [Salary Checker]          │
├──────────────────────────────────────────────────────────────────┤
│  Latest from the blog ...                                        │
└──────────────────────────────────────────────────────────────────┘
```

The hero headline speaks directly to the emotional pain point. No mention of "AI-powered platform." No corporate language. Direct.

---

## Readiness Score Widget (mini version)

Shown in the top-right of the logged-in header:

```
Readiness: [──────●───] 82
```

Click → expands to breakdown:
```
Resume quality        ████████░░  78%  (analysed 14d ago)
Skill completion      ██████████  94%  (8/24 topics mastered)
Interview practice    ████░░░░░░  40%  (2 sessions, 68% avg score)
Quiz scores           █████████░  88%  (4 videos completed)
```

Full Readiness Score spec: `features/readiness-score.md`

---

## "This Week in AU IT" Stats Strip

A server-rendered strip using cached Supabase aggregates (not live API calls):
- Active open roles (from the last 48h job sync, if implemented)
- Top hiring companies (hardcoded + updated weekly by admin)
- Most in-demand skills (from AU Insights job market data, static)

This makes the logged-out homepage feel alive and data-driven.

---

## Architecture Notes

- The logged-in homepage is a server component that fetches:
  1. `profiles` row — onboarding data, readiness snapshot
  2. `visa_tracker` row — current step status
  3. `skill_progress` — any reviews due today
  4. `resume_analyses` — last analysis date
  - All 4 in a single `Promise.all()` — target <200ms
- The "3 matched jobs" strip is client-side (separate fetch, shown after hydration — doesn't block above-fold)
- The blog posts section is already static (SSG) — unchanged

---

## Files

| File | Change |
|------|--------|
| `app/page.tsx` | Modify — detect auth server-side, render personalised vs public hero |
| `components/PersonalisedHero.tsx` | Create — logged-in dashboard strip |
| `components/PublicHero.tsx` | Create — logged-out targeted hero |
| `components/ReadinessScoreMini.tsx` | Create — header widget |
| `app/api/dashboard/summary/route.ts` | Create — aggregated user status in one call |

---

## Acceptance Criteria

- [ ] Logged-in users see personalised hero above the fold (not blog)
- [ ] "Next action" card is always relevant — never empty
- [ ] Blog posts still appear below the fold for SEO
- [ ] Logged-out users see targeted hero with emotional copy
- [ ] Readiness score mini widget visible in header when logged in
- [ ] Page loads above-the-fold content in < 1s (SSR)
- [ ] Stats strip renders on first paint (no layout shift)
- [ ] Mobile: hero card is full-width, "Today" strip stacks vertically
- [ ] `npm run build` passes
