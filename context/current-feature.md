# Current Feature: Gamified Interview Prep — Mentor-Led Immersive UX

A Brilliant.org-style interview preparation experience at `/interview-prep`, redesigned around
a **streaming AI mentor character** who guides the user through real-world scenarios instead of
presenting static Q&A cards.

## Status

🟡 In Progress — UX redesign (original card deck replaced with mentor storytelling flow)

## Goals

### Core UX Principle

Every question starts with a **real-world story** before the question is ever asked.
The user is placed inside a scenario at a real Australian tech company. The mentor (Alex)
speaks to them through streaming text — conversational, direct, like a senior dev who
genuinely wants them to get the job.

The journey for each question:

```
SCENE  →  WHY  →  GUIDE  →  PRACTICE  →  DEBRIEF
```

| Stage | What happens | Who speaks | Delivery |
|-------|-------------|------------|----------|
| **SCENE** | Alex sets the real-world context. "You're on day 3 at Canva. Your tech lead drops a ticket..." The question emerges naturally from the story. | Alex (mentor) | Streaming |
| **WHY** | Alex explains why interviewers ask this — what they're actually testing for, what separates a junior from someone who gets hired. | Alex (mentor) | Streaming |
| **GUIDE** | Alex walks through a mental framework for answering — not the answer itself, just how to structure thinking. | Alex (mentor) | Streaming |
| **PRACTICE** | "Your turn." User types their answer in context of the scenario. No timer, no pressure — just write what you'd say. | User | Input |
| **DEBRIEF** | Alex reviews the answer in character — what landed, what was missing, what a great answer adds. Ends with a score and an improved version. | Alex (mentor) | Streaming |

### Alex — The Mentor Persona

- Senior developer, 8 years experience, worked at Atlassian and Canva
- Direct but warm — celebrates effort, never condescending
- Australian context — references real AU companies, visa situations, local market
- Speaks in first person: "I've seen candidates fail this one for a simple reason..."
- Each question has its own scenario, tied to a real company from that role's `companies[]` list

### What Changes vs. Current Implementation

| Current | New |
|---------|-----|
| Static card with `keyPoints[]` bullet list | Alex narrates the concept via streaming |
| Static `exampleAnswer` text block | Alex explains the approach conversationally |
| Cold question presented upfront | Question emerges from a scenario story |
| Score shown as a number | Alex gives scored feedback in character |
| Floating chatbot is separate | Alex IS the experience — chatbot stays as a free-form escape hatch |

### What Stays The Same

- XP system (same values, same levels)
- Supabase progress tracking (unchanged schema)
- Question sidebar with status dots
- Floating chatbot (free-form questions outside the lesson flow)
- Role selector page (`/interview-prep`)
- Auth gating on evaluate endpoint

---

## Implementation Plan

### API Changes

**`app/api/interview/questions/route.ts`** — modify response shape:
```typescript
type InterviewQuestion = {
  id:       string;
  text:     string;           // the bare question
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  scenario: string;           // 2-3 sentence real-world setup for SCENE stage
  // removed: keyPoints, exampleAnswer, whatInterviewersWant
  // those are now streamed by the mentor on demand
};
```

**`app/api/interview/mentor/route.ts`** — NEW endpoint (replaces static content delivery):
- POST `{ role, question, stage, scenario, userAnswer? }`
- Streams Alex's narration for the given stage
- Stage-specific prompts:
  - `scene`: Alex narrates the scenario + reveals the question naturally
  - `why`: Why this question is asked, what it tests
  - `guide`: Mental framework for answering (not the answer)
  - `debrief`: Scored feedback on the user's answer (replaces `/evaluate`)
- Model: `gpt-4o-mini`, streaming
- No auth required on `scene/why/guide`; auth required on `debrief`

**`app/api/interview/chat/route.ts`** — unchanged (free-form mentor chat)

### UI Changes

**`app/interview-prep/[role]/InterviewSession.tsx`** — full redesign:

Each stage has two phases:
1. **Streaming phase** — Alex's text streams in character, word by word
2. **Action phase** — user can proceed, or for practice, type their answer

New stage rendering:
```
┌─────────────────────────────────────────────┐
│  Alex Chen  ·  Senior Dev  ·  ex-Atlassian  │
│  ─────────────────────────────────────────  │
│  [streaming mentor text appears here...]    │
│                                             │
│  [action button / answer input]             │
└─────────────────────────────────────────────┘
```

Mentor text streams with a subtle cursor blink while loading.
"Alex is thinking..." shown with animated dots before stream starts.

---

## Implementation Checklist

- [x] `lib/interview-roles.ts` — 8 role definitions + XP level helpers + STAGE_XP_VALUES
- [x] `supabase/004_interview_prep.sql` — DB migration (run manually in Supabase dashboard)
- [ ] `app/api/interview/questions/route.ts` — updated: leaner shape with `scenario` field
- [ ] `app/api/interview/mentor/route.ts` — NEW: streaming stage narration by Alex
- [ ] `app/api/interview/chat/route.ts` — free-form mentor chat (no auth)
- [ ] `app/interview-prep/page.tsx` — role selector grid (server component)
- [ ] `app/interview-prep/[role]/page.tsx` — route wrapper + metadata
- [ ] `app/interview-prep/[role]/InterviewSession.tsx` — redesigned mentor UX
- [ ] `components/Header.tsx` — add Interview nav link
- [ ] `app/learn/page.tsx` — add cross-promo banner

## Notes

- Questions are always ordered Easy → Medium → Hard (3 Easy, 5 Medium, 2 Hard). Sorted after generation, re-indexed q1–q10.
- All mentor narration is streamed — never shown as a static pre-loaded block
- The `scenario` field in the question is the seed for the SCENE stage; Alex expands on it
- No new npm packages needed
- Follows existing CSS var + inline style pattern — no Tailwind classes

## History

- **2026-03-28** — Feature spec written; `lib/interview-roles.ts` and `supabase/004_interview_prep.sql` created
- **2026-03-30** — UX redesign: replaced static card deck with mentor-led streaming storytelling flow
