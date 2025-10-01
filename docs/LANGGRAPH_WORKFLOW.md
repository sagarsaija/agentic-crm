# LangGraph Lead Processing Workflow

A comprehensive, stateful workflow system for automated lead processing inspired by LangGraph patterns.

## 🎯 Overview

The Lead Processing Workflow is a multi-step, state-based pipeline that automates the entire lead qualification process from discovery to status assignment. This workflow demonstrates modern agent orchestration patterns using a state machine approach.

## 📋 Workflow Steps

### 1. **Discovery**

- **Purpose**: Validate and fetch lead data
- **Actions**:
  - Fetch lead from Supabase
  - Validate required fields (email, name)
  - Prepare data for next steps
- **Error Handling**: Fails workflow if lead not found
- **Average Duration**: ~0.5s

### 2. **Enrichment**

- **Purpose**: Add AI-powered research and insights
- **Actions**:
  - Run Tavily web search for lead information
  - Generate AI insights using OpenAI
  - Extract pain points and buying signals
  - Update lead profile with enrichment data
- **Error Handling**: Continues to scoring even if enrichment fails
- **Average Duration**: ~15-30s

### 3. **Scoring**

- **Purpose**: Calculate lead quality score
- **Actions**:
  - Analyze lead data with AI
  - Consider company fit, pain points, buying signals
  - Assign score from 0-100
  - Store score in database
- **Error Handling**: Continues to status update with default score
- **Average Duration**: ~3-5s

### 4. **Status Update**

- **Purpose**: Update lead status based on score
- **Actions**:
  - Determine status from score:
    - 80-100: "qualified"
    - 60-79: "researching"
    - 40-59: "nurturing"
    - 0-39: "new"
  - Update lead status in database
  - Log workflow completion activity
- **Error Handling**: Marks workflow as failed
- **Average Duration**: ~0.5s

## 🏗️ Architecture

### State Machine Pattern

```typescript
enum WorkflowState {
  DISCOVERY = "discovery",
  ENRICHMENT = "enrichment",
  SCORING = "scoring",
  STATUS_UPDATE = "status_update",
  COMPLETED = "completed",
  FAILED = "failed",
}
```

### Workflow Context

The context object flows through each step, accumulating state:

```typescript
interface WorkflowContext {
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
```

Each step records its execution:

```typescript
interface WorkflowStep {
  state: WorkflowState;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  output?: any;
  error?: string;
}
```

## 🚀 Usage

### Via UI

1. Navigate to any lead detail page
2. Find the "Automated Workflow" card in the sidebar
3. Click "Run Processing Workflow"
4. Watch the progress in real-time
5. View results including score, status, and step durations

### Via API

```bash
# Run workflow for specific lead
curl -X POST http://localhost:3000/api/workflows/lead-processing \
  -H "Content-Type: application/json" \
  -d '{"leadId": "650e8400-e29b-41d4-a716-446655440001"}'

# Test with first lead in database
curl http://localhost:3000/api/workflows/test
```

### Response Format

```json
{
  "success": true,
  "summary": {
    "leadId": "...",
    "status": "completed",
    "duration": 25,
    "steps": [
      {
        "name": "discovery",
        "status": "completed",
        "duration": 1,
        "output": { "leadFound": true }
      },
      {
        "name": "enrichment",
        "status": "completed",
        "duration": 18,
        "output": {
          "enriched": true,
          "painPointsCount": 3,
          "buyingSignalsCount": 2
        }
      },
      {
        "name": "scoring",
        "status": "completed",
        "duration": 5,
        "output": {
          "score": 75,
          "reasoning": "Strong company fit with clear pain points"
        }
      },
      {
        "name": "status_update",
        "status": "completed",
        "duration": 1,
        "output": {
          "newStatus": "researching",
          "score": 75
        }
      }
    ],
    "finalScore": 75,
    "finalStatus": "researching"
  }
}
```

## 🔧 Implementation Details

### Key Features

#### 1. **Modularity**

Each step is a separate function that can be tested independently:

- `discoveryStep(context)`
- `enrichmentStep(context)`
- `scoringStep(context)`
- `statusUpdateStep(context)`

#### 2. **State Transitions**

Clear state flow with error handling:

```
discovery → enrichment → scoring → status_update → completed
    ↓           ↓           ↓            ↓
  failed      continue    continue    failed
```

#### 3. **Error Recovery**

- Discovery failure: Stops workflow
- Enrichment failure: Continues with partial data
- Scoring failure: Uses default score
- Status update failure: Marks as failed

#### 4. **Observability**

