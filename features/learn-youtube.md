# Feature: YouTube Video Learning — AI Study Guide + NotebookLM

## Vision

A learning platform embedded in the blog where any YouTube video becomes a structured study session. Paste a URL, pick from curated channels, or search — and the app generates a study guide, tests your knowledge, and bridges you into NotebookLM for open-ended exploration.

Two AI layers:
- **Gemini 1.5 Flash** (same AI that powers NotebookLM) — analyses the video directly from its YouTube URL, no transcript scraping needed. Produces the study guide and quiz.
- **NotebookLM** — a "deep dive" escape hatch. One click copies the URL and opens NotebookLM so the user can ask follow-up questions, request audio overviews, and explore further.

This is the closest thing to a NotebookLM API integration that is technically possible today.

---

## Routes

| Route | Purpose |
|-------|---------|
| `/learn/youtube` | Home — paste URL, search, or browse curated channels |
| `/learn/youtube/[videoId]` | Study session — guide + quiz + NotebookLM panel |

The existing `/learn` page gets a featured card linking to `/learn/youtube`.

---

## User Flows

### Flow A — Paste any YouTube URL (primary)

```
User lands on /learn/youtube
  ↓
Pastes a YouTube URL (any video on YouTube)
  ↓
App extracts videoId, fetches metadata via YouTube Data API
  (title, channel, thumbnail, duration, description)
  ↓
Navigates to /learn/youtube/[videoId]
  ↓
Gemini 1.5 Flash analyses the video directly via YouTube URL
  (multimodal — watches video, reads on-screen code/diagrams, hears audio)
  ↓
Study guide streams in:
  • Summary (3-4 sentences)
  • Key Concepts (term + definition + why it matters for AU IT jobs)
  • Core Insights (top 5 things to remember, priority ordered)
  • Architecture / Diagram notes (if present on screen)
  • AU Market Context (how this maps to job ads, enterprise tech, frameworks used locally)
  • Study tips (3 actionable things to do after watching)
  ↓
User reads guide, then clicks "Test my knowledge" tab
  ↓
Gemini generates 5 MCQ questions from the guide
  ↓
User takes quiz — instant feedback + explanation per question
  ↓
Score saved to Supabase (authenticated users) or localStorage (guests)
  ↓
"Deep dive in NotebookLM →" panel visible throughout
```

### Flow B — Browse curated channels

```
User lands on /learn/youtube
  ↓
Selects a curated channel (IBM Technology, Fireship, ByteByteGo, etc.)
  ↓
Channel video grid loads (YouTube Data API, cached 1h)
  ↓
Videos show completion badges + quiz scores for signed-in users
  ↓
User clicks a video → same study session flow as Flow A
```

### Flow C — NotebookLM deep dive

```
At any point during a study session:
  ↓
User clicks "Deep dive in NotebookLM →"
  ↓
Panel slides in:
  • YouTube URL shown with "Copy" button
  • Step-by-step: "1. Open NotebookLM  2. Click + Add Source  3. Paste URL"
  • 6 ready-to-use prompts the user can copy-paste into NotebookLM chat:
      "Summarise the 3 most important concepts from this video"
      "Quiz me on this video with 10 questions"
      "Explain [key concept from guide] as if I'm a junior developer"
      "What are real-world use cases for what's described in this video?"
      "Create flashcards for all the key terms"
      "How does this technology compare to alternatives used in Australian IT?"
  • "Open NotebookLM" button (opens notebooklm.google.com in new tab)
```

### Flow D — Search (future, v2)

```
User types a topic ("kubernetes", "react server components", "system design")
  ↓
YouTube Data API search returns relevant results
  ↓
User picks a video → same study session flow
```

---

## AI: Gemini Integration

### Why Gemini, not Claude

- Gemini 1.5 Flash accepts a YouTube URL directly as a multimodal input — it watches the video, reads slides/diagrams/code on screen, and hears the audio. No transcript extraction needed.
- This is the exact same model powering Google NotebookLM under the hood.
- Free tier: 1,500 requests/day (Flash), generous for a personal blog.
- Cost if over free tier: ~$0.075/1M input tokens — essentially free at blog traffic volumes.

### API call shape

