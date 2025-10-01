import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { executeLeadProcessingWorkflow } from "@/lib/workflows/lead-processing-workflow";

/**
 * GET /api/workflows/test
 *
 * Test endpoint to demonstrate the workflow with a sample lead
 */
export async function GET() {
  try {
    // Get the first lead from the database
    const supabase = createServiceRoleClient();
    const { data: leads, error } = await supabase
      .from("leads")
      .select("id, first_name, last_name")
      .limit(1);

    if (error || !leads || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads found in database" },
        { status: 404 },
      );
    }

    const testLead = leads[0];

    console.log(
      `Testing workflow with lead: ${testLead.first_name} ${testLead.last_name} (${testLead.id})`,
    );

    // Execute the workflow
    const context = await executeLeadProcessingWorkflow(testLead.id);

    // Return full results
    return NextResponse.json({
      message: "Workflow test completed",
      leadId: testLead.id,
      leadName: `${testLead.first_name} ${testLead.last_name}`,
      workflowStatus: context.currentState,
      duration: context.completedAt
        ? Math.round(
            (context.completedAt.getTime() - context.startedAt.getTime()) /
              1000,
          )
        : null,
      steps: context.steps.map((step) => ({
        name: step.state,
        status: step.status,
        duration: step.completedAt
          ? Math.round(
              (step.completedAt.getTime() - step.startedAt.getTime()) / 1000,
            )
          : null,
        output: step.output,
        error: step.error,
      })),
      finalScore: context.score,
      finalStatus: context.newStatus,
      error: context.error,
    });
  } catch (error) {
    console.error("Workflow test error:", error);
    return NextResponse.json(
      {
        error: "Workflow test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
