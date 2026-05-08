-- Stripe event deduplication table.
-- Prevents duplicate processing when Stripe replays a webhook event.
-- Service-role only: RLS is enabled with no anon/user policies (deny-all for normal clients).
-- Referenced by app/api/stripe/webhook/route.ts idempotency guard.

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id       text        PRIMARY KEY,
  event_type     text        NOT NULL,
  processed_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — all access is via the service-role key which bypasses RLS.
