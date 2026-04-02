# Feature: Resume Career Coach — Upload, Analyse, Rank & Practice

**Priority:** 🔴 High
**Status:** 🔲 Not started
**Branch:** `feature/resume-career-coach`
**Started:** —
**Shipped:** —

---

## Goal

Transform the `/resume` page from a static CV display into a full career coaching tool for anyone — not just Henry. A visitor uploads their own resume (PDF or plain text), gets AI-powered feedback benchmarked against Australian IT/tech hiring standards, sees live job listings ranked by difficulty, builds a practice-first application strategy, and gets real-time company-specific interview intel. Henry's resume is the built-in template and benchmark — it shows what a strong entry-level candidate looks like in the AU market.

**Who benefits:** Any junior/grad developer in Australia wanting to break into tech. Henry's site becomes a useful tool, not just a portfolio.

---

## Feature Map — Four Panels

```
┌──────────────────────────────────────────────────────────────────┐
│  PANEL 1: Resume Upload & AI Audit                               │
│  Upload PDF/text → AI scores vs AU market → actionable fixes     │
├──────────────────────────────────────────────────────────────────┤
│  PANEL 2: Live Job Market (your city)                            │
│  Adzuna jobs → ranked by difficulty → Tier 1/2/3 badges          │
├──────────────────────────────────────────────────────────────────┤
│  PANEL 3: Practice Strategy Builder                              │
│  "Start here" → tier-ranked apply order → track progress         │
├──────────────────────────────────────────────────────────────────┤
│  PANEL 4: Company Interview Intel                                │
│  Select a company → AI fetches recent interview Q&A in real time │
└──────────────────────────────────────────────────────────────────┘
```

---

## Panel 1 — Resume Upload & AU Market Audit

### User flow
1. User sees Henry's resume as the default example (already rendered)
2. "Audit your own resume" CTA below — file input (PDF, .txt, .docx) OR paste text
3. On submit → `/api/resume-coach/audit` → streaming response
4. Result replaces the widget with a scored report

### AI Audit output schema
```ts
interface ResumeAudit {
  overallScore: number;          // 0–100
  auMarketScore: number;         // how well it fits AU IT market specifically
  sections: {
    summary:     SectionScore;
    skills:      SectionScore;
    experience:  SectionScore;
    projects:    SectionScore;
    education:   SectionScore;
  };
  redFlags: string[];            // things that hurt chances (e.g. "no GitHub link", "gaps unexplained")
  quickWins: string[];           // top 3 fixes with highest ROI
  auSpecific: string[];          // AU-specific tips (e.g. "mention 485 visa status clearly", "Brisbane vs Sydney market differences", "Australian formatting: no photo, no DOB")
  benchmark: {
    vsJuniorAvg: number;         // percentile vs typical AU junior applicant
    vsHenryResume: number;       // score comparison to Henry's built-in template
  };
}

interface SectionScore {
  score: number;                 // 0–10
  feedback: string;              // 1–2 sentences
  suggestions: string[];         // specific improvements
}
```

### AU market context injected into prompt
Key things AU IT employers (especially Brisbane/Sydney/Melbourne) care about:
- GitHub profile with real projects (not just coursework)
- Visa status clearly stated (for non-citizens/PRs)
- Concise 1-page for graduates (2 pages max for seniors)
- No photo, no DOB, no marital status (discrimination law)
- Quantified achievements ("reduced load time by 40%", not "improved performance")
- Certifications valued: AWS, Azure, GCP for infra; React, Node for web
- Keywords for ATS: agile, scrum, CI/CD, REST API, cloud
- Cover letter optional but recommended for startup/agency roles

### UI components
- `ResumeUploader` — drag-and-drop zone + file picker, shows Henry's resume as "example" thumbnail
- `AuditScoreCard` — animated score ring (0–100) + AU market sub-score
- `SectionBreakdown` — accordion: each section with score bar + feedback
- `QuickWinsList` — top 3 priority fixes, each with a "copy to clipboard" suggestion
- `AUSpecificTips` — AU-flagged tips with 🇦🇺 icon

---

## Panel 2 — Live Job Market Ranked by Difficulty

