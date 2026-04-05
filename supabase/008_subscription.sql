-- Migration 008: Subscription tiers + API usage tracking

-- ── 1. Extend profiles with subscription fields ───────────────────────
alter table public.profiles
  add column if not exists subscription_tier       text        not null default 'free'
    check (subscription_tier in ('free', 'pro', 'admin')),
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists stripe_customer_id      text        unique;

-- ── 2. Block self-upgrade: only service role can change subscription_tier
-- auth.uid() is NULL when the service role key is used, so the trigger
-- allows Stripe webhook writes while blocking any user-initiated change.
create or replace function public.guard_subscription_tier()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is not null
     and NEW.subscription_tier is distinct from OLD.subscription_tier
  then
    raise exception 'Permission denied: subscription_tier cannot be changed directly';
  end if;
  return NEW;
end;
$$;

drop trigger if exists guard_subscription_tier on public.profiles;
create trigger guard_subscription_tier
  before update on public.profiles
  for each row execute function public.guard_subscription_tier();

-- ── 3. API usage — for per-user rate limiting ─────────────────────────
create table if not exists public.api_usage (
  id         bigserial    primary key,
  user_id    uuid         references public.profiles(id) on delete cascade not null,
  endpoint   text         not null,
  called_at  timestamptz  not null default now()
);

create index if not exists api_usage_lookup_idx
  on public.api_usage (user_id, called_at desc);

alter table public.api_usage enable row level security;

-- Users can read their own usage (for dashboard/quota display)
create policy "users read own usage"
  on public.api_usage for select
  using (auth.uid() = user_id);

-- Insert via service role only (API routes use service key)
grant select on public.api_usage to authenticated;
grant insert, select on public.api_usage to service_role;
grant usage, select on sequence public.api_usage_id_seq to service_role;
