# ⚡ Quick Start - Agentic CRM

Get up and running in 5 minutes!

## 🎯 What You'll Get

- ✅ Next.js CRM with AI agents
- ✅ 3 sample leads with data
- ✅ AI lead enrichment agent
- ✅ Interactive AI assistant chatbot
- ✅ Complete CRM dashboard

## 📋 Prerequisites

- Node.js 18+
- Supabase account (free)
- OpenAI API key

## 🚀 Setup Steps

### 1. Clone & Install (2 min)

```bash
git clone <your-repo-url>
cd agentic-crm/frontend
npm install
```

### 2. Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `agentic-crm`, choose a password & region
3. Wait ~2 minutes for it to initialize

### 3. Set Up Database (1 min)

In Supabase dashboard:

1. Go to **SQL Editor** → **New query**
2. Copy/paste contents of `supabase/schema.sql` → **Run**
3. Repeat with `supabase/seed.sql` → **Run**
4. Repeat with `supabase/rls-policies.sql` → **Run**

✅ You now have 10 tables with sample data!

### 4. Configure Environment (1 min)

Create `frontend/.env.local`:

```bash
# Get these from Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Optional: Get from https://tavily.com (free tier)
TAVILY_API_KEY=tvly-...
```

### 5. Start the App! (30 sec)

```bash
npm run dev
```

Visit: **http://localhost:3000** 🎉

## 🎮 Try It Out

### View Leads

Visit: http://localhost:3000/leads

See 3 sample leads: John Doe, Jane Smith, Bob Johnson

### Test AI Enrichment

1. Click on any lead
2. Click **"AI Enrich"** button (top right)
3. Wait ~15 seconds
4. View results in **Research** tab!

**What it does:**

- Searches web for lead info (or uses mock data without Tavily)
- AI analyzes and extracts insights
- Updates lead profile with:
  - Research summary
  - Pain points
  - Buying signals
  - Social profiles

### Chat with AI Assistant

Visit: http://localhost:3000/agents

Ask the AI assistant about your CRM data!

## 🧪 Verify Everything Works

Visit: http://localhost:3000/api/test-all

Should show:

- ✅ Supabase connected
- ✅ OpenAI working
- ✅ LangChain agent ready

## 📊 What's Included

| Page             | URL           | What You Can Do                    |
| ---------------- | ------------- | ---------------------------------- |
| **Dashboard**    | `/dashboard`  | View overview and metrics          |
| **Leads List**   | `/leads`      | Browse and filter leads            |
| **Lead Detail**  | `/leads/[id]` | View profile, enrich, see timeline |
| **AI Assistant** | `/agents`     | Chat with CRM assistant            |
| **Workflows**    | `/workflows`  | (Coming soon)                      |

## 🐛 Quick Troubleshooting

### Pages Show 404?

```bash
# Restart dev server
pkill -f "next dev"
cd frontend && npm run dev
```

### "Error fetching lead"?

- Check `.env.local` has all required vars
- Restart dev server after adding env vars
- Verify RLS policies were applied

### Enrichment Fails?

- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify `OPENAI_API_KEY` is valid
- Restart dev server

## 📚 Next Steps

1. **Explore the code**: Check out `lib/agents/lead-enrichment-agent.ts`
2. **Read the docs**: [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for details
3. **Learn about enrichment**: [LEAD_ENRICHMENT.md](./docs/LEAD_ENRICHMENT.md)
4. **Customize**: Modify UI components, add new agents, build workflows

## 💡 Tips

- **Cost**: ~$0.003 per lead enrichment
- **Free Tiers**: Supabase, Tavily (1K requests), OpenAI pay-as-you-go
- **Local Dev**: Everything runs locally, no deployment needed
- **Sample Data**: 3 leads, 2 companies, activities pre-loaded

## 🎯 What's Next?

**Current Status**: ✅ Tasks 1-6 Complete

**Next Up**:

- Task 7: Firecrawl Integration (web scraping)
- Task 8: LangGraph Workflows
- Task 9: Agent Monitoring Dashboard

---

**Questions?** Check [README.md](./README.md) or [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for detailed info!

**Ready to build!** 🚀
