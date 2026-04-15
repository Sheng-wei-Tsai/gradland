-- 019_gap_analysis.sql
-- Job-to-Gap Engine: stores cached skill gap analyses per user+job
-- pgvector extension is already enabled (applied separately)

create table if not exists public.job_gap_analyses (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  job_id          text not null,                    -- AdzunaJob.id (e.g. "jsearch-xxx")
  job_title       text not null,
  company         text not null,
  match_percent   int not null default 0,           -- 0-100
  matched_skills  text[] not null default '{}',     -- skills user has started/mastered
  missing_skills  jsonb not null default '[]',      -- [{name, pathId, skillId, learnUrl}]
  all_jd_skills   text[] not null default '{}',     -- all skills extracted from JD
  recommended_paths text[] not null default '{}',   -- e.g. ['junior-frontend']
  created_at      timestamptz default now() not null,
  expires_at      timestamptz not null,             -- created_at + 7 days
  unique(user_id, job_id)
);

create index if not exists idx_gap_analyses_user     on public.job_gap_analyses (user_id);
create index if not exists idx_gap_analyses_expires  on public.job_gap_analyses (expires_at);

alter table public.job_gap_analyses enable row level security;

create policy "Users can read own gap analyses"
  on public.job_gap_analyses for select using (auth.uid() = user_id);

create policy "Users can insert own gap analyses"
  on public.job_gap_analyses for insert with check (auth.uid() = user_id);

create policy "Users can update own gap analyses"
  on public.job_gap_analyses for update using (auth.uid() = user_id);
