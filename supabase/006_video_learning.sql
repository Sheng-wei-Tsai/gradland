-- Migration 006: Video learning progress

create table if not exists public.video_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  video_id    text not null,
  video_title text not null,
  channel     text not null default 'ibm',
  -- study guide cached so we don't re-analyse on every visit
  study_guide jsonb,
  -- quiz results
  quiz_score  int,
  quiz_taken  boolean not null default false,
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, video_id)
);

alter table public.video_progress enable row level security;

create policy "own video progress" on public.video_progress
  for all using (auth.uid() = user_id);
