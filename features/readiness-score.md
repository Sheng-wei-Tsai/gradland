# Feature: Readiness Score

**Priority:** 🔴 P1 — Retention Engine
**Status:** 🔲 Not started
**Effort:** Small (1–2 days)
**Started:** —
**Shipped:** —

---

## Problem

Users complete learning topics, take quizzes, analyse their resume, practice interviews — but there is no single number that answers "how job-ready am I?" Without a measurable goal to chase, users have no daily reason to return to the platform. Duolingo built an empire on streaks. LinkedIn built one on profile completeness. The Readiness Score is our version.

---

## Goal

A 0–100 score visible on the dashboard and homepage that reflects the user's real job-readiness based on actions they have taken on the platform. The score improves as they use the platform. Improving the score correlates with getting a job. The breakdown shows exactly which actions will move the needle.

---

## Score Formula

```
Readiness Score = (Resume × 25%) + (Skills × 25%) + (Interview × 25%) + (Quiz × 25%)
```

### Component 1 — Resume Quality (0–100, weight 25%)
Source: latest `resume_analyses` record.
- Score is the AI analysis score (0–100) from the Resume Analyser
- If no resume uploaded: 0
- If resume > 30 days old: capped at 60 (encourages regular updates)
- If resume > 60 days old: capped at 40

### Component 2 — Skill Completion (0–100, weight 25%)
Source: `skill_progress` table.
```
skill_score = (mastered_skills / total_skills_in_target_path) × 100
```
- Uses the path matching `onboarding_role` (from onboarding)
- If no onboarding_role: uses the path with the most progress
- "Mastered" = `review_count >= 3` (3+ spaced repetition cycles)
- "Completed" = `completed = true` (counts as 60% of a mastered skill)

### Component 3 — Interview Practice (0–100, weight 25%)
Source: `interview_sessions` table (or equivalent progress tracking).
- 0 sessions: 0
- 1 session: 30
- 2–3 sessions: 55
- 4+ sessions: 70
- Average session score ≥ 75%: +15 bonus (capped at 100)
- Sessions in the target role (matching onboarding_role): +10 bonus

### Component 4 — Learning Quizzes (0–100, weight 25%)
Source: `video_progress` table.
- 0 quizzes completed: 0
- 1–2 quizzes: 30
- 3–5 quizzes: 55
- 6+ quizzes: 70
- Average quiz score: weighted in (avg_score / 100) × 30 bonus

---

## Score Bands

| Range | Label | Color | What it means |
|-------|-------|-------|---------------|
| 85–100 | Job Ready | #10b981 green | Apply confidently to target roles |
| 70–84 | Strong Candidate | #22c55e light green | Ready for most applications |
| 55–69 | Getting There | #f59e0b amber | A few key gaps to close |
| 40–54 | Building Foundation | #f97316 orange | Keep working the learning paths |
| 0–39 | Early Stage | #ef4444 red | Focus on skills + resume first |

---

## UI Design

### Dashboard — full widget

```
┌──────────────────────────────────────────────────────────┐
│  Job Readiness Score                                     │
│                                                          │
│         ╭──────────────╮                                 │
│        /    82 / 100    \       Strong Candidate         │
│       │   ████████░░░   │                                │
│        \               /                                 │
│         ╰──────────────╯                                 │
│                                                          │
│  ┌──────────────┬───────────────────────────────────┐   │
│  │ Resume       │ ████████░░  78  (analysed 14d ago) │   │
│  │ Skills       │ ██████████  94  (8/10 mastered)    │   │
│  │ Interviews   │ ████░░░░░░  42  (2 sessions)       │   │
│  │ Quizzes      │ █████████░  85  (6 videos, avg 88%)│   │
│  └──────────────┴───────────────────────────────────┘   │
│                                                          │
│  💡 Boost your score:  [Practice an interview →]         │
└──────────────────────────────────────────────────────────┘
```

The ring gauge uses SVG — no external chart library needed.

### Header mini widget (logged-in only)

```
Readiness  82  ██████████░░
```

Shown in top nav next to avatar. Click → expands to full breakdown (popover).

### Homepage strip

```
Your career status:  Readiness 82/100  ·  Visa Step 3 in progress  ·  8 skills mastered
```

---

## Boost Suggestion Engine

Below the score, always show the ONE action that will increase the score the most:

```ts
function getBestBoostAction(components: ScoreComponents): BoostAction {
  // Find the lowest-scoring component
  // Return specific action to improve it
  const lowest = Object.entries(components).sort((a, b) => a[1] - b[1])[0];
  
  const actions = {
    resume:    { label: 'Analyse your resume', href: '/dashboard/resume-analyser', gain: '+8 pts' },
    skills:    { label: 'Complete next skill topic', href: `/learn/${targetPath}`, gain: '+6 pts' },
    interview: { label: 'Practice an interview session', href: '/interview-prep', gain: '+10 pts' },
    quiz:      { label: 'Take a YouTube learning quiz', href: '/learn/youtube', gain: '+5 pts' },
  };
  
  return actions[lowest[0]];
}
```

---

## Score Persistence

Daily snapshot stored in Supabase — creates a history that can be charted.

```sql
CREATE TABLE IF NOT EXISTS readiness_snapshots (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users NOT NULL,
  score       int NOT NULL,
  resume_score     int,
  skills_score     int,
  interview_score  int,
  quiz_score       int,
  recorded_at      date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, recorded_at)
);
ALTER TABLE readiness_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snapshots" ON readiness_snapshots FOR ALL USING (auth.uid() = user_id);
```

The snapshot is upserted once per day on dashboard load. In the future, a 30-day sparkline chart shows the user's improvement trajectory.

---

## API

### `GET /api/readiness-score`
Auth required.
Returns:
```json
{
  "score": 82,
  "components": {
    "resume":    { "score": 78, "detail": "Analysed 14 days ago" },
    "skills":    { "score": 94, "detail": "8 of 10 topics mastered" },
    "interview": { "score": 42, "detail": "2 sessions, avg 65%" },
    "quiz":      { "score": 85, "detail": "6 videos, avg 88%" }
  },
  "band": "Strong Candidate",
  "boostAction": { "label": "Practice an interview", "href": "/interview-prep", "gain": "+10 pts" }
}
```

One DB call per component (4 queries in `Promise.all()`), cached in Vercel KV for 1 hour.

---

## Files

| File | Change |
|------|--------|
| `app/api/readiness-score/route.ts` | Create — compute score from 4 Supabase queries |
| `components/ReadinessScore.tsx` | Create — full SVG ring widget for dashboard |
| `components/ReadinessScoreMini.tsx` | Create — header strip version |
| `supabase/014_readiness_snapshots.sql` | Create — daily snapshot table |
| `app/dashboard/page.tsx` | Modify — add ReadinessScore widget above career tools |

---

## Acceptance Criteria

- [ ] Score calculated from 4 components, formula documented in code
- [ ] Score displays correctly when some components are zero (new user)
- [ ] Ring gauge renders in SVG (no external library)
- [ ] Score cached 1h in Vercel KV — not recalculated on every dashboard load
- [ ] Daily snapshot stored in Supabase
- [ ] Boost suggestion shows the most impactful action
- [ ] Mini widget shown in nav header for logged-in users
- [ ] Score updates in real-time after completing a learning topic (client-side optimistic update)
- [ ] `npm run build` passes
