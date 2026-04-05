# Feature: Learn with IBM — AI-Powered Video Learning

## Overview

A "Learn with IBM" section inside the `/learn` tab. Users browse IBM Technology YouTube videos, pick one, and the app:
1. Fetches the video's transcript
2. Uses Claude to break it down into a structured study guide (key concepts, why they matter, code/architecture notes)
3. Runs an interactive quiz to test retention
4. Saves progress to Supabase so it persists across devices

The experience is a Claude-powered NotebookLM equivalent — built into the blog with no external sign-in required.

---

## Why IBM Technology

- Channel ID: `UCKWaEZ-_VweaEx1j62do_vQ`
- High-signal, jargon-free explanations of cloud, AI, DevOps, and distributed systems
- Videos are 5–15 min — right length for a study session
- Transcript coverage is near-100% (auto-captions)
- Directly relevant to Australian IT job seekers targeting enterprise roles (IBM, AWS, Atlassian, banks)

---

## Architecture

### Data flow

```
/learn/ibm
  → YouTube Data API v3 (videos.list, playlistItems.list)
  → Display video grid
  → User picks video
  → /api/learn/transcript?videoId=xxx
      → youtube-transcript npm package (unofficial but reliable)
      → fallback: YouTube captions.download() with OAuth (future)
  → /api/learn/analyse (POST, streams)
      → Claude claude-sonnet-4-6
      → Returns study guide JSON + markdown
  → /api/learn/quiz (POST)
      → Claude generates 5 MCQ questions from the study guide
  → /api/learn/progress (POST)
      → Supabase `video_progress` table
```

### Environment variables needed

```env
YOUTUBE_API_KEY=        # YouTube Data API v3 key (Google Cloud Console, free tier)
# ANTHROPIC_API_KEY already present
```

No new paid services. YouTube Data API free quota: 10,000 units/day — well within limits.

---

## Database

```sql
-- Migration: 006_video_learning.sql

create table if not exists public.video_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  video_id    text not null,
  video_title text not null,
  channel     text not null default 'ibm',
  -- study guide cached so we don't re-analyse on every visit
  study_guide jsonb,
  -- quiz results
  quiz_score  int,        -- 0-100
  quiz_taken  boolean not null default false,
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, video_id)
);

alter table public.video_progress enable row level security;
create policy "own progress" on public.video_progress
  for all using (auth.uid() = user_id);
```

---

## API Routes

### `GET /api/learn/videos?channel=ibm&page=1`

- Calls YouTube Data API `playlistItems.list` on the channel's uploads playlist
- Returns `{ videos: [{ id, title, thumbnail, duration, publishedAt, description }], nextPageToken }`
- Server-side cache: `next: { revalidate: 3600 }` (1 hour)

### `GET /api/learn/transcript?videoId=xxx`

