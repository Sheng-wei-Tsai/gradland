# Feature: Smart Onboarding Flow

**Priority:** 🔴 P1 — Retention Engine
**Status:** 🔲 Not started
**Effort:** Small (1–2 days)
**Started:** —
**Shipped:** —

---

## Problem

Every user who signs up lands on the same homepage — a blog. There is no guidance. They don't know the platform has resume analysis, visa tracking, interview prep specific to Atlassian, or that there are learning paths for Data Engineering. The platform has 20+ features and zero onboarding. The average new user churns within one session because they never discover the tools that would actually help them.

---

## Goal

A 3-question modal (90 seconds) that fires on first login. Answers are stored in `profiles` and used by every other feature to personalise the experience. The user immediately sees a dashboard tailored to their situation — not a generic page.

---

## User Story

> "I just graduated in India with a CS degree and I want to work in Australia as a data engineer. I found this site on Reddit. I sign up and immediately it asks me three questions. I answer them, and the dashboard shows me exactly what I need to do: complete my Visa Tracker step 1, start the Data Engineer learning path, and there are 8 jobs matching my profile. I come back the next day."

---

## The Three Questions

### Question 1 — Target role
```
What IT role are you targeting? (pick one)

[ Frontend Developer ]  [ Full Stack Developer ]  [ Backend Developer ]
[ Data Engineer ]       [ DevOps / Cloud ]         [ QA Engineer ]
[ Mobile Developer ]    [ Something else ]
```
Maps to: `onboarding_role` → pre-selects learning path + interview prep role.

### Question 2 — Visa status
```
What's your current situation in Australia?

[ I'm outside Australia, planning to move ]
[ I have a student visa (500) ]
[ I have a graduate visa (485) ]
[ I have a working visa (482/skilled) ]
[ I'm an Australian resident or citizen ]
[ Not sure / prefer not to say ]
```
Maps to: `onboarding_visa_status` → shows/hides Visa Tracker in dashboard.

### Question 3 — Job search stage
```
Where are you in your job search?

[ Just starting out — building skills ]
[ Actively applying — no offers yet ]
[ Have interviews lined up ]
[ Just received an offer, need to negotiate / navigate visa ]
```
Maps to: `onboarding_job_stage` → determines dashboard priority order.

---

## UI Design

### Modal layout (centred, 480px wide, responsive)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   👋  Welcome to Gradland                    │
│   Let's personalise your experience.                     │
│   3 quick questions · takes 90 seconds                   │
│                                                          │
│  ─────────────────────────────────────  ① ② ③            │
│                                                          │
│   What IT role are you targeting?                        │
│                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │ 🎨 Frontend  │  │ ⚡ Full Stack │  │ 🔧 Backend   │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │ 📊 Data Eng  │  │ ☁️ DevOps    │  │ 📱 Mobile    │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│                             [Skip →]  [Continue →]       │
└──────────────────────────────────────────────────────────┘
```

- Progress dots (3 steps) at top right
- Each option is a clickable card — selected state: terracotta border + background tint
- "Skip →" writes nulls, shows generic dashboard
- Animated transition between questions (slide left)
- On Q3 completion: brief success animation ("You're all set ✓"), redirect to dashboard

### Mobile: full-screen modal, options stack in 2 columns

---

## Database Changes

```sql
-- Add to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_role       text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_visa_status text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_job_stage  text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed  boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
```

---

## API

### `POST /api/onboarding`
Auth required.
```ts
Body: {
  role?:       string;  // 'data-engineer' | 'frontend' | etc.
  visaStatus?: string;  // 'student' | 'graduate' | etc.
  jobStage?:   string;  // 'building' | 'applying' | etc.
}
// Upserts to profiles, sets onboarding_completed = true
```

---

## Trigger Logic

- Fire modal when: `user.onboarding_completed === false` AND user lands on any page (checked in `AuthProvider`)
- After completion: `onboarding_completed = true` — never shown again
- User can re-take from `/dashboard` → "Edit preferences" link
- Guest users: no modal, shown after signup

---

## Downstream Effects (what this unlocks)

| Feature | How it uses onboarding data |
|---------|----------------------------|
| Dashboard | Prioritises cards based on `job_stage` |
| Learning paths | Pre-highlights the path matching `role` |
| Interview Prep | Pre-selects the role matching `onboarding_role` |
| Visa Tracker | Shown prominently if `visa_status` is relevant |
| Gap Engine | Uses `role` as the target for skill gap analysis |
| Readiness Score | Weights components based on `job_stage` |
| Job Search | Pre-fills role keyword based on `onboarding_role` |

---

## Files

| File | Change |
|------|--------|
| `components/OnboardingModal.tsx` | Create — 3-step modal, animated |
| `app/api/onboarding/route.ts` | Create — upsert profiles |
| `components/AuthProvider.tsx` | Modify — trigger modal check on login |
| `supabase/012_onboarding.sql` | Create — add columns to profiles |

---

## Acceptance Criteria

- [ ] Modal fires once on first login — never again after completion
- [ ] All 3 answers saved to `profiles` table
- [ ] Skipping any question is possible (writes null, not blocked)
- [ ] "Edit preferences" link in dashboard reopens the modal
- [ ] Learning path pre-selection works after onboarding
- [ ] Modal is accessible: keyboard navigable, focus trap, ESC to skip
- [ ] Animates between questions smoothly
- [ ] `npm run build` passes
