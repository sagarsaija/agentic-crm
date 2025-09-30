import { NextResponse } from "next/server";
import { scrapePage, extractLeadInfo } from "@/lib/scraping/firecrawl-client";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const maxDuration = 60; // Allow up to 60 seconds for scraping

export async function POST(request: Request) {
  try {
    const { url, action = "scrape" } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (action === "extract-lead") {
      // Extract lead information from the page
      const leadInfo = await extractLeadInfo(url);

      return NextResponse.json({
        success: true,
        action: "extract-lead",
        url,
        data: leadInfo,
      });
    } else {
      // Default: scrape the page
      const result = await scrapePage({
        url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
      });

      return NextResponse.json({
        success: result.success,
        action: "scrape",
        url,
        data: result,
      });
    }
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      {
        error: "Scraping failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Test endpoint to verify Firecrawl is working
 * GET /api/scrape?test=true
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isTest = searchParams.get("test") === "true";

    if (!isTest) {
      return NextResponse.json(
        { error: "Use POST for scraping or add ?test=true to test" },
        { status: 400 },
      );
    }

    // Test with a simple page
    const result = await scrapePage({
      url: "https://example.com",
      formats: ["markdown"],
      onlyMainContent: true,
    });

    return NextResponse.json({
      success: true,
      message: "Firecrawl is configured correctly!",
      test: {
        scraped: result.success,
        hasContent: !!result.markdown,
        contentPreview: result.markdown?.substring(0, 100),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
        message:
          "Firecrawl API key might be missing or invalid. Add FIRECRAWL_API_KEY to .env.local",
      },
      { status: 500 },
    );
  }
}
