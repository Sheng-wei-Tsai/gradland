-- Migration 015: User active learning paths
-- Tracks which paths a user has enrolled in (separate from per-skill progress)

create table if not exists public.user_active_paths (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  path_id     text not null,
  enrolled_at timestamptz default now(),
  unique(user_id, path_id)
);

alter table public.user_active_paths enable row level security;

create policy "Users can view own active paths"
  on public.user_active_paths for select using (auth.uid() = user_id);

create policy "Users can insert own active paths"
  on public.user_active_paths for insert with check (auth.uid() = user_id);

create policy "Users can delete own active paths"
  on public.user_active_paths for delete using (auth.uid() = user_id);
