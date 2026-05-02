-- 020_jobs_v2.sql
-- Additive: source attribution, 3-source dedup key, sponsor tracking.
-- Safe to run on a live table — no drops, no renames.

alter table public.scraped_jobs
  add column if not exists cluster_key       text,
  add column if not exists primary_source    text,
  add column if not exists sources           jsonb default '[]'::jsonb,
  add column if not exists sponsor_signal    boolean default false,
  add column if not exists sponsor_confirmed boolean default false,
  add column if not exists stack             text[] default '{}',
  add column if not exists seniority         text,
  add column if not exists anzsco_code       text;

-- Backfill cluster_key from existing rows
update public.scraped_jobs
  set cluster_key = lower(regexp_replace(trim(title || '|' || company), '\s+', ' ', 'g'))
  where cluster_key is null;

-- Backfill primary_source from existing source column
update public.scraped_jobs
  set primary_source = source
  where primary_source is null;

-- Backfill sources jsonb for existing rows
update public.scraped_jobs
  set sources = jsonb_build_array(
    jsonb_build_object('name', source, 'label', initcap(source), 'apply_url', url)
  )
  where sources = '[]'::jsonb or sources is null;

create index if not exists idx_scraped_jobs_cluster_key on public.scraped_jobs(cluster_key);
create index if not exists idx_scraped_jobs_primary_src on public.scraped_jobs(primary_source);
create index if not exists idx_scraped_jobs_sponsor     on public.scraped_jobs(sponsor_signal) where sponsor_signal = true;
