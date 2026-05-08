# Gradland

> **The definitive career platform for international IT graduates entering the Australian job market.**

Built with Next.js 16 App Router, Supabase, Anthropic Claude, and OpenAI. Deployed on Vercel.

🌐 **Live:** [gradland.au](https://gradland.au)

---

## What it does

Gradland is **not** a blog with tools bolted on. The primary product is a suite of AI-powered career tools designed specifically for international students and 482/485/PR visa applicants in Australian tech roles.

### Career Tools

| Tool | Description |
|------|-------------|
| **Resume Analyser** | PDF upload → Claude AU recruiter analysis → score ring + 5-axis radar chart + action items |
| **Cover Letter Generator** | GPT-4.1 streaming, 4-paragraph AU structure, inline editing |
| **Interview Prep** | AI mentor Alex, 8 tech roles + Universal Questions bank, 6-stage session flow, XP gamification, post-interview toolkit (summary email, rejection handling, salary negotiation) |
| **Job Search** | Live aggregation from JSearch (Google for Jobs) + Adzuna + Jora scraper + ACS RSS — 50+ AU IT listings per search |
| **Visa Journey Tracker** | Personal 482 step tracker with document checklists, auto-save, 6-stage progress |
| **AU Insights** | 10 tabs: company tiers, salary checker, grad programs, skill map, visa guide, company compare with SVG radar |
| **Learning Paths** | 5 skill paths (Frontend, Fullstack, Backend, Data Engineering, DevOps/Cloud), spaced repetition, Mermaid concept diagrams, personalised roadmaps |
| **Claude Code Lab** | 4-level interactive guide (Foundation → Core → Power User → Master), 20+ lessons |
| **Readiness Score** | 0–100 composite: resume quality (25%) + skill completion (25%) + interview XP (25%) + quiz scores (25%) |
| **Onboarding Flow** | 3-question first-login modal → personalises all tools to role + visa status + job stage |

### Content (SEO moat)

| Content | Description |
|---------|-------------|
| **Blog** | Technical writing, MDX, reading progress bar, tag filters |
| **AI Digest** | Daily Claude-curated AI research summaries, auto-published |
| **GitHub Hot** | Daily trending repo analysis, auto-published |
| **Visa News** | AU immigration updates, auto-curated |
| **AU Insights** | 10-tab market intelligence hub for the AU IT job market |

---

## Design System — Eastern Ink × Comic Panel

The visual language fuses Chinese ink brush art with Western comic book panels.

| Mode | Palette | Feel |
|------|---------|------|
| **Light** | Rice Paper & Ink — `#fdf5e4` background, `#140a05` ink, `#c0281c` vermilion | Warm, editorial, aged parchment |
| **Dark** | Night Market & Lanterns — `#07050f` deep night, `#e84040` lantern red, `#f0b830` gold | Atmospheric, glowing, night market |

- Hard-offset comic-book shadows: `4px 4px 0 var(--ink)` / `4px 4px 0 rgba(232,64,64,0.6)`
- Typography: `Lora` serif for H1/H2 · `Space Grotesk` for UI · `Caveat` for handwritten accents
- CSS custom properties throughout — zero Tailwind, zero CSS Modules
- Yin-yang SVG dark mode toggle with smooth 180° CSS rotation, persisted to localStorage

Full design system documented in [`DESIGN.md`](./DESIGN.md).

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Next.js 16.2** | App Router, Turbopack, TypeScript strict |
| Auth & DB | **Supabase** | PostgreSQL + Row-Level Security + GitHub OAuth |
| AI — interactive | **Anthropic Claude Sonnet 4.6** | Interview prep, resume analysis, salary check |
| AI — automation | **Claude Haiku 4.5** | Daily digest, githot, visa news pipelines |
| AI — diagrams | **OpenAI GPT-4o-mini** | Mermaid concept diagrams + career roadmaps |
| Diagrams | **Mermaid.js** | SVG flowchart rendering from GPT-generated code |
| Animations | **Framer Motion** | `whileHover`, `whileTap`, `whileInView`, `AnimatePresence` |
| Styling | CSS custom properties + inline styles | No Tailwind, no CSS Modules |
| Content | Markdown in `content/` | `gray-matter`, `rehype-pretty-code`, `next-mdx-remote` |
| Payments | **Stripe** | Checkout, customer portal, webhook, subscription gate |
| Job data | **JSearch (RapidAPI)** + **Adzuna** + **custom scraper** | Live + cached AU IT listings |
| Deploy | **Vercel** | Triggered on `git push origin main` |
| CI | **GitHub Actions** | `npm audit` + `next build` gate; daily job scraper cron |

---

## Local Setup

```bash
git clone https://github.com/Sheng-wei-Tsai/claude-code henry-blog
cd henry-blog
npm install
cp .env.local.example .env.local   # fill in your keys (see below)
npm run dev
```

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Job search APIs
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
RAPIDAPI_KEY=            # JSearch (Google for Jobs)

# Stripe (optional — subscription features only)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=                     # recurring price ID for the Pro plan

# App
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

### Apply Database Migrations

```bash
supabase login
supabase link --project-ref your-project-ref

# Apply all migrations
for f in supabase/0*.sql; do
  supabase db query --linked -f "$f"
done
```

Migrations are in `supabase/` — numbered, append-only. Never modify existing files.

---

## Scripts & Automation

```bash
# Development
npm run dev          # Next.js dev server (Turbopack)
npm run build        # Production build
npm run check        # npm audit + next build (pre-push gate)

# Content pipelines (run daily via GitHub Actions)
npm run digest       # Fetch AI research → Claude filter + summarise → publish post
npm run githot       # Fetch trending GitHub repos → Claude analyse → publish post

# Job scraper
npm run scrape:jobs  # Scrape Jora + ACS RSS + Indeed → upsert to scraped_jobs table
                     # Also runs daily at 6am AEST via .github/workflows/scrape-jobs.yml
```

---

## Quality Gate

Every push to `main` must pass:

```bash
npm run check   # = npm audit --audit-level=moderate && next build
```

Enforced by:
1. `.git/hooks/pre-push` — install via `sh scripts/setup-hooks.sh`
2. GitHub Actions `check` job in `.github/workflows/deploy.yml` — deploy is gated on it

Vercel deploy only triggers after the check job passes.

---

## Database Schema

18 tables, all with RLS enabled. Migrations in `supabase/` (append-only, numbered).

| Table | Purpose |
|-------|---------|
| `profiles` | User profile, onboarding data, XP, interview level |
| `resume_analyses` | Resume upload history + Claude analysis results |
| `job_applications` | Application pipeline tracker |
| `job_alerts` | Saved job search criteria |
| `cover_letters` | Generated cover letters |
| `skill_progress` | Per-user skill status + spaced repetition state |
| `user_active_paths` | Which learning paths a user is enrolled in |
| `github_skill_progress` | GitHub-linked skill evidence |
| `interview_progress` | Interview session history + scores |
| `visa_tracker` | Personal 482/485 visa journey steps |
| `api_usage` | Rate limiting + usage tracking per endpoint |
| `readiness_snapshots` | Daily readiness score history |
| `page_views` | First-party analytics (no third-party trackers) |
| `post_comments` | Blog comments (auth-gated, admin moderated) |
| `video_content` | YouTube study guide cache |
| `video_progress` | User video watch progress |
| `scraped_jobs` | AU IT job listings from Jora/ACS/Indeed (30-day TTL) |
| `saved_jobs` | User-saved job listings |

---

## Project Structure

```
app/
  page.tsx                    Homepage — PersonalisedHero (logged-in) or PublicHero (guest)
  dashboard/                  Saved jobs, pipeline, readiness score, visa tracker
  interview-prep/             Landing page + [role] session + networking hub
  learn/                      5 skill paths + YouTube study + Claude Code Lab
  au-insights/                10-tab AU market intelligence hub
  jobs/                       Job search (live APIs + scraped cache)
  resume/                     Cover letter generator
  admin/                      Analytics dashboard, user management
  api/
    dashboard/summary/        Aggregated dashboard data (single API call)
    learn/diagram/            GPT-4o-mini → Mermaid concept diagram
    learn/roadmap-image/      GPT-4o-mini → personalised career roadmap
    interview/share-card/     1200x630 PNG share card (Satori/ImageResponse)
    jobs/                     Job aggregation (JSearch + Adzuna + scraped)
    resume-analyse/           Claude resume analysis
    gap-analysis/             (planned) JD embedding vs resume similarity

components/
  MermaidDiagram.tsx          Client-side Mermaid SVG renderer
  OnboardingModal.tsx         3-step first-login flow
  PersonalisedHero.tsx        Logged-in homepage: next action + roadmap diagram
  ReadinessScore.tsx          SVG score ring + breakdown bars
  ThemeToggle.tsx             Yin-yang dark mode toggle

scripts/
  scrape-au-jobs.ts           Jora + ACS RSS + Indeed scraper → Supabase cache
  fetch-ai-news.ts            Daily AI digest pipeline
  fetch-visa-news.ts          Daily visa news pipeline
  run-githot.ts               Daily GitHub Hot pipeline

supabase/
  001–018_*.sql               Append-only migrations
  schema.sql                  Full schema snapshot

.github/workflows/
  deploy.yml                  CI gate: audit + build before Vercel deploy
  scrape-jobs.yml             Daily job scraper cron (6am AEST)
```

---

## Architecture Decisions

**Why CSS custom properties instead of Tailwind?**
The Eastern Ink × Comic Panel design system requires deep dark mode control and animated theme transitions. CSS custom properties let every token cross-fade in 400ms with a single `transition` on `body`. Tailwind's JIT doesn't support this cleanly without a custom plugin.

**Why Mermaid.js instead of image generation for diagrams?**
Tried Gemini 2.0 Flash `responseModalities: IMAGE` — the `@google/generative-ai` SDK v0.24 doesn't expose this reliably. GPT-4o-mini → Mermaid code → client-side SVG render is faster, cheaper, crisp at any resolution, and dark-mode compatible out of the box.

**Why scrape Jora instead of Seek?**
Seek deploys Cloudflare bot protection (HTTP 403) on all server-side requests. Jora (au.jora.com) is Seek-owned and serves the same listings without Cloudflare. LinkedIn is covered by JSearch (Google for Jobs aggregation). Indeed is attempted best-effort.

**Why first-party analytics?**
`page_views` table in Supabase with RLS. No GDPR cookie banners, no third-party tracking, no data sharing. Admins see the same data via `/admin/analytics`. This is both a privacy win and a portfolio signal.

---

## Employer-Impressiveness Checklist

- [x] SSR with streaming AI responses (interview prep, cover letter)
- [x] Row-Level Security on all user data (Supabase RLS)
- [x] Pre-push CI gate (audit + build, enforced by git hook + GitHub Actions)
- [x] Proper auth pattern — no secrets in client components, service role isolated
- [x] First-party analytics — no third-party trackers
- [x] Rate limiting on every AI endpoint (`checkEndpointRateLimit`)
- [x] Spaced repetition algorithm (skill review scheduling)
- [x] Database migrations — numbered, append-only, applied via Supabase CLI
- [x] Framer Motion animations — respects `prefers-reduced-motion`
- [x] WCAG 2.1 AA colour contrast across light + dark modes
- [x] RSS feed, sitemap, robots.txt, OG images — full SEO infrastructure
- [ ] Integration test suite (Vitest — planned)
- [ ] pgvector embeddings for job-to-skill gap analysis (planned)
- [ ] Edge caching via Vercel KV (planned)

---

## Contributing / Agent Instructions

See [`AGENTS.md`](./AGENTS.md) for the full development protocol — stack rules, security requirements, styling conventions, database patterns, commit format, and the mandatory commit/push confirmation workflow.

See [`DESIGN.md`](./DESIGN.md) for the complete design system — colour tokens, typography, spacing, component patterns, motion guidelines, and accessibility standards.
