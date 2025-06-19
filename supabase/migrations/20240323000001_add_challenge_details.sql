-- Add missing columns to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS scoring_method TEXT,
ADD COLUMN IF NOT EXISTS video_duration_limit INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS prize_distribution TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add comments to explain the columns
COMMENT ON COLUMN challenges.max_participants IS 'Maximum number of participants allowed in the challenge';
COMMENT ON COLUMN challenges.scoring_method IS 'Method used to score participants (e.g., fastest_time, max_reps, longest_hold)';
COMMENT ON COLUMN challenges.video_duration_limit IS 'Maximum duration of submission videos in seconds';
COMMENT ON COLUMN challenges.prize_distribution IS 'How the prize pool is distributed (e.g., winner_takes_all, top_3_split)';
COMMENT ON COLUMN challenges.is_public IS 'Whether the challenge is visible to all users';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_challenges_scoring_method ON challenges(scoring_method);
CREATE INDEX IF NOT EXISTS idx_challenges_is_public ON challenges(is_public);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status); 