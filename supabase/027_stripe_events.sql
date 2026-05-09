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

-- Deny all access to anon and authenticated roles — service role bypasses RLS.
CREATE POLICY "No direct access to stripe_events"
  ON public.stripe_events
  FOR ALL
  USING (false);

CREATE INDEX IF NOT EXISTS stripe_events_processed_at_idx
  ON public.stripe_events (processed_at);
