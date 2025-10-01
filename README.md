# 🤖 Agentic CRM

An AI-powered CRM system with autonomous agents for lead discovery, enrichment, scoring, and outreach. Built with Next.js, Supabase, LangGraph, and OpenAI.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)

## 🎯 Project Vision

The Agentic CRM reimagines customer relationship management by placing AI agents at the core. Instead of manual data entry and repetitive tasks, intelligent agents work autonomously to discover leads, enrich data, qualify prospects, and execute personalized outreach at scale.

## ✨ Features

- **🤖 AI Lead Enrichment**: Automatically research and enrich lead profiles with web data
- **📊 Lead Management**: Track leads through the sales pipeline with status tracking
- **🎯 Smart Scoring**: AI-powered lead scoring based on engagement and fit
- **🔄 Automated Workflows**: Multi-step LangGraph workflows for lead processing
- **🌐 Web Scraping**: Firecrawl-powered company intelligence gathering
- **💬 AI Assistant**: Interactive chatbot for CRM operations using assistant-ui
- **📈 Dashboard**: Overview of leads, activities, and agent performance
- **⏱️ Activity Timeline**: Complete history of all interactions and agent actions
- **🔐 Secure Access**: Row Level Security (RLS) with Supabase

## 🏗️ Tech Stack

### Frontend

- **Next.js 15.5** - React framework with App Router & Server Components
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **assistant-ui** - AI chat interface with LangGraph integration
- **Zustand** - Lightweight state management

### Backend & Database

- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** - Secure, policy-based data access
- **Supabase Auth** - Authentication and authorization

### AI & Agents

- **OpenAI GPT-4o-mini** - Fast, cost-effective LLM for agent operations
- **LangChain** - LLM application framework
- **LangGraph** - State-based workflow orchestration (pattern)
- **Tavily** - AI-optimized search API for web research
- **Firecrawl** - Intelligent web scraping and data extraction
- **assistant-ui** - React components for AI chat interfaces

### DevOps & Tools

- **Vercel** - Hosting and deployment (recommended)
- **Task Master AI** - Project task management and planning

## 📋 Task Progress

### ✅ Phase 1: Foundation (Complete)

| Task                          | Status  | Description                                              |
| ----------------------------- | ------- | -------------------------------------------------------- |
| 1. Initialize Next.js Project | ✅ Done | Next.js 15.5 + TypeScript + TailwindCSS + assistant-ui   |
| 2. Set Up Supabase            | ✅ Done | Database, Auth, RLS configured                           |
| 3. Database Schema            | ✅ Done | 10 tables with relationships, indexes, seed data         |
| 4. Install AI Packages        | ✅ Done | LangGraph, OpenAI SDK, Tavily, LangChain                 |
| 5. Build Basic UI             | ✅ Done | Dashboard, Leads List, Lead Detail, Sidebar, Agents page |
| 6. Lead Enrichment Agent      | ✅ Done | Web search + AI analysis agent with API endpoint         |

### ✅ Phase 2: Advanced Features (Complete!)

