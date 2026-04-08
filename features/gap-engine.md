# Feature: Job-to-Gap Engine

**Priority:** 🔴 P1 — Core Product Intelligence
**Status:** 🔲 Not started
**Effort:** Large (1–2 weeks)
**Started:** —
**Shipped:** —

---

## Problem

The platform has five separate tools — Resume Analyser, Skill Map, Learning Paths, Interview Prep, Job Search — but none of them talk to each other. A user can analyse their resume, search for a Data Engineer job at Atlassian, and take the Data Engineer learning path, but the platform never connects the dots: "here are the 3 skills you're missing for *this specific job*, and here's exactly how to close that gap using the tools you already have."

This is the most common experience in career tools: isolated features that never synthesise into a plan.

---

## Goal

Paste any job description → get a complete, personalised battle plan in 10 seconds.

The Gap Engine:
1. Reads the JD using vector embeddings
2. Compares it against the user's resume (already parsed + embedded)
3. Cross-references the user's completed learning skills and quiz scores
4. Returns a structured gap analysis: what you have, what you're missing, and exactly how to close each gap using the platform's own tools

---

## User Flow

```
User is on /jobs or /au-insights/companies/[slug]
  ↓
Clicks "Analyse this job" on any job card or company page
  ↓
/gap-analysis?jobId=xxx (or pastes JD text directly)
  ↓
10-second analysis animation ("Reading the JD → Comparing your profile → Building your plan")
  ↓
Results page with 4 sections:
  1. Match score (0–100%) with visual indicator
  2. ✅ Strengths — skills you have that the JD values
  3. ❌ Gaps — skills the JD requires that you don't have
  4. 📋 Action plan — prioritised list of next steps, each linked to a platform tool
  ↓
User saves the analysis to their profile (persisted)
  ↓
Analysis appears on dashboard as "Your job targets"
```

---

## Gap Analysis Output (example)

```
Job: Senior Data Engineer — Atlassian (Sydney)
Match Score: 64%  ──────●──────  Gap: 36%

✅ You have these (7 skills)
  • Python           — mastered in Data Engineer path (day 7 review done)
  • SQL Advanced     — mastered
  • PostgreSQL       — from resume
  • Docker           — from resume
  • REST APIs        — from resume
  • Git              — from resume
  • Agile/Scrum      — from resume

❌ These are missing (5 skills)
  • Apache Spark     — critical (mentioned 3× in JD)
    → Learn: Data Engineer path Phase 3 — "Apache Spark Fundamentals" [5 days]
    → Watch: ByteByteGo — "Apache Spark Explained" [study guide ready]

  • dbt              — high priority (mentioned 2× in JD)
    → Learn: Data Engineer path Phase 2 — "dbt (data build tool)" [7 days]

  • Airflow          — high priority
    → Learn: Data Engineer path Phase 2 — "Apache Airflow" [7 days]

  • AWS / Databricks — medium priority
    → Learn: DevOps path — "AWS Cloud Fundamentals" [10 days]
    → Watch: "Databricks for Data Engineers" on YouTube Learning

  • Terraform        — low priority (nice to have in JD)
    → Learn: DevOps path — "Infrastructure as Code" [7 days]

📋 Your 30-day action plan
  Week 1:  Complete "Apache Airflow" topic in Data Engineer path
  Week 2:  Complete "dbt" topic in Data Engineer path
  Week 3:  Start "Apache Spark Fundamentals"
  Week 4:  Watch 2 Databricks YouTube study guides + take quizzes

  Estimated score after plan: 89%

[Save this analysis]  [Start Airflow →]  [Prep for Atlassian interview →]
```

---

## Technical Architecture

### Step 1 — Vector embeddings on resume

When a user uploads their resume (already supported in Resume Analyser), the parsed text is:
1. Sent to OpenAI `text-embedding-3-small` (128 dimensions, $0.00002 per call)
2. Stored as `resume_embedding vector(128)` in the `profiles` table

```sql
-- supabase/012_embeddings.sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS resume_embedding vector(128),
  ADD COLUMN IF NOT EXISTS resume_text      text,
  ADD COLUMN IF NOT EXISTS resume_embedded_at timestamptz;

CREATE INDEX IF NOT EXISTS profiles_resume_embedding_idx
  ON profiles USING ivfflat (resume_embedding vector_cosine_ops)
  WITH (lists = 50);
```

### Step 2 — JD embedding + cosine similarity

