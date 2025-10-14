# AI Agent Chat Setup

This guide explains how to set up and use the AI-powered chat interface for managing your CRM agents and workflows.

## Overview

The chat interface allows you to interact with your CRM using natural language. You can:

- **Search for leads**: "Find me 5 leads that are YC founders in the codegen space"
- **Get lead status**: "What is the status of lead [ID]?"
- **Trigger workflows**: "Process this lead through the enrichment workflow"
- **View statistics**: "Show me CRM stats"
- **Manage agents**: "List all available agents"

## Architecture

The system consists of:

1. **CRM Assistant Graph** (`frontend/lib/agents/crm-assistant-graph.ts`)

   - LangGraph-based agent with multiple tools
   - Tools for searching, processing, and analyzing leads

2. **Chat UI** (`frontend/components/MyAssistant.tsx`)

   - Built with assistant-ui
   - Connects to LangGraph runtime

3. **API Integration**
   - Option 1: Deploy to LangGraph Cloud (production)
   - Option 2: Local development server (development)

## Setup Options

### Option 1: LangGraph Cloud (Recommended for Production)

1. **Install LangGraph CLI**:

   ```bash
   pip install langgraph-cli
   ```

2. **Set up environment variables**:

   ```bash
   # In your .env file
   LANGCHAIN_API_KEY=your_langchain_api_key
   LANGGRAPH_API_URL=your_deployment_url
   NEXT_PUBLIC_LANGGRAPH_API_URL=your_deployment_url
   NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID=crm_assistant
   ```

3. **Deploy the graph**:

   ```bash
   langgraph deploy
   ```

4. **Update your frontend** to use the deployed graph URL

### Option 2: Local Development Server

For quick testing and development, you can run the graph locally:

1. **Environment variables** (in `.env.local`):

   ```bash
   # No LANGGRAPH_API_URL needed for local development
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **The local endpoint** is already created at `/api/agent`

3. **Update the chat API** to use local endpoint (see below)

## Using Local Development Mode

To use the local development server, update `frontend/lib/chatApi.ts`:

```typescript
// Change this line:
const apiUrl =
  process.env["NEXT_PUBLIC_LANGGRAPH_API_URL"] ||
  new URL("/api", window.location.href).href;

