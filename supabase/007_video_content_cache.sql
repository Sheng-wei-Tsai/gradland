-- Migration 007: Global video content cache
-- Shared across all users — first visitor generates content, everyone else reads from DB

create table if not exists public.video_content (
  id             bigserial primary key,
  video_id       text unique not null,
  video_title    text,
  channel_title  text,
  study_guide    jsonb,
  quiz_questions jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Non-personal shared cache — no RLS needed
grant select, insert, update on public.video_content to anon, authenticated;
grant usage, select on sequence public.video_content_id_seq to anon, authenticated;