### Data sources — 3-layer stack

The existing Adzuna integration misses jobs posted only on company websites (Atlassian, Canva, REA Group, etc.). Use a layered approach:

#### Layer 1 — JSearch API (Google Jobs) — primary broad source
JSearch scrapes Google Jobs, which indexes company career pages via structured data. Catches roles that never appear on aggregators.
- API: RapidAPI `JSearch` endpoint
- Env var: `RAPIDAPI_KEY`
- Cost: ~$0.001/req via RapidAPI (200 free/month; $10 = 10,000 req)
- Filter: `query="software developer"&location="Australia"&employment_type=FULLTIME`
- Freshness: same-day

#### Layer 2 — Direct ATS scrapers (Lever + Greenhouse) — Tier 1 companies
Most AU tech companies use Lever or Greenhouse as their ATS. Both have public JSON endpoints — no scraping, no auth, zero cost. A GitHub Actions cron runs every 6h and upserts to Supabase.

**Lever** (public JSON API): `https://jobs.lever.co/{company}/json`
**Greenhouse** (official public API): `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`

| Company | ATS | Slug |
|---------|-----|------|
| Atlassian | Lever | `atlassian` |
| SafetyCulture | Lever | `safetyculturepty` |
| Airwallex | Lever | `airwallex` |
| Seek (the company) | Lever | `seek` |
| Deputy | Lever | `deputy` |
| Canva | Greenhouse | `canva` |
| REA Group | Greenhouse | `rea` |
| Xero | Greenhouse | `xero` |
| Culture Amp | Greenhouse | `cultureamp` |
| Afterpay/Block | Greenhouse | `block` |
| Zip Co | Greenhouse | `zipmoney` |
| WiseTech Global | Greenhouse | `wisetechglobal` |

Cron script: `.github/workflows/scrape-ats.yml` — runs `scripts/scrape-ats.ts` every 6h, upserts to `ats_jobs` Supabase table.

#### Layer 3 — Adzuna (existing) — SME / Tier 3 coverage
Keep the existing Adzuna integration as the long-tail source for agencies, SMEs, and regional roles not on Lever/Greenhouse.

#### Merge & deduplication
All three sources merge in `/api/resume-coach/jobs/route.ts`. Dedup key: `normalise(company_name + title + city)`. Cache merged results in Supabase `cached_jobs` for 30 minutes. Layer 2 data is pre-populated by cron so the API response is instant for Tier 1 roles.

New param: `location` from browser geolocation or manual city picker (Brisbane / Sydney / Melbourne / Perth / Adelaide / Remote).

### Difficulty ranking algorithm
Each job gets a **Difficulty Score** (1–10) computed from:

| Signal | Weight | Source |
|--------|--------|--------|
| Salary range | 30% | Adzuna `salary_min` / `salary_max` |
| Company tier (see below) | 30% | Company name lookup |
| Years experience required | 25% | AI extraction from JD text |
| Application count (if available) | 15% | Adzuna `__CLASS` or competition proxy |

**Company Tier classification** (built-in lookup + AI fallback):
- **Tier 1 — Elite:** Google, Atlassian, Canva, Airwallex, Afterpay, Xero, WiseTech, Zip Co, Amazon, Atlassian, Microsoft, Salesforce AU
- **Tier 2 — Strong:** Big 4 tech consultancies (Accenture, Deloitte Digital, Cognizant, Infosys AU), scale-ups, Series B+ startups, major banks (CBA, ANZ, NAB, Westpac digital teams)
- **Tier 3 — Accessible:** SMEs, agencies, local startups, government contractors, regional firms

**Difficulty badge colours:**
- 🟢 Easy (1–3): Tier 3, entry salary, 0–1 yrs exp → "Good for practice"
- 🟡 Medium (4–6): Tier 2, grad-to-mid salary, 1–3 yrs exp → "Achievable with prep"
- 🔴 Hard (7–10): Tier 1, senior salary, 3+ yrs exp → "Stretch goal"