```typescript
// POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
{
  "contents": [{
    "parts": [
      {
        "file_data": {
          "mime_type": "video/mp4",
          "file_uri": "https://www.youtube.com/watch?v={videoId}"
        }
      },
      { "text": "Analyse this video and produce a study guide as JSON: ..." }
    ]
  }]
}
```

### Study guide prompt (system)

```
You are a technical educator helping an Australian developer learn from YouTube videos.
Your study guides are practical, concrete, and immediately useful.
You reference real content visible or audible in the video — do not make things up.
Return a JSON object only — no markdown wrapper, no preamble.
```

### Study guide JSON schema

```json
{
  "summary": "3-4 sentence plain English overview of what this video teaches and who it's for",
  "essay": "250-300 word professional flowing prose summary. Key technical terms wrapped in **double asterisks** (renders bold). Structured as: (1) opening — what this video teaches and who it is for, (2) body — the 3-4 most important points with evidence, (3) closing — why this matters for a developer's career. No headers, no bullet points.",
  "keyConcepts": [
    {
      "term": "Service Mesh",
      "definition": "A dedicated infrastructure layer for service-to-service communication",
      "example": "Istio managing traffic between microservices in a Kubernetes cluster",
      "whyMatters": "Appears in senior DevOps/platform engineer job ads at companies like Atlassian and REA Group"
    }
  ],
  "sections": [
    { "title": "section title", "timestamp": "0:00 – 3:20", "summary": "what this section covers" }
  ],
  "useCases": [
    { "scenario": "real-world scenario", "description": "how the topic applies", "industry": "Fintech" }
  ],
  "coreInsights": ["Most important insight", "Second", "Third", "Fourth", "Fifth"],
  "architectureNote": "Description of any diagram or architecture shown — or null",
  "australianContext": "1-2 sentences on AU market relevance",
  "studyTips": ["tip 1", "tip 2", "tip 3"],
  "videoType": "tutorial | explainer | deep-dive | talk | demo",
  "audioScript": "~750 word spoken-word narration (no headers/bullets)",
  "infographic": {
    "title": "punchy title",
    "tagline": "one-line summary",
    "palette": "blue | green | purple | orange | teal",
    "stats": [{ "value": "69%", "label": "label", "icon": "emoji" }],
    "flow": [{ "step": "step name", "detail": "1 sentence" }],
    "keyPoints": ["point 1", "point 2"]
  }
}
```

### Quiz prompt

```
Based on this study guide, create 5 multiple choice questions.
Mix difficulty: 2 recall, 2 comprehension, 1 application.
Return JSON: { "questions": [{ "q": "...", "options": ["A..","B..","C..","D.."], "answer": 0, "explanation": "..." }] }
```

---

## Curated Channels

Selected for quality, AU relevance, and transcript coverage:

| Channel | ID | Focus |
|---------|----|-------|
| IBM Technology | UCKWaEZ-_VweaEx1j62do_vQ | Cloud, AI, DevOps fundamentals |
| Fireship | UCsBjURrPoezykLs9EqgamOA | Fast practical web dev |
| ByteByteGo | UCZgt6AzoyjslHTC9dz0UoTw | System design (interview-critical) |
| TechWorld with Nana | UCdngmbVKX1Tgre699-XLlUA | Kubernetes, Docker, CI/CD |
| Theo (t3.gg) | UCbRP3c757lWg9M-U7TyEkXA | TypeScript, React, modern web |
| Hussein Nasser | UC_ML5xP23TOWKUcc-oAE_Eg | Backend, networking, DB fundamentals |

More can be added by config — no code change required.

---

## Database

```sql
-- Migration: 006_video_learning.sql

create table if not exists public.video_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  video_id      text not null,
  video_title   text not null,
  channel_name  text,
  thumbnail_url text,
  -- cached so we don't re-analyse on every visit (Gemini call = ~2s + cost)
  study_guide   jsonb,
  -- quiz
  quiz_score    int,
  quiz_taken    boolean not null default false,
  completed     boolean not null default false,
  -- timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, video_id)
);

alter table public.video_progress enable row level security;
create policy "own video progress" on public.video_progress
  for all using (auth.uid() = user_id);

-- Index for dashboard "recently studied" query
create index on public.video_progress(user_id, updated_at desc);
```

---

## API Routes

