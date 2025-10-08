sequenceDiagram
participant User
participant UI as Frontend UI
participant API as Workflow API
participant WF as Workflow Engine
participant Enrich as Enrichment Agent
participant Score as Scoring Agent
participant Tavily as Tavily Search
participant OpenAI
participant DB as Supabase DB

    User->>UI: Click "Process Lead"
    UI->>API: POST /api/workflows/lead-processing
    API->>WF: executeLeadProcessingWorkflow(leadId)

    Note over WF: DISCOVERY STEP
    WF->>DB: Fetch lead data
    DB-->>WF: Lead details
    WF->>WF: Validate lead (email required)

    Note over WF: ENRICHMENT STEP
    WF->>Enrich: enrichLead(leadData)
    Enrich->>Tavily: Search for lead info
    Tavily-->>Enrich: Search results
    Enrich->>OpenAI: Analyze results (GPT-4o-mini)
    OpenAI-->>Enrich: Insights + Pain Points + Signals
    Enrich-->>WF: Enrichment data
    WF->>DB: Update lead with enrichment

    Note over WF: SCORING STEP
    WF->>Score: Calculate lead score
    Score->>OpenAI: Score lead (GPT-4o-mini)
    OpenAI-->>Score: Score (0-100) + reasoning
    Score-->>WF: Lead score
    WF->>DB: Update lead score

    Note over WF: STATUS UPDATE STEP
    WF->>WF: Determine status from score<br/>(80+ = qualified, 60+ = researching, etc.)
    WF->>DB: Update lead status
    WF->>DB: Log activity event

    WF-->>API: Workflow context + summary
    API-->>UI: Success + workflow details
    UI-->>User: Show updated lead with score & insights
