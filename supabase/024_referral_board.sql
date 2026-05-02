-- Extend anonymous_profiles with referral board fields
-- Hired users can post "I can refer you" cards on the /network Referral Board tab.

alter table public.anonymous_profiles
  add column if not exists is_hired      boolean not null default false,
  add column if not exists hired_company text    check (char_length(hired_company) <= 100),
  add column if not exists hired_skills  text[]  not null default '{}',
  add column if not exists hired_message text    check (char_length(hired_message) <= 280);

-- Partial index: only index the rows that appear on the referral board
create index if not exists anonymous_profiles_is_hired_idx
  on public.anonymous_profiles (updated_at desc)
  where is_hired = true;
