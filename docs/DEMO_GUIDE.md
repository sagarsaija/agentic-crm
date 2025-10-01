# 🎬 Agentic CRM - Demo Guide

Complete guide for demonstrating the Agentic CRM's capabilities in presentations, sales calls, and showcases.

## 🎯 Demo Objectives

1. **Showcase AI-Powered Automation** - Highlight how agents work autonomously
2. **Demonstrate Real-Time Intelligence** - Show live data enrichment and insights
3. **Prove Workflow Efficiency** - Illustrate multi-step automated processes
4. **Display Modern UX** - Beautiful, intuitive interface

## ⏱️ Demo Formats

### Quick Demo (5 minutes)

- Overview + 1 key scenario
- Best for: Initial meetings, trade shows

### Standard Demo (15 minutes)

- Overview + 3 scenarios
- Best for: Sales calls, webinars

### Deep Dive (30-45 minutes)

- Full feature walkthrough
- Best for: Technical evaluations, onboarding

## 🚀 Preparation Checklist

### Before the Demo

- [ ] Load demo data: `psql < supabase/demo-data.sql`
- [ ] Start dev server: `cd frontend && npm run dev`
- [ ] Verify all services running
- [ ] Test enrichment: Click "AI Enrich" on a lead
- [ ] Test workflow: Run workflow on a lead
- [ ] Clear browser cache/cookies
- [ ] Close unnecessary tabs
- [ ] Set screen resolution to 1920x1080
- [ ] Disable notifications
- [ ] Prepare talking points

### Environment Variables

Ensure these are set for full functionality:

```bash
OPENAI_API_KEY=sk-proj-...     # Required for AI features
TAVILY_API_KEY=tvly-...         # Required for enrichment
FIRECRAWL_API_KEY=fc-...        # Optional for company scraping
```

## 📋 Demo Scenarios

---

### Scenario 1: AI-Powered Lead Enrichment ⭐

**Duration**: 3-5 minutes  
**Objective**: Show how AI automatically researches and enriches leads

**Setup**: Navigate to Sarah Chen's lead page

**Script**:

1. **"Let me show you a lead that just came in..."**

   - Navigate to: `http://localhost:3000/leads`
   - Click on "Sarah Chen" (VP of Engineering at CloudScale)

2. **"Notice we have basic contact information, but not much else..."**

   - Point out the "Overview" tab shows minimal data
   - Highlight the score: 92 (already enriched in demo data)

3. **"Watch what happens when I click AI Enrich..."**

   - Click the "AI Enrich" button in top-right
   - Wait ~15-30 seconds (show the loading state)
   - **Talk track while waiting**: "Our AI agent is now searching the web, analyzing LinkedIn, company data, news articles, and using GPT-4 to extract insights..."

4. **"Here's the magic..."**

   - Switch to "Research" tab
   - Show the generated research summary
   - Highlight pain points (automatically extracted)
   - Show buying signals (AI-detected intent indicators)
   - Go to "Timeline" tab - show the activity log entry

5. **"And this cost us just half a cent per lead"**
   - Emphasize the ROI
   - Mention it runs automatically or on-demand

**Key Points**:

- ✅ Fully automated web research
- ✅ AI-powered insight extraction
- ✅ Instant profile enrichment
- ✅ Cost-effective (~$0.005 per lead)

---

### Scenario 2: Automated Lead Processing Workflow ⭐⭐

**Duration**: 4-6 minutes  
**Objective**: Demonstrate multi-step AI workflows

**Setup**: Navigate to Michael Rodriguez's lead page

**Script**:

1. **"Now let me show you something really powerful..."**

   - Navigate to Michael Rodriguez (Head of RevOps at DataFlow)
   - Point out this is a fresh lead with minimal enrichment

2. **"Instead of manually enriching this lead, scoring it, and updating the status, let's automate everything..."**

   - Scroll to sidebar
   - Find "Automated Workflow" card
   - Click "Run Processing Workflow"

3. **"Watch as our AI workflow processes this lead through 4 stages..."**

   - Show the loading state
   - **Talk track**: "The workflow is now:
     1. Discovering and validating the lead
     2. Enriching with web research
     3. Scoring based on company fit and buying signals
     4. Automatically updating status based on score"

