import { createFalMiniModel } from "@/lib/fal-openrouter-config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { scrapePage } from "@/lib/scraping/firecrawl-client";

/**
 * Profile Scraper Agent
 *
 * This agent scrapes LinkedIn and X (Twitter) profiles to automatically
 * extract lead information like title, company, location, bio, etc.
 * Uses Firecrawl for scraping and AI for extraction.
 */

export interface ProfileScraperInput {
  linkedinUrl?: string;
  twitterUrl?: string;
  existingData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    title?: string;
    companyName?: string;
    location?: string;
  };
}

export interface ProfileScraperResult {
  // Extracted Information
  title?: string;
  companyName?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration?: string;
  }>;
  education?: string[];
  
  // Social/Contact
  email?: string;
  website?: string;
  
  // Metadata
  profileType: "linkedin" | "twitter" | "both";
  confidence: "high" | "medium" | "low";
  extractionSummary: string;
  notes?: string;
}

/**
 * Scrape a LinkedIn profile
 */
async function scrapeLinkedInProfile(url: string): Promise<string | null> {
  console.log(`Scraping LinkedIn profile: ${url}`);

  try {
    const result = await scrapePage({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!result.success || !result.markdown) {
      // LinkedIn requires Firecrawl Enterprise - this is expected
      console.warn("⚠️  LinkedIn scraping unavailable (Firecrawl Enterprise required). Enrichment Agent will handle data collection.");
      return null;
    }

    return result.markdown;
  } catch (error) {
    // Check if it's the expected 403 from Firecrawl for LinkedIn
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("403") || errorMessage.includes("not currently supported")) {
      console.warn("⚠️  LinkedIn scraping unavailable (Firecrawl Enterprise required). Enrichment Agent will handle data collection.");
      return null;
    }
    
    // For other unexpected errors, log as error
    console.error("LinkedIn scrape error:", error);
    return null;
  }
}

/**
 * Scrape an X (Twitter) profile
 */
