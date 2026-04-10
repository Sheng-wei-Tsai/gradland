-- ─────────────────────────────────────────────────────────────
-- 013 — Resume analyses persistence
-- Stores the score each time a user runs the Resume Analyser
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  overall_score   int  NOT NULL,         -- 0–100
  format_score    int,
  content_score   int,
  market_fit_score int,
  analysed_at     timestamptz DEFAULT now()
);

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON public.resume_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses"
  ON public.resume_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
