-- ─────────────────────────────────────────────────────────────
-- Migration 009: Topic-level checkbox persistence
-- Adds checked_topics[] to skill_progress so topic state
-- survives across devices for logged-in users.
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

alter table public.skill_progress
  add column if not exists checked_topics text[] not null default '{}';