async function scrapeTwitterProfile(url: string): Promise<string | null> {
  console.log(`Scraping X/Twitter profile: ${url}`);

  try {
    const result = await scrapePage({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!result.success || !result.markdown) {
      console.warn("⚠️  X/Twitter scraping failed. Enrichment Agent will handle data collection.");
      return null;
    }

    return result.markdown;
  } catch (error) {
    console.warn("⚠️  X/Twitter scraping failed. Enrichment Agent will handle data collection.");
    console.debug("X scrape error details:", error);
    return null;
  }
}

/**
 * Extract structured information from scraped profile using AI
 */
async function extractProfileInfo(
  profileContent: string,
  profileType: "linkedin" | "twitter",
  existingData?: ProfileScraperInput["existingData"],
): Promise<Partial<ProfileScraperResult>> {
  const model = createFalMiniModel(0.2); // Low temp for factual extraction

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a profile information extraction expert. Extract structured data from ${profileType === "linkedin" ? "LinkedIn" : "X/Twitter"} profile content.

EXTRACTION RULES:
1. ONLY extract information explicitly present in the content
2. Do NOT fabricate or guess information
3. Be conservative - if unsure, omit the field
4. For LinkedIn: Focus on current role, company, location, experience
5. For Twitter: Focus on bio, location, current role/company mentioned

Return a JSON object with this structure:
{{
  "title": "Current job title" or null,
  "companyName": "Current company name" or null,
  "location": "City, State/Country" or null,
  "bio": "Professional summary/bio (2-3 sentences)" or null,
  "skills": ["skill1", "skill2"] or [],
  "experience": [
    {{
      "title": "Job title",
      "company": "Company name",
      "duration": "e.g., 2020-2023 or 3 years"
    }}
  ] or [],
  "education": ["School/Degree"] or [],
  "email": "email@domain.com" or null,
  "website": "https://website.com" or null,
  "confidence": "high" | "medium" | "low",
  "extractionSummary": "Brief summary of what was extracted",
  "notes": "Any caveats or important context"
}}

CONFIDENCE LEVELS:
- "high": Clear, explicit information found
- "medium": Reasonable inference from context
- "low": Limited or unclear information`,
    ],
    [
      "human",
      `Profile Type: ${profileType}

Existing Lead Data:
${existingData ? JSON.stringify(existingData, null, 2) : "None"}

Profile Content:
{content}

Extract all available information from this profile. Prioritize current/recent information.`,
    ],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  try {
    const response = await chain.invoke({
      content: profileContent.substring(0, 8000), // Limit to avoid token limits
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || existingData?.title,
        companyName: parsed.companyName || existingData?.companyName,
        location: parsed.location || existingData?.location,
        bio: parsed.bio,
        skills: parsed.skills || [],
        experience: parsed.experience || [],
        education: parsed.education || [],
        email: parsed.email || existingData?.email,
        website: parsed.website,
        confidence: parsed.confidence || "medium",
        extractionSummary: parsed.extractionSummary || "Extraction completed",
        notes: parsed.notes,
      };
    }

    // Fallback if JSON parsing fails
    return {
      confidence: "low",
      extractionSummary: "Failed to parse AI response",
      title: existingData?.title,
      companyName: existingData?.companyName,
      location: existingData?.location,
    };
  } catch (error) {
    console.error("Profile extraction error:", error);
    return {
      confidence: "low",
      extractionSummary: `Error during extraction: ${error instanceof Error ? error.message : "Unknown error"}`,
      title: existingData?.title,
      companyName: existingData?.companyName,
      location: existingData?.location,
    };
  }
}

/**
 * Merge information from multiple sources
 */
function mergeProfileData(
  linkedinData?: Partial<ProfileScraperResult>,
  twitterData?: Partial<ProfileScraperResult>,
): Partial<ProfileScraperResult> {
  // LinkedIn data takes precedence for professional info
  // Twitter data fills in gaps and adds context
  
  return {
    title: linkedinData?.title || twitterData?.title,
    companyName: linkedinData?.companyName || twitterData?.companyName,
    location: linkedinData?.location || twitterData?.location,
    bio: linkedinData?.bio || twitterData?.bio,
    skills: linkedinData?.skills || twitterData?.skills || [],
    experience: linkedinData?.experience || [],
    education: linkedinData?.education || [],
    email: linkedinData?.email || twitterData?.email,
    website: linkedinData?.website || twitterData?.website,
    confidence: linkedinData?.confidence || twitterData?.confidence || "low",
    extractionSummary: [
      linkedinData?.extractionSummary,
      twitterData?.extractionSummary,
    ]
      .filter(Boolean)
      .join(" | "),
    notes: [linkedinData?.notes, twitterData?.notes]
      .filter(Boolean)
      .join(" | "),
  };
}

/**
 * Main function to scrape and extract profile information
 * Orchestrates scraping and AI extraction for LinkedIn and/or Twitter
 */
export async function scrapeProfile(
  input: ProfileScraperInput,
): Promise<ProfileScraperResult> {
  console.log("Starting profile scraper");

  const { linkedinUrl, twitterUrl, existingData } = input;

  // Check if we have any URLs to scrape
  if (!linkedinUrl && !twitterUrl) {
    throw new Error("No profile URLs provided");
  }

  let linkedinData: Partial<ProfileScraperResult> | undefined;
  let twitterData: Partial<ProfileScraperResult> | undefined;
  let profileType: "linkedin" | "twitter" | "both";

  try {
    // Scrape LinkedIn if URL provided
    if (linkedinUrl) {
      console.log("Scraping LinkedIn profile...");
      const linkedinContent = await scrapeLinkedInProfile(linkedinUrl);
      if (linkedinContent) {
        linkedinData = await extractProfileInfo(
          linkedinContent,
          "linkedin",
          existingData,
        );
      } else {
        console.log("LinkedIn scraping unavailable, skipping profile extraction");
      }
    }

    // Scrape Twitter if URL provided
    if (twitterUrl) {
      console.log("Scraping X/Twitter profile...");
      const twitterContent = await scrapeTwitterProfile(twitterUrl);
      if (twitterContent) {
        twitterData = await extractProfileInfo(
          twitterContent,
          "twitter",
          existingData,
        );
      } else {
        console.log("X/Twitter scraping unavailable, skipping profile extraction");
      }
    }

    // Determine profile type
    if (linkedinUrl && twitterUrl) {
      profileType = "both";
    } else if (linkedinUrl) {
      profileType = "linkedin";
    } else {
      profileType = "twitter";
    }

    // If no data was scraped from either source
    if (!linkedinData && !twitterData) {
      console.log("No profile data scraped, workflow will continue with enrichment");
      return {
        profileType,
        confidence: "low",
        extractionSummary: "Profile scraping unavailable. Enrichment Agent will collect data via web search.",
        notes: "LinkedIn/X scraping requires Firecrawl Enterprise plan. Workflow continues with enrichment.",
      } as ProfileScraperResult;
    }

    // Merge data from both sources
    const mergedData = mergeProfileData(linkedinData, twitterData);

    console.log("Profile scraping completed");

    return {
      ...mergedData,
      profileType,
    } as ProfileScraperResult;
  } catch (error) {
    console.error("Unexpected error in profile scraping:", error);
    // Return graceful failure instead of throwing
    return {
      profileType: linkedinUrl ? "linkedin" : "twitter",
      confidence: "low",
      extractionSummary: "Profile scraping encountered an error. Enrichment Agent will collect data via web search.",
      notes: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    } as ProfileScraperResult;
  }
}

/**
 * Helper function to validate if a URL is a LinkedIn profile
 */
export function isLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes("linkedin.com") && urlObj.pathname.includes("/in/")
    );
  } catch {
    return false;
  }
}

/**
 * Helper function to validate if a URL is an X/Twitter profile
 */
export function isTwitterUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      (urlObj.hostname.includes("twitter.com") ||
        urlObj.hostname.includes("x.com")) &&
      urlObj.pathname.split("/").filter(Boolean).length === 1
    );
  } catch {
    return false;
  }
}

