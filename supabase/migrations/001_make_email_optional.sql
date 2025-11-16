-- Migration: Make email optional in leads table
-- Reason: Allow leads to be created without email, which will be filled by AI agents (Contact Finder, Profile Scraper)

-- Remove NOT NULL constraint from email column
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Add comment explaining why email is optional
COMMENT ON COLUMN leads.email IS 'Email address - can be null initially and filled by AI agents during lead processing workflow';

