import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { executeLeadProcessingWorkflow } from "@/lib/workflows/lead-processing-workflow";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createFalChatModel, createFalMiniModel } from "@/lib/fal-openrouter-config";

/**
 * Tool: Search Leads
 * Search for leads based on various criteria
 */
const searchLeadsTool = tool(
  async ({ query, limit = 10, status, minScore }) => {
    const supabase = createServiceRoleClient();

    let queryBuilder = supabase
      .from("leads")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        title,
        company_name,
        status,
        score,
        research_summary,
        pain_points,
        buying_signals,
        linkedin_url,
        twitter_url,
        location,
        created_at,
        updated_at
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply filters
    if (status) {
      queryBuilder = queryBuilder.eq("status", status);
    }

    if (minScore !== undefined) {
      queryBuilder = queryBuilder.gte("score", minScore);
    }

    // Apply text search if query provided
    if (query) {
      queryBuilder = queryBuilder.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,company_name.ilike.%${query}%,title.ilike.%${query}%,research_summary.ilike.%${query}%`,
      );
    }

    const { data: leads, error } = await queryBuilder;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      count: leads?.length || 0,
      leads: leads || [],
    };
  },
  {
    name: "search_leads",
    description:
      "Search for leads in the CRM. Use this to find leads by name, company, title, status, or other criteria. For example: 'YC founders in codegen space' or 'qualified leads with high scores'.",
    schema: z.object({
      query: z
        .string()
        .optional()
        .describe(
          "Search query to filter leads by name, company, title, or research summary",
        ),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Maximum number of leads to return (default: 10)"),
      status: z
        .enum(["new", "researching", "nurturing", "qualified", "contacted"])
        .optional()
        .describe("Filter by lead status"),
      minScore: z
        .number()
        .optional()
        .describe("Minimum lead quality score (0-100)"),
    }),
  },
);

/**
 * Tool: Get Lead Status
 * Get detailed information about a specific lead
 */
const getLeadStatusTool = tool(
  async ({ leadId }) => {
    const supabase = createServiceRoleClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .select(
        `
        *,
        company:companies(*)
      `,
      )
      .eq("id", leadId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!lead) {
      return {
        success: false,
        error: "Lead not found",
      };
    }

    // Get recent activities
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      success: true,
      lead,
      recentActivities: activities || [],
    };
  },
  {
    name: "get_lead_status",
    description:
      "Get detailed status and information about a specific lead by their ID. Returns lead details, score, status, research summary, and recent activities.",
    schema: z.object({
      leadId: z.string().describe("The UUID of the lead to retrieve"),
    }),
  },
);

/**
 * Tool: Process Lead
 * Trigger the lead processing workflow for one or more leads
 */
const processLeadTool = tool(
  async ({ leadIds }) => {
    const results = [];

    for (const leadId of leadIds) {
      try {
        const context = await executeLeadProcessingWorkflow(leadId);
        results.push({
          leadId,
          success: context.currentState === "completed",
          status: context.currentState,
          score: context.score,
          newStatus: context.newStatus,
          error: context.error,
        });
      } catch (error) {
        results.push({
          leadId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: true,
      processed: results.length,
      results,
    };
  },
  {
    name: "process_lead",
    description:
      "Trigger the automated lead processing workflow for one or more leads. This will enrich the lead with research, calculate a quality score, and update their status.",
    schema: z.object({
      leadIds: z
        .array(z.string())
        .describe("Array of lead UUIDs to process through the workflow"),
    }),
  },
);

/**
 * Tool: Get Workflow Status
 * Get information about available workflows and their status
 */
const getWorkflowStatusTool = tool(
  async () => {
    const supabase = createServiceRoleClient();

    // Get recent workflow activities
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("type", "agent_action")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get workflow statistics
    const { count: totalProcessed } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("type", "agent_action")
      .like("subject", "%Workflow Completed%");

    return {
      success: true,
      workflows: [
        {
          name: "lead-processing",
          description: "Automated lead enrichment, scoring, and status updates",
          status: "active",
          totalProcessed: totalProcessed || 0,
        },
      ],
      recentActivities: activities || [],
    };
  },
  {
    name: "get_workflow_status",
    description:
      "Get information about available AI workflows and their recent activity. Shows workflow stats and recent executions.",
    schema: z.object({}),
  },
);

/**
 * Tool: List Agents
 * Get information about available AI agents
 */
const listAgentsTool = tool(
  async () => {
    return {
      success: true,
      agents: [
        {
          name: "Lead Enrichment Agent",
          type: "enrichment",
          description:
            "Researches leads using web search and AI to gather insights, pain points, and buying signals",
          capabilities: [
            "Web research",
            "LinkedIn profile analysis",
            "Pain point identification",
            "Buying signal detection",
          ],
          status: "active",
        },
        {
          name: "Lead Scoring Agent",
          type: "scoring",
          description:
            "Analyzes lead quality and assigns scores based on multiple factors",
          capabilities: [
            "Quality scoring (0-100)",
            "Status recommendation",
            "Engagement analysis",
          ],
          status: "active",
        },
      ],
    };
  },
  {
    name: "list_agents",
    description:
      "Get information about available AI agents in the CRM system and their capabilities.",
    schema: z.object({}),
  },
);

/**
 * Tool: Get CRM Statistics
 * Get overall CRM statistics and metrics
 */
const getCRMStatsTool = tool(
  async () => {
    const supabase = createServiceRoleClient();

    // Get lead counts by status
    const { data: leadsByStatus } = await supabase
      .from("leads")
      .select("status")
      .order("status");

    const statusCounts = (leadsByStatus || []).reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get average score
    const { data: scores } = await supabase
      .from("leads")
      .select("score")
      .not("score", "is", null);

    const avgScore =
      scores && scores.length > 0
        ? scores.reduce((sum, l) => sum + (l.score || 0), 0) / scores.length
        : 0;

    // Get total companies
    const { count: companyCount } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true });

    // Get recent activity count
    const { count: activityCount } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ); // Last 7 days

    return {
      success: true,
      stats: {
        totalLeads: leadsByStatus?.length || 0,
        leadsByStatus: statusCounts,
        averageScore: Math.round(avgScore),
        totalCompanies: companyCount || 0,
        recentActivityCount: activityCount || 0,
      },
    };
  },
  {
    name: "get_crm_stats",
    description:
      "Get overall CRM statistics including lead counts, average scores, and recent activity metrics.",
    schema: z.object({}),
  },
);

/**
 * Tool: Get Company Details
 * Get detailed information about a company including related leads
 */
const getCompanyDetailsTool = tool(
  async ({ companyName, companyId }) => {
    const supabase = createServiceRoleClient();

    let company;

    // Search by ID or name
    if (companyId) {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || "Company not found",
        };
      }
      company = data;
    } else if (companyName) {
      // Try exact match first
      let { data, error } = await supabase
        .from("companies")
        .select("*")
        .ilike("name", companyName)
        .limit(1)
        .single();

      if (error || !data) {
        // Try fuzzy search
        const { data: fuzzyData } = await supabase
          .from("companies")
          .select("*")
          .ilike("name", `%${companyName}%`)
          .limit(1);

        if (!fuzzyData || fuzzyData.length === 0) {
          return {
            success: false,
            error: "Company not found",
          };
        }
        company = fuzzyData[0];
      } else {
        company = data;
      }
    } else {
      return {
        success: false,
        error: "Either companyName or companyId is required",
      };
    }

    // Get related leads
    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .eq("company_name", company.name)
      .order("score", { ascending: false })
      .limit(10);

    // Get recent activities for this company
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get similar companies (same industry)
    const { data: similarCompanies } = await supabase
      .from("companies")
      .select("id, name, industry, size, location")
      .eq("industry", company.industry)
      .neq("id", company.id)
      .limit(5);

    return {
      success: true,
      company,
      relatedLeads: leads || [],
      recentActivities: activities || [],
      similarCompanies: similarCompanies || [],
    };
  },
  {
    name: "get_company_details",
    description:
      "Get detailed information about a company including related leads, recent activities, and similar companies. Use when user asks 'Tell me about [Company]' or wants company information.",
    schema: z.object({
      companyName: z
        .string()
        .optional()
        .describe("The name of the company to look up"),
      companyId: z
        .string()
        .optional()
        .describe("The UUID of the company to look up"),
    }),
  },
);

/**
 * Tool: Get Lead by Email
 * Look up a lead by their email address
 */
const getLeadByEmailTool = tool(
  async ({ email }) => {
    const supabase = createServiceRoleClient();

    // Search for lead by email
    const { data: lead, error } = await supabase
      .from("leads")
      .select(
        `
        *,
        company:companies(*)
      `,
      )
      .ilike("email", email)
      .single();

    if (error || !lead) {
      return {
        success: false,
        error: error?.message || "Lead not found",
      };
    }

    // Get recent activities
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get other leads at the same company
    const { data: colleagueLeads } = await supabase
      .from("leads")
      .select("id, first_name, last_name, email, title, status, score")
      .eq("company_name", lead.company_name)
      .neq("id", lead.id)
      .limit(5);

    // Get conversations if any
    const { data: conversations } = await supabase
      .from("conversations")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(3);

    return {
      success: true,
      lead,
      recentActivities: activities || [],
      colleagueLeads: colleagueLeads || [],
      conversations: conversations || [],
    };
  },
  {
    name: "get_lead_by_email",
    description:
      "Look up a lead by their email address. Returns detailed lead information, recent activities, colleagues at the same company, and conversation history. Use when user asks 'What's the status of [email]' or wants to look up a specific person by email.",
    schema: z.object({
      email: z.string().describe("The email address of the lead to look up"),
    }),
  },
);

/**
 * Tool: Natural Language CRM Query
 * Execute complex natural language queries against the CRM database
 */
const queryCRMTool = tool(
  async ({ query, targetEntity = "leads", limit = 20, offset = 0 }) => {
    const supabase = createServiceRoleClient();

    // Use AI to parse the natural language query into structured filters
    const parser = createFalMiniModel(0);

    const parsingPrompt = `You are a CRM query parser. Convert the natural language query into structured filters.

Available fields for leads:
- first_name, last_name, email, title, company_name
- status: new, researching, qualified, contacted, engaged, nurturing, won, lost
- score: 0-100
- location, linkedin_url, twitter_url
- research_summary, pain_points, buying_signals
- created_at, updated_at

Available fields for companies:
- name, domain, industry, size, revenue
- funding_stage, funding_amount, location
- description, tech_stack

User query: "${query}"

Return a JSON object with these fields:
{
  "filters": {
    "textSearch": "search terms for ILIKE",
    "exactMatches": {"field": "value"},
    "rangeFilters": {"field": {"gte": min, "lte": max}},
    "arrayContains": {"field": "value"}
  },
  "sortBy": "field_name",
  "sortOrder": "asc" or "desc"
}

Example 1: "tech leads from Bay Area with >50 score"
{
  "filters": {
    "textSearch": "tech Bay Area",
    "rangeFilters": {"score": {"gte": 50}}
  }
}

Example 2: "qualified leads at SaaS companies"
{
  "filters": {
    "textSearch": "SaaS",
    "exactMatches": {"status": "qualified"}
  }
}

Return ONLY the JSON object, no explanation.`;

    try {
      const parseResponse = await parser.invoke(parsingPrompt);
      const parseContent =
        typeof parseResponse.content === "string"
          ? parseResponse.content
          : JSON.stringify(parseResponse.content);

      // Extract JSON from response
      const jsonMatch = parseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse query structure");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const { filters, sortBy, sortOrder } = parsed;

      // Build Supabase query based on target entity
      let queryBuilder;

      if (targetEntity === "leads") {
        queryBuilder = supabase
          .from("leads")
          .select(
            `
          id,
          first_name,
          last_name,
          email,
          title,
          company_name,
          status,
          score,
          location,
          research_summary,
          pain_points,
          buying_signals,
          linkedin_url,
          created_at,
          updated_at
        `,
            { count: "exact" },
          )
          .range(offset, offset + limit - 1);
      } else if (targetEntity === "companies") {
        queryBuilder = supabase
          .from("companies")
          .select(
            `
          id,
          name,
          domain,
          industry,
          size,
          revenue,
          funding_stage,
          funding_amount,
          location,
          description,
          tech_stack,
          created_at,
          updated_at
        `,
            { count: "exact" },
          )
          .range(offset, offset + limit - 1);
      } else {
        return {
          success: false,
          error: `Unknown entity type: ${targetEntity}`,
        };
      }

      // Apply text search
      if (filters?.textSearch) {
        const searchTerm = filters.textSearch;
        if (targetEntity === "leads") {
          queryBuilder = queryBuilder.or(
            `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,research_summary.ilike.%${searchTerm}%`,
          );
        } else if (targetEntity === "companies") {
          queryBuilder = queryBuilder.or(
            `name.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
          );
        }
      }

      // Apply exact matches
      if (filters?.exactMatches) {
        for (const [field, value] of Object.entries(filters.exactMatches)) {
          queryBuilder = queryBuilder.eq(field, value);
        }
      }

      // Apply range filters
      if (filters?.rangeFilters) {
        for (const [field, range] of Object.entries(filters.rangeFilters)) {
          const rangeObj = range as any;
          if (rangeObj.gte !== undefined) {
            queryBuilder = queryBuilder.gte(field, rangeObj.gte);
          }
          if (rangeObj.lte !== undefined) {
            queryBuilder = queryBuilder.lte(field, rangeObj.lte);
          }
          if (rangeObj.gt !== undefined) {
            queryBuilder = queryBuilder.gt(field, rangeObj.gt);
          }
          if (rangeObj.lt !== undefined) {
            queryBuilder = queryBuilder.lt(field, rangeObj.lt);
          }
        }
      }

      // Apply sorting
      if (sortBy) {
        queryBuilder = queryBuilder.order(sortBy, {
          ascending: sortOrder === "asc",
        });
      } else {
        // Default sort
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
      }

      const { data, error, count } = await queryBuilder;

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        query: query,
        parsedFilters: filters,
        results: data || [],
        count: count || 0,
        limit,
        offset,
        hasMore: count ? count > offset + limit : false,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse query",
      };
    }
  },
  {
    name: "query_crm",
    description:
      "Execute complex natural language queries against the CRM database. Supports filtering by multiple criteria, searching across text fields, range queries, and sorting. Examples: 'show me all tech leads from Bay Area with >50 employees', 'find qualified SaaS founders', 'get contacts at YC companies in AI space'",
    schema: z.object({
      query: z
        .string()
        .describe(
          "Natural language query describing what data to retrieve from the CRM",
        ),
      targetEntity: z
        .enum(["leads", "companies"])
        .optional()
        .default("leads")
        .describe("Which CRM entity to query (default: leads)"),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe("Maximum number of results to return (default: 20)"),
      offset: z
        .number()
        .optional()
        .default(0)
        .describe("Offset for pagination (default: 0)"),
    }),
  },
);

