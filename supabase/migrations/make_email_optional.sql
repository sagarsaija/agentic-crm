-- Make email field optional in leads table
-- This allows leads to be created without email (AI will find it later)

ALTER TABLE leads
ALTER COLUMN email DROP NOT NULL;

-- Add comment to document this change
COMMENT ON COLUMN leads.email IS 'Email address (optional - AI will find it if not provided)';

