-- Server-side error log sink for `app/api/log-error/route.ts`.
-- Pairs with Sentry — Sentry handles alerting, this table gives the admin
-- panel a cheap queryable history without pulling from the Sentry API.
-- Inserts come only from the service-role client; RLS denies all direct access.

CREATE TABLE IF NOT EXISTS public.error_logs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message    text        NOT NULL,
  digest     text,
  url        text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to error_logs"
  ON public.error_logs
  FOR ALL
  USING (false);

CREATE INDEX IF NOT EXISTS error_logs_created_at_idx
  ON public.error_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS error_logs_digest_idx
  ON public.error_logs (digest)
  WHERE digest IS NOT NULL;
