-- ─────────────────────────────────────────────────────────────
-- Migration 005: role column + post_comments table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- 1. Add role to profiles
alter table public.profiles
  add column if not exists role text not null default 'user';

-- 2. Post comments
create table if not exists public.post_comments (
  id          uuid default gen_random_uuid() primary key,
  post_slug   text not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null check (char_length(content) between 1 and 2000),
  parent_id   uuid references public.post_comments(id) on delete cascade,
  edited_at   timestamptz,
  created_at  timestamptz default now()
);

create index if not exists post_comments_slug_idx   on public.post_comments (post_slug, created_at);
create index if not exists post_comments_parent_idx on public.post_comments (parent_id);

-- 3. RLS
alter table public.post_comments enable row level security;

create policy "Public can read comments"
  on public.post_comments for select using (true);

create policy "Authenticated users can post"
  on public.post_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can edit own comments"
  on public.post_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.post_comments for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. Set your admin user (run after migration)
-- update public.profiles set role = 'admin' where email = 'henrytsaiqut@gmail.com';
