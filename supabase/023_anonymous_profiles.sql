-- Anonymous community profiles for the /network feature (opt-in)
-- One row per user; presence = opted in, absence = opted out.
-- All rows are publicly readable so /network can browse without auth.

CREATE TABLE IF NOT EXISTS public.anonymous_profiles (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_title  text        NOT NULL CHECK (char_length(role_title) BETWEEN 1 AND 100),
  visa_type   text        NOT NULL CHECK (visa_type IN ('485','482','student','pr','citizen','other')),
  skills      text[]      NOT NULL DEFAULT '{}',
  city        text        NOT NULL CHECK (city IN ('Sydney','Melbourne','Brisbane','Perth','Adelaide','Canberra','Other')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.anonymous_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone (including logged-out visitors) can browse profiles for /network
CREATE POLICY "Public read on anonymous_profiles"
  ON public.anonymous_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users insert own anonymous_profile"
  ON public.anonymous_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own anonymous_profile"
  ON public.anonymous_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own anonymous_profile"
  ON public.anonymous_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS anonymous_profiles_city_idx
  ON public.anonymous_profiles (city);

CREATE INDEX IF NOT EXISTS anonymous_profiles_visa_type_idx
  ON public.anonymous_profiles (visa_type);

CREATE INDEX IF NOT EXISTS anonymous_profiles_user_id_idx
  ON public.anonymous_profiles (user_id);
