import FirecrawlApp from "@mendable/firecrawl-js";

/**
 * Firecrawl Client
 *
 * Provides web scraping capabilities using the Firecrawl API.
 * Used for lead generation, company research, and data extraction.
 */

export interface ScrapeOptions {
  url: string;
  formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  waitFor?: number;
}

export interface ScrapeResult {
  success: boolean;
  markdown?: string;
  html?: string;
  rawHtml?: string;
  links?: string[];
  screenshot?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
    statusCode?: number;
  };
}

export interface CrawlOptions {
  url: string;
  maxDepth?: number;
  limit?: number;
  excludePaths?: string[];
  includePaths?: string[];
}

/**
 * Get Firecrawl client instance
 */
function getFirecrawlClient(): FirecrawlApp {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error(
      "FIRECRAWL_API_KEY environment variable is not set. Get your API key from https://firecrawl.dev",
    );
  }

  return new FirecrawlApp({ apiKey });
}

/**
 * Scrape a single page
 *
 * @example
 * ```typescript
 * const result = await scrapePage({
 *   url: 'https://example.com/about',
 *   formats: ['markdown', 'html'],
 *   onlyMainContent: true
 * });
 * ```
 */
export async function scrapePage(
  options: ScrapeOptions,
): Promise<ScrapeResult> {
  try {
    const app = getFirecrawlClient();

    const scrapeOptions: any = {
      formats: options.formats || ["markdown"],
      onlyMainContent: options.onlyMainContent ?? true,
    };

    if (options.includeTags) {
      scrapeOptions.includeTags = options.includeTags;
    }

    if (options.excludeTags) {
      scrapeOptions.excludeTags = options.excludeTags;
    }

    if (options.waitFor) {
      scrapeOptions.waitFor = options.waitFor;
    }

    const response = await app.scrapeUrl(options.url, scrapeOptions);

    return {
      success: true,
      markdown: response.markdown,
      html: response.html,
      rawHtml: response.rawHtml,
      links: response.links,
      screenshot: response.screenshot,
      metadata: response.metadata,
    };
  } catch (error) {
    console.error("Firecrawl scraping error:", error);
    return {
      success: false,
      metadata: {
        sourceURL: options.url,
      },
    };
  }
}

/**
 * Crawl a website (multiple pages)
 *
 * @example
 * ```typescript
 * const results = await crawlWebsite({
 *   url: 'https://example.com',
 *   maxDepth: 2,
 *   limit: 10
 * });
 * ```
 */
export async function crawlWebsite(
  options: CrawlOptions,
): Promise<ScrapeResult[]> {
  try {
    const app = getFirecrawlClient();

    const crawlOptions: any = {
      limit: options.limit || 10,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    };

    if (options.maxDepth) {
      crawlOptions.maxDepth = options.maxDepth;
    }

    if (options.excludePaths) {
      crawlOptions.excludePaths = options.excludePaths;
    }

    if (options.includePaths) {
      crawlOptions.includePaths = options.includePaths;
    }

    const response = await app.crawlUrl(options.url, crawlOptions);

    if (!response.success) {
      throw new Error("Crawl failed");
    }

    return (
      response.data?.map((page: any) => ({
        success: true,
        markdown: page.markdown,
        html: page.html,
        metadata: page.metadata,
      })) || []
    );
  } catch (error) {
    console.error("Firecrawl crawling error:", error);
    return [];
  }
}

/**
 * Extract structured data from a webpage
 * Useful for lead generation
 */
export async function extractLeadInfo(url: string): Promise<{
  companyName?: string;
  industry?: string;
  description?: string;
  contactEmail?: string;
  phoneNumber?: string;
  location?: string;
  employees?: string;
  foundedYear?: string;
  content?: string;
}> {
  try {
    const result = await scrapePage({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!result.success || !result.markdown) {
      return {};
    }

    // Extract basic info from markdown content
    const markdown = result.markdown;
    const metadata = result.metadata;

    // Simple extraction (can be enhanced with AI)
    const emailMatch = markdown.match(/[\w.-]+@[\w.-]+\.\w+/i);
    const phoneMatch = markdown.match(
      /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/,
    );

    return {
      companyName: metadata?.title?.split("|")[0]?.trim(),
      description: metadata?.description,
      contactEmail: emailMatch ? emailMatch[0] : undefined,
      phoneNumber: phoneMatch ? phoneMatch[0] : undefined,
      content: markdown.substring(0, 1000), // First 1000 chars
    };
  } catch (error) {
    console.error("Lead extraction error:", error);
    return {};
  }
}
