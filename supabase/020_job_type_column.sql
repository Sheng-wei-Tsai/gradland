-- 020_job_type_column.sql
-- Add job_type column to scraped_jobs for filtering remote/freelance/onsite jobs.
-- Also updates the source constraint to include new sources (arbeitnow, freelancer).

-- Add job_type column (defaults to 'onsite' for all existing rows)
alter table public.scraped_jobs
  add column if not exists job_type text not null default 'onsite';

-- Add index for job_type filtering
create index if not exists idx_scraped_jobs_job_type on public.scraped_jobs (job_type);

-- Add composite index for common query pattern: job_type + expires_at
create index if not exists idx_scraped_jobs_type_expires on public.scraped_jobs (job_type, expires_at);

-- Comment for documentation
comment on column public.scraped_jobs.job_type is 'Job arrangement type: onsite, remote, or freelance';