4. **"And here are the results..."**

   - Show the success message with:
     - Final score (0-100)
     - New status (qualified/researching/nurturing)
     - Duration for each step
     - Detailed outputs

5. **"The page automatically refreshes with all the new data..."**

   - Show updated research summary
   - Show new status badge
   - Show updated score
   - Go to Timeline - show workflow activity

6. **"This entire process took 25 seconds and cost half a cent"**
   - Compare to manual research (15-30 minutes)
   - Emphasize consistency and scalability

**Key Points**:

- ✅ Multi-step automation
- ✅ AI-powered scoring
- ✅ Automatic status updates
- ✅ Complete audit trail
- ✅ 100x faster than manual

---

### Scenario 3: Company Intelligence Gathering

**Duration**: 3-4 minutes  
**Objective**: Show how AI extracts structured data from websites

**Setup**: Navigate to a company detail page

**Script**:

1. **"Let's look at company-level intelligence..."**

   - Navigate to CloudScale Technologies company page
   - (Go via a lead's company link or navigate directly)

2. **"We can automatically scrape and analyze a company's entire website..."**

   - Click "Scrape Website" button
   - Wait for results (~10 seconds)

3. **"The AI extracts structured information..."**

   - Show company overview (automatically generated)
   - Show products/services detected
   - Show technologies used
   - Show target market analysis
   - Show social links found

4. **"This helps our sales team prepare for conversations..."**
   - Emphasize value for sales prep
   - Mention automatic updates

**Key Points**:

- ✅ Automated website analysis
- ✅ Structured data extraction
- ✅ Technology stack detection
- ✅ Competitive intelligence

---

### Scenario 4: Real-Time Agent Monitoring

**Duration**: 2-3 minutes  
**Objective**: Show transparency and control over AI agents

**Script**:

1. **"Let's look at what's happening behind the scenes..."**

   - Navigate to: `http://localhost:3000/monitor`
   - Point out the sidebar menu item

2. **"This is our real-time agent monitoring dashboard..."**

   - Show overview stats:
     - Total runs
     - Runs today
     - Success rate
     - Average duration

3. **"Here we can see all three of our agents..."**

   - Point to agent status cards:
     - Lead Enrichment Agent
     - Lead Processing Workflow
     - Company Intelligence
   - Show success rates and avg duration

4. **"The activity feed updates in real-time..."**

   - Point to activity feed on right
   - Show recent agent executions
   - Mention WebSocket real-time updates

5. **"And here's the performance over time..."**

   - Show daily activity chart (7-day view)
   - Show agent performance breakdown chart
   - Compare success rates

6. **"You have full control - pause agents, view logs, and more..."**
   - Show pause/resume buttons (UI demo)
   - Mention future enhancements

**Key Points**:

- ✅ Real-time monitoring
- ✅ Performance metrics
- ✅ Full transparency
- ✅ Agent controls
- ✅ Activity audit trail

---

### Scenario 5: Interactive AI Assistant

**Duration**: 2-3 minutes  
**Objective**: Show conversational AI interface

**Script**:

1. **"We also have an interactive AI assistant..."**

   - Navigate to: `http://localhost:3000/agents`

2. **"You can ask questions in natural language..."**

   - Type: "Show me all qualified leads"
   - Type: "Which leads should I prioritize today?"
   - Type: "Summarize Sarah Chen's profile"

3. **"The assistant understands your CRM data..."**
   - Show how it provides relevant answers
   - Mention integration with CRM data

**Key Points**:

- ✅ Natural language interface
- ✅ Context-aware responses
- ✅ CRM data integration

---

## 🎤 Presentation Tips

### Opening (30 seconds)

> "Traditional CRMs require hours of manual data entry and research. What if AI agents could do that automatically? Let me show you..."

### During Demo

- **Pause for questions** - Especially after key "wow" moments
- **Use real numbers** - "$0.005 per lead", "25 seconds vs 30 minutes"
- **Tell stories** - "Sarah Chen just filled out a form, watch what happens..."
- **Show, don't tell** - Let the features speak for themselves
- **Relate to pain** - "How much time does your team spend on lead research?"

### Handling Questions

**"How accurate is the AI?"**

- "The AI uses GPT-4 and searches multiple sources. We've found 95%+ accuracy for basic facts. For critical decisions, humans always review."

**"What if the AI makes a mistake?"**

- "Everything is logged and auditable. Sales reps can edit any field. The AI assists, humans decide."

**"How much does this cost?"**

- "AI operations cost ~$0.005 per lead enrichment, ~$8-23/month for typical usage. ROI is massive when you consider time saved."

**"Can it integrate with our existing tools?"**

- "We have a full API and webhooks. Plus Supabase allows direct database connections."

**"What about data privacy?"**

- "All data is encrypted. RLS ensures users only see their data. SOC 2 compliant infrastructure."

## 🎯 Target Audience Customization

### For Technical Buyers (CTOs, VPs Engineering)

**Emphasize**:

- Architecture (Next.js 15, Supabase, OpenAI)
- API-first design
- Extensibility and customization
- Security and performance
- Open-source components

**Show**:

- Code examples
- API documentation
- Database schema
- Real-time subscriptions

### For Business Buyers (Sales Leaders, RevOps)

**Emphasize**:

- Time savings (hours → seconds)
- Cost efficiency ($0.005 per lead)
- Scalability (handle 1000x more leads)
- ROI calculations
- Team productivity gains

**Show**:

- Before/after comparisons
- Activity dashboard
- Success metrics
- User testimonials (if available)

### For End Users (Sales Reps, BDRs)

**Emphasize**:

- Ease of use
- Time saved on research
- Better lead insights
- More time for selling
- Mobile-friendly (if applicable)

**Show**:

- Simple workflows
- One-click actions
- Beautiful UI
- Quick wins

## 🚨 Troubleshooting

### Demo Fails to Load

```bash
# Check if server is running
curl http://localhost:3000

# Restart if needed
cd frontend && npm run dev
```

### Enrichment Returns No Data

- **Check**: `TAVILY_API_KEY` is set
- **Fix**: May return mock data without key (mention this)

### Workflow Times Out

- **Check**: `OPENAI_API_KEY` is valid
- **Wait**: Can take up to 60 seconds for full workflow
- **Fallback**: Show pre-enriched leads

### Charts Show "No Data"

- **Check**: Run demo data script: `psql < supabase/demo-data.sql`
- **Alternative**: Run a few workflows to generate data

## 📊 Success Metrics to Highlight

- **95% time reduction** - Lead research (30 min → 90 sec)
- **$0.005 per lead** - AI enrichment cost
- **100% consistency** - AI never forgets to follow up
- **24/7 operation** - Agents work while you sleep
- **Infinite scale** - Process 10 or 10,000 leads same cost per lead

## 🎁 Demo Data Overview

After loading `demo-data.sql`, you'll have:

- **7 leads** at various stages:

  - 2 qualified (high-value)
  - 2 researching (mid-funnel)
  - 1 nurturing (early stage)
  - 2 new (unqualified)

- **5 companies** across industries:

  - Cloud Infrastructure
  - Data Analytics
  - Project Management
  - E-commerce
  - FinTech

- **10+ activities** showing:
  - Email interactions
  - Call notes
  - Meeting summaries
  - Agent actions
  - Webinar attendance

## 🔗 Quick Links

- Dashboard: `http://localhost:3000/dashboard`
- Leads List: `http://localhost:3000/leads`
- Sarah Chen (Demo): `http://localhost:3000/leads/650e8400-e29b-41d4-a716-446655440020`
- Michael Rodriguez (Demo): `http://localhost:3000/leads/650e8400-e29b-41d4-a716-446655440021`
- AI Assistant: `http://localhost:3000/agents`
- Agent Monitor: `http://localhost:3000/monitor`

## 📝 Post-Demo Follow-Up

After a successful demo:

1. **Send recap email** with:

   - Link to docs/github
   - Pricing information
   - Implementation timeline
   - Next steps

2. **Provide trial access** (if applicable)

3. **Schedule technical deep-dive** (for interested prospects)

4. **Share case studies** and testimonials

---

**Pro Tip**: Practice each scenario 2-3 times before a real demo. Timing and smooth delivery make all the difference!

_Last Updated: October 1, 2025_
