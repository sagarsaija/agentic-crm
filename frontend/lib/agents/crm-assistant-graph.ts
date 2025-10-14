import { ChatOpenAI } from "@langchain/openai";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { executeLeadProcessingWorkflow } from "@/lib/workflows/lead-processing-workflow";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

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

// Create the tools array
const tools = [
  searchLeadsTool,
  getLeadStatusTool,
  processLeadTool,
  getWorkflowStatusTool,
  listAgentsTool,
  getCRMStatsTool,
];

// Create tool node
const toolNode = new ToolNode(tools);

// Initialize the model with tools
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
}).bindTools(tools);

/**
 * Agent node - decides whether to use tools or respond
 */
async function callModel(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
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