### `GET /api/learn/video-meta?videoId=xxx`

Fetches video metadata from YouTube Data API v3.

Returns:
```json
{
  "id": "dQw4w9WgXcQ",
  "title": "...",
  "channelTitle": "...",
  "thumbnail": "https://...",
  "duration": "PT12M34S",
  "description": "..."
}
```

Cache: `next: { revalidate: 86400 }` — video metadata is stable.

### `GET /api/learn/channel-videos?channelId=xxx&pageToken=yyy`

Fetches latest videos from a channel's uploads playlist.

Returns:
```json
{
  "videos": [{ "id", "title", "thumbnail", "publishedAt", "description" }],
  "nextPageToken": "..."
}
```

Cache: `next: { revalidate: 3600 }`.

### `POST /api/learn/analyse`

Request: `{ videoId, videoTitle, channelTitle }`

1. Checks Supabase cache — returns cached guide if exists for this user + videoId
2. Calls Gemini 1.5 Flash with YouTube URL directly
3. Parses and returns study guide JSON
4. Caches to Supabase if user authenticated

Response: streaming `text/plain` (SSE) — raw JSON accumulates on client

### `POST /api/learn/quiz`

Request: `{ videoId, studyGuide }`

1. Calls Gemini to generate 5 MCQ questions from the study guide
2. Returns JSON immediately (no streaming needed)

### `POST /api/learn/progress`

Request: `{ videoId, videoTitle, channelName?, thumbnailUrl?, quizScore?, completed? }`

Auth required. Upserts to `video_progress`. Guests use localStorage instead.

### `GET /api/learn/progress?channel=ibm`

Returns user's progress records for a given channel (or all if no filter).

---

## Frontend

### `/learn/youtube` — Landing & Browse

**Layout (desktop: two-column, mobile: single column):**

```
┌─────────────────────────────────────────────────────────┐
│  Learn from YouTube                                      │
│  Paste any video URL — Claude builds your study guide    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ youtube.com/watch?v=...          [Start learning] │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

[IBM Technology] [Fireship] [ByteByteGo] [TechWorld] [Theo] [Hussein]

┌─────────────────────────────────────────────────────────┐
│  [thumbnail]  Title of video          2d ago            │
│               Channel name            ✓ Done  82%       │
├─────────────────────────────────────────────────────────┤
│  [thumbnail]  Title of video          1w ago            │
│               Channel name                              │
└─────────────────────────────────────────────────────────┘
```

Progress badges (✓ Done, score %) only shown to signed-in users.

### `/learn/youtube/[videoId]` — Study Session

**Layout:**

```
← Back   [Video title]                    [Deep dive in NotebookLM →]

┌──────────────────────────────┐  ┌─────────────────────────────────┐
│                              │  │ 📖 Study Guide  |  🧠 Quiz       │
│    YouTube embed             │  ├─────────────────────────────────┤
│                              │  │                                 │
│                              │  │  [Guide or Quiz content]        │
└──────────────────────────────┘  │                                 │
                                  └─────────────────────────────────┘
```

Mobile: stacked — embed on top, tabs below.

**Study Guide tab states:**
- Loading: "Gemini is watching the video…" with skeleton cards
- Error (video too long / private / no audio): clear message + NotebookLM fallback CTA
- Loaded: summary → key concepts (accordion) → insights → architecture note → AU context → study tips