```ts
// POST /api/gap-analysis
// 1. Embed the JD text
const jdEmbedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: jdText,
  dimensions: 128,
});

// 2. Cosine similarity vs resume (in Postgres — no round-trip per skill)
const { data } = await sb.rpc('match_resume_to_jd', {
  user_id: userId,
  jd_embedding: jdEmbedding.data[0].embedding,
});
// Returns: match_score (0–1)
```

```sql
-- Postgres function for cosine similarity
CREATE OR REPLACE FUNCTION match_resume_to_jd(user_id uuid, jd_embedding vector(128))
RETURNS float AS $$
  SELECT 1 - (resume_embedding <=> jd_embedding)
  FROM profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE;
```

### Step 3 — Skill extraction from JD (AI)

```ts
// Extract structured skills from JD text using GPT-4.1-mini
const extracted = await openai.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages: [{
    role: 'user',
    content: `Extract technical skills from this job description as JSON.
    Return: { required: string[], preferred: string[], domain: string }
    JD: ${jdText.slice(0, 3000)}`
  }],
  response_format: { type: 'json_object' },
  max_tokens: 300,
});
```

### Step 4 — Cross-reference with completed skills

```ts
// Get user's completed skill IDs from Supabase
const { data: completedSkills } = await sb
  .from('skill_progress')
  .select('skill_id')
  .eq('user_id', userId)
  .eq('completed', true);

// Match JD skills against SKILL_PATHS data
// For each gap skill → find which path + phase it belongs to → return as structured link
```

### Step 5 — Action plan generation (AI synthesis)

The extracted gaps + user's completed skills are sent to GPT-4.1 to generate:
- Priority ranking of gaps (critical / high / medium / low)
- Weekly action plan (4 weeks)
- Estimated match score after completing the plan

---

## Job Analysis Entry Points

1. **Job search results** — "🔍 Analyse fit" button on each job card
2. **Company detail pages** — "Analyse your fit for [company] roles →" CTA
3. **Gap Engine page** (`/gap-analysis`) — paste any JD text directly
4. **Onboarding** — after Q1 (target role), immediately show gap vs a sample JD

---

## Persistence

```sql
CREATE TABLE IF NOT EXISTS gap_analyses (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users NOT NULL,
  job_title   text,
  company     text,
  jd_text     text,
  match_score int,           -- 0–100
  strengths   jsonb,         -- [{ skill, source }]
  gaps        jsonb,         -- [{ skill, priority, path_id?, video_id? }]
  action_plan jsonb,         -- [{ week, action, tool, link }]
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE gap_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own gap analyses" ON gap_analyses FOR ALL USING (auth.uid() = user_id);
```

Up to 10 saved analyses per user. Shown on dashboard as "Your job targets."

---

## Cost Model

| Operation | Model | Cost per call |
|-----------|-------|---------------|
| JD embedding | text-embedding-3-small (128d) | ~$0.000002 |
| Skill extraction | gpt-4.1-mini | ~$0.002 |
| Action plan synthesis | gpt-4.1 | ~$0.015 |
| **Total per gap analysis** | | **~$0.017** |

At 1,000 analyses/month: ~$17. At 10,000: ~$170. Well within free-tier subscription margins.

---

## Files

| File | Change |
|------|--------|
| `supabase/012_embeddings.sql` | Create — pgvector, resume_embedding column, ivfflat index |
| `supabase/013_gap_analyses.sql` | Create — gap_analyses table |
| `app/api/gap-analysis/route.ts` | Create — full pipeline: embed → similarity → extract → cross-ref → plan |
| `app/gap-analysis/page.tsx` | Create — standalone page (paste JD) |
| `components/GapAnalysisButton.tsx` | Create — "Analyse fit" button for job cards |
| `components/GapAnalysisResults.tsx` | Create — full results display |
| `app/api/resume-match/route.ts` | Modify — also generate + store resume embedding after analysis |

---

## Acceptance Criteria

- [ ] Resume embedding generated on resume upload, stored in Supabase
- [ ] Pasting any JD returns a gap analysis in <15 seconds
- [ ] Cosine similarity match score is displayed (0–100%)
- [ ] Every gap skill is linked to a specific platform tool (learning path, YouTube video)
- [ ] Action plan shows 4-week prioritised schedule
- [ ] Analysis saves to `gap_analyses` table for logged-in users
- [ ] "Your job targets" section appears on dashboard
- [ ] Cost per analysis < $0.02
- [ ] Works without a resume (shows "Upload resume for personalised results" fallback)
- [ ] `npm run build` passes
