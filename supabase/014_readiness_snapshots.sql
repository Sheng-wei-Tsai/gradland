-- ─────────────────────────────────────────────────────────────
-- 014 — Daily readiness score snapshots
-- Upserted once per day on dashboard load for trend history
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.readiness_snapshots (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users NOT NULL,
  score            int  NOT NULL,
  resume_score     int,
  skills_score     int,
  interview_score  int,
  quiz_score       int,
  recorded_at      date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, recorded_at)
);

ALTER TABLE public.readiness_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own snapshots"
  ON public.readiness_snapshots FOR ALL USING (auth.uid() = user_id);
