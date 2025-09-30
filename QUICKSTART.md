# 🚀 Quick Start Guide

Get the Agentic CRM up and running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node -v`)
- [ ] Git installed
- [ ] Supabase account (free tier)
- [ ] OpenAI API key

## Fast Setup (5 minutes)

### 1. Clone & Install (1 min)

```bash
git clone <your-repo-url>
cd agentic-crm/frontend
npm install
```

### 2. Set Up Database (2 min)

**Option A: Join Existing Project**

- Get credentials from team member
- Skip to step 3

**Option B: Create New Project**

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `agentic-crm`, choose region, save password
3. Wait 2 minutes for provisioning
4. Go to SQL Editor → New Query
5. Copy & paste `/supabase/schema.sql` → Run
6. Copy & paste `/supabase/rls-policies.sql` → Run
7. (Optional) Copy & paste `/supabase/seed.sql` → Run

### 3. Configure Environment (1 min)

Get Supabase credentials from: **Settings → API**

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
OPENAI_API_KEY=sk-...
```

### 4. Launch (1 min)

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

Test DB: [http://localhost:3000/api/test-db](http://localhost:3000/api/test-db)

## Verify Setup ✓

Should see in Supabase → Table Editor:

- ✅ 10 tables created
- ✅ All showing 🟢 RLS enabled
- ✅ Sample data loaded (if you ran seed.sql)

Test API should return:

```json
{
  "success": true,
  "message": "Database connection successful!",
  "tables_accessible": true,
  "auth_working": true
}
```

## Common Issues

**❌ Database connection failed**

- Restart Supabase project if paused (Settings → General)
- Verify `.env.local` has correct URL and keys
- Check you ran `schema.sql` in SQL Editor

**❌ Build errors**

```bash
rm -rf .next node_modules
npm install
npm run build
```

**❌ RLS policy errors**

- Verify you ran `rls-policies.sql`
- Check policies exist: Supabase → Authentication → Policies
- For server-side ops, use `service_role` key

## Next Steps

1. **Add your OpenAI key** to `.env.local`
2. **Create a test user**: Supabase → Authentication → Add User
3. **Start building**: Check `README.md` for detailed docs

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Check code quality

# Database
# Run in Supabase SQL Editor or use CLI
supabase link            # Link to project
supabase db push         # Push migrations
supabase db pull         # Pull remote schema
```

## File Locations

- **Environment**: `frontend/.env.local`
- **Database Schema**: `supabase/schema.sql`
- **RLS Policies**: `supabase/rls-policies.sql`
- **Seed Data**: `supabase/seed.sql`
- **API Test**: `frontend/app/api/test-db/route.ts`
- **Supabase Utils**: `frontend/lib/supabase/`

## Getting Help

- 📖 Full docs: `README.md`
- 🗂️ PRD: `PRD.txt`
- 🏗️ Schema: `supabase/schema.sql`
- 🔧 Tasks: `.taskmaster/tasks/tasks.json`

---

**Need help?** Check the Troubleshooting section in `README.md`