### UI
- City picker pill (defaults to geolocation → Brisbane fallback)
- Job cards: existing Adzuna card style + **Difficulty badge** (coloured pill top-right)
- Sort tabs: "Best match for your resume" | "Easiest first" | "Highest salary" | "Newest"
- "Best match" requires Panel 1 audit to be done — shows resume match % alongside difficulty
- Filter: Tier 1 / Tier 2 / Tier 3 toggle buttons
- Clicking a job card opens Panel 4 (Company Interview Intel) for that company

### API
`/api/resume-coach/jobs` — merges JSearch + ATS scraper cache + Adzuna, adds difficulty scoring, accepts `{ city, resumeScore?, skills? }`

---

## Panel 3 — Practice Strategy Builder

### Concept
Bouldering metaphor: just like the game on `/about`, you start on easy problems before attempting the crux. "Work your way up the wall."

### Strategy generation
After Panel 1 audit, AI generates a personalised **5-step practice ladder**:

```
Step 1 (Week 1–2): Apply to 3–5 Tier 3 companies → goal: pass phone screen, learn your pitch
Step 2 (Week 2–3): Apply to 3–5 Tier 2 roles → goal: get to technical round
Step 3 (Week 3–4): Target your dream Tier 1 role → goal: full interview loop
Step 4: Post-mortem each rejection → update resume + interview answers
Step 5: Re-attempt Tier 1 with improved pitch
```

Each step is personalised based on the user's audit score and skill profile.

### Kanban board (lightweight, localStorage only)
```
[ Shortlist ] → [ Applied ] → [ Phone Screen ] → [ Technical ] → [ Offer/Reject ]
```
- Jobs from Panel 2 can be dragged or added with one click into the Kanban
- Each card shows: Company, Role, Tier badge, Apply date, notes field
- Progress auto-saves to localStorage (no auth required) OR Supabase `job_applications` table (if logged in)
- "You've applied to 3 Tier 3 roles — ready to move up?" prompt when threshold hit

### Insight bar
Updates dynamically as user moves jobs through stages:
- "You have a 60% phone screen rate for Tier 3 — above average for grads"
- "0 Tier 1 applications yet — time to stretch?"
- "Your weakest stage is Technical — consider the Interview Prep page"

---

## Panel 4 — Company Interview Intel (Real-time)

### Trigger
User clicks a job card in Panel 2 → Panel 4 slides/expands with that company loaded.

### Data sources (in priority order)
1. **AI synthesis** — `gpt-4o-mini` generates likely questions based on: company type, tech stack in JD, role level. This is always available.
2. **Glassdoor scrape (public data)** — via `cheerio` + `axios` fetching the public Glassdoor interview page (no login required for first page). Rate-limited, cached 24h in Supabase.
3. **Web search synthesis** — AI uses known interview patterns for the company based on training data.

### Output schema
```ts
interface CompanyInterviewIntel {
  company: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  interviewProcess: string[];    // stages: ["Phone screen (30 min)", "Take-home (3h)", "Panel (2x1h)"]
  technicalQuestions: {
    question: string;
    category: 'DSA' | 'System Design' | 'React' | 'Node' | 'SQL' | 'Behavioural' | 'Other';
    frequency: 'Common' | 'Occasional' | 'Rare';
  }[];
  behaviouralQuestions: string[];
  tips: string[];                // "They value culture-fit heavily", "Prepare for live coding in CollabeEdit"
  insiderTips: string[];         // sourced from Glassdoor or AU tech community patterns
  prepLinks: { label: string; url: string }[]; // LeetCode tag, System Design Primer, etc.
  lastUpdated: string;           // ISO date
  confidence: 'AI-generated' | 'Partially sourced' | 'Glassdoor-verified';
}
```

### Caching strategy
- Supabase table `interview_intel` — cache by `(company_slug, role_slug)` for 24h
- After 24h, regenerate on next request and update cache
- Rate limit: 20 req/min/IP via `app/api/resume-coach/intel/route.ts`

### UI
- Company header: logo (from Clearbit or Simple Icons) + tier badge + difficulty
- Interview process timeline (horizontal stepper)
- Questions grouped by category with frequency tags
- "Add to Interview Prep" button → links to `/interview-prep` with this company pre-loaded
- "Bookmark" saves the intel to Supabase `saved_intel` (auth-gated) or localStorage (fallback)

