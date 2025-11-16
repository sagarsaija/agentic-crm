import { createFalMiniModel } from "@/lib/fal-openrouter-config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

/**
 * Lead Enrichment Agent
 *
 * This agent enriches lead data by:
 * 1. Searching the web for information about the lead
 * 2. Analyzing the search results with AI
 * 3. Generating insights, pain points, and buying signals
 * 4. Returning structured enrichment data
 */

export interface LeadInput {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  companyName?: string;
  linkedinUrl?: string;
}

export interface EnrichmentResult {
  researchSummary: string;
  painPoints: string[];
  buyingSignals: string[];
  linkedin_url?: string;
  twitter_url?: string;
  location?: string;
  additionalInsights?: string;
}

/**
 * Search for information about a lead using Tavily
 */
async function searchLeadInfo(lead: LeadInput): Promise<string> {
  // Check if Tavily API key is configured
  if (!process.env.TAVILY_API_KEY) {
    console.warn("Tavily API key not found, using mock search results");
    return `Mock search results for ${lead.firstName} ${lead.lastName}`;
  }

  try {
    const search = new TavilySearchResults({
      maxResults: 5,
      apiKey: process.env.TAVILY_API_KEY,
    });

    // Build search query
    const query =
      `${lead.firstName} ${lead.lastName} ${lead.title || ""} ${lead.companyName || ""}`.trim();

    const results = await search.invoke(query);

    // Format results as string
    if (typeof results === "string") {
      return results;
    }

    // Handle array of results
    if (Array.isArray(results)) {
      return results
        .map((r: any) => {
          if (typeof r === "string") return r;
          return `${r.title || ""}\n${r.content || r.snippet || ""}`;
        })
        .join("\n\n");
    }

    return JSON.stringify(results);
  } catch (error) {
    console.error("Search error:", error);
    return `Unable to search for ${lead.firstName} ${lead.lastName}`;
  }
}

/**
 * Analyze search results and generate enrichment insights
 */
async function analyzeLeadData(
  lead: LeadInput,
  searchResults: string,
): Promise<EnrichmentResult> {
  const model = createFalMiniModel(0.7);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a B2B sales research expert. Analyze the provided information about a lead and extract valuable insights for sales outreach.

Your task:
1. Write a concise research summary (2-3 sentences)
2. Identify 3-5 pain points they might have
3. Identify 3-5 buying signals or opportunities
4. Extract any LinkedIn/Twitter URLs, location info

Return your response as a JSON object with this exact structure:
{{
  "researchSummary": "Brief summary here",
  "painPoints": ["pain point 1", "pain point 2", ...],
  "buyingSignals": ["signal 1", "signal 2", ...],
  "linkedin_url": "url or null",
  "twitter_url": "url or null",
  "location": "location or null",
  "additionalInsights": "any other relevant info"
}}

Be specific and actionable. Focus on information relevant to B2B sales.`,
    ],
    [
      "human",
      `Lead Information:
- Name: {firstName} {lastName}
- Title: {title}
- Company: {companyName}
- Email: {email}

Search Results:
{searchResults}

Analyze this information and provide enrichment data in JSON format.`,
    ],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  try {
    const response = await chain.invoke({
      firstName: lead.firstName,
      lastName: lead.lastName,
      title: lead.title || "Unknown",
      companyName: lead.companyName || "Unknown",
      email: lead.email,
      searchResults: searchResults.substring(0, 3000), // Limit to avoid token limits
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        researchSummary: parsed.researchSummary || "No summary available",
        painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
        buyingSignals: Array.isArray(parsed.buyingSignals)
          ? parsed.buyingSignals
          : [],
        linkedin_url: parsed.linkedin_url || lead.linkedinUrl,
        twitter_url: parsed.twitter_url || undefined,
        location: parsed.location || undefined,
        additionalInsights: parsed.additionalInsights || undefined,
      };
    }

    // Fallback if JSON parsing fails
    return {
      researchSummary: response.substring(0, 500),
      painPoints: [],
      buyingSignals: [],
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      researchSummary: `Analysis for ${lead.firstName} ${lead.lastName} at ${lead.companyName || "their company"}`,
      painPoints: [],
      buyingSignals: [],
    };
  }
}

/**
 * Main enrichment function
 * Orchestrates web search and AI analysis
 */
export async function enrichLead(lead: LeadInput): Promise<EnrichmentResult> {
  console.log(`Starting enrichment for ${lead.firstName} ${lead.lastName}`);

  // Step 1: Search for information
  const searchResults = await searchLeadInfo(lead);
  console.log("Search completed, analyzing data...");

  // Step 2: Analyze with AI
  const enrichment = await analyzeLeadData(lead, searchResults);
  console.log("Enrichment completed");

  return enrichment;
}
