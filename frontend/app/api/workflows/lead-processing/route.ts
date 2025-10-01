import { NextResponse } from "next/server";
import {
  executeLeadProcessingWorkflow,
  getWorkflowSummary,
} from "@/lib/workflows/lead-processing-workflow";

export const maxDuration = 120; // Allow up to 2 minutes for full workflow

/**
 * POST /api/workflows/lead-processing
 *
 * Trigger the lead processing workflow for a specific lead
 *
 * Body: { leadId: string }
 */
export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
        { status: 400 },
      );
    }

    console.log(`Starting workflow for lead: ${leadId}`);

    // Execute the complete workflow
    const context = await executeLeadProcessingWorkflow(leadId);

    // Get summary
    const summary = getWorkflowSummary(context);

    console.log(`Workflow completed:`, summary);

    return NextResponse.json({
      success: context.currentState === "completed",
      summary,
      context,
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
