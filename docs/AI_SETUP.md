# 🤖 AI & Agent Infrastructure

Complete guide to the AI and agent setup in the Agentic CRM.

## 📦 Installed Packages

### Core AI Libraries

| Package                    | Version | Purpose                                     |
| -------------------------- | ------- | ------------------------------------------- |
| **`ai`**                   | ^3.2.33 | Vercel AI SDK for streaming and completions |
| **`@ai-sdk/openai`**       | ^0.0.34 | OpenAI provider for Vercel AI SDK           |
| **`langchain`**            | ^0.2.11 | LangChain core for agent orchestration      |
| **`@langchain/openai`**    | ^0.0.34 | OpenAI integration for LangChain            |
| **`@langchain/core`**      | ^0.2.15 | LangChain core primitives and types         |
| **`@langchain/community`** | Latest  | Community tools (Tavily search)             |
| **`tavily`**               | Latest  | AI-optimized web search API                 |

### LangGraph & assistant-ui

| Package                             | Version  | Purpose                                 |
| ----------------------------------- | -------- | --------------------------------------- |
| **`@assistant-ui/react`**           | ^0.11.15 | React components for AI chat interfaces |
| **`@assistant-ui/react-langgraph`** | ^0.6.9   | LangGraph integration for assistant-ui  |
| **`@assistant-ui/react-markdown`**  | ^0.11.0  | Markdown rendering for chat messages    |
| **`@langchain/langgraph-sdk`**      | ^0.1.6   | LangGraph SDK for workflows (optional)  |

### Installation Command

```bash
cd frontend
npm install ai @ai-sdk/openai langchain @langchain/openai @langchain/core @langchain/community tavily
```

All packages are already installed in the project! ✅

## 🔑 Environment Variables

Add these to `frontend/.env.local`:

```bash
# =============================================
# OPENAI API (REQUIRED)
# =============================================
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...your-key-here

# =============================================
# TAVILY API (RECOMMENDED)
# =============================================
# Get from: https://tavily.com
# Free tier: 1,000 requests/month
# Used for web search in lead enrichment
TAVILY_API_KEY=tvly-...your-key-here

# =============================================
# LANGGRAPH CLOUD (OPTIONAL)
# =============================================
# Only needed if using LangGraph Cloud
# Not required for local development or MVP
LANGGRAPH_API_URL=https://your-deployment.langchain.app
LANGGRAPH_API_KEY=your-langgraph-key
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│                                                          │
│  ┌────────────────┐      ┌────────────────────────┐   │
│  │  UI Components │      │  AI Assistant Chat     │   │
│  │  - Dashboard   │      │  (assistant-ui)        │   │
│  │  - Leads       │      └────────────────────────┘   │
│  │  - Agents      │                │                   │
│  └────────────────┘                │                   │
│         │                           │                   │
│         └───────────┬───────────────┘                   │
│                     ▼                                   │
│         ┌───────────────────────┐                      │
│         │   API Routes          │                      │
│         │   /api/leads/enrich   │                      │
│         │   /api/test-*         │                      │
│         └───────────────────────┘                      │
└─────────────────────┼───────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌───────────────────┐      ┌──────────────────────┐
│   AI Agents       │      │   External APIs      │
│                   │      │                      │
│  Lead Enrichment  │─────▶│  - OpenAI (GPT-4o)   │
│  - Web Search     │      │  - Tavily (Search)   │
│  - Analysis       │      │  - Supabase (Data)   │
│  - Data Update    │      └──────────────────────┘
└───────────────────┘
```

## 🤖 Implemented Agents

### 1. Lead Enrichment Agent

**Location**: `frontend/lib/agents/lead-enrichment-agent.ts`

**Purpose**: Automatically research and enrich lead profiles with web data and AI insights.

**Workflow**:

```
Input: Lead Info
  ↓
1. Search Web (Tavily API)
  ↓
2. Analyze Results (OpenAI GPT-4o-mini)
  ↓
3. Extract Structured Data
  - Research summary
  - Pain points
  - Buying signals
  - Social URLs
  ↓
Output: Enriched Lead Data
```

**Code Structure**:

```typescript
// Main entry point
export async function enrichLead(lead: LeadInput): Promise<EnrichmentResult>;

// Internal steps
async function searchLeadInfo(lead: LeadInput): Promise<string>;
async function analyzeLeadData(
  lead: LeadInput,
  searchResults: string
): Promise<EnrichmentResult>;
```

