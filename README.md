# 🤖 Agentic CRM

An AI-powered CRM system with autonomous agents for lead discovery, enrichment, scoring, and outreach. Built with Next.js, Supabase, LangGraph, and OpenAI.

## 🎯 Project Vision

The Agentic CRM reimagines customer relationship management by placing AI agents at the core. Instead of manual data entry and repetitive tasks, intelligent agents work autonomously to discover leads, enrich data, qualify prospects, and execute personalized outreach at scale.

## 🏗️ Tech Stack

### Frontend

- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first styling
- **shadcn/ui** - Reusable UI components
- **assistant-ui** - AI chat interface components
- **Zustand** - State management
- **React Query** - Server state management

### Backend & Database

- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Row Level Security (RLS)** - Secure data access policies

### AI & Agents

- **LangGraph** - Agent workflow orchestration
- **OpenAI** - GPT-4 for AI capabilities
- **LangChain** - LLM application framework

### DevOps

- **Vercel** - Hosting and deployment
- **GitHub** - Version control

## 📋 Current Progress

### ✅ Completed Tasks

1. **✓ Initialize Next.js Project with TypeScript**

   - Next.js 15.5 with TypeScript configured
   - TailwindCSS 4 and shadcn/ui components
   - assistant-ui with LangGraph template
   - Zustand for state management

2. **✓ Set Up Supabase Project**

   - Supabase project created: `agentic-crm`
   - PostgreSQL database configured
   - Authentication enabled
   - Environment variables configured

3. **✓ Create Database Schema and Migrations**
   - 10 tables created with relationships
   - Row Level Security (RLS) enabled on all tables
   - Indexes for performance optimization
   - Auto-updating timestamps
   - Seed data loaded (sample leads and companies)

### 🚧 In Progress / Next Steps

4. **Install LangGraph and OpenAI SDK** (Next)
5. Build Basic UI Components
6. Implement Lead Enrichment Agent
7. Set Up Firecrawl Integration
8. Create Simple LangGraph Workflow
9. Build Agent Monitoring Dashboard
10. Prepare Demo Data and Scenarios

## 🗄️ Database Schema

### Core Tables

#### `leads`

Stores lead/contact information with enrichment data and AI-generated insights.

- Contact info (name, email, phone, title)
- Company association
- Lead score (0-100)
- Status tracking (new → researching → qualified → contacted → engaged → nurturing → won/lost)
- Enrichment data (LinkedIn, Twitter, location, timezone)
- AI insights (research summary, pain points, buying signals)
- Workflow tracking

#### `companies`

Company information and intelligence.

- Basic info (name, domain, industry, size, revenue)
- Funding data
- Tech stack and competitors
- Recent news and social profiles

#### `activities`

Timeline of all interactions and events.

- Activity types (email, call, meeting, note, agent actions)
- Associated lead and user
- Agent execution tracking

#### `workflows`

LangGraph workflow definitions.

- Workflow type (lead generation, outreach, re-engagement)
- Graph definition (serialized LangGraph)
- Trigger configuration (manual, scheduled, event)

#### `workflow_runs`

Execution history of workflows.

- Current state and node
- Status tracking (running, completed, failed, paused)
- Error logging

#### `agents`

AI agent definitions and configurations.

- Agent type and capabilities
- Configuration parameters
- Active status

#### `agent_runs`

Individual agent execution logs.

- Input/output data
- Execution logs
- Cost tracking (API usage)
- Performance metrics

#### `email_templates`

Reusable email templates for outreach.

#### `email_campaigns`

Email campaign management.

#### `integrations`

Third-party API configurations (encrypted).

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Authenticated users have full access (development setup)
- Service role bypasses RLS for server-side operations
- In production, implement role-based policies

## 🚀 Setup Instructions

### Prerequisites

