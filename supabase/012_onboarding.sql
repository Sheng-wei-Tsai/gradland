-- ─────────────────────────────────────────────────────────────
-- 012 — Onboarding profile columns
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_role          text,
  ADD COLUMN IF NOT EXISTS onboarding_visa_status   text,
  ADD COLUMN IF NOT EXISTS onboarding_job_stage     text,
  ADD COLUMN IF NOT EXISTS onboarding_completed     boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at  timestamptz;
