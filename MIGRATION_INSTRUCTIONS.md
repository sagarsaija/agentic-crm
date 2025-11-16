# Database Migration Instructions

## Issue

The `leads` table had `email` as a required (NOT NULL) field, preventing creation of leads without email addresses. This conflicts with the AI agent workflow where emails can be discovered by the Contact Finder or Profile Scraper agents.

## Solution

Run the migration to make `email` optional in the `leads` table.

## How to Run Migration

### Option 1: Using Supabase CLI (Recommended)

```bash
# If you have Supabase CLI installed
cd /Users/sagarsaija/Code/agentic-crm
supabase db push
```

### Option 2: Manual SQL (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL:

```sql
-- Remove NOT NULL constraint from email column
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Add comment explaining why email is optional
COMMENT ON COLUMN leads.email IS 'Email address - can be null initially and filled by AI agents during lead processing workflow';
```

### Option 3: Direct psql

```bash
# Connect to your database
psql postgresql://[your-connection-string]

# Run the migration
\i supabase/migrations/001_make_email_optional.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- Check the column constraint
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'leads' AND column_name = 'email';

-- Should return:
-- column_name | is_nullable | data_type
-- email       | YES         | text
```

## What This Enables

Now you can:

✅ Create leads with just name (no email required)  
✅ Add LinkedIn/X URL for Profile Scraper to find email  
✅ Let Contact Finder agent discover email via web search  
✅ Manually add email later if discovered externally  

## Schema Changes

**Before:**
```sql
email TEXT NOT NULL
```

**After:**
```sql
email TEXT  -- Optional - can be filled by AI agents
```

## Affected Features

- ✅ **Add Lead Form**: Now accepts leads without email
- ✅ **Profile Scraper**: Can extract email from LinkedIn
- ✅ **Contact Finder**: Can discover email via web search
- ✅ **Lead Processing Workflow**: Works with or without initial email

## Rollback (If Needed)

If you need to revert this change:

```sql
-- First, update any NULL emails to a placeholder or delete those records
UPDATE leads SET email = 'unknown@pending.com' WHERE email IS NULL;

-- Then add back the NOT NULL constraint
ALTER TABLE leads ALTER COLUMN email SET NOT NULL;
```

⚠️ **Warning**: Rollback will fail if you have leads without emails. Clean them up first!

