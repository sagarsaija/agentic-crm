# 🔥 Firecrawl Integration Guide

Complete guide to web scraping and lead generation using Firecrawl in the Agentic CRM.

## 🎯 Overview

Firecrawl is a web scraping API optimized for AI and LLM applications. It handles JavaScript-heavy sites, provides clean markdown output, and respects robots.txt automatically.

### What It Does

- **Web Scraping**: Extract content from any website
- **Lead Generation**: Scrape company websites for contact info
- **Company Intelligence**: Analyze company websites for insights
- **Data Extraction**: Convert web pages to clean markdown/HTML

### Use Cases

1. **Lead Generation**: Scrape company "About Us" and "Contact" pages
2. **Competitive Intelligence**: Monitor competitor websites
3. **Data Enrichment**: Enhance company profiles with web data
4. **Market Research**: Gather industry insights from websites

## 🚀 Setup

### Step 1: Create Firecrawl Account

1. Visit [https://firecrawl.dev](https://firecrawl.dev)
2. Sign up for an account (free tier available)
3. Go to your dashboard and generate an API key

### Step 2: Add API Key

Add to `frontend/.env.local`:

```bash
FIRECRAWL_API_KEY=fc-your-api-key-here
```

### Step 3: Install Dependencies

Already installed! ✅

```bash
# These are already in package.json
@mendable/firecrawl-js
axios
```

### Step 4: Restart Dev Server

```bash
# Stop current server
pkill -f "next dev"

# Start with new env vars
cd frontend
npm run dev
```

## 🧪 Testing

### Test Firecrawl Setup

Visit: http://localhost:3000/api/scrape?test=true

Expected response:

```json
{
  "success": true,
  "message": "Firecrawl is configured correctly!",
  "test": {
    "scraped": true,
    "hasContent": true,
    "contentPreview": "Example Domain..."
  }
}
```

### Test Manual Scraping

```bash
# Scrape a page
curl -X POST http://localhost:3000/api/scrape \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "action": "scrape"}'

# Extract lead info
curl -X POST http://localhost:3000/api/scrape \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "action": "extract-lead"}'
```

### Test Company Scraping

```bash
# Scrape a company website (replace with actual company ID)
curl -X POST http://localhost:3000/api/companies/550e8400-e29b-41d4-a716-446655440001/scrape
```

## 📝 API Reference

### Basic Scraping

**Endpoint**: `POST /api/scrape`

**Request**:

```json
{
  "url": "https://example.com/about",
  "action": "scrape" // or "extract-lead"
}
```

**Response**:

```json
{
  "success": true,
  "action": "scrape",
  "url": "https://example.com/about",
  "data": {
    "success": true,
    "markdown": "# About Us\\n\\nWe are...",
    "html": "<html>...</html>",
    "metadata": {
      "title": "About Us - Example Company",
      "description": "Learn more about...",
      "statusCode": 200
    }
  }
}
```

### Company Intelligence

**Endpoint**: `POST /api/companies/[id]/scrape`

**What It Does**:

1. Scrapes the company's website
2. Analyzes content with GPT-4o-mini
3. Extracts structured intelligence:
   - Company description
   - Industry/sector
   - Products/services
   - Target market
   - Tech stack
   - Competitors
   - Recent news
4. Updates company record in database
5. Logs activity to timeline

**Response**:

```json
{
  "success": true,
  "company": { /* updated company object */ },
  "intelligence": {
    "description": "...",
    "industry": "...",
    "products": [...],
    "targetMarket": "...",
    "techStack": [...],
    "competitors": [...],
    "recentNews": "...",
    "keyInsights": [...]
  },
  "scraped": {
    "url": "https://company.com",
    "contentLength": 5432
  }
}
```

## 🎮 Usage in UI

### Company Detail Page

Navigate to: `/companies/[id]`

Click **"Scrape Website"** button to:

- Extract company intelligence
- Update company profile
- Log scraping activity

The button shows:

- ⏳ "Scraping..." while in progress
- ✅ Success alert when complete
- ❌ Error alert if fails

## 💡 Code Examples

### Manual Scraping

```typescript
import { scrapePage } from "@/lib/scraping/firecrawl-client";

const result = await scrapePage({
  url: "https://example.com",
  formats: ["markdown", "html"],
  onlyMainContent: true,
});

console.log(result.markdown);
```

### Crawling a Website

```typescript
import { crawlWebsite } from "@/lib/scraping/firecrawl-client";

const pages = await crawlWebsite({
  url: "https://example.com",
  maxDepth: 2,
  limit: 10,
  excludePaths: ["/blog/*"],
});

pages.forEach((page) => {
  console.log(page.metadata.title);
  console.log(page.markdown);
});
```

### Extract Lead Info

```typescript
import { extractLeadInfo } from "@/lib/scraping/firecrawl-client";

const lead = await extractLeadInfo("https://company.com/about");

console.log(lead.companyName);
console.log(lead.contactEmail);
console.log(lead.phoneNumber);
```

## 🏗️ Architecture

```
┌────────────────────────────────────────────────┐
│  UI (Company Detail Page)                      │
│  ┌──────────────────────────────────────────┐ │
│  │  "Scrape Website" Button                 │ │
│  └───────────┬──────────────────────────────┘ │
└──────────────┼─────────────────────────────────┘
               │
               ▼
    POST /api/companies/[id]/scrape
               │
               ▼
┌──────────────────────────────────────────────┐
│  1. Fetch Company from Supabase              │
│  2. Scrape Website (Firecrawl API)          │
│  3. Analyze with GPT-4o-mini                │
│  4. Extract Intelligence                     │
│  5. Update Company Record                    │
│  6. Log Activity                            │
└──────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  Firecrawl API (firecrawl.dev)              │
│  • JavaScript rendering                      │
│  • Clean markdown output                     │
│  • Respects robots.txt                       │
│  • IP rotation                              │
└──────────────────────────────────────────────┘
```

## 💰 Cost Estimates

### Firecrawl Pricing

**Free Tier**:

- 500 credits/month
- 1 credit = 1 page scrape
- Good for testing

**Paid Plans** (typical):

- Starter: $20/month (~2,000 pages)
- Growth: $100/month (~12,000 pages)
- Enterprise: Custom pricing

### Per-Operation Costs

| Operation            | Firecrawl Cost | OpenAI Cost | Total  |
| -------------------- | -------------- | ----------- | ------ |
| Simple Scrape        | $0.01          | -           | $0.01  |
| Company Intelligence | $0.01          | $0.002      | $0.012 |
| Lead Extraction      | $0.01          | -           | $0.01  |

### At Scale

| Companies/Month | Scraping Cost | Total Est |
| --------------- | ------------- | --------- |
| 100             | $1.20         | ~$5       |
| 500             | $6.00         | ~$20      |
| 1,000           | $12.00        | ~$40      |

## 🔒 Compliance & Best Practices

### Legal Compliance

✅ **DO**:

- Respect robots.txt (Firecrawl does this automatically)
- Check website terms of service
- Only scrape publicly available data
- Rate limit your requests
- Store data securely

❌ **DON'T**:

- Scrape copyrighted content
- Bypass authentication/paywalls
- Scrape personal data without consent
- Overwhelm servers with requests
- Ignore cease & desist notices

### Technical Best Practices

1. **Error Handling**:

```typescript
try {
  const result = await scrapePage({ url });
  if (!result.success) {
    // Handle failure gracefully
  }
} catch (error) {
  console.error("Scraping failed:", error);
  // Return fallback or retry
}
```

2. **Rate Limiting**:

```typescript
// Add delay between requests
await scrapePage({ url: page1 });
await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay
await scrapePage({ url: page2 });
```

3. **Caching**:

```typescript
// Cache scraped content for 24 hours
const cacheKey = `scrape:${url}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

const result = await scrapePage({ url });
await redis.set(cacheKey, result, { ex: 86400 });
```

4. **Validation**:

```typescript
// Validate URLs before scraping
try {
  new URL(url);
} catch {
  throw new Error("Invalid URL");
}

// Check for valid domain
if (!url.startsWith("http://") && !url.startsWith("https://")) {
  throw new Error("URL must start with http:// or https://");
}
```

## 🐛 Troubleshooting

### "FIRECRAWL_API_KEY not set"

**Cause**: Environment variable missing or not loaded

**Solution**:

1. Add `FIRECRAWL_API_KEY` to `.env.local`
2. Restart dev server
3. Verify with `curl http://localhost:3000/api/scrape?test=true`

### "Scraping failed" or Timeout

**Causes**:

- Website blocks scraping
- JavaScript takes too long to load
- Network issues
- Invalid URL

**Solutions**:

```typescript
// Increase wait time for JavaScript
await scrapePage({
  url,
  waitFor: 5000, // Wait 5 seconds
});

// Increase API timeout
export const maxDuration = 120; // 2 minutes
```

### "Failed to extract data"

**Cause**: Website structure doesn't match extraction patterns

**Solution**: Use AI to analyze markdown content instead of regex:

```typescript
// Instead of regex extraction
const result = await scrapePage({ url });
const analysis = await analyzeWithAI(result.markdown);
```

### Rate Limited by Firecrawl

**Cause**: Exceeded API quota or rate limits

**Solutions**:

- Upgrade Firecrawl plan
- Implement request queuing
- Add delays between requests
- Cache results

## 🚀 Future Enhancements

### Planned Features

1. **Bulk Scraping**:

   - Scrape multiple companies at once
   - Queue system for large batches
   - Progress tracking

2. **Scheduled Scraping**:

   - Automatic re-scraping of company websites
   - Monitor for changes/updates
   - Alert on significant changes

3. **Advanced Extraction**:

   - Extract pricing information
   - Find team members/contacts
   - Identify technologies used
   - Extract social media links

4. **Lead Discovery**:
   - Discover new leads from scraped pages
   - Extract contact directories
   - Find decision makers

## 📚 Resources

- **Firecrawl Docs**: https://docs.firecrawl.dev
- **Firecrawl Dashboard**: https://firecrawl.dev/dashboard
- **API Reference**: https://docs.firecrawl.dev/api-reference
- **Web Scraping Best Practices**: https://www.scrapingbee.com/blog/web-scraping-best-practices/

---

**Questions?** Check [AI_SETUP.md](./AI_SETUP.md) for AI agent patterns or [SETUP_GUIDE.md](./SETUP_GUIDE.md) for configuration help.
