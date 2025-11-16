-- Quick Fix: Make email optional in leads table
-- Run this in your Supabase SQL Editor

ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Verify it worked
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'leads' AND column_name = 'email';

-- Should show: is_nullable = YES

