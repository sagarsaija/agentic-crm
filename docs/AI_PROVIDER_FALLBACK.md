# AI Provider Fallback Logic

## Overview

The application uses a smart fallback system to ensure AI functionality is always available.

## Provider Priority

```
┌─────────────────────────────────────────┐
│          AI Request Made                │
└───────────────┬─────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │ FAL_KEY set?  │
        └───────┬───────┘
                │
        ┌───────┴───────┐
        │               │
       Yes              No
        │               │
        ▼               ▼
┌───────────────┐  ┌──────────────────┐
│  Use fal      │  │ OPENAI_API_KEY   │
│  OpenRouter   │  │     set?         │
│               │  └────────┬─────────┘
│ Model:        │           │
│ Claude Sonnet │   ┌───────┴────────┐
│ 4.5 / 3.5     │   │                │
└───────────────┘  Yes               No
                    │                │
                    ▼                ▼
            ┌──────────────┐  ┌──────────┐
            │ Use OpenAI   │  │  ERROR   │
            │              │  │  Throw   │
            │ Model:       │  └──────────┘
            │ GPT-4o /     │
            │ GPT-4o-mini  │
            └──────────────┘
```

## Configuration Options

### Option 1: fal Only (Recommended)

**Best for**: Production use, access to multiple models

```bash
# .env.local
FAL_KEY=your_fal_api_key_here
```

**Result**:
- ✅ Uses Claude Sonnet 4.5 (main)
- ✅ Uses Claude Sonnet 3.5 (mini)
- ✅ Access to GPT, Gemini, and other models
- ❌ No fallback if fal is down

### Option 2: OpenAI Only (Fallback)

**Best for**: Development, testing without fal

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

**Result**:
- ❌ No Claude models
- ✅ Uses GPT-4o (main)
- ✅ Uses GPT-4o-mini (mini)
- ❌ No access to other OpenRouter models

### Option 3: Both (Most Resilient)

**Best for**: Production with maximum uptime

```bash
# .env.local
FAL_KEY=your_fal_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

**Result**:
- ✅ Uses Claude Sonnet 4.5 (primary)
- ✅ Falls back to GPT-4o if fal unavailable
- ✅ Maximum resilience
- ✅ Zero downtime during provider issues

## Model Mapping

| Operation | fal (Primary) | OpenAI (Fallback) |
|-----------|---------------|-------------------|
| **Main Model** | Claude Sonnet 4.5 | GPT-4o |
| **Mini Model** | Claude Sonnet 3.5 | GPT-4o-mini |
| **Use Case** | Complex reasoning | Fast operations |

## Logging

The system logs which provider is active:

### Using fal OpenRouter

```
[AI] Using fal OpenRouter with model: anthropic/claude-sonnet-4.5
```

### Falling back to OpenAI

```
[AI] FAL_KEY not found, falling back to OpenAI with model: gpt-4o
```

### No provider available

```
Error: No AI provider configured. Please add FAL_KEY or OPENAI_API_KEY to your .env file.
```

## Code Example

The fallback is completely transparent to your code:

```typescript
import { createFalChatModel, createFalMiniModel } from "@/lib/fal-openrouter-config";

// This automatically uses fal or falls back to OpenAI
const mainModel = createFalChatModel();  // Claude 4.5 or GPT-4o
const miniModel = createFalMiniModel();  // Claude 3.5 or GPT-4o-mini

// No additional code needed for fallback logic!
```

## Testing Fallback

### Test fal Configuration

```bash
# With FAL_KEY set
curl http://localhost:3000/api/test-fal
```

Expected response:
```json
{
  "success": true,
  "tests": [{
    "name": "AI Provider Configuration",
    "message": "Using FAL as AI provider",
    "details": {
      "provider": "fal",
      "hasFalKey": true,
      "hasOpenAIKey": false
    }
  }]
}
```

### Test OpenAI Fallback

```bash
# Remove FAL_KEY, keep OPENAI_API_KEY
curl http://localhost:3000/api/test-fal
```

Expected response:
```json
{
  "success": true,
  "tests": [{
    "name": "AI Provider Configuration",
    "message": "Using OPENAI as AI provider",
    "details": {
      "provider": "openai",
      "hasFalKey": false,
      "hasOpenAIKey": true
    }
  }]
}
```

## Error Scenarios

### Neither Key Configured

```json
{
  "success": false,
  "tests": [{
    "name": "AI Provider Configuration",
    "status": "error",
    "message": "No AI provider configured...",
    "hint": "Add FAL_KEY or OPENAI_API_KEY to your .env.local file"
  }]
}
```

### Invalid fal Key (with OpenAI Fallback)

The system will:
1. Try fal first (fails)
2. Automatically fall back to OpenAI (succeeds)
3. Log warning: `[AI] FAL_KEY not found, falling back to OpenAI...`

## Best Practices

1. **Production**: Use both keys for maximum resilience
2. **Development**: Use fal only to test primary path
3. **Testing**: Use OpenAI only for simpler, faster tests
4. **Monitoring**: Watch console logs to see which provider is active
5. **Cost**: Track usage per provider to optimize costs

## Switching Providers Manually

Edit `frontend/lib/fal-openrouter-config.ts`:

```typescript
// To force OpenAI even if fal is available
// Comment out the fal check:
export function createFalChatModel(...) {
  // Skip fal
  // if (isFalAvailable()) { ... }
  
  // Use OpenAI directly
  if (isOpenAIAvailable()) {
    return new ChatOpenAI({ modelName: "gpt-4o", ... });
  }
}
```

But this is NOT recommended - let the automatic fallback handle it!

## Related Documentation

- [Full Setup Guide](./FAL_OPENROUTER_SETUP.md)
- [Migration Summary](./FAL_MIGRATION_SUMMARY.md)

