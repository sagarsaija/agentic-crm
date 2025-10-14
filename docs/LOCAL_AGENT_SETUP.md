# Local AI Agent Chat - Quick Setup

## The Issue

You're getting a 500 error because the chat is trying to connect to LangGraph Cloud, but we've configured it to use a local endpoint instead. You just need to set up your environment variables.

## Quick Fix (2 minutes)

### Step 1: Create Environment File

```bash
cd frontend
touch .env.local
```

### Step 2: Add Your API Keys

Edit `frontend/.env.local` and add:

```bash
# =============================================
# SUPABASE CONFIGURATION
# =============================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# =============================================
# OPENAI API (REQUIRED for AI chat)
# =============================================
OPENAI_API_KEY=your_openai_api_key_here

# =============================================
# TAVILY API (Optional - for web search)
# =============================================
TAVILY_API_KEY=your_tavily_key_here
```

**Where to get these:**

- **Supabase keys**: Supabase Dashboard → Project Settings → API
- **OpenAI key**: https://platform.openai.com/api-keys
- **Tavily key** (optional): https://tavily.com

### Step 3: Restart Dev Server

```bash
# Kill the current server
Ctrl+C

# Restart
npm run dev
```

### Step 4: Test the Chat

1. Go to http://localhost:3000/agents
2. Try: **"Show me CRM statistics"**
3. Should work now! ✅

## What Changed

I updated the code to use a **local development endpoint** at `/api/agent` instead of trying to connect to LangGraph Cloud:

**Files modified:**

- `frontend/lib/chatApi.ts` - Now uses local endpoint
- `frontend/app/api/agent/route.ts` - Runs the graph locally

**Benefits:**

- ✅ No LangGraph Cloud deployment needed
- ✅ Faster development iteration
- ✅ Works offline (after initial model download)
- ✅ Free (only pay for OpenAI API calls)

## Available Commands

Once running, try these natural language queries:

### Search & Filter

- "Find me 5 leads that are YC founders"
- "Show me all qualified leads with scores above 80"
- "Search for leads in the AI industry"

### Lead Status

- "What is the status of lead [paste UUID]?"
- "Show me details for lead [UUID]"

### Process Workflows

- "Process lead [UUID] through enrichment"
- "Enrich this lead [UUID]"

### Statistics & Overview

- "Show me CRM statistics"
- "What's the average lead score?"
- "Give me an overview of the CRM"

### Agent Management

- "What agents are available?"
- "List all AI agents"
- "Show me workflow status"

## Troubleshooting

### Still getting errors?

**Check the terminal logs** for:

```
Agent request: { threadId: 'thread_...', messageCount: 1 }
```

If you see errors about OpenAI:

- Verify `OPENAI_API_KEY` is set correctly
- Check you have credits at https://platform.openai.com/usage

If you see errors about Supabase:

- Verify all 3 Supabase variables are set
- Test database connection: http://localhost:3000/api/test-db

### Want to see what the agent is thinking?

Check the browser console (F12) - you'll see:

- Tool calls being made
- Search results
- Processing steps

### Performance Tuning

The default model is `gpt-4o`. To make it faster/cheaper, edit `frontend/lib/agents/crm-assistant-graph.ts`:

```typescript
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini", // Change to mini for speed
  temperature: 0.7,
}).bindTools(tools);
```

## Next Steps

1. ✅ Get the chat working locally
2. 🔄 Test all the tools (search, status, process, etc.)
3. 📊 Add more custom tools for your specific needs
4. 🚀 Deploy to LangGraph Cloud when ready for production

See [AGENT_CHAT_SETUP.md](./AGENT_CHAT_SETUP.md) for more details on customizing the agent.

