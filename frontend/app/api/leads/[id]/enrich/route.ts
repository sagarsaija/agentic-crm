import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { enrichLead } from "@/lib/agents/lead-enrichment-agent";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for enrichment

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Use regular client to fetch (respects RLS)
    const supabase = await createClient();
    // Use service role client for updates (bypasses RLS)
    const supabaseAdmin = createServiceRoleClient();

    // Get the lead
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Run enrichment
    console.log(`Enriching lead: ${lead.first_name} ${lead.last_name}`);
    const enrichment = await enrichLead({
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      title: lead.title,
      companyName: lead.company_name,
      linkedinUrl: lead.linkedin_url,
    });

    // Update the lead with enriched data (using service role to bypass RLS)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("leads")
      .update({
        research_summary: enrichment.researchSummary,
        pain_points: enrichment.painPoints,
        buying_signals: enrichment.buyingSignals,
        linkedin_url: enrichment.linkedin_url || lead.linkedin_url,
        twitter_url: enrichment.twitter_url || lead.twitter_url,
        location: enrichment.location || lead.location,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 500 },
      );
    }

    // Log activity (using service role)
    await supabaseAdmin.from("activities").insert({
      lead_id: id,
      type: "agent_action",
      subject: "Lead Enrichment Completed",
      content: `AI agent enriched lead profile with research summary and insights.`,
      metadata: {
        agent: "lead-enrichment",
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      lead: updated,
      enrichment,
    });
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      {
        error: "Enrichment failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