**API Endpoint**: `POST /api/leads/[id]/enrich`

**Cost**: ~$0.003 per enrichment

- Tavily search: $0.001
- OpenAI analysis: $0.002

**Documentation**: See [LEAD_ENRICHMENT.md](./LEAD_ENRICHMENT.md)

## 🧪 Testing the AI Setup

### Test Endpoints

| Endpoint           | Purpose                  | Expected Result                           |
| ------------------ | ------------------------ | ----------------------------------------- |
| `/api/test-db`     | Test Supabase connection | `{ success: true, tables: [...] }`        |
| `/api/test-openai` | Test OpenAI API          | `{ success: true, response: "..." }`      |
| `/api/test-agent`  | Test LangChain agent     | `{ success: true, agentResponse: "..." }` |
| `/api/test-all`    | Test all integrations    | All tests passing                         |

### Manual Testing

```bash
# 1. Test OpenAI directly
curl http://localhost:3000/api/test-openai | jq .

# 2. Test LangChain agent
curl http://localhost:3000/api/test-agent | jq .

# 3. Test full integration
curl http://localhost:3000/api/test-all | jq .

# 4. Test lead enrichment
curl -X POST http://localhost:3000/api/leads/650e8400-e29b-41d4-a716-446655440002/enrich | jq .
```

### Expected Responses

**Test OpenAI** (`/api/test-openai`):

```json
{
  "success": true,
  "message": "OpenAI test successful",
  "response": "Hello! I'm an AI assistant...",
  "model": "gpt-4o-mini",
  "usage": {
    "promptTokens": 12,
    "completionTokens": 20
  }
}
```

**Test All** (`/api/test-all`):

```json
{
  "overall": "success",
  "message": "All integrations working!",
  "results": [
    { "name": "Supabase", "status": "success" },
    { "name": "OpenAI", "status": "success" },
    { "name": "LangChain Agent", "status": "success" }
  ]
}
```

## 🔄 Agent Development Patterns

### Pattern 1: Simple Agent (Lead Enrichment)

```typescript
// 1. Define input/output types
interface LeadInput {
  /* ... */
}
interface EnrichmentResult {
  /* ... */
}

// 2. Create main function
export async function enrichLead(lead: LeadInput): Promise<EnrichmentResult> {
  // 3. Gather data
  const searchResults = await searchWebForLead(lead);

  // 4. Analyze with LLM
  const insights = await analyzeWithAI(searchResults);

  // 5. Return structured output
  return formatEnrichmentResult(insights);
}

// 6. Create API endpoint
// POST /api/leads/[id]/enrich
export async function POST(request: Request) {
  const enrichment = await enrichLead(leadData);
  await updateDatabase(enrichment);
  return Response.json({ success: true, enrichment });
}
```

### Pattern 2: Multi-Step Workflow (Future)

```typescript
// Using LangGraph for complex workflows
import { StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph({
  channels: {
    /* ... */
  },
})
  .addNode("research", researchAgent)
  .addNode("score", scoringAgent)
  .addNode("outreach", outreachAgent)
  .addEdge("research", "score")
  .addEdge("score", "outreach");

const app = workflow.compile();
const result = await app.invoke(input);
```

### Pattern 3: Streaming Responses (AI Assistant)

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });

  return result.toDataStreamResponse();
}
```

## 🎯 Agent Best Practices

### 1. Error Handling

```typescript
export async function enrichLead(lead: LeadInput): Promise<EnrichmentResult> {
  try {
    const searchResults = await searchWebForLead(lead);
    return await analyzeWithAI(searchResults);
  } catch (error) {
    console.error("Enrichment error:", error);

    // Return graceful fallback
    return {
      researchSummary: `Analysis for ${lead.firstName} ${lead.lastName}`,
      painPoints: [],
      buyingSignals: [],
    };
  }
}
```

### 2. Cost Optimization

```typescript
// Use cheaper model for simple tasks
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini", // $0.15/1M tokens vs $2.50/1M for gpt-4
  temperature: 0.7,
});

// Limit input tokens
const truncatedInput = searchResults.substring(0, 3000);

