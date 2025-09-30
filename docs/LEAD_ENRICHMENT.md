# Lead Enrichment Agent

The Lead Enrichment Agent is an AI-powered system that automatically gathers and analyzes information about leads to enhance their profiles with valuable insights.

## 🎯 What It Does

The enrichment agent:

1. **Searches the web** for information about the lead (name, title, company)
2. **Analyzes search results** using GPT-4o-mini
3. **Extracts insights** including:
   - Research summary (2-3 sentence overview)
   - Pain points (challenges they might face)
   - Buying signals (opportunities for outreach)
   - LinkedIn/Twitter URLs
   - Location information
4. **Updates the lead** profile in Supabase
5. **Logs activity** for tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  Lead Detail Page (UI)                          │
│  ┌────────────────────────────────────────┐    │
│  │  "AI Enrich" Button                    │    │
│  └────────────┬───────────────────────────┘    │
└───────────────┼────────────────────────────────┘
                │
                ▼
      POST /api/leads/[id]/enrich
                │
                ▼
┌───────────────────────────────────────────────┐
│  Lead Enrichment Agent                        │
│  ┌─────────────────────────────────────────┐ │
│  │  1. Fetch Lead Data                     │ │
│  └──────────┬──────────────────────────────┘ │
│             ▼                                 │
│  ┌─────────────────────────────────────────┐ │
│  │  2. Search Web (Tavily API)            │ │
│  └──────────┬──────────────────────────────┘ │
│             ▼                                 │
│  ┌─────────────────────────────────────────┐ │
│  │  3. Analyze with GPT-4o-mini           │ │
│  └──────────┬──────────────────────────────┘ │
│             ▼                                 │
│  ┌─────────────────────────────────────────┐ │
│  │  4. Extract Structured Data            │ │
│  └──────────┬──────────────────────────────┘ │
└─────────────┼─────────────────────────────────┘
              ▼
┌────────────────────────────────────────────────┐
│  Update Supabase                               │
│  - research_summary                            │
│  - pain_points (JSONB array)                   │
│  - buying_signals (JSONB array)                │
│  - linkedin_url, twitter_url, location         │
└────────────────────────────────────────────────┘
```

## 🔧 Setup

### 1. Get Tavily API Key

Tavily is a search API designed for AI agents. It provides clean, LLM-ready search results.

1. Visit [https://tavily.com](https://tavily.com)
2. Sign up (free tier available: 1,000 requests/month)
3. Get your API key
4. Add to `frontend/.env.local`:

```bash
TAVILY_API_KEY=tvly-your-key-here
```

### 2. Ensure OpenAI Key is Set

```bash
OPENAI_API_KEY=sk-your-key-here
```

## 🎮 How to Use

### Via UI

1. Navigate to any lead detail page: `/leads/[id]`
2. Click the **"AI Enrich"** button in the top right
3. Wait 10-30 seconds for enrichment to complete
4. Page will refresh with new data visible in the **Research** tab

### Via API

```typescript
POST /api/leads/{leadId}/enrich

// Response
{
  "success": true,
  "lead": {
    // Updated lead object
  },
  "enrichment": {
    "researchSummary": "...",
    "painPoints": [...],
    "buyingSignals": [...],
    "linkedin_url": "...",
    "twitter_url": "...",
    "location": "..."
  }
}
```

### Programmatically

```typescript
import { enrichLead } from "@/lib/agents/lead-enrichment-agent";

const result = await enrichLead({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  title: "VP of Sales",
  companyName: "Acme Corp",
});

console.log(result);
// {
//   researchSummary: "...",
//   painPoints: [...],
//   buyingSignals: [...],
//   ...
// }
```

## 📊 What Gets Updated

The agent updates these fields in the `leads` table:

| Field              | Type  | Description            |
| ------------------ | ----- | ---------------------- |
| `research_summary` | TEXT  | 2-3 sentence overview  |
| `pain_points`      | JSONB | Array of challenges    |
| `buying_signals`   | JSONB | Array of opportunities |
| `linkedin_url`     | TEXT  | LinkedIn profile URL   |
| `twitter_url`      | TEXT  | Twitter profile URL    |
| `location`         | TEXT  | Geographic location    |

## 🧪 Testing

### Manual Testing

Use the sample leads in the database:

```sql
-- Get a test lead ID
SELECT id, first_name, last_name, company_name
FROM leads
LIMIT 1;
```

Then click "AI Enrich" on that lead's detail page.

### Check Results

1. **Research Tab**: View the AI-generated summary
2. **Timeline Tab**: See the enrichment activity log
3. **Database**: Query directly to see raw data

```sql
SELECT
  first_name,
  last_name,
  research_summary,
  pain_points,
  buying_signals
FROM leads
WHERE id = 'your-lead-id';
```

## 💰 Cost Estimate

### Per Enrichment:

- **Tavily API**: ~$0.001 per search (5 results)
- **OpenAI GPT-4o-mini**: ~$0.002 per enrichment
- **Total**: ~$0.003 per lead

### At Scale:

- 1,000 leads: ~$3
- 10,000 leads: ~$30

## 🔒 Security & Best Practices

1. **Rate Limiting**: Consider adding rate limits to prevent API abuse
2. **Caching**: Cache enrichment results to avoid re-enriching the same lead
3. **Error Handling**: Agent gracefully handles API failures
4. **Privacy**: Be mindful of data privacy when storing web-scraped data

## 🚀 Future Enhancements

- **Scheduled Enrichment**: Automatically enrich new leads
- **Re-enrichment**: Refresh stale data periodically
- **Custom Sources**: Add company-specific data sources
- **Scoring Integration**: Use enrichment data to auto-score leads
- **Batch Enrichment**: Enrich multiple leads at once
- **Approval Workflow**: Review enrichment before saving

## 📝 Code Structure

```
frontend/
├── lib/agents/
│   └── lead-enrichment-agent.ts  # Core agent logic
├── app/api/leads/[id]/enrich/
│   └── route.ts                  # API endpoint
└── app/(crm)/leads/[id]/
    └── enrich-button.tsx         # UI component
```

## 🐛 Troubleshooting

### "Tavily API key not found"

- Check `.env.local` has `TAVILY_API_KEY`
- Restart dev server after adding the key

### "Enrichment taking too long"

- Increase `maxDuration` in the API route
- Check Tavily API status
- Try enriching a simpler lead (less web presence)

### "No insights generated"

- Check if search returned meaningful results
- Try a lead with more online presence
- Review OpenAI API logs

## 📚 Resources

- [Tavily API Docs](https://docs.tavily.com/)
- [LangChain Docs](https://js.langchain.com/)
- [OpenAI API](https://platform.openai.com/docs)
