# 🚀 Complete Setup Guide - Agentic CRM

This guide walks you through setting up the Agentic CRM from scratch, with detailed explanations for each step.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Common Issues](#common-issues)

---

## Prerequisites

### Required Software

- **Node.js 18+** and npm
  ```bash
  node --version  # Should be 18.0.0 or higher
  npm --version
  ```

### Required API Keys

| Service      | Purpose               | Cost                         | Get Key                                                     |
| ------------ | --------------------- | ---------------------------- | ----------------------------------------------------------- |
| **Supabase** | Database & Auth       | Free tier available          | [supabase.com](https://supabase.com)                        |
| **OpenAI**   | AI agent operations   | Pay-as-you-go (~$0.002/lead) | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Tavily**   | Web search for agents | Free tier: 1K requests/month | [tavily.com](https://tavily.com)                            |

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd agentic-crm
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

This installs:

- Next.js 15.5 + React 19
- TailwindCSS 4 + shadcn/ui
- Supabase client
- OpenAI SDK + LangChain
- Tavily for web search
- assistant-ui for AI chat

---

## Supabase Configuration

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project details:

   - **Name**: `agentic-crm` (or your choice)
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to you
   - **Plan**: Free tier is fine for development

4. Wait ~2 minutes for project initialization

### Step 2: Get API Credentials

1. Go to **Project Settings** (gear icon)
2. Click **API** in sidebar
3. Copy these values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (keep secret!)
   ```

### Step 3: Apply Database Schema

#### Option A: Using Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Repeat for `supabase/seed.sql` (sample data)
6. Repeat for `supabase/rls-policies.sql` (security)

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Step 4: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see 10 tables:

   - `leads`
   - `companies`
   - `activities`
   - `agents`
   - `workflows`
   - `workflow_runs`
   - `agent_runs`
   - `email_templates`
   - `email_campaigns`
   - `integrations`

3. Check sample data in `leads` table (should have 3 rows)

### Step 5: Verify RLS Policies

1. Go to **Authentication** → **Policies**
2. Each table should have 2 policies:
   - **Read policy** for `anon` and `authenticated` roles
   - **Modify policy** for `authenticated` role only

---

## Environment Variables

### Create `.env.local` File

In `frontend/` directory:

```bash
cd frontend
touch .env.local
```

### Add Configuration

Copy this template and fill in your actual values:

```bash
# =============================================
# SUPABASE CONFIGURATION
# =============================================
# Get these from Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key

# =============================================
# OPENAI API
# =============================================
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...your-openai-key

# =============================================
# TAVILY API (Web Search)
# =============================================
# Get from: https://tavily.com
# Free tier: 1,000 requests/month
TAVILY_API_KEY=tvly-...your-tavily-key

# =============================================
# OPTIONAL: LANGGRAPH CLOUD
# =============================================
# Only needed if using LangGraph Cloud (not required for MVP)
# LANGGRAPH_API_URL=https://your-deployment.langchain.app
# LANGGRAPH_API_KEY=your-langgraph-key
```

### Environment Variables Explained

| Variable                        | Required       | Purpose                           | Where to Get                          |
| ------------------------------- | -------------- | --------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅ Yes         | Supabase API endpoint             | Project Settings → API                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes         | Public API key (safe for browser) | Project Settings → API                |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅ Yes         | Admin key for server-side ops     | Project Settings → API (keep secret!) |
| `OPENAI_API_KEY`                | ✅ Yes         | OpenAI API access                 | platform.openai.com/api-keys          |
| `TAVILY_API_KEY`                | ⚠️ Recommended | Web search for enrichment         | tavily.com (free signup)              |
| `LANGGRAPH_API_URL`             | ❌ Optional    | LangGraph Cloud endpoint          | Not needed for MVP                    |
| `LANGGRAPH_API_KEY`             | ❌ Optional    | LangGraph Cloud auth              | Not needed for MVP                    |

### Security Notes

🔐 **Never commit `.env.local` to git!**

The `.gitignore` is already configured to exclude it, but double-check:

```bash
# Verify .env.local is ignored
git status  # Should NOT show .env.local
```

---

## Running the Application

### Start Development Server

```bash
cd frontend
npm run dev
```

Expected output:

```
  ▲ Next.js 15.5.4 (Turbopack)
  - Local:        http://localhost:3000
  - Network:      http://10.0.0.90:3000
  - Environments: .env.local, .env

✓ Starting...
✓ Compiled middleware in 180ms
✓ Ready in 1255ms
```

### Access the Application

Open your browser to: **http://localhost:3000**

You should be redirected to: **http://localhost:3000/dashboard**

---

## Verification

### 1. Test Database Connection

Visit: http://localhost:3000/api/test-db

Expected response:

```json
{
  "success": true,
  "message": "Database connection successful",
  "tables": ["leads", "companies", "activities", ...],
  "leadCount": 3
}
```

### 2. Test OpenAI Integration

Visit: http://localhost:3000/api/test-openai

Expected response:

```json
{
  "success": true,
  "message": "OpenAI test successful",
  "response": "Hello! I'm working correctly..."
}
```

### 3. Test Full Integration

Visit: http://localhost:3000/api/test-all

Should show success for:

- ✅ Supabase connection
- ✅ OpenAI API
- ✅ LangChain agent

### 4. Test UI Pages

| Page             | URL                                           | What to Check               |
| ---------------- | --------------------------------------------- | --------------------------- |
| **Dashboard**    | `/dashboard`                                  | Stats cards load, no errors |
| **Leads List**   | `/leads`                                      | Table shows 3 sample leads  |
| **Lead Detail**  | `/leads/650e8400-e29b-41d4-a716-446655440001` | Profile loads, tabs work    |
| **AI Assistant** | `/agents`                                     | Chatbot interface renders   |

### 5. Test AI Enrichment

1. Go to any lead: http://localhost:3000/leads/650e8400-e29b-41d4-a716-446655440002
2. Click **"AI Enrich"** button (top right)
3. Wait 10-30 seconds
4. Page refreshes automatically
5. Click **"Research"** tab
6. Should see:
   - Research summary
   - Pain points (list)
   - Buying signals (list)
7. Check **"Timeline"** tab for enrichment log entry

**Expected Console Output**:

```
Enriching lead: Jane Smith
Starting enrichment for Jane Smith
Search completed, analyzing data...
Enrichment completed
POST /api/leads/.../enrich 200 in 12000ms
```

---

## Common Issues

### Issue 1: Pages Show 404

**Symptom**: All pages return "404 - This page could not be found"

**Causes**:

- Dev server not running
- Environment variables not loaded

**Solution**:

```bash
# Kill any existing server
pkill -f "next dev"

# Restart with env vars
cd frontend
npm run dev
```

### Issue 2: "Error fetching lead"

**Symptom**: Lead pages show 404, console shows:

```
Error fetching lead: {
  code: 'PGRST116',
  message: 'Cannot coerce the result to a single JSON object'
}
```

**Cause**: RLS policies blocking anonymous access

**Solution**: Re-run RLS policies SQL:

```sql
-- In Supabase SQL Editor
-- Paste contents of supabase/rls-policies.sql
-- Click Run
```

### Issue 3: Enrichment Fails

**Symptom**: "Failed to enrich lead" alert, console shows:

```
Update error: { code: 'PGRST116', ... }
```

**Cause**: Missing `SUPABASE_SERVICE_ROLE_KEY`

**Solution**:

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
2. Restart dev server
3. Try enrichment again

### Issue 4: Slow/Timeout Enrichment

**Symptom**: Enrichment takes >60 seconds or times out

**Causes**:

- Tavily API slow/rate limited
- OpenAI API slow
- Network issues

**Solutions**:

```typescript
// Increase timeout in: app/api/leads/[id]/enrich/route.ts
export const maxDuration = 120; // Increase from 60 to 120 seconds
```

### Issue 5: Mock Data Instead of Real Search

**Symptom**: Enrichment works but data looks generic

**Cause**: Missing `TAVILY_API_KEY`

**Solution**:

1. Sign up at [tavily.com](https://tavily.com)
2. Get free API key (1,000 requests/month)
3. Add to `.env.local`:
   ```bash
   TAVILY_API_KEY=tvly-your-key-here
   ```
4. Restart dev server

### Issue 6: Environment Variables Not Loading

**Symptom**: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` shows `undefined`

**Causes**:

- Typo in variable name
- Missing `.env.local` file
- Dev server not restarted after changes

**Solution**:

```bash
# 1. Verify file exists
ls -la frontend/.env.local

# 2. Check variable names match exactly
cat frontend/.env.local | grep NEXT_PUBLIC

# 3. Restart dev server (REQUIRED after any .env changes)
pkill -f "next dev"
cd frontend && npm run dev
```

---

## Next Steps

Once setup is complete:

1. **Explore the UI**: Click through dashboard, leads, and agents pages
2. **Test AI Enrichment**: Enrich a few leads to see the agent in action
3. **Check Documentation**:
   - [LEAD_ENRICHMENT.md](./LEAD_ENRICHMENT.md) - Deep dive into enrichment agent
   - [AI_SETUP.md](./AI_SETUP.md) - AI architecture and patterns
4. **Review Database**: Explore tables in Supabase to understand data model
5. **Start Building**: Move on to Task 7 (Firecrawl Integration) or customize the UI

---

## Getting Help

If you encounter issues not covered here:

1. Check the terminal console for error messages
2. Check browser DevTools console
3. Review Supabase logs (Dashboard → Logs)
4. Check OpenAI usage dashboard for API errors
5. Open an issue with error details

---

**Setup complete! 🎉 You're ready to build with the Agentic CRM!**
