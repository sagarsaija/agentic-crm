# AI & Agent Setup Guide

This document explains the AI and agent infrastructure for the Agentic CRM.

## 📦 Installed Packages

### Core AI Libraries

- ✅ **`ai`** (^4.x) - Vercel AI SDK for streaming responses
- ✅ **`@ai-sdk/openai`** - OpenAI provider for Vercel AI SDK
- ✅ **`langchain`** - LangChain core for agent building
- ✅ **`@langchain/openai`** - OpenAI integration for LangChain
- ✅ **`@langchain/core`** - LangChain core primitives

### LangGraph & assistant-ui

- ✅ **`@assistant-ui/react-langgraph`** (^0.6.9) - LangGraph integration for UI
- ✅ **`@langchain/langgraph-sdk`** (^0.1.6) - LangGraph SDK for workflows
- ✅ **`@assistant-ui/react`** (^0.11.15) - AI chat interface components

## 🔑 Environment Variables

Add these to your `frontend/.env.local`:

```bash
# Required
OPENAI_API_KEY=sk-...your-key-here

# Optional (for LangGraph Cloud)
LANGGRAPH_API_URL=https://...
LANGCHAIN_API_KEY=...your-key-here
```

## 🧪 Testing the Setup

### 1. Test All Integrations

```bash
curl http://localhost:3000/api/test-all | jq .
```

Expected output:

```json
{
  "overall": "success",
  "message": "All integrations working!",
  "results": [
    {
      "name": "Supabase Connection",
      "status": "success"
    },
    {
      "name": "OpenAI API Key",
      "status": "success"
    },
    {
      "name": "Environment Variables",
      "status": "success"
    }
  ]
}
```

### 2. Test OpenAI Direct Connection

```bash
curl http://localhost:3000/api/test-openai | jq .
```

Expected:

```json
{
  "success": true,
  "message": "OpenAI API connection successful!",
  "response": "Hello from OpenAI!",
  "model": "gpt-4o-mini"
}
```

### 3. Test LangChain Agent

```bash
curl http://localhost:3000/api/test-agent | jq .
```

Expected:

```json
{
  "success": true,
  "message": "LangChain agent test successful!",
  "agent_response": "I am a helpful CRM assistant...",
  "model": "gpt-4o-mini"
}
```

## 🏗️ Architecture

### Current Setup

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                │
│  (assistant-ui components)              │
└────────────┬────────────────────────────┘
             │
             ├──> /api/chat → LangGraph Cloud (optional)
             │
             ├──> /api/test-openai → Direct OpenAI
             │
             └──> /api/test-agent → LangChain Agent
                                    ↓
                              OpenAI API
```

### Agent Infrastructure

#### Location: `frontend/lib/agents/`

**`test-agent.ts`** - Simple test agent showing the pattern:

```typescript
// 1. Initialize model
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

// 2. Create prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful CRM assistant."],
  ["human", "{input}"],
]);

// 3. Build chain
const chain = prompt.pipe(model).pipe(outputParser);
```

This pattern will be used for:

- Lead Enrichment Agent
- Lead Scoring Agent
- Outreach Content Agent
- Research Agent

## 🤖 Agent Development

### Creating a New Agent

1. Create agent file: `frontend/lib/agents/your-agent.ts`

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function createYourAgent() {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Your system prompt here"],
    ["human", "{input}"],
  ]);

  return prompt.pipe(model);
}
```

2. Create API endpoint: `frontend/app/api/agents/your-agent/route.ts`

```typescript
import { createYourAgent } from "@/lib/agents/your-agent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { input } = await req.json();
  const agent = await createYourAgent();
  const result = await agent.invoke({ input });
  return NextResponse.json({ result });
}
```

3. Use in components with assistant-ui:

```typescript
import { useAssistantRuntime } from "@assistant-ui/react";

const runtime = useAssistantRuntime({
  api: "/api/agents/your-agent",
});
```

## 🎯 Next Steps

The infrastructure is now ready for building:

1. **Lead Enrichment Agent** (Task 6)

   - Web search integration
   - Company data extraction
   - LinkedIn profile enrichment

2. **Lead Scoring Agent** (Task 8)

   - Rule-based scoring
   - ML-based scoring (later)
   - Intent signals detection

3. **Content Generation Agent** (Phase 4)

   - Personalized email generation
   - Follow-up sequences
   - Social media outreach

4. **Research Agent**
   - Company intelligence
   - Market research
   - Competitor analysis

## 📚 Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [LangChain Docs](https://js.langchain.com/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [assistant-ui Docs](https://www.assistant-ui.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🔒 Security Best Practices

1. **Never expose API keys client-side**

   - Use server-side routes for all AI calls
   - OpenAI key stays in `.env.local` only

2. **Rate Limiting**

   - Implement rate limits on AI endpoints
   - Monitor usage and costs

3. **Input Validation**

   - Sanitize all user inputs before sending to AI
   - Validate response formats

4. **Cost Management**
   - Track token usage per request
   - Set up usage alerts in OpenAI dashboard
   - Use cheaper models (gpt-4o-mini) for testing

## 💰 Cost Optimization

- **gpt-4o-mini**: $0.15/1M input tokens, $0.60/1M output tokens
- **gpt-4o**: $5.00/1M input tokens, $15.00/1M output tokens

For development, use `gpt-4o-mini`. Upgrade to `gpt-4o` only when needed for complex reasoning.
