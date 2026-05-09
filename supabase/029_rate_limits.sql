-- Persistent rate-limit counters — survive cold starts and function recycles.
-- Replaces in-memory Maps in log-error and track routes.
-- key: identifies the rate-limited resource (e.g. "log-error:1.2.3.4")
-- bucket: start-of-window timestamp (aligns to windowSec boundaries)

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key    text        NOT NULL,
  bucket timestamptz NOT NULL,
  count  int         NOT NULL DEFAULT 1,
  PRIMARY KEY (key, bucket)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to rate_limits"
  ON public.rate_limits
  FOR ALL
  USING (false);

CREATE INDEX IF NOT EXISTS rate_limits_bucket_idx
  ON public.rate_limits (bucket);

-- Atomic increment — INSERT on first call, UPDATE count on subsequent calls.
-- Returns the new count after increment.
CREATE OR REPLACE FUNCTION public.increment_rate_limit(p_key text, p_bucket timestamptz)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count int;
BEGIN
  INSERT INTO public.rate_limits (key, bucket, count)
  VALUES (p_key, p_bucket, 1)
  ON CONFLICT (key, bucket) DO UPDATE
    SET count = rate_limits.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;

-- Periodic cleanup — removes buckets older than 2 hours.
-- Called opportunistically; no cron needed for correctness.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE bucket < now() - INTERVAL '2 hours';
END;
$$;
