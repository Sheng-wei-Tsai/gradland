@AGENTS.md

# Henry Blog — AI Engineering Guide

This is a full-stack career platform built on Next.js 16 App Router, Supabase, and multiple AI APIs.
Read this file fully before touching any code.

---

## What This Project Is

Not just a blog. A personal career platform for Henry Tsai — a Full Stack Developer (Brisbane, QUT CS grad, 485 Graduate Visa) actively seeking junior/graduate roles in the Australian IT market. The site is a live demonstration of his skills.

**Deployed at:** Vercel (auto-deploy on push to `main`)
**Repo:** `Sheng-wei-Tsai/henrys-blog`

---

## Context Files — Read These First

| File | When to read |
|------|-------------|
| `context/current-feature.md` | At the start of every session — tells you exactly what's being built |
| `context/feature-roadmap.md` | When choosing what to work on next |
| `context/ai-interaction.md` | **Read before every session** — defines the workflow, branching, commit, and code review rules |
| `context/coding-standards.md` | Before writing any code — TypeScript, React, styling, API patterns |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 App Router (React 19) |
| Language | TypeScript 5 |
| Styling | CSS custom properties (inline styles + CSS vars — NO Tailwind) |
| Database | Supabase (PostgreSQL) via `@supabase/ssr` |
| AI (user-facing) | OpenAI `gpt-4o-mini` — cover letter, resume match, interview prep |
| AI (pipelines) | Anthropic `claude-sonnet-4-6` — digest, githot, daily post scripts |
| Content | MDX via `next-mdx-remote` + `gray-matter` + `reading-time` |
| Auth | Supabase (GitHub OAuth + email/password) |
| Deployment | Vercel |

---

## Project Structure

```
app/
  page.tsx              Homepage
  blog/                 Blog listing + individual posts (MDX)
  digest/               AI digest listing + individual posts
  githot/               GitHub Hot listing + individual posts
  jobs/                 Australian IT job search (Adzuna API)
  resume/               Online resume + AI job match widget
  cover-letter/         AI cover letter generator (streaming)
  dashboard/            Saved jobs + application tracker
  learn/                IT career pathways (spaced repetition)
  interview-prep/       Gamified interview prep ← IN PROGRESS
  login/                Auth page
  about/                About Henry
  api/
    jobs/               Adzuna proxy
    resume-match/       OpenAI scoring
    cover-letter/       OpenAI streaming
    ai-usage/           AI usage stats
    interview/
      questions/        OpenAI question generation
      evaluate/         OpenAI answer evaluation (streaming)
      chat/             OpenAI mentor chatbot (streaming)

components/
  Header.tsx            Sticky nav (pill on desktop, bottom bar on mobile)
  AuthProvider.tsx      Supabase auth context
  PostCard.tsx          Reusable content card
  PostHeatmap.tsx       GitHub-style writing activity heatmap
  BlogList.tsx          Search + tag filtering for blog

lib/
  supabase.ts           Browser Supabase client
  resume-data.ts        Henry's resume as TypeScript object
  skill-paths.ts        Career pathway definitions (spaced repetition)
  skill-content.ts      Rich topic content with code examples
  interview-roles.ts    Interview prep role definitions + XP levels

content/
  posts/                Blog posts (MDX)
  digests/              AI digest posts (auto-generated daily)
  githot/               GitHub Hot posts (auto-generated daily)

scripts/
  run-post.ts           Daily post pipeline (Claude)
  run-digest.ts         AI digest pipeline (Claude)
  run-githot.ts         GitHub Hot pipeline (Claude)

supabase/
  schema.sql            Tables: profiles, saved_jobs, job_alerts, job_applications
  002_cover_letters.sql Table: cover_letters
  003_auth_and_learn.sql Tables: skill_progress; adds display_name to profiles
  004_interview_prep.sql Tables: interview_progress; adds interview_xp to profiles

context/                ← AI engineering documentation
  feature-roadmap.md    Full todo list, prioritised
  current-feature.md    What's being built right now
  ai-interaction.md     All AI prompts, models, patterns
```

---

## Coding Conventions

### Styling — CSS custom properties only (no Tailwind)

```typescript
// Correct: inline styles using CSS variables
<div style={{ color: 'var(--brown-dark)', background: 'var(--warm-white)', padding: '1.5rem' }}>

// Wrong: Tailwind classes
<div className="text-brown-dark bg-white p-6">
```

Key CSS variables: `--brown-dark`, `--terracotta`, `--warm-white`, `--parchment`, `--text-secondary`, `--text-muted`

### Components

- Client components: `'use client'` at top, `useState`/`useEffect`
- Server components: no directive, can fetch data directly
- Auth in client: `const { user } = useAuth()` from `@/components/AuthProvider`
- Auth in server API route: `createServerClient` from `@supabase/ssr` + `cookies()`

### API Routes

```typescript
// Auth-gated server route pattern
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
const cookieStore = await cookies();
const supabase = createServerClient(url, key, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
const { data: { user } } = await supabase.auth.getUser();
if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
```

### Streaming (OpenAI)

```typescript
const stream = await openai.chat.completions.create({ stream: true, ... });
const encoder = new TextEncoder();
const readable = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) controller.enqueue(encoder.encode(text));
    }
    controller.close();
  },
});
return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
```

Reference: `app/api/cover-letter/route.ts`

### Supabase (client)

```typescript
import { supabase } from '@/lib/supabase';
// Read
const { data } = await supabase.from('table').select('col').eq('user_id', user.id);
// Write
await supabase.from('table').upsert({ user_id: user.id, ...data });
// Delete
await supabase.from('table').delete().eq('user_id', user.id).eq('id', itemId);
```

---

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User info + `interview_xp`, `interview_level`, `display_name`, `location` |
| `saved_jobs` | Bookmarked Adzuna jobs |
| `job_alerts` | Saved search alerts (schema only — no UI yet) |
| `job_applications` | Application tracker with status pipeline |
| `cover_letters` | Generated cover letter history |
| `skill_progress` | Spaced repetition progress per skill |
| `interview_progress` | Gamified interview prep progress per question |

---

## Environment Variables

```bash
ANTHROPIC_API_KEY            # Claude — used by scripts only
OPENAI_API_KEY               # OpenAI — used by API routes
ADZUNA_APP_ID                # Job search
ADZUNA_APP_KEY               # Job search
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anonymous key
GITHUB_TOKEN                 # GitHub API (optional, avoids rate limits in scripts)
VERCEL_TOKEN                 # Deployment
VERCEL_ORG_ID                # Deployment
VERCEL_PROJECT_ID            # Deployment
```

---

## What NOT to Do

- **No Tailwind** — this project uses CSS custom properties. Don't add Tailwind classes.
- **Don't add new dependencies** without checking if something already installed covers the need.
- **Don't touch the `.github/workflows/` files** unless specifically fixing a CI issue.
- **Don't edit `lib/resume-data.ts`** — it's Henry's actual CV; don't change the content.
- **Don't use Claude for user-facing API routes** — OpenAI only for those (cost balance).
- **Don't push directly to main** — but the CI scripts do push content commits; that's intentional.
- **Read files before editing** — always read the current file before making changes.
- **Confirm before deleting** any file that might be Henry's actual content.

---

## Navigation Links (Header.tsx)

Current nav entries:
```
Home, Blog, Digest, Githot, Learn  (mobile bottom bar)
Resume, About                       (mobile "More" sheet only)
Interview Prep                      ← being added
```

To add a nav item: edit `navLinks` array in `components/Header.tsx` and add a new `IconXxx` SVG function at the bottom of that file.
