# henry-blog

A production-grade personal platform built with Next.js — combining a technical blog, automated AI content pipelines, Australian IT job search, and AI-powered career tools. Live at [henrys-blog.vercel.app](https://henrys-blog.vercel.app).

## What's inside

**Content**
- Blog, AI research digest, and GitHub trending analysis — all written in Markdown
- Automated weekly digest: fetches from 7 curated AI sources, filters with Claude, summarises, and publishes
- Automated Githot: hits GitHub Search API daily, analyses top repos with Claude, generates structured posts

**Career Tools**
- Australian IT job search powered by Adzuna API with filters and saved jobs
- AI cover letter generator (OpenAI streaming) — tailored to any job description
- Resume matcher with ATS scoring against job descriptions
- Application tracker with status pipeline (applied → interview → offer)

**Infrastructure**
- Auth via Supabase (GitHub OAuth + email/password) with Row-Level Security on all tables
- Spaced repetition learning tracker for 60+ skills across 4 career paths
- GitHub-style writing activity heatmap on homepage
- CI/CD via GitHub Actions → Vercel

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Auth & DB | Supabase (PostgreSQL + RLS + OAuth) |
| AI | Anthropic Claude API, OpenAI GPT-4o-mini |
| Styling | Tailwind CSS + CSS custom properties |
| Content | Markdown, gray-matter, rehype-pretty-code |
| Deploy | Vercel + GitHub Actions |

## Local setup

```bash
npm install
cp .env.local.example .env.local  # add your keys
npm run dev
```

Required env vars:
```
OPENAI_API_KEY
ANTHROPIC_API_KEY
ADZUNA_APP_ID
ADZUNA_APP_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Content pipelines

```bash
npm run digest   # fetch + filter + summarise AI research → publishes post
npm run githot   # fetch + analyse trending GitHub repos → publishes post
```

Both auto-commit and push to trigger a Vercel deploy.

## Database

Schema lives in `supabase/`. Tables: `profiles`, `saved_jobs`, `job_applications`, `job_alerts`, `cover_letters`, `skill_progress`. All protected by RLS — users can only read and write their own data.
