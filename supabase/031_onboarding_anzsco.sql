-- ─────────────────────────────────────────────────────────────
-- 031 — Onboarding ANZSCO + experience
-- Extends 012_onboarding to capture occupation code + years experience
-- so visa pathway / TSMIT compliance / sponsor matching can work.
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_anzsco           text,
  ADD COLUMN IF NOT EXISTS onboarding_experience_years int;