- Uses `youtube-transcript` npm package
- Returns `{ transcript: string }` (plain text, stripped of timestamps)
- Truncates to 12,000 chars (sufficient for Claude's analysis)
- If transcript unavailable → `{ error: 'No transcript available' }`

### `POST /api/learn/analyse`

Request: `{ videoId, videoTitle, transcript }`

Response: streaming text/event-stream (SSE)

Claude prompt produces a structured study guide:
```json
{
  "summary": "2-3 sentence plain English overview",
  "keyConceptes": [
    { "term": "Kubernetes", "definition": "...", "whyMatters": "..." }
  ],
  "coreInsights": ["insight 1", "insight 2", "insight 3"],
  "architectureDiagram": "ASCII or mermaid diagram if relevant",
  "australianContext": "How this applies to AU market / job requirements",
  "studyTips": ["tip 1", "tip 2"]
}
```

Caches result to `video_progress.study_guide` in Supabase (authenticated users only).

### `POST /api/learn/quiz`

Request: `{ videoId, studyGuide }`

Claude generates 5 multiple-choice questions:
```json
{
  "questions": [
    {
      "q": "What does a service mesh primarily solve?",
      "options": ["A. Database scaling", "B. Service-to-service communication", "C. Frontend rendering", "D. CI/CD pipelines"],
      "answer": 1,
      "explanation": "A service mesh handles..."
    }
  ]
}
```

### `POST /api/learn/progress`

Request: `{ videoId, videoTitle, quizScore?, completed? }`

Upserts to `video_progress`. Auth required — graceful no-op for guests (progress stored in localStorage instead).

---

## Frontend: `/learn/ibm`

### Layout

```
/learn (existing tabs: Junior Frontend, Junior Full Stack, Junior Backend)
  + new tab: "Learn with IBM 🎥"
```

Or: add a new route `/learn/ibm` linked from the Learn page.

**Recommended**: separate route `/learn/ibm` with its own page, linked from `/learn` with a prominent card. This keeps the existing learning path component untouched.

### `/learn/ibm` page structure

```
Hero header
  "Learn Cloud, AI & DevOps — with IBM"
  "Pick a video → get a study guide → take the quiz"

Video grid (3-col desktop, 1-col mobile)
  Each card: thumbnail, title, duration, "Start Learning →" button
  Completed videos: green tick + score badge
  Load More button (pagination)

[When user selects a video]
  Video embed (YouTube iframe)
  
  Tabs: "Study Guide" | "Quiz" | "My Notes"

  Study Guide tab:
    Summary paragraph
    Key Concepts (accordion or card list)
    Core Insights (bullet list)
    Architecture diagram (if present)
    Australian Context callout box

  Quiz tab:
    "Test your knowledge" — 5 MCQ questions
    Instant feedback per question (green/red)
    Final score + "Share on LinkedIn" CTA (nice-to-have)
    Retry button

  My Notes tab:
    Textarea — user's personal notes (saved to localStorage/Supabase)
```

### Guest vs authenticated UX

| Action | Guest | Authenticated |
|--------|-------|---------------|
| Browse videos | ✅ | ✅ |
| View study guide | ✅ (re-generated each visit) | ✅ (cached in DB) |
| Take quiz | ✅ (score not saved) | ✅ (score + completion saved) |
| Progress badges on grid | ❌ | ✅ |
| Notes | localStorage only | Supabase sync |

---

## Implementation Steps

### Step 1 — Database
Run `supabase/006_video_learning.sql`

### Step 2 — YouTube API wrapper
`app/api/learn/videos/route.ts` — fetches IBM Tech uploads playlist with 1h cache

### Step 3 — Transcript endpoint
`app/api/learn/transcript/route.ts` — `npm install youtube-transcript`

### Step 4 — Analysis endpoint (streaming)
`app/api/learn/analyse/route.ts` — Claude streaming, saves to Supabase on completion

### Step 5 — Quiz endpoint
`app/api/learn/quiz/route.ts` — Claude JSON quiz generation

### Step 6 — Progress endpoint
`app/api/learn/progress/route.ts` — upsert to Supabase

### Step 7 — Frontend
`app/learn/ibm/page.tsx` — video grid + study session UI

### Step 8 — Link from `/learn`
Add IBM card to `app/learn/page.tsx`

---

## Package additions

```bash
npm install youtube-transcript
```

`youtube-transcript` (MIT, 200k weekly downloads) — no API key needed, uses YouTube's auto-caption endpoint.

---

## Honest constraints

- **Transcript quality**: auto-captions on IBM videos are excellent but not perfect. Claude will handle minor errors gracefully.
- **NotebookLM API**: Google does not offer a public NotebookLM API. This feature delivers the same value (transcript → structured notes → quiz) using Claude, which is already paid for.
- **youtube-transcript**: unofficial package using YouTube's internal caption endpoint. If YouTube blocks it, fallback is YouTube Data API captions with OAuth.
- **Rate limiting**: `/api/learn/analyse` and `/api/learn/quiz` should be rate-limited to 10 calls/user/hour to prevent Claude cost blowout.

---

## Success metrics

- User opens a video → study guide loads in < 8s
- Quiz completion rate > 60% (people who start finish it)
- Return visit: users come back to check completed videos

---

## Future

- Add more channels: **Fireship**, **Theo (t3.gg)**, **TechWorld with Nana** (DevOps)
- "Study streak" — consecutive days learning → Supabase streak counter
- AI-generated flashcards (Anki-style)
- "Ask a question about this video" — chat interface against the study guide
