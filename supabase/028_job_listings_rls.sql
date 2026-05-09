-- Enable RLS on job_listings to prevent anon clients reading contact_email directly.
-- service-role (admin + stripe webhook) bypasses RLS automatically — no policy needed.
-- public_job_listings view uses security_invoker=false so it executes as its owner
-- (postgres superuser, BYPASSRLS), allowing anon to read active listings safely.

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Explicit deny-all: belt-and-suspenders alongside the RLS-enabled default.
CREATE POLICY "No direct access to job_listings"
  ON public.job_listings
  FOR ALL
  USING (false);

-- Safe public view: only active, unexpired rows; contact_email excluded.
-- security_invoker=false is required so anon callers can read through the deny policy.
CREATE OR REPLACE VIEW public.public_job_listings
  WITH (security_invoker = false)
AS
  SELECT
    id,
    company,
    logo_url,
    title,
    location,
    job_type,
    description,
    apply_url,
    salary,
    status,
    expires_at,
    posted_at,
    created_at
  FROM public.job_listings
  WHERE status = 'active'
    AND expires_at > now();

GRANT SELECT ON public.public_job_listings TO anon, authenticated;
