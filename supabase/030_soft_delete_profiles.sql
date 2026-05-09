-- Soft-delete support for profiles.
-- AU Privacy Act APP 13 requires account deletion on request.
-- We soft-delete (set deleted_at) rather than hard-delete so referential integrity
-- is preserved for billing records. A cron job can hard-delete after 30 days.

alter table public.profiles
  add column if not exists deleted_at timestamptz;

-- Deleted profiles are invisible to normal reads.
-- Service role can still see them for billing reconciliation.
create policy "Hide deleted profiles from normal reads"
  on public.profiles
  for select
  using (deleted_at is null or auth.uid() = id);
