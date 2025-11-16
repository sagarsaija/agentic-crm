import { createFalMiniModel } from "@/lib/fal-openrouter-config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

/**
 * Contact Finder Agent
 *
 * This agent finds missing contact information (email, LinkedIn) for leads
 * when only name and company are provided. Uses web search and AI to locate
 * professional contact details.
 */

export interface ContactFinderInput {
  firstName: string;
  lastName: string;
  companyName?: string;
  title?: string;
  location?: string;
  existingEmail?: string;
  existingLinkedinUrl?: string;
}

export interface ContactFinderResult {
  email?: string;
  linkedinUrl?: string;
  confidence: "high" | "medium" | "low";
  searchSummary: string;
  alternativeEmails?: string[];
  notes?: string;
}

/**
 * Search for contact information using Tavily
 */
async function searchContactInfo(
  input: ContactFinderInput,
): Promise<string> {
  // Check if Tavily API key is configured
  if (!process.env.TAVILY_API_KEY) {
    console.warn("Tavily API key not found, using mock search results");
    return `Mock search results for ${input.firstName} ${input.lastName} at ${input.companyName || "Unknown Company"}`;
  }

  try {
    const search = new TavilySearchResults({
      maxResults: 10,
      apiKey: process.env.TAVILY_API_KEY,
    });

    // Build comprehensive search query
    const queries = [];

    // Query 1: LinkedIn profile search
    if (!input.existingLinkedinUrl) {
      queries.push(
        `${input.firstName} ${input.lastName} ${input.title || ""} ${input.companyName || ""} site:linkedin.com/in`,
      );
    }

    // Query 2: Email search
    if (!input.existingEmail) {
      queries.push(
        `${input.firstName} ${input.lastName} ${input.companyName || ""} email contact`,
      );
    }

    // Query 3: Company directory
    if (input.companyName) {
      queries.push(
        `${input.firstName} ${input.lastName} ${input.companyName} team directory`,
      );
    }

    // Execute searches and combine results
    const searchResults = await Promise.all(
      queries.map(async (query) => {
        try {
          const results = await search.invoke(query);
          if (typeof results === "string") return results;
          if (Array.isArray(results)) {
            return results
              .map((r: any) => {
                if (typeof r === "string") return r;
                return `${r.title || ""}\n${r.content || r.snippet || ""}\nURL: ${r.url || ""}`;
              })
              .join("\n\n");
          }
          return JSON.stringify(results);
        } catch (error) {
          console.error(`Search error for "${query}":`, error);
          return "";
        }
      }),
    );

    return searchResults.filter((r) => r).join("\n\n---\n\n");
  } catch (error) {
    console.error("Contact search error:", error);
    return `Unable to search for ${input.firstName} ${input.lastName}`;
  }
}

/**
 * Analyze search results and extract contact information
 */
async function extractContactInfo(
  input: ContactFinderInput,
  searchResults: string,
): Promise<ContactFinderResult> {
  const model = createFalMiniModel(0.3); // Lower temp for factual extraction

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a contact information extraction expert. Your job is to find and verify professional contact details from search results.

CRITICAL RULES:
1. ONLY extract information if you find CONCRETE EVIDENCE in the search results
2. For emails: Must be explicitly shown in the results
3. For LinkedIn: Must be a full linkedin.com/in/[username] URL
4. Do NOT fabricate or guess information
5. Confidence levels:
   - "high": Found explicit mention with verification
   - "medium": Strong indicators but not 100% confirmed
   - "low": Minimal evidence, mostly inference

Return ONLY a JSON object with this exact structure:
{{
  "email": "email@company.com or null",
  "linkedinUrl": "https://linkedin.com/in/username or null",
  "confidence": "high" | "medium" | "low",
  "searchSummary": "Brief explanation of what was found",
  "alternativeEmails": ["other@email.com"] (optional),
  "notes": "Any important caveats or additional context"
}}

If you cannot find reliable information, return:
{{
  "email": null,
  "linkedinUrl": null,
  "confidence": "low",
  "searchSummary": "No reliable contact information found in search results",
  "notes": "Consider manual research or alternative data sources"
}}`,
    ],
    [
      "human",
      `Person Information:
- Name: {firstName} {lastName}
- Company: {companyName}
- Title: {title}
- Location: {location}
- Existing Email: {existingEmail}
- Existing LinkedIn: {existingLinkedinUrl}

Search Results:
{searchResults}

Extract and verify contact information from these search results. Be conservative - only include information you're confident about.`,
    ],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  try {
    const response = await chain.invoke({
      firstName: input.firstName,
      lastName: input.lastName,
      companyName: input.companyName || "Unknown",
      title: input.title || "Unknown",
      location: input.location || "Unknown",
      existingEmail: input.existingEmail || "Not provided",
      existingLinkedinUrl: input.existingLinkedinUrl || "Not provided",
      searchResults: searchResults.substring(0, 6000), // Limit to avoid token limits
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        email: parsed.email || input.existingEmail || undefined,
        linkedinUrl: parsed.linkedinUrl || input.existingLinkedinUrl || undefined,
        confidence: parsed.confidence || "low",
        searchSummary: parsed.searchSummary || "Analysis completed",
        alternativeEmails: parsed.alternativeEmails || undefined,
        notes: parsed.notes || undefined,
      };
    }

    // Fallback if JSON parsing fails
    return {
      confidence: "low",
      searchSummary: "Failed to parse AI response",
      email: input.existingEmail,
      linkedinUrl: input.existingLinkedinUrl,
    };
  } catch (error) {
    console.error("Contact extraction error:", error);
    return {
      confidence: "low",
      searchSummary: `Error during analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
      email: input.existingEmail,
      linkedinUrl: input.existingLinkedinUrl,
    };
  }
}

/**
 * Main function to find missing contact information
 * Orchestrates web search and AI analysis
 */
export async function findContactInfo(
  input: ContactFinderInput,
): Promise<ContactFinderResult> {
  console.log(
    `Starting contact finder for ${input.firstName} ${input.lastName}`,
  );

  // Check if we need to search at all
  const needsEmail = !input.existingEmail;
  const needsLinkedIn = !input.existingLinkedinUrl;

  if (!needsEmail && !needsLinkedIn) {
    return {
      email: input.existingEmail,
      linkedinUrl: input.existingLinkedinUrl,
      confidence: "high",
      searchSummary: "All contact information already provided",
    };
  }

  // Step 1: Search for contact information
  const searchResults = await searchContactInfo(input);
  console.log("Search completed, extracting contact info...");

  // Step 2: Extract and validate contact information
  const contactInfo = await extractContactInfo(input, searchResults);
  console.log("Contact finder completed");

  return contactInfo;
}