// Cache repeated queries
const cache = new Map();
if (cache.has(leadId)) return cache.get(leadId);
```

### 3. Structured Output

```typescript
// Use JSON mode for reliable parsing
const prompt = `Return your response as JSON:
{
  "researchSummary": "...",
  "painPoints": ["...", "..."],
  "buyingSignals": ["...", "..."]
}`;

const response = await model.invoke(prompt);
const parsed = JSON.parse(response.content);
```

### 4. Progress Tracking

```typescript
// Log to database for monitoring
await supabase.from("agent_runs").insert({
  agent_id: "lead-enrichment",
  status: "running",
  started_at: new Date(),
});

// Update on completion
await supabase.from("agent_runs").update({
  status: "completed",
  completed_at: new Date(),
  tokens_used: usage.totalTokens,
});
```

## 💰 Cost Management

### Current Usage

| Operation       | Model       | Cost per Call | Tokens | Monthly Est (1K leads) |
| --------------- | ----------- | ------------- | ------ | ---------------------- |
| Lead Enrichment | GPT-4o-mini | $0.002        | ~1,000 | $2.00                  |
| Web Search      | Tavily      | $0.001        | -      | $1.00                  |
| AI Assistant    | GPT-4o-mini | $0.001/msg    | ~500   | Variable               |
| **Total**       | -           | **$0.003**    | -      | **~$3.00**             |

### Cost Optimization Tips

1. **Use GPT-4o-mini** instead of GPT-4 (10x cheaper)
2. **Batch operations** when possible
3. **Cache results** for 24 hours
4. **Set token limits** on model calls
5. **Monitor usage** via OpenAI dashboard

## 🔐 Security Best Practices

### 1. API Key Management

```typescript
// ✅ DO: Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

// ❌ DON'T: Hardcode keys
const apiKey = "sk-proj-..."; // NEVER DO THIS
```

### 2. Server-Side Only

```typescript
// ✅ DO: Call AI APIs from server
// app/api/agents/route.ts
export async function POST(request: Request) {
  const result = await openai.chat.completions.create({
    apiKey: process.env.OPENAI_API_KEY, // Safe on server
    // ...
  });
}

// ❌ DON'T: Call from client
// This would expose your API key!
```

### 3. Rate Limiting

```typescript
// Implement rate limiting for public endpoints
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function POST(request: Request) {
  const { success } = await ratelimit.limit("api");
  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  // ...
}
```

### 4. Input Validation

```typescript
// Validate and sanitize inputs
import { z } from "zod";

const LeadInputSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = LeadInputSchema.parse(body); // Throws if invalid
  // ...
}
```

## 📊 Monitoring & Observability

### LangSmith Integration (Optional)

```bash
# Add to .env.local
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-key
LANGCHAIN_PROJECT=agentic-crm
```

### Custom Logging

```typescript
// Log agent runs to database
async function logAgentRun(params: AgentRunParams) {
  await supabase.from("agent_runs").insert({
    agent_id: params.agentId,
    status: params.status,
    input: params.input,
    output: params.output,
    tokens_used: params.tokensUsed,
    cost: params.cost,
    duration_ms: params.duration,
    error: params.error,
  });
}
```

## 🚀 Future Enhancements

### Planned Agents

1. **Lead Scoring Agent**

   - Analyze lead data
   - Predict conversion probability
   - Auto-update lead scores

2. **Email Outreach Agent**

   - Research lead background
   - Generate personalized emails
   - Schedule optimal send times

3. **Meeting Summarization Agent**

   - Transcribe call recordings
   - Extract action items
   - Update CRM automatically

4. **Competitive Intelligence Agent**
   - Monitor competitor mentions
   - Track industry trends
   - Alert on opportunities

### LangGraph Workflows

```typescript
// Multi-agent workflow example
const workflow = new StateGraph({
  /* ... */
})
  .addNode("research", researchAgent)
  .addNode("qualify", qualifyAgent)
  .addNode("outreach", outreachAgent)
  .addConditionalEdges("qualify", routeByScore)
  .compile();
```

## 📚 Additional Resources

- **LangChain Docs**: https://js.langchain.com/
- **OpenAI Cookbook**: https://cookbook.openai.com/
- **Tavily Docs**: https://docs.tavily.com/
- **assistant-ui**: https://assistant-ui.com/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/

---

**Questions?** Check [LEAD_ENRICHMENT.md](./LEAD_ENRICHMENT.md) for the enrichment agent details or [SETUP_GUIDE.md](./SETUP_GUIDE.md) for setup help.