**Quiz tab states:**
- Pre-load: "Test your knowledge →" button (lazy — don't call Gemini until requested)
- Loading: "Generating questions…"
- Active: one question at a time, A/B/C/D buttons, instant feedback after selection
- Done: score card with band label + "Retry" + "Share score" (LinkedIn deep link)

**Score bands:**
- 90–100: "Outstanding — you've got this" (green)
- 75–89: "Strong — ready to discuss this in an interview" (green)
- 60–74: "Good foundation — review the key concepts once more" (amber)
- below 60: "Keep studying — re-watch and try again" (red)

**NotebookLM panel (slides in from right on mobile, fixed aside on desktop):**

```
┌──────────────────────────────────────────┐
│ Deep dive in NotebookLM                  │
│                                          │
│ NotebookLM can answer follow-up          │
│ questions, build flashcards, and create  │
│ audio summaries from this video.         │
│                                          │
│ 1. Copy this URL:                        │
│ ┌────────────────────────────────────┐   │
│ │ youtube.com/watch?v=xxxxx  [Copy] │   │
│ └────────────────────────────────────┘   │
│                                          │
│ 2. Open NotebookLM, click + Add source,  │
│    paste the URL.                        │
│                                          │
│ [Open NotebookLM ↗]                      │
│                                          │
│ Suggested prompts (click to copy):       │
│ ─────────────────────────────────────    │
│ "Quiz me on this video with 10 Qs"       │
│ "Summarise the 3 key concepts"           │
│ "Explain [term] like I'm a junior dev"   │
│ "Create flashcards for all key terms"    │
│ "Compare this to alternatives in AU IT"  │
│ "What would I build with this?"          │
└──────────────────────────────────────────┘
```

---

## Guest vs Authenticated UX

| Capability | Guest | Signed-in |
|------------|-------|-----------|
| Paste any YouTube URL | ✅ | ✅ |
| Browse curated channels | ✅ | ✅ |
| Study guide (Gemini) | ✅ re-generated each visit | ✅ cached in Supabase |
| Take quiz | ✅ score not saved | ✅ score saved |
| Progress badges on video grid | ❌ | ✅ |
| NotebookLM panel | ✅ | ✅ |
| "Recently studied" on dashboard | ❌ | ✅ |

---

## Environment Variables

```env
YOUTUBE_API_KEY=        # YouTube Data API v3 (Google Cloud Console, free)
GEMINI_API_KEY=         # Google AI Studio (free tier: 1,500 req/day Flash)
# ANTHROPIC_API_KEY already present (kept for other features)
```

Both keys are server-only (never NEXT_PUBLIC_).

---

## Packages

```bash
npm install @google/generative-ai   # Gemini SDK
# youtube-transcript — can be removed; Gemini handles video natively
```

---

## Error States

| Error | Cause | UI |
|-------|-------|----|
| Private / deleted video | YouTube 404 | "This video isn't publicly accessible" |
| Video too long (>2h) | Gemini context limit | "This video is too long — try a chapter link or paste a shorter video" |
| No speech / music-only | Gemini can't analyse | "No analysable content — try a video with narration" |
| Gemini quota hit | >1,500 free req/day | "AI analysis is temporarily unavailable — try again later or use NotebookLM" |
| YouTube API quota | >10,000 units/day | Channel browse fails silently; paste URL still works |

---

## Rate Limiting

- `/api/learn/analyse`: 20 calls/user/hour (Gemini cost protection)
- `/api/learn/quiz`: 30 calls/user/hour
- Unauthenticated: 5 calls/IP/hour

Implemented via Supabase `rate_limits` table or simple in-memory counter (acceptable for a personal blog).

---

## Implementation Order

1. **`supabase/006_video_learning.sql`** — create table (already done, update schema if needed)
2. **`app/api/learn/video-meta/route.ts`** — YouTube metadata fetch
3. **`app/api/learn/channel-videos/route.ts`** — channel video list
4. **`app/api/learn/analyse/route.ts`** — Gemini study guide (streaming)
5. **`app/api/learn/quiz/route.ts`** — Gemini quiz generation
6. **`app/api/learn/progress/route.ts`** — Supabase upsert + fetch
7. **`app/learn/youtube/page.tsx`** — landing + channel browse
8. **`app/learn/youtube/[videoId]/page.tsx`** — study session UI
9. **Link from `/learn/page.tsx`** — feature card

---

## Success Metrics

- Study guide loads in < 5s (Gemini Flash is fast)
- Quiz completion rate > 65%
- NotebookLM panel opened on > 20% of study sessions
- Returning users: come back to complete videos or improve quiz score

---

## Future Expansions

- **Search**: YouTube Data API search so users can find videos by topic without leaving the app
- **Playlists**: paste a YouTube playlist URL → sequential study path with overall progress
- **More channels**: Fireship, Theo, TechWorld already configured — add by appending to channels array
- **Audio overview**: link to NotebookLM's audio overview feature (NotebookLM-generated podcast of the video)
- **Flashcard export**: export key concepts as Anki deck (.apkg)
- **Study streak**: consecutive-day learning streak stored in Supabase