// To use local endpoint:
const apiUrl = "/api/agent";
```

Or set in `.env.local`:

```bash
NEXT_PUBLIC_LANGGRAPH_API_URL=/api/agent
```

## Available Tools

The CRM Assistant has access to these tools:

### 1. `search_leads`

Search for leads based on various criteria.

**Example queries**:

- "Find me 5 leads that are YC founders"
- "Show me all qualified leads with scores above 80"
- "Search for leads in the AI industry"

**Parameters**:

- `query`: Text search across name, company, title, research
- `limit`: Maximum number of results (default: 10)
- `status`: Filter by lead status (new, researching, nurturing, qualified, contacted)
- `minScore`: Minimum quality score (0-100)

### 2. `get_lead_status`

Get detailed information about a specific lead.

**Example queries**:

- "What is the status of lead [UUID]?"
- "Show me details for lead [UUID]"
- "Get information about [Lead Name]"

**Parameters**:

- `leadId`: UUID of the lead

### 3. `process_lead`

Trigger the automated lead processing workflow.

**Example queries**:

- "Process lead [UUID] through the enrichment workflow"
- "Enrich this lead [UUID]"
- "Run the workflow on these leads [UUID1, UUID2]"

**Parameters**:

- `leadIds`: Array of lead UUIDs to process

### 4. `get_workflow_status`

Get information about available workflows and their recent activity.

**Example queries**:

- "Show me workflow status"
- "What workflows are available?"
- "How many leads have been processed?"

### 5. `list_agents`

Get information about available AI agents and their capabilities.

**Example queries**:

- "What agents are available?"
- "List all AI agents"
- "Show me agent capabilities"

### 6. `get_crm_stats`

Get overall CRM statistics and metrics.

**Example queries**:

- "Show me CRM statistics"
- "What's the average lead score?"
- "How many leads do we have by status?"

## Example Conversations

### Finding Leads

**User**: "Find me 5 leads that are YC founders in the codegen space"

**Assistant**:

- Uses `search_leads` tool with query="YC founders codegen"
- Returns matching leads with their details
- Can then process them with `process_lead`

### Checking Lead Status

**User**: "What is the status of lead abc-123-def?"

**Assistant**:

- Uses `get_lead_status` tool with leadId="abc-123-def"
- Returns full lead details including score, status, research summary
- Shows recent activities

### Processing Leads

**User**: "Process these 3 leads through enrichment"

**Assistant**:

- Uses `process_lead` tool with array of leadIds
- Triggers the lead processing workflow for each
- Reports back on success/failure and scores

### Getting Overview

**User**: "Give me an overview of the CRM"

**Assistant**:

- Uses `get_crm_stats` to get overall metrics
- Uses `get_workflow_status` to see recent activity
- Provides comprehensive summary

## Customizing the Agent

### Adding New Tools

To add new tools to the assistant:

1. **Create the tool** in `crm-assistant-graph.ts`:

   ```typescript
   const myNewTool = tool(
     async ({ param1, param2 }) => {
       // Your logic here
       return { success: true, data: ... };
     },
     {
       name: "my_new_tool",
       description: "What this tool does",
       schema: z.object({
         param1: z.string().describe("Description"),
         param2: z.number().optional(),
       }),
     }
   );
   ```

2. **Add to tools array**:

   ```typescript
   const tools = [
     searchLeadsTool,
     // ... other tools
     myNewTool,
   ];
   ```

3. **Redeploy** if using LangGraph Cloud, or restart dev server

### Modifying System Prompt

The model is initialized in `crm-assistant-graph.ts`:

```typescript
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
}).bindTools(tools);
```

To add a system prompt:

```typescript
import { SystemMessage } from "@langchain/core/messages";

// Add to callModel function
async function callModel(state: typeof MessagesAnnotation.State) {
  const systemMessage = new SystemMessage(
    "You are a helpful CRM assistant. Always be concise and action-oriented."
  );
  const messages = [systemMessage, ...state.messages];
  const response = await model.invoke(messages);
  return { messages: [response] };
}
```

## Monitoring and Debugging

### View Agent Activity

The agent logs all activities to the `activities` table in Supabase:

```sql
SELECT * FROM activities
WHERE type = 'agent_action'
ORDER BY created_at DESC
LIMIT 10;
```

### Debug Tool Calls

Tools return structured responses:

```typescript
{
  success: boolean,
  data?: any,
  error?: string
}
```

Check the browser console for detailed logs during development.

### Performance Monitoring

- Tool execution times are logged
- Workflow steps track duration
- Use LangSmith for detailed tracing (if using LangGraph Cloud)

## Troubleshooting

### "No tools found" error

- Check that tools are properly bound to the model
- Verify OpenAI API key is set

### "Database connection failed"

- Check Supabase environment variables
- Ensure service role key has proper permissions

### Agent not responding

- Check API endpoint is correct
- Verify LangGraph deployment status (if using Cloud)
- Check browser console for errors

### Tools returning empty results

- Verify database has data
- Check RLS policies allow service role access
- Test queries directly in Supabase dashboard

## Next Steps

1. **Add more specialized tools** for your specific CRM needs
2. **Implement memory** to maintain conversation context
3. **Add streaming responses** for better UX
4. **Create pre-built workflows** for common tasks
5. **Add authentication** to tool calls based on user roles

## Related Documentation

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Workflow Guide](./LANGGRAPH_WORKFLOW.md)
- [Agent Monitoring](./AGENT_MONITORING.md)
- [Lead Enrichment](./LEAD_ENRICHMENT.md)