---

## New Pages & API Routes

```
app/
  resume/
    page.tsx                    ← Redesign: 4-panel layout. Henry's resume still visible.

app/api/
  resume-coach/
    audit/route.ts              ← POST: PDF/text → streaming ResumeAudit JSON
    jobs/route.ts               ← GET: Adzuna + difficulty scoring
    strategy/route.ts           ← POST: audit result → 5-step strategy
    intel/route.ts              ← POST: { company, role } → CompanyInterviewIntel (cached)
```

---

## Affected Files

| File | Action | Notes |
|------|--------|-------|
| `app/resume/page.tsx` | Rewrite | 4-panel layout replaces current single-column |
| `app/api/resume-coach/audit/route.ts` | Create | PDF parse + OpenAI audit, streaming |
| `app/api/resume-coach/jobs/route.ts` | Create | Adzuna wrapper + difficulty scoring |
| `app/api/resume-coach/strategy/route.ts` | Create | Strategy generation |
| `app/api/resume-coach/intel/route.ts` | Create | Company intel, Supabase cache |
| `supabase/005_resume_coach.sql` | Create | `interview_intel`, `resume_audits` tables |
| `lib/company-tiers.ts` | Create | Tier 1/2/3 company lookup map + ATS slug registry |
| `scripts/scrape-ats.ts` | Create | Lever + Greenhouse fetcher, upserts to Supabase |
| `.github/workflows/scrape-ats.yml` | Create | Cron every 6h, calls scrape-ats.ts |
| `components/ResumeUploader.tsx` | Create | Drag-and-drop resume input |
| `components/AuditReport.tsx` | Create | Score rings + section breakdown |
| `components/JobDifficultyCard.tsx` | Create | Existing job card + difficulty badge |
| `components/PracticeKanban.tsx` | Create | 5-column kanban board |
| `components/CompanyIntel.tsx` | Create | Interview intel panel |

---

## Implementation Notes

### PDF parsing — no new package needed
Use the browser's built-in `FileReader` to extract text from `.txt` / `.docx` (via `ArrayBuffer`). For PDF: use `pdf.js` (Mozilla, already available as CDN, no npm install). Extract raw text, send to API as plain string. Do NOT store the file.

### Resume text handling — security
- Strip all HTML from extracted text before sending to OpenAI
- Max 8000 chars (truncate with note)
- Never log or persist the uploaded resume text — audit only, no storage

### Difficulty scoring — no new API calls
Compute difficulty client-side after jobs are fetched:
- `lib/company-tiers.ts` exports `getCompanyTier(name: string): 1 | 2 | 3`
- Uses fuzzy match (company name `.includes()` or `.toLowerCase()` check) against the tier lists
- Salary range normalised: AU median junior IT salary = $75k, senior = $130k
- Experience extracted by AI in the audit call, cached per-session

### Kanban persistence
- Logged-in users: `job_applications` table (already exists with status column)
- Guests: `localStorage` key `henry_kanban_v1`
- Kanban reads from both and merges (logged-in state takes precedence)

### Intel caching — Supabase
```sql
CREATE TABLE interview_intel (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug text NOT NULL,
  role_slug    text NOT NULL,
  data         jsonb NOT NULL,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(company_slug, role_slug)
);
```
Cache TTL = 24h. On fetch: `SELECT * FROM interview_intel WHERE company_slug = $1 AND role_slug = $2 AND created_at > now() - interval '24 hours'`.

### Page layout — no Tailwind, CSS vars only
```
/resume page layout:
  - Henry's resume (existing) stays at top — now labelled "Template: Henry's Resume"
  - Panel 1 (Audit) below it with upload widget
  - Panel 2 (Jobs) full-width section with city picker
  - Panel 3 (Strategy) — sticky sidebar on desktop, tab on mobile
  - Panel 4 (Intel) — slide-in panel / modal triggered from job card click
```

---

## Supabase Migration

