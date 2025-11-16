import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { scrapePage } from "@/lib/scraping/firecrawl-client";
import { createFalMiniModel } from "@/lib/fal-openrouter-config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const maxDuration = 60;

/**
 * Scrape a company's website and extract intelligence
 * POST /api/companies/[id]/scrape
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Get the company
    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!company.domain) {
      return NextResponse.json(
        { error: "Company domain is required for scraping" },
        { status: 400 },
      );
    }

    // Scrape the company website
    console.log(`Scraping company website: ${company.domain}`);
    const scrapeResult = await scrapePage({
      url: `https://${company.domain}`,
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!scrapeResult.success || !scrapeResult.markdown) {
      return NextResponse.json(
        { error: "Failed to scrape website" },
        { status: 500 },
      );
    }

    // Analyze the scraped content with AI
    console.log("Analyzing scraped content...");
    const model = createFalMiniModel(0.7);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a B2B company research expert. Analyze the company website content and extract key intelligence.

Return a JSON object with this structure:
{{
  "description": "Brief company description (2-3 sentences)",
  "industry": "Primary industry/sector",
  "products": ["product/service 1", "product/service 2", ...],
  "targetMarket": "Who they sell to",
  "techStack": ["technology 1", "technology 2", ...] (if mentioned),
  "competitors": ["competitor 1", "competitor 2", ...] (if mentioned),
  "recentNews": "Any notable recent developments or news",
  "keyInsights": ["insight 1", "insight 2", ...]
}}`,
      ],
      [
        "human",
        `Company: {companyName}
Domain: {domain}

Website Content (first 3000 chars):
{content}

Analyze this company and provide intelligence in JSON format.`,
      ],
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      companyName: company.name,
      domain: company.domain,
      content: scrapeResult.markdown.substring(0, 3000),
    });

    // Parse AI response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    let intelligence: any = {};

    if (jsonMatch) {
      try {
        intelligence = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    // Update company with intelligence
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("companies")
      .update({
        description: intelligence.description || company.description,
        industry: intelligence.industry || company.industry,
        tech_stack: intelligence.techStack || company.tech_stack,
        competitors: intelligence.competitors || company.competitors,
        recent_news: intelligence.recentNews || company.recent_news,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update company" },
        { status: 500 },
      );
    }

    // Log activity
    await supabaseAdmin.from("activities").insert({
      company_id: id,
      type: "agent_action",
      subject: "Company Website Scraped",
      content: `AI agent scraped and analyzed company website for intelligence.`,
      metadata: {
        agent: "company-scraper",
        timestamp: new Date().toISOString(),
        intelligence,
      },
    });

    return NextResponse.json({
      success: true,
      company: updated,
      intelligence,
      scraped: {
        url: `https://${company.domain}`,
        contentLength: scrapeResult.markdown.length,
      },
    });
  } catch (error) {
    console.error("Company scrape error:", error);
    return NextResponse.json(
      {
        error: "Scraping failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
