-- GitHub Skill Progress tracking
-- Mirrors the dual-layer pattern of claude_code_progress

create table if not exists github_skill_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table github_skill_progress enable row level security;

create policy "Users manage own GitHub skill progress"
  on github_skill_progress
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists github_skill_progress_user_idx on github_skill_progress (user_id);
