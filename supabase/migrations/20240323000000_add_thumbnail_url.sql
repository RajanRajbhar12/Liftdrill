-- Add thumbnail_url column to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN challenges.thumbnail_url IS 'URL of the challenge thumbnail image stored in Supabase Storage';

-- Update RLS policies to allow access to thumbnail_url
ALTER POLICY "Enable read access for all users" ON challenges
USING (true);

-- Add index for faster thumbnail_url lookups
CREATE INDEX IF NOT EXISTS idx_challenges_thumbnail_url ON challenges(thumbnail_url); 