- Each step records timing
- Full execution history preserved
- Activity log in database
- Detailed error messages

### Dependencies

```json
{
  "langchain": "^0.2.11",
  "@langchain/openai": "^0.0.34",
  "@langchain/core": "^0.2.15",
  "tavily": "^0.1.2",
  "@supabase/supabase-js": "^2.58.0"
}
```

### Environment Variables

```bash
OPENAI_API_KEY=sk-...           # Required for AI scoring
TAVILY_API_KEY=tvly-...         # Required for enrichment
SUPABASE_SERVICE_ROLE_KEY=...  # Required for database writes
```

## 📊 Performance

### Average Execution Time

- **Total**: 20-40 seconds
- **Discovery**: 0.5s
- **Enrichment**: 15-30s (depends on Tavily search)
- **Scoring**: 3-5s (AI analysis)
- **Status Update**: 0.5s

### Optimization Tips

1. **Parallel Execution**: Could run enrichment sources in parallel
2. **Caching**: Cache Tavily results for same queries
3. **Batching**: Process multiple leads at once
4. **Model Selection**: Use faster models for scoring

## 🧪 Testing

### Test Single Lead

```bash
# Test with specific lead ID
curl -X POST http://localhost:3000/api/workflows/lead-processing \
  -H "Content-Type: application/json" \
  -d '{"leadId": "YOUR_LEAD_ID"}'
```

### Test First Lead

```bash
# Automatically test with first lead in database
curl http://localhost:3000/api/workflows/test
```

### Expected Results

1. ✅ Discovery finds lead
2. ✅ Enrichment adds research data
3. ✅ Scoring assigns 0-100 score
4. ✅ Status updated based on score
5. ✅ Activity log created
6. ✅ Lead data updated in database

## 🔮 Future Enhancements

### Phase 1: Advanced Workflows

- [ ] Parallel step execution
- [ ] Conditional branching (A/B test paths)
- [ ] Human-in-the-loop approvals
- [ ] Retry logic with exponential backoff

### Phase 2: Multi-Agent Orchestration

- [ ] Specialized agents per step
- [ ] Agent collaboration patterns
- [ ] Cross-workflow communication
- [ ] Workflow composition

### Phase 3: Monitoring & Analytics

- [ ] Real-time workflow dashboard
- [ ] Performance metrics
- [ ] Cost tracking per step
- [ ] Success rate analytics

### Phase 4: Advanced Features

- [ ] Scheduled workflows
- [ ] Bulk processing
- [ ] Workflow templates
- [ ] Custom step injection

## 💰 Cost Analysis

### Per Workflow Execution

| Component  | Service            | Cost per Run |
| ---------- | ------------------ | ------------ |
| Enrichment | Tavily API         | $0.005       |
| Scoring    | OpenAI GPT-4o-mini | $0.0003      |
| Database   | Supabase           | $0.0001      |
| **Total**  |                    | **~$0.0054** |

### Monthly Projections

| Workflows/Month | Total Cost |
| --------------- | ---------- |
| 100             | $0.54      |
| 1,000           | $5.40      |
| 10,000          | $54.00     |
| 100,000         | $540.00    |

## 🛠️ Troubleshooting

### Workflow Fails at Discovery

- **Check**: Lead ID exists in database
- **Fix**: Ensure valid UUID format

### Enrichment Step Fails

- **Check**: `TAVILY_API_KEY` is set
- **Check**: Lead has valid email/name
- **Fix**: Workflow continues with partial data

### Scoring Returns Default (50)

- **Check**: `OPENAI_API_KEY` is valid
- **Check**: OpenAI API quota
- **Fix**: Review API error logs

### Status Update Fails

- **Check**: `SUPABASE_SERVICE_ROLE_KEY` is set
- **Check**: RLS policies allow service role
- **Fix**: Verify service role key

## 📚 Related Documentation

- [Lead Enrichment Agent](./LEAD_ENRICHMENT.md)
- [AI Setup Guide](./AI_SETUP.md)
- [Project Status](./PROJECT_STATUS.md)
- [Firecrawl Integration](./FIRECRAWL_INTEGRATION.md)

## 🔗 Code References

- **Workflow Logic**: `frontend/lib/workflows/lead-processing-workflow.ts`
- **API Endpoint**: `frontend/app/api/workflows/lead-processing/route.ts`
- **UI Component**: `frontend/app/(crm)/leads/[id]/workflow-button.tsx`
- **Test Endpoint**: `frontend/app/api/workflows/test/route.ts`

---

_Last Updated: September 30, 2025_