```sql
-- 005_resume_coach.sql

-- Interview intel cache
CREATE TABLE IF NOT EXISTS interview_intel (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug text NOT NULL,
  role_slug    text NOT NULL,
  data         jsonb NOT NULL,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (company_slug, role_slug)
);

-- Resume audit log (optional — for aggregate insights, no PII stored)
CREATE TABLE IF NOT EXISTS resume_audits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score integer,
  au_score      integer,
  skills_found  text[],
  created_at    timestamptz DEFAULT now()
);
-- RLS
ALTER TABLE interview_intel  ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_audits    ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intel readable by all"  ON interview_intel  FOR SELECT USING (true);
CREATE POLICY "intel writable by service" ON interview_intel FOR ALL USING (false);
CREATE POLICY "audit own row" ON resume_audits FOR ALL USING (auth.uid() = user_id);
```

---

## Acceptance Criteria

- [ ] User can upload a PDF or paste text and receive a scored audit report
- [ ] Audit includes overall score, AU-specific tips, section breakdown, quick wins
- [ ] Henry's resume shown as benchmark comparison
- [ ] Job listings load for user's city (Brisbane default), sorted by difficulty
- [ ] Each job card shows a Tier badge (1/2/3) and difficulty colour
- [ ] "Best match" sort requires completed audit and shows resume match % per job
- [ ] Practice Kanban: jobs can be added and moved through 5 stages
- [ ] Kanban persists to localStorage for guests, Supabase for logged-in users
- [ ] Clicking a company triggers Company Intel panel with questions + tips
- [ ] Intel cached in Supabase for 24h per company+role combination
- [ ] Rate limit on intel endpoint (20 req/min/IP)
- [ ] Uploaded resume text never logged or stored
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] All 4 panels work on mobile at 375px

---

## Senior Dev Test Checklist

### Functional
- [ ] PDF upload extracts readable text (test with Henry's actual PDF)
- [ ] Audit handles edge cases: empty resume, non-English text, image-only PDF (graceful error)
- [ ] Jobs load within 3s; skeleton shown during load
- [ ] Kanban drag (desktop) and tap-to-move (mobile) both work
- [ ] Intel panel loads within 4s; cache hit returns instantly
- [ ] Strategy builder produces coherent 5-step plan for a weak resume (score < 40)

### Auth & Data
- [ ] Audit API rejects if OpenAI key missing (500 with message, not crash)
- [ ] Intel API returns cached data without re-calling OpenAI within 24h
- [ ] Kanban Supabase writes scoped to `user_id` — no cross-user leakage

### Security
- [ ] Resume text stripped of HTML before sending to OpenAI
- [ ] Resume text not stored in database, logs, or response beyond the audit call
- [ ] Glassdoor/Cheerio scrape only fetches public pages, no login/session

### Performance
- [ ] Audit streams response (no waiting for full JSON)
- [ ] Company intel cached — Tier 1 companies pre-warm cache on first visit
- [ ] Job difficulty computed client-side (no extra API call)

---

## Post-Ship Checklist

- [ ] Tested on live Vercel URL (not just localhost)
- [ ] Supabase migration `005_resume_coach.sql` applied to production
- [ ] Vercel env vars: `OPENAI_API_KEY` confirmed working
- [ ] `context/current-feature.md` updated
- [ ] `context/feature-roadmap.md` item checked off
- [ ] This file updated with ship date

---

## Notes / History

- **2026-04-02** — Spec written. Builds on existing `/resume` page + `resume-match` API + Adzuna jobs integration.
- **2026-04-02** — Data source strategy updated: 3-layer stack (JSearch/Google Jobs + Lever/Greenhouse ATS scrapers + Adzuna). Lever/Greenhouse have public JSON endpoints for most AU Tier 1 companies — zero scraping risk, free, trustworthy. JSearch covers company-direct postings missed by aggregators. New env var: `RAPIDAPI_KEY`. New cron: `scrape-ats.yml` every 6h.
- The bouldering metaphor (start easy → work up) is intentional — ties the career coaching philosophy to the game on `/about`. "Climb your career like a V-grade wall."
- Henry's resume stays as the built-in example/benchmark. The tool is useful to any AU grad developer, not just Henry.
- Glassdoor scraping: only fetch publicly accessible (non-login-gated) pages. If blocked, fall back to pure AI generation gracefully.