- **Node.js 18+** and npm
- **Supabase account** (free tier works)
- **OpenAI API key** (for AI agents)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd agentic-crm
```

### 2. Set Up Supabase Project

#### Option A: Use Existing Project (Recommended if collaborating)

1. Get project credentials from team
2. Skip to step 3

#### Option B: Create New Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project:
   - **Name**: `agentic-crm`
   - **Database Password**: Save this securely
   - **Region**: Choose closest to you
3. Wait ~2 minutes for provisioning

#### Apply Database Schema

In Supabase Dashboard → SQL Editor:

1. Run `/supabase/schema.sql` to create all tables
2. Run `/supabase/seed.sql` to add sample data (optional)

Or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

### 3. Configure Environment Variables

Get your Supabase credentials from:
**Supabase Dashboard → Settings → API**

Create `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# LangGraph Configuration (optional, if using LangGraph Cloud)
# LANGGRAPH_API_URL=your_langgraph_api_url_here
# LANGGRAPH_API_KEY=your_langgraph_api_key_here
```

⚠️ **Security Notes:**

- Never commit `.env.local` to git (already in `.gitignore`)
- The `service_role` key bypasses RLS - keep it secret!
- Use environment variables in production deployment

### 4. Install Dependencies

```bash
cd frontend
npm install
```

### 5. Verify Database Connection

Start the development server:

```bash
npm run dev
```

Test the database connection:

```bash
curl http://localhost:3000/api/test-db
```

Expected response:

```json
{
  "success": true,
  "message": "Database connection successful!",
  "tables_accessible": true,
  "auth_working": true,
  "user_authenticated": false
}
```

### 6. View the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
agentic-crm/
├── frontend/                    # Next.js application
│   ├── app/                     # App Router pages
│   │   ├── api/                 # API routes
│   │   │   ├── chat/            # LangGraph chat endpoint
│   │   │   └── test-db/         # Database test endpoint
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── assistant-ui/        # AI chat interface
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/                     # Utilities and helpers
│   │   ├── supabase/            # Supabase client utilities
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Auth middleware
│   │   ├── types/               # TypeScript types
│   │   │   └── database.ts      # Database type definitions
│   │   └── utils.ts             # Utility functions
│   ├── middleware.ts            # Next.js middleware (auth)
│   ├── .env.local              # Environment variables (not in git)
│   ├── .env.example            # Example env file
│   └── package.json            # Dependencies
├── supabase/                    # Database files
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Sample data
├── .taskmaster/                # Task management
├── PRD.txt                     # Product Requirements Document
└── README.md                   # This file
```

## 🔑 Key Files

### Frontend

- **`lib/supabase/client.ts`** - Browser-side Supabase client
- **`lib/supabase/server.ts`** - Server-side Supabase client
- **`lib/types/database.ts`** - TypeScript types for all database tables
- **`middleware.ts`** - Session management for authenticated routes
- **`app/api/test-db/route.ts`** - Database connection test endpoint

### Database

- **`supabase/schema.sql`** - Complete database schema with indexes and triggers
- **`supabase/seed.sql`** - Sample data for development

## 🧪 Testing the Setup

### Test Database Connection

```bash
# Using curl
curl http://localhost:3000/api/test-db

# Or visit in browser
open http://localhost:3000/api/test-db
```

### Verify Tables in Supabase

1. Go to **Supabase Dashboard → Table Editor**
2. You should see 10 tables (all with 🟢 RLS enabled):
   - companies
   - leads
   - activities
   - workflows
   - workflow_runs
   - agents
   - agent_runs
   - email_templates
   - email_campaigns
   - integrations

### Query Sample Data

In **Supabase Dashboard → SQL Editor**:

```sql
-- View all leads with company info
SELECT
  l.first_name,
  l.last_name,
  l.email,
  l.title,
  l.status,
  l.score,
  c.name as company_name,
  c.industry
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id
ORDER BY l.score DESC;
```

## 🎨 Features Roadmap

### Phase 1: Core CRM (✅ Complete)

- ✅ Lead CRUD operations (database ready)
- ✅ Company management (database ready)
- ✅ Activity timeline (database ready)
- ✅ Basic pipeline stages (schema ready)

### Phase 2: Basic Agents (In Progress)

- ⏳ Simple LangGraph setup
- ⏳ Lead Enrichment Agent (basic web search)
- ⏳ Scoring Agent (rule-based)
- ⏳ Basic workflow: Add lead → Enrich → Score → Update
- ⏳ Agent activity logs

### Phase 3: Lead Generation

- ⏳ Web Scraper Agent (Firecrawl)
- ⏳ Natural language search interface
- ⏳ Agent Discovery workflow
- ⏳ Deduplication logic

### Phase 4: Outreach

- ⏳ Content Generation Agent
- ⏳ Email template management
- ⏳ Personalization engine
- ⏳ Email sending (Resend integration)

### Phase 5: Advanced Workflows

- ⏳ Complex multi-agent workflows
- ⏳ Conditional routing
- ⏳ Human-in-the-loop approvals
- ⏳ Visual workflow builder

## 🤝 Contributing

This is an MVP project. Key principles:

- **Speed over perfection** - Get it working first
- **AI-first** - Agents should do the heavy lifting
- **Practical** - Build what actually helps sales teams
- **Extensible** - Easy to add new agents and workflows

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [assistant-ui Documentation](https://www.assistant-ui.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** `Database connection failed`

**Solutions:**

1. Check `.env.local` has correct credentials
2. Verify Supabase project is running (not paused)
3. Run schema.sql in Supabase SQL Editor
4. Check network/firewall isn't blocking Supabase

### Build Errors

**Problem:** TypeScript errors or build failures

**Solutions:**

```bash
# Clear Next.js cache
rm -rf frontend/.next

# Reinstall dependencies
rm -rf frontend/node_modules
cd frontend && npm install

# Rebuild
npm run build
```

### RLS Policy Issues

**Problem:** "new row violates row-level security policy"

**Solutions:**

1. Make sure you're authenticated (create a test user)
2. Verify RLS policies exist (check Supabase → Authentication → Policies)
3. Use `service_role` key on server-side for admin operations

## 📝 License

MIT

---

**Built with ❤️ using AI agents**