| Task                     | Status  | Description                                               |
| ------------------------ | ------- | --------------------------------------------------------- |
| 7. Firecrawl Integration | ✅ Done | Web scraping with company intelligence agent              |
| 8. LangGraph Workflows   | ✅ Done | Multi-step lead processing workflow with state management |
| 9. Agent Monitoring      | ✅ Done | Real-time agent activity dashboard with metrics           |
| 10. Demo Data            | ✅ Done | Rich demo data and presentation scenarios                 |

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Supabase Account** (free tier available)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Tavily API Key** ([Get one here](https://tavily.com)) - Free tier: 1,000 requests/month

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd agentic-crm

# Install dependencies
cd frontend
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (~2 minutes)
3. Go to **Project Settings** → **API** to find your credentials

#### Apply Database Schema

```bash
# Using Supabase MCP (recommended if available)
# Or manually in Supabase SQL Editor:

# 1. Run schema.sql to create tables
# 2. Run seed.sql to load sample data
# 3. Run rls-policies.sql to set up security
```

The schema includes:

- ✅ 10 tables (leads, companies, activities, agents, workflows, etc.)
- ✅ Indexes for performance
- ✅ RLS policies configured
- ✅ Sample data (3 leads, 2 companies, activities)

### 3. Configure Environment Variables

Create `frontend/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI API Key (required)
OPENAI_API_KEY=sk-your-openai-key-here

# Tavily API (for web search in agents)
TAVILY_API_KEY=tvly-your-key-here

# Optional: LangGraph Cloud (not required for MVP)
# LANGGRAPH_API_URL=https://your-deployment.langchain.app
# LANGGRAPH_API_KEY=your-langgraph-key
```

### 4. Start Development Server

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 📱 Application Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (crm)/                   # CRM routes (with sidebar layout)
│   │   ├── dashboard/           # Dashboard overview
│   │   ├── leads/               # Leads list and detail pages
│   │   │   └── [id]/           # Individual lead page
│   │   │       ├── page.tsx    # Lead detail with tabs
│   │   │       ├── enrich-button.tsx  # AI enrichment button
│   │   │       └── workflow-button.tsx  # Workflow automation
│   │   ├── agents/              # AI assistant chatbot
│   │   ├── monitor/             # Agent monitoring dashboard
│   │   │   ├── page.tsx        # Real-time dashboard
│   │   │   ├── activity-feed.tsx  # Live activity feed
│   │   │   ├── metrics-charts.tsx  # Performance charts
│   │   │   └── agent-status-cards.tsx  # Agent controls
│   │   ├── companies/[id]/      # Company detail pages
│   │   └── layout.tsx          # Shared sidebar layout
│   ├── api/                     # API routes
│   │   ├── leads/[id]/enrich/  # Lead enrichment endpoint
│   │   ├── workflows/lead-processing/  # Workflow execution
│   │   ├── companies/[id]/scrape/  # Company scraping
│   │   └── test-*/             # Testing endpoints
│   └── page.tsx                # Root (redirects to dashboard)
├── components/
│   ├── layout/                  # Layout components
│   │   └── sidebar.tsx         # CRM navigation sidebar
│   ├── ui/                     # shadcn/ui components
│   └── MyAssistant.tsx         # AI chat assistant
├── lib/
│   ├── agents/
│   │   └── lead-enrichment-agent.ts  # Lead enrichment logic
│   ├── workflows/
│   │   └── lead-processing-workflow.ts  # Multi-step workflow
│   ├── scraping/
│   │   └── firecrawl-client.ts  # Web scraping client
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   ├── middleware.ts       # Session refresh
│   │   └── service-role.ts     # Admin client (bypasses RLS)
│   └── types/
│       └── database.ts         # TypeScript types for DB
└── ...

supabase/
├── schema.sql                   # Database table definitions
├── seed.sql                    # Sample data
├── demo-data.sql               # Rich demo data
└── rls-policies.sql           # Row Level Security policies

docs/
├── AI_SETUP.md                 # AI infrastructure setup
├── LEAD_ENRICHMENT.md         # Lead enrichment agent guide
├── LANGGRAPH_WORKFLOW.md      # Workflow system guide
├── FIRECRAWL_INTEGRATION.md   # Web scraping guide
├── AGENT_MONITORING.md        # Monitoring dashboard guide
├── DEMO_GUIDE.md              # Presentation scenarios
├── PROJECT_STATUS.md          # Project status & roadmap
└── SETUP_GUIDE.md             # Detailed setup guide
```

## 🎮 Usage Guide

### Dashboard

- **URL**: `/dashboard`
- View overview of leads, activities, and metrics
- Quick access to recent activities

### Leads Management

- **List View**: `/leads` - Browse all leads with filtering
- **Detail View**: `/leads/[id]` - Complete lead profile with tabs:
  - **Overview**: Contact info, status, score
  - **Research**: AI-generated insights, pain points, buying signals
  - **Timeline**: All activities and interactions
  - **Conversations**: Email and message history
  - **Tasks**: Related tasks and follow-ups

### Automated Lead Processing Workflow 🆕

**NEW**: Full pipeline workflow that processes leads through multiple stages automatically!

1. Navigate to any lead detail page
2. Find the **"Automated Workflow"** card in the sidebar
3. Click **"Run Processing Workflow"**
4. Watch the multi-step process (takes ~20-40 seconds):
   - **Discovery** (0.5s): Validate and fetch lead data
   - **Enrichment** (15-30s): AI web research and insights
   - **Scoring** (3-5s): Calculate 0-100 quality score
   - **Status Update** (0.5s): Auto-assign status based on score
5. View complete results:
   - Final lead score (0-100)
   - New status (qualified/researching/nurturing/new)
   - Duration and timing for each step
   - Detailed outputs from each stage

**Scoring Logic**:

- 80-100 → "qualified" (high priority)
- 60-79 → "researching" (medium priority)
- 40-59 → "nurturing" (low priority)
- 0-39 → "new" (needs more data)

**Cost**: ~$0.0054 per workflow run

**Test via API**:

```bash
# Test with first lead in database
curl http://localhost:3000/api/workflows/test

# Run for specific lead
curl -X POST http://localhost:3000/api/workflows/lead-processing \
  -H "Content-Type: application/json" \
  -d '{"leadId": "YOUR_LEAD_ID"}'
```

**Documentation**: See [docs/LANGGRAPH_WORKFLOW.md](docs/LANGGRAPH_WORKFLOW.md) for complete details.

### AI Lead Enrichment

1. Navigate to any lead detail page
2. Click the **"AI Enrich"** button in the top right
3. Wait 10-30 seconds while the agent:
   - Searches the web for information about the lead
   - Analyzes results with GPT-4o-mini
   - Extracts insights, pain points, and buying signals
4. View results in the **Research** tab
5. Check the **Timeline** tab for the enrichment activity log

**Cost**: ~$0.003 per lead enrichment

### AI Assistant

- **URL**: `/agents`
- Interactive AI chatbot for CRM operations
- Powered by assistant-ui with LangGraph integration
- Ask questions, get insights, and manage leads via chat

### Agent Monitoring Dashboard 🆕

- **URL**: `/monitor`
- Real-time monitoring of all AI agents
- Performance metrics and analytics
- Live activity feed with WebSocket updates
- Agent controls (pause/resume)
- Charts showing daily activity and agent performance

**Features**:

- Overview stats (total runs, today, success rate, avg duration)
- Agent status cards with controls
- Real-time activity feed
- Performance visualizations (Recharts)

**Documentation**: See [docs/AGENT_MONITORING.md](docs/AGENT_MONITORING.md)

## 🗄️ Database Schema

### Core Tables

#### `leads`

Primary table for storing lead/contact information.

**Key Fields**:

- Contact info: `first_name`, `last_name`, `email`, `phone`, `title`
- Company: `company_id`, `company_name` (denormalized)
- Status: `new` → `researching` → `qualified` → `contacted` → `engaged` → `nurturing` → `won`/`lost`
- Score: 0-100 lead quality score
- Enrichment: `linkedin_url`, `twitter_url`, `location`, `timezone`
- AI Insights: `research_summary`, `pain_points`, `buying_signals` (JSONB)
- Source: `source`, `source_campaign`, `source_medium`

#### `companies`

Company/account information.

**Key Fields**:

- Basic: `name`, `domain`, `industry`, `size`, `revenue`
- Intelligence: `tech_stack`, `competitors`, `recent_news`
- Social: `linkedin_url`, `twitter_handle`, `facebook_url`
- Funding: `funding_stage`, `funding_amount`, `investors`

#### `activities`

Timeline of all interactions and agent actions.

**Key Fields**:

- Type: `email`, `call`, `meeting`, `note`, `agent_action`, `form_submission`
- Content: `subject`, `content`, `direction` (inbound/outbound)
- Tracking: `metadata` (JSONB for flexible data)
- Relations: `lead_id`, `company_id`, `agent_id`, `user_id`

#### `agents`

AI agent definitions and configurations.

**Key Fields**:

- Identity: `name`, `type`, `description`
- Config: `model`, `temperature`, `config` (JSONB)
- State: `is_active`, `last_run_at`
- Performance: `success_rate`, `avg_runtime`

### Additional Tables

- `workflows` - Multi-step automation workflows
- `workflow_runs` - Workflow execution history
- `agent_runs` - Agent execution logs
- `email_templates` - Email templates for outreach
- `email_campaigns` - Email campaign management
- `integrations` - External tool integrations

See `supabase/schema.sql` for complete schema definitions.

## 🔐 Security & RLS Policies

### Current Setup (MVP)

- **Anonymous Users**: READ-only access to all CRM data
- **Authenticated Users**: Full READ/WRITE access
- **Service Role**: Used by AI agents to bypass RLS for write operations

### RLS Policies Applied

```sql
-- Example: Leads table
CREATE POLICY "Allow anon and authenticated users to read leads"
  ON leads FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify leads"
  ON leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### Production Recommendations

For production deployments, implement:

- User-based RLS policies (filter by `user_id`)
- Organization-based access control
- Role-based permissions (admin, sales rep, viewer)
- API rate limiting
- Require authentication for all operations

## 🧪 Testing

### Test Database Connection

Visit: http://localhost:3000/api/test-db

### Test OpenAI Integration

Visit: http://localhost:3000/api/test-openai

### Test LangChain Agent

Visit: http://localhost:3000/api/test-agent

### Test Full System

Visit: http://localhost:3000/api/test-all

### Manual Testing

1. **Dashboard**: Verify metrics and recent activities load
2. **Leads List**: Check table rendering and filtering
3. **Lead Detail**: Verify all tabs load correctly
4. **AI Enrichment**: Click "AI Enrich" on a lead
5. **AI Assistant**: Chat with the assistant on `/agents`

## 🐛 Troubleshooting

### Dev Server Issues

**404 on All Pages**

```bash
# Check if dev server is running
ps aux | grep "next dev"

# Restart dev server
cd frontend
npm run dev
```

### Supabase Connection Issues

**"Error fetching lead" or Empty Data**

1. Check environment variables are set in `.env.local`
2. Restart dev server after updating env vars
3. Verify Supabase project is active
4. Check RLS policies allow anonymous read access

```bash
# Test Supabase connection
curl http://localhost:3000/api/test-db
```

### Lead Enrichment Failures

**"Failed to enrich lead"**

1. Check `SUPABASE_SERVICE_ROLE_KEY` is set (required for writes)
2. Verify `OPENAI_API_KEY` is valid
3. Check server logs for specific error messages
4. Tavily API key is optional (will use mock data without it)

**Enrichment Slow/Timeout**

- Normal enrichment: 10-30 seconds
- Increase `maxDuration` in `app/api/leads/[id]/enrich/route.ts`
- Check Tavily API rate limits
- Verify OpenAI API quota

### RLS Permission Errors

**"Cannot coerce the result to a single JSON object" or "The result contains 0 rows"**

This means RLS is blocking the query. Fix:

```sql
-- Ensure anonymous users can read
CREATE POLICY "Allow anon users to read"
  ON your_table FOR SELECT
  TO anon, authenticated
  USING (true);
```

### Environment Variables Not Loading

```bash
# Verify file exists
ls -la frontend/.env.local

# Restart dev server (required after env changes)
pkill -f "next dev"
cd frontend && npm run dev
```

## 📊 Cost Estimates

### AI Operations

**Per Lead Enrichment**:

- Tavily Search: ~$0.001 (5 results)
- OpenAI GPT-4o-mini: ~$0.002
- **Total**: ~$0.003 per lead

**At Scale**:

- 100 leads: ~$0.30
- 1,000 leads: ~$3.00
- 10,000 leads: ~$30.00

### Infrastructure

- **Supabase**: Free tier supports up to 500MB database
- **Vercel**: Free tier for hobby projects
- **OpenAI**: Pay-as-you-go (GPT-4o-mini is very affordable)
- **Tavily**: Free tier includes 1,000 requests/month

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy! 🎉

```bash
# Or use Vercel CLI
npm i -g vercel
cd frontend
vercel
```

### Environment Variables for Production

Set these in Vercel dashboard or deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TAVILY_API_KEY`

### Post-Deployment Checklist

- [ ] Update Supabase allowed domains
- [ ] Implement authentication
- [ ] Tighten RLS policies for production
- [ ] Set up monitoring and error tracking
- [ ] Configure custom domain (optional)
- [ ] Enable Vercel Analytics (optional)

## 📚 Documentation

- **[LEAD_ENRICHMENT.md](./docs/LEAD_ENRICHMENT.md)** - Complete guide to the lead enrichment agent
- **[AI_SETUP.md](./docs/AI_SETUP.md)** - Detailed AI infrastructure and patterns
- **[PRD.txt](./PRD.txt)** - Original product requirements document
- **[QUICKSTART.md](./QUICKSTART.md)** - Condensed setup guide

## 🛣️ Roadmap

### Phase 2: Advanced Agents

- [ ] Firecrawl integration for web scraping
- [ ] Lead scoring agent with ML
- [ ] Email outreach agent with personalization
- [ ] Conversation intelligence agent
- [ ] Meeting summarization agent

### Phase 3: Workflows & Automation

- [ ] Visual workflow builder
- [ ] Multi-step LangGraph workflows
- [ ] Conditional logic and branching
- [ ] Scheduled agent runs
- [ ] Webhook triggers

### Phase 4: Analytics & Insights

- [ ] Agent performance dashboard
- [ ] Lead conversion analytics
- [ ] Revenue attribution
- [ ] A/B testing for outreach
- [ ] Predictive lead scoring

### Phase 5: Enterprise Features

- [ ] Multi-user authentication
- [ ] Organization/team management
- [ ] Role-based access control
- [ ] Advanced RLS policies
- [ ] Audit logging
- [ ] API rate limiting

## 🤝 Contributing

This is currently a solo project, but contributions are welcome! Areas where help would be appreciated:

- Additional AI agents (scoring, outreach, research)
- UI/UX improvements
- Performance optimizations
- Documentation improvements
- Test coverage

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [assistant-ui](https://assistant-ui.com) for AI chat interfaces
- [Supabase](https://supabase.com) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [LangChain](https://langchain.com) for LLM orchestration
- [Tavily](https://tavily.com) for AI-optimized web search

---

**Built with ❤️ and 🤖 AI**

For questions or support, please open an issue or check the documentation.
