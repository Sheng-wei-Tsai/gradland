-- Visa Journey Tracker
-- Stores per-user 482 / Skills in Demand visa progress

CREATE TABLE IF NOT EXISTS visa_tracker (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users NOT NULL,
  employer    text,
  occupation  text,
  started_at  date,
  -- steps: { "1": { status: "completed"|"in_progress"|"not_started", completedAt: "ISO", docs: ["doc1"], notes: "" } }
  steps       jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE visa_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tracker" ON visa_tracker
  FOR ALL USING (auth.uid() = user_id);
