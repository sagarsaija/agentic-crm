# fal OpenRouter Integration with OpenAI Fallback

This project uses **fal's OpenRouter endpoint** as the primary AI provider, with automatic fallback to direct OpenAI if fal is unavailable. This gives us the best of both worlds: access to multiple LLM providers through fal, with OpenAI as a reliable backup.

## Why fal OpenRouter with Fallback?

- **Unified API**: Access to multiple LLM providers (Anthropic, OpenAI, Google, etc.) through one endpoint
- **Cost Effective**: Pay-as-you-go pricing through fal
- **Flexible**: Easy to switch between models (Claude, GPT, Gemini, etc.)
- **Resilient**: Automatic fallback to OpenAI if fal is unavailable
- **No Provider Lock-in**: Switch providers without changing code

## Provider Priority

The system automatically uses providers in this order:

1. **fal OpenRouter** (Primary) - Uses Claude Sonnet 4.5, GPT, Gemini, etc.
2. **Direct OpenAI** (Fallback) - Uses GPT-4o and GPT-4o-mini
3. **Error** - If neither FAL_KEY nor OPENAI_API_KEY is configured

## Current Configuration

### Default Models

- **Main Model**: Claude Sonnet 4.5 (`anthropic/claude-sonnet-4.5`)
- **Mini Model**: Claude Sonnet 3.5 (`anthropic/claude-sonnet-3.5`)

These are used throughout the application:
- CRM Assistant (main chat interface)
- Lead enrichment agent
- Lead scoring workflow
- Company scraping and analysis

### Environment Setup

#### Primary: fal OpenRouter (Recommended)

Add your fal API key to `.env.local`:

```bash
FAL_KEY=your_fal_api_key_here
```

Get your API key from: https://fal.ai/dashboard/keys

#### Fallback: Direct OpenAI (Optional)

If you want OpenAI as a fallback, also add:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: If FAL_KEY is configured, it will always be used first. OpenAI is only used as a fallback.

## Implementation Details

### Centralized Configuration

All OpenRouter configuration is in: `frontend/lib/fal-openrouter-config.ts`

This file provides:
- `createFalChatModel()` - Create a model for complex tasks
- `createFalMiniModel()` - Create a faster, cheaper model
- Model constants (available models)
- Configuration validation utilities

### Updated Files

The following files now use fal's OpenRouter endpoint:

1. `frontend/lib/agents/crm-assistant-graph.ts` - Main CRM assistant
2. `frontend/lib/workflows/lead-processing-workflow.ts` - Lead processing
3. `frontend/lib/agents/lead-enrichment-agent.ts` - Lead enrichment
4. `frontend/app/api/companies/[id]/scrape/route.ts` - Company scraping

## Switching Models

### Quick Switch (Edit Config File)

Open `frontend/lib/fal-openrouter-config.ts` and change:

```typescript
export const DEFAULT_MODEL = FAL_MODELS.CLAUDE_SONNET_4_5;
// To something else, like:
export const DEFAULT_MODEL = FAL_MODELS.GPT_4O;
```

### Available Models

Check the `FAL_MODELS` constant in `fal-openrouter-config.ts` for all available models:

- **Claude**: Sonnet 4.5, Sonnet 3.5, Opus 3.5
- **GPT**: GPT-4o, GPT-4o-mini
- **Gemini**: Gemini Flash, Gemini Pro

### Testing Different Models

The model name is passed through OpenRouter, so you can use any model supported by OpenRouter:

```typescript
import { createFalChatModel } from "@/lib/fal-openrouter-config";

// Use a specific model
const model = createFalChatModel("anthropic/claude-3.5-opus", 0.7);

// Or use defaults
const model = createFalChatModel(); // Uses Claude Sonnet 4.5
```

## API Endpoint Details

- **Base URL**: `https://fal.run/openrouter/router/openai/v1`
- **Authentication**: `Authorization: Key <FAL_KEY>`
- **Interface**: OpenAI-compatible API

## Pricing

Pricing is based on:
1. Model used (Claude Sonnet 4.5, GPT-4o, etc.)
2. Tokens consumed (input + output)

View current pricing at: https://fal.ai/pricing

## Troubleshooting

### Automatic Fallback Behavior

The system will automatically log which provider it's using:

```
[AI] Using fal OpenRouter with model: anthropic/claude-sonnet-4.5
```

Or if falling back:

```
[AI] FAL_KEY not found, falling back to OpenAI with model: gpt-4o
```

### Error: No AI provider configured

If you see this error, you need at least one API key:

```bash
# Either fal (recommended)
FAL_KEY=your_fal_key_here

# Or OpenAI (fallback)
OPENAI_API_KEY=your_openai_key_here

# Or both (fal will be used, OpenAI as backup)
FAL_KEY=your_fal_key_here
OPENAI_API_KEY=your_openai_key_here
```

### Model Not Available

If a model isn't available through fal's OpenRouter:
1. Check fal documentation for supported models
2. Try an alternative model from the `FAL_MODELS` constant
3. Update the model name in `fal-openrouter-config.ts`

### Rate Limits

If you hit rate limits:
1. Check your fal dashboard for usage
2. Consider upgrading your fal plan
3. Add retry logic or fallback models

## Testing

Test the configuration:

```bash
curl http://localhost:3000/api/test-fal
```

Or use the CRM chat interface and ask a question to verify it's working.

## Migration Notes

### From Direct OpenAI

Previously:
```typescript
import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });
```

Now:
```typescript
import { createFalMiniModel } from "@/lib/fal-openrouter-config";
const model = createFalMiniModel();
```

### Benefits

1. **Lower Costs**: Pay through fal's unified billing
2. **Better Models**: Access to Claude Sonnet 4.5
3. **Flexibility**: Switch models without code changes
4. **Unified API**: One authentication key for all models

## Additional Resources

- fal Documentation: https://docs.fal.ai/
- OpenRouter Models: https://fal.ai/models/openrouter/router
- fal Dashboard: https://fal.ai/dashboard

