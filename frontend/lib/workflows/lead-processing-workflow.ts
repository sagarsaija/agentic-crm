import { enrichLead } from "@/lib/agents/lead-enrichment-agent";
import { findContactInfo } from "@/lib/agents/contact-finder-agent";
import { scrapeProfile } from "@/lib/agents/profile-scraper-agent";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createFalMiniModel } from "@/lib/fal-openrouter-config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Lead Processing Workflow
 *
 * A stateful workflow that processes leads through multiple stages:
 * 1. Discovery - Validate and prepare lead data
 * 2. Enrichment - Add research and insights
 * 3. Scoring - Calculate lead quality score
 * 4. Status Update - Update lead status based on score
 *
 * This workflow uses a state machine pattern inspired by LangGraph
 */

// Workflow States
export enum WorkflowState {
  DISCOVERY = "discovery",
  PROFILE_SCRAPER = "profile_scraper", // Scrape LinkedIn/Twitter to fill lead data
  CONTACT_FINDER = "contact_finder", // Find missing email/LinkedIn
  ENRICHMENT = "enrichment",
  SCORING = "scoring",
  STATUS_UPDATE = "status_update",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Workflow Context (state that flows through the workflow)
export interface WorkflowContext {
  leadId: string;
  currentState: WorkflowState;
  lead?: any;
  enrichmentData?: any;
  score?: number;
  newStatus?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  state: WorkflowState;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  output?: any;
  error?: string;
}

/**
 * Initialize workflow context
 */
export function initializeWorkflow(leadId: string): WorkflowContext {
  return {
    leadId,
    currentState: WorkflowState.DISCOVERY,
    startedAt: new Date(),
    steps: [],
  };
}

/**
 * Step 1: Lead Discovery
 * Fetch and validate lead data from database
 */
export async function discoveryStep(
  context: WorkflowContext,
): Promise<WorkflowContext> {
  const step: WorkflowStep = {
    state: WorkflowState.DISCOVERY,
    status: "running",
    startedAt: new Date(),
  };

  try {
    const supabase = createServiceRoleClient();

    // Fetch lead from database
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", context.leadId)
      .single();

    if (error || !lead) {
      throw new Error(`Lead not found: ${context.leadId}`);
    }

    // Check if we have social profiles to scrape
    const hasProfilesToScrape = lead.linkedin_url || lead.twitter_url;
    const needsContactFinding = !lead.email || !lead.linkedin_url;

    step.status = "completed";
    step.completedAt = new Date();
    step.output = { 
      leadFound: true,
      hasProfilesToScrape,
      needsContactFinding,
      hasEmail: !!lead.email,
      hasLinkedIn: !!lead.linkedin_url,
      hasTwitter: !!lead.twitter_url
    };

    // Determine next state based on what we have
    let nextState = WorkflowState.ENRICHMENT;
    if (hasProfilesToScrape) {
      nextState = WorkflowState.PROFILE_SCRAPER;
    } else if (needsContactFinding) {
      nextState = WorkflowState.CONTACT_FINDER;
    }

    return {
      ...context,
      lead,
      currentState: nextState,
      steps: [...context.steps, step],
    };
  } catch (error) {
    step.status = "failed";
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : "Unknown error";

    return {
      ...context,
      currentState: WorkflowState.FAILED,
      error: step.error,
      steps: [...context.steps, step],
    };
  }
}

/**
 * Step 2: Profile Scraper
 * Scrape LinkedIn/Twitter profiles to extract lead information
 */
export async function profileScraperStep(
  context: WorkflowContext,
): Promise<WorkflowContext> {
  const step: WorkflowStep = {
    state: WorkflowState.PROFILE_SCRAPER,
    status: "running",
    startedAt: new Date(),
  };

  try {
    if (!context.lead) {
      throw new Error("No lead data available");
    }

    // Skip if no profiles to scrape
    if (!context.lead.linkedin_url && !context.lead.twitter_url) {
      step.status = "completed";
      step.completedAt = new Date();
      step.output = { skipped: true, reason: "No profile URLs provided" };

      // Continue to contact finder if needed
      const needsContactFinding = !context.lead.email || !context.lead.linkedin_url;
      return {
        ...context,
        currentState: needsContactFinding 
          ? WorkflowState.CONTACT_FINDER 
          : WorkflowState.ENRICHMENT,
        steps: [...context.steps, step],
      };
    }

    // Run profile scraper agent
    const profileData = await scrapeProfile({
      linkedinUrl: context.lead.linkedin_url,
      twitterUrl: context.lead.twitter_url,
      existingData: {
        firstName: context.lead.first_name,
        lastName: context.lead.last_name,
        email: context.lead.email,
        title: context.lead.title,
        companyName: context.lead.company_name,
        location: context.lead.location,
      },
    });

    // Update lead in database with scraped information
    const supabase = createServiceRoleClient();
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update fields only if not already present
    if (profileData.title && !context.lead.title) {
      updateData.title = profileData.title;
    }
    if (profileData.companyName && !context.lead.company_name) {
      updateData.company_name = profileData.companyName;
    }
    if (profileData.location && !context.lead.location) {
      updateData.location = profileData.location;
    }
    if (profileData.email && !context.lead.email) {
      updateData.email = profileData.email;
    }
    if (profileData.website) {
      updateData.custom_fields = {
        ...context.lead.custom_fields,
        website: profileData.website,
        profileBio: profileData.bio,
        skills: profileData.skills,
        experience: profileData.experience,
        education: profileData.education,
      };
    }

    // Add bio to personal notes if exists
    if (profileData.bio) {
      const existingNotes = context.lead.personal_notes || "";
      updateData.personal_notes = existingNotes
        ? `${existingNotes}\n\nProfile Bio: ${profileData.bio}`
        : `Profile Bio: ${profileData.bio}`;
    }

    await supabase
      .from("leads")
      .update(updateData)
      .eq("id", context.leadId);

    // Log activity
    await supabase.from("activities").insert({
      lead_id: context.leadId,
      type: "agent_action",
      subject: "Profile Information Extracted",
      content: `AI agent scraped ${profileData.profileType} profile and extracted lead information. ${profileData.extractionSummary}`,
      metadata: {
        agent: "profile-scraper",
        profileType: profileData.profileType,
        confidence: profileData.confidence,
        fieldsExtracted: Object.keys(updateData).filter(k => k !== 'updated_at'),
        timestamp: new Date().toISOString(),
      },
    });

    step.status = "completed";
    step.completedAt = new Date();
    step.output = {
      profileType: profileData.profileType,
      confidence: profileData.confidence,
      extractedFields: Object.keys(updateData).filter(k => k !== 'updated_at'),
      summary: profileData.extractionSummary,
    };

    // Update context with scraped data
    const updatedLead = { ...context.lead };
    if (profileData.title) updatedLead.title = profileData.title;
    if (profileData.companyName) updatedLead.company_name = profileData.companyName;
    if (profileData.location) updatedLead.location = profileData.location;
    if (profileData.email) updatedLead.email = profileData.email;

    // Check if we still need contact finding after profile scraping
    const needsContactFinding = !updatedLead.email || !updatedLead.linkedin_url;

    return {
      ...context,
      lead: updatedLead,
      currentState: needsContactFinding 
        ? WorkflowState.CONTACT_FINDER 
        : WorkflowState.ENRICHMENT,
      steps: [...context.steps, step],
    };
  } catch (error) {
    step.status = "failed";
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : "Unknown error";

    // Continue to contact finder or enrichment even if scraping fails
    const needsContactFinding = !context.lead?.email || !context.lead?.linkedin_url;
    return {
      ...context,
      currentState: needsContactFinding 
        ? WorkflowState.CONTACT_FINDER 
        : WorkflowState.ENRICHMENT,
      steps: [...context.steps, step],
    };
  }
}

/**
 * Step 3: Contact Finder
 * Find missing email and LinkedIn URL using AI web search
 */
export async function contactFinderStep(
  context: WorkflowContext,
): Promise<WorkflowContext> {
  const step: WorkflowStep = {
    state: WorkflowState.CONTACT_FINDER,
    status: "running",
    startedAt: new Date(),
  };

  try {
    if (!context.lead) {
      throw new Error("No lead data available");
    }

    // Skip if both email and LinkedIn are already present
    if (context.lead.email && context.lead.linkedin_url) {
      step.status = "completed";
      step.completedAt = new Date();
      step.output = { skipped: true, reason: "All contact info present" };

      return {
        ...context,
        currentState: WorkflowState.ENRICHMENT,
        steps: [...context.steps, step],
      };
    }

    // Run contact finder agent
    const contactInfo = await findContactInfo({
      firstName: context.lead.first_name,
      lastName: context.lead.last_name,
      companyName: context.lead.company_name,
      title: context.lead.title,
      location: context.lead.location,
      existingEmail: context.lead.email,
      existingLinkedinUrl: context.lead.linkedin_url,
    });

    // Update lead in database with found information
    const supabase = createServiceRoleClient();
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (contactInfo.email && !context.lead.email) {
      updateData.email = contactInfo.email;
    }

    if (contactInfo.linkedinUrl && !context.lead.linkedin_url) {
      updateData.linkedin_url = contactInfo.linkedinUrl;
    }

    await supabase
      .from("leads")
      .update(updateData)
      .eq("id", context.leadId);

    // Log activity
    await supabase.from("activities").insert({
      lead_id: context.leadId,
      type: "agent_action",
      subject: "Contact Information Found",
      content: `AI agent found missing contact information. ${contactInfo.searchSummary}`,
      metadata: {
        agent: "contact-finder",
        confidence: contactInfo.confidence,
        foundEmail: !!contactInfo.email,
        foundLinkedIn: !!contactInfo.linkedinUrl,
        timestamp: new Date().toISOString(),
      },
    });

    step.status = "completed";
    step.completedAt = new Date();
    step.output = {
      foundEmail: !!contactInfo.email && !context.lead.email,
      foundLinkedIn: !!contactInfo.linkedinUrl && !context.lead.linkedin_url,
      confidence: contactInfo.confidence,
      summary: contactInfo.searchSummary,
    };

    // Update context with new contact info
    const updatedLead = { ...context.lead };
    if (contactInfo.email) updatedLead.email = contactInfo.email;
    if (contactInfo.linkedinUrl) updatedLead.linkedin_url = contactInfo.linkedinUrl;

    return {
      ...context,
      lead: updatedLead,
      currentState: WorkflowState.ENRICHMENT,
      steps: [...context.steps, step],
    };
  } catch (error) {
    step.status = "failed";
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : "Unknown error";

    // Continue to enrichment even if contact finding fails
    // We'll work with whatever contact info we have
    return {
      ...context,
      currentState: WorkflowState.ENRICHMENT,
      steps: [...context.steps, step],
    };
  }
}

/**
 * Step 4: Enrichment
 * Enrich lead with web research and AI insights
 */
export async function enrichmentStep(
  context: WorkflowContext,
): Promise<WorkflowContext> {
  const step: WorkflowStep = {
    state: WorkflowState.ENRICHMENT,
    status: "running",
    startedAt: new Date(),
  };

  try {
    if (!context.lead) {
      throw new Error("No lead data available");
    }

    // Run enrichment agent
    const enrichmentData = await enrichLead({
      firstName: context.lead.first_name,
      lastName: context.lead.last_name,
      email: context.lead.email,
      title: context.lead.title,
      companyName: context.lead.company_name,
      linkedinUrl: context.lead.linkedin_url,
    });

    // Update lead in database
    const supabase = createServiceRoleClient();
    await supabase
      .from("leads")
      .update({
        research_summary: enrichmentData.researchSummary,
        pain_points: enrichmentData.painPoints,
        buying_signals: enrichmentData.buyingSignals,
        linkedin_url: enrichmentData.linkedin_url || context.lead.linkedin_url,
        twitter_url: enrichmentData.twitter_url,
        location: enrichmentData.location,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.leadId);

    step.status = "completed";
    step.completedAt = new Date();
    step.output = {
      enriched: true,
      painPointsCount: enrichmentData.painPoints?.length || 0,
      buyingSignalsCount: enrichmentData.buyingSignals?.length || 0,
    };

    return {
      ...context,
      enrichmentData,
      currentState: WorkflowState.SCORING,
      steps: [...context.steps, step],
    };
  } catch (error) {
    step.status = "failed";
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : "Unknown error";

    // Continue to scoring even if enrichment fails
    return {
      ...context,
      currentState: WorkflowState.SCORING,
      steps: [...context.steps, step],
    };
  }
}

/**
 * Step 5: Scoring
 * Calculate lead quality score using AI
 */
export async function scoringStep(
  context: WorkflowContext,
): Promise<WorkflowContext> {
  const step: WorkflowStep = {
    state: WorkflowState.SCORING,
    status: "running",
    startedAt: new Date(),
  };

  try {
    const model = createFalMiniModel(0.3); // Lower temperature for consistent scoring

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a lead scoring expert. Analyze the lead data and assign a score from 0-100.

Consider:
- Company fit (industry, size, revenue)
- Contact information quality
- Pain points (more = higher score)
- Buying signals (more = higher score)
- Engagement indicators

Return ONLY a JSON object:
{{
  "score": 75,
  "reasoning": "Brief explanation of the score"
}}`,
      ],
      [
        "human",
        `Lead Data:
Name: {firstName} {lastName}
Title: {title}
Company: {companyName}
Email: {email}
Pain Points: {painPoints}
Buying Signals: {buyingSignals}
Research Summary: {researchSummary}

Calculate a lead quality score (0-100).`,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      firstName: context.lead?.first_name || "Unknown",
      lastName: context.lead?.last_name || "",
      title: context.lead?.title || "Unknown",
      companyName: context.lead?.company_name || "Unknown",
      email: context.lead?.email || "",
      painPoints:
        context.enrichmentData?.painPoints?.join(", ") || "Not analyzed",
      buyingSignals:
        context.enrichmentData?.buyingSignals?.join(", ") || "Not analyzed",
      researchSummary:
        context.enrichmentData?.researchSummary || "Not available",
    });

    // Parse score from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    let score = 50; // Default score
    let reasoning = "Default score assigned";

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        score = Math.max(0, Math.min(100, parsed.score || 50));
        reasoning = parsed.reasoning || reasoning;
      } catch (e) {
        console.error("Failed to parse scoring response:", e);
      }
    }

    // Update score in database
    const supabase = createServiceRoleClient();
    await supabase
      .from("leads")
      .update({
        score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.leadId);

    step.status = "completed";
    step.completedAt = new Date();
    step.output = { score, reasoning };

    return {
      ...context,
      score,
      currentState: WorkflowState.STATUS_UPDATE,
      steps: [...context.steps, step],
    };
  } catch (error) {
    step.status = "failed";
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : "Unknown error";

    return {
      ...context,
      currentState: WorkflowState.STATUS_UPDATE,
      steps: [...context.steps, step],
    };
  }
}

/**
 * Step 6: Status Update
 * Update lead status based on score
 */
export async function statusUpdateStep(
  context: WorkflowContext,
): Promise<WorkflowContext> {
  const step: WorkflowStep = {
    state: WorkflowState.STATUS_UPDATE,
    status: "running",
    startedAt: new Date(),
  };

  try {
    const score = context.score || 0;

    // Determine new status based on score
    let newStatus = "new";
    if (score >= 80) {
      newStatus = "qualified";
    } else if (score >= 60) {
      newStatus = "researching";
    } else if (score >= 40) {
      newStatus = "nurturing";
    }

    // Update status in database
    const supabase = createServiceRoleClient();
    await supabase
      .from("leads")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.leadId);

    // Log workflow completion activity
    await supabase.from("activities").insert({
      lead_id: context.leadId,
      type: "agent_action",
      subject: "Lead Processing Workflow Completed",
      content: `Automated workflow processed lead. Score: ${score}, Status: ${newStatus}`,
      metadata: {
        workflow: "lead-processing",
        score,
        newStatus,
        timestamp: new Date().toISOString(),
      },
    });

    step.status = "completed";
    step.completedAt = new Date();
    step.output = { newStatus, score };

    return {
      ...context,
      newStatus,
      currentState: WorkflowState.COMPLETED,
      completedAt: new Date(),
      steps: [...context.steps, step],
    };
  } catch (error) {
    step.status = "failed";
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : "Unknown error";

    return {
      ...context,
      currentState: WorkflowState.FAILED,
      error: step.error,
      completedAt: new Date(),
      steps: [...context.steps, step],
    };
  }
}

/**
 * Execute the complete workflow
 * Orchestrates all steps in sequence
 */
export async function executeLeadProcessingWorkflow(
  leadId: string,
): Promise<WorkflowContext> {
  console.log(`Starting lead processing workflow for lead: ${leadId}`);

  // Initialize workflow
  let context = initializeWorkflow(leadId);

  // Execute steps in sequence
  context = await discoveryStep(context);
  if (context.currentState === WorkflowState.FAILED) {
    return context;
  }

  // Profile scraper step (only if LinkedIn/Twitter URL provided)
  if (context.currentState === WorkflowState.PROFILE_SCRAPER) {
    context = await profileScraperStep(context);
    if (context.currentState === WorkflowState.FAILED) {
      return context;
    }
  }

  // Contact finder step (only if email/LinkedIn still missing)
  if (context.currentState === WorkflowState.CONTACT_FINDER) {
    context = await contactFinderStep(context);
    if (context.currentState === WorkflowState.FAILED) {
      return context;
    }
  }

  context = await enrichmentStep(context);
  if (context.currentState === WorkflowState.FAILED) {
    return context;
  }

  context = await scoringStep(context);
  if (context.currentState === WorkflowState.FAILED) {
    return context;
  }

  context = await statusUpdateStep(context);

  console.log(`Workflow completed in ${context.currentState} state`);

  return context;
}

/**
 * Get workflow summary for display
 */
export function getWorkflowSummary(context: WorkflowContext) {
  const duration = context.completedAt
    ? context.completedAt.getTime() - context.startedAt.getTime()
    : Date.now() - context.startedAt.getTime();

  return {
    leadId: context.leadId,
    status: context.currentState,
    duration: Math.round(duration / 1000), // seconds
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
  };
}
