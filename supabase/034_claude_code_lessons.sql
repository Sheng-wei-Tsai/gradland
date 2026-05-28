-- Claude Code interactive lesson progress + gamification
-- Per-lesson progress row + aggregated user stats (XP, streak, badges)

create table if not exists claude_code_lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_slug  text not null,
  completed_at timestamptz not null default now(),
  quiz_score   int  not null default 0,
  quiz_total   int  not null default 0,
  xp_earned    int  not null default 0,
  terminal_passed boolean not null default false,
  attempts     int  not null default 1,
  unique (user_id, lesson_slug)
);

alter table claude_code_lesson_progress enable row level security;

create policy "Users manage own Claude Code lesson progress"
  on claude_code_lesson_progress
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists claude_code_lesson_progress_user_idx
  on claude_code_lesson_progress (user_id);

-- Aggregated stats row per user. Updated via trigger on lesson_progress writes.
create table if not exists claude_code_user_stats (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  total_xp           int  not null default 0,
  lessons_completed  int  not null default 0,
  current_streak     int  not null default 0,
  longest_streak     int  not null default 0,
  last_activity_date date,
  badges             jsonb not null default '[]'::jsonb,
  updated_at         timestamptz not null default now()
);

alter table claude_code_user_stats enable row level security;

create policy "Users read own Claude Code stats"
  on claude_code_user_stats
  for select
  using (auth.uid() = user_id);

create policy "Users update own Claude Code stats"
  on claude_code_user_stats
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger function: recompute user stats after lesson progress changes.
create or replace function update_claude_code_user_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_xp          int;
  v_lessons_completed int;
  v_existing_streak   int := 0;
  v_existing_longest  int := 0;
  v_last_date         date;
  v_new_streak        int;
  v_today             date := (new.completed_at at time zone 'UTC')::date;
begin
  select coalesce(sum(xp_earned), 0), count(*)
    into v_total_xp, v_lessons_completed
    from claude_code_lesson_progress
   where user_id = new.user_id;

  select current_streak, longest_streak, last_activity_date
    into v_existing_streak, v_existing_longest, v_last_date
    from claude_code_user_stats
   where user_id = new.user_id;

  if v_last_date is null then
    v_new_streak := 1;
  elsif v_last_date = v_today then
    v_new_streak := greatest(v_existing_streak, 1);
  elsif v_last_date = v_today - interval '1 day' then
    v_new_streak := v_existing_streak + 1;
  else
    v_new_streak := 1;
  end if;

  insert into claude_code_user_stats (
    user_id, total_xp, lessons_completed,
    current_streak, longest_streak,
    last_activity_date, updated_at
  ) values (
    new.user_id, v_total_xp, v_lessons_completed,
    v_new_streak, greatest(v_existing_longest, v_new_streak),
    v_today, now()
  )
  on conflict (user_id) do update set
    total_xp           = excluded.total_xp,
    lessons_completed  = excluded.lessons_completed,
    current_streak     = excluded.current_streak,
    longest_streak     = greatest(claude_code_user_stats.longest_streak, excluded.current_streak),
    last_activity_date = excluded.last_activity_date,
    updated_at         = now();

  return new;
end;
$$;

drop trigger if exists claude_code_lesson_progress_after_write on claude_code_lesson_progress;
create trigger claude_code_lesson_progress_after_write
  after insert or update on claude_code_lesson_progress
  for each row execute function update_claude_code_user_stats();

-- The trigger function is SECURITY DEFINER but should NOT be callable as a
-- PostgREST RPC by anon or authenticated. Revoke direct EXECUTE — triggers
-- continue to fire because they run as the table owner regardless of grants.
revoke execute on function public.update_claude_code_user_stats() from public;
revoke execute on function public.update_claude_code_user_stats() from anon;
revoke execute on function public.update_claude_code_user_stats() from authenticated;
