import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Create a new lead
 * POST /api/leads
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      companyName,
      linkedinUrl,
      twitterUrl,
      location,
      personalNotes,
    } = body;

    // Validate required fields (only name is required)
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 },
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }
    }

    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Check if lead with this email already exists (only if email provided)
    if (email) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id, email")
        .eq("email", email.toLowerCase())
        .single();

      if (existingLead) {
        return NextResponse.json(
          {
            error: "A lead with this email already exists",
            leadId: existingLead.id,
          },
          { status: 409 },
        );
      }
    }

    // Create the lead (email is optional now)
    const { data: lead, error: createError } = await supabaseAdmin
      .from("leads")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email ? email.toLowerCase().trim() : null,
        phone: phone?.trim() || null,
        title: title?.trim() || null,
        company_name: companyName?.trim() || null,
        linkedin_url: linkedinUrl?.trim() || null,
        twitter_url: twitterUrl?.trim() || null,
        location: location?.trim() || null,
        personal_notes: personalNotes?.trim() || null,
        source: "manual",
        status: "new",
        score: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating lead:", createError);
      return NextResponse.json(
        { error: "Failed to create lead", details: createError.message },
        { status: 500 },
      );
    }

    // Log activity
    await supabaseAdmin.from("activities").insert({
      lead_id: lead.id,
      type: "note",
      subject: "Lead Created",
      content: `New lead manually added: ${firstName} ${lastName} from ${companyName || "Unknown Company"}`,
      metadata: {
        source: "manual",
        created_by: "user",
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        lead,
        message: "Lead created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create lead",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Get all leads (with optional filtering)
 * GET /api/leads?status=new&limit=50
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient();

    let query = supabase
      .from("leads")
      .select(
        `
        *,
        companies (name, domain, industry)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data: leads, error, count } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch leads",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