// Create the tools array
const tools = [
  queryCRMTool,
  searchLeadsTool,
  getLeadStatusTool,
  getCompanyDetailsTool,
  getLeadByEmailTool,
  processLeadTool,
  getWorkflowStatusTool,
  listAgentsTool,
  getCRMStatsTool,
];

// Create tool node
const toolNode = new ToolNode(tools);

// Initialize the model with tools
const model = createFalChatModel(
  undefined, // Use default model (Claude Sonnet 4.5)
  0.7
).bindTools(tools);

// System message to guide the agent
const systemMessage = {
  role: "system",
  content: `You are a helpful CRM assistant with access to a lead management system. 

You have access to the following tools:
- query_crm: Execute complex natural language queries with advanced filtering (USE THIS FIRST for complex queries)
- search_leads: Simple search and filter for leads
- get_lead_status: Get detailed status of a specific lead by ID
- get_company_details: Look up company information with related leads and similar companies (USE for "Tell me about [Company]")
- get_lead_by_email: Look up a lead by email address with related information (USE for "What's the status of [email]")
- process_lead: Trigger lead processing workflow
- get_workflow_status: Check workflow execution status
- list_agents: List all available AI agents
- get_crm_stats: Get CRM statistics and metrics

IMPORTANT: When a user asks about leads, statistics, or any CRM data, you MUST use the appropriate tool to fetch real data. Do not make up information.

LOOKUP PATTERNS:
- "Tell me about [Company Name]" or "What do you know about [Company]" → use get_company_details
- "What's the status of [email]" or "Look up [email]" → use get_lead_by_email
- "Show me leads at [Company]" → use query_crm with company name filter

QUERY TOOL PRIORITY:
- For complex queries with multiple filters → use query_crm tool
- **ALWAYS use query_crm for ANY request to see/show/list/display leads or companies**
- Use search_leads ONLY for simple name/company lookups without displaying results

Examples of query_crm usage (displays results in table):
- "show me all leads" → use query_crm tool with empty filters
- "list all companies" → use query_crm with targetEntity="companies"
- "show me tech leads from Bay Area with >50 score" → use query_crm tool
- "find qualified SaaS founders" → use query_crm tool
- "get contacts at YC companies" → use query_crm tool with "YC" query
- "get me CRM stats" → use get_crm_stats tool (summary only)

When displaying query results from query_crm tool:
1. **CRITICAL: DO NOT repeat the results in text format** - the tool already shows a nice table
2. **ONLY provide a brief 1-sentence summary** like "Found 6 results" or "Here are your leads"
3. **DO NOT list out individual items** - NO bullet points, NO details, NO markdown tables
4. The tool call automatically renders a beautiful table component
5. Example GOOD response: "I found 15 leads matching your criteria."
6. Example BAD response: DO NOT list "Sarah Chen - VP of Engineering..." etc.
7. If paginated, just mention "More results available - ask to see more"

PAGINATION HANDLING:
- Default limit is 20 results per query
- If hasMore=true, user can ask "show me more" or "next page"
- For "more/next", use offset = previous offset + limit
- Example: First query (offset=0, limit=20) → Next query (offset=20, limit=20)
- Track context: remember the original query to paginate correctly
- Inform user: "Showing results 1-20 of 45" or "Showing results 21-40 of 45"

FOLLOW-UP QUERIES:
- Maintain conversation context for refinements
- "show only qualified leads" → add exactMatches filter to existing query
- "with score > 70" → add rangeFilter to existing query
- "sort by score" → modify sortBy and sortOrder
- Remember the user's original intent across follow-ups

Always use tools to answer questions about the CRM data.`,
};

/**
 * Agent node - decides whether to use tools or respond
 */
async function callModel(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;

  // Add system message if not already present
  const hasSystemMessage = messages.some((m: any) => m.role === "system");
  const messagesWithSystem = hasSystemMessage
    ? messages
    : [systemMessage, ...messages];

  const response = await model.invoke(messagesWithSystem);
  return { messages: [response] };
}

/**
 * Routing function - decides next step
 */
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  // If the LLM makes a tool call, route to tools
  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls)) {
    if (lastMessage.tool_calls.length > 0) {
      return "tools";
    }
  }

  // Otherwise end
  return "__end__";
}

/**
 * Build the agent graph
 */
export function buildCRMAssistantGraph() {
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return workflow.compile();
}

// Export the compiled graph
export const crmAssistantGraph = buildCRMAssistantGraph();
