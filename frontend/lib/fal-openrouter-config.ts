/**
 * fal OpenRouter Configuration with OpenAI Fallback
 *
 * Centralized configuration for using fal's OpenRouter endpoint
 * with automatic fallback to OpenAI if FAL_KEY is not configured.
 *
 * Priority:
 * 1. fal OpenRouter (if FAL_KEY exists) - Uses Claude, GPT, Gemini, etc.
 * 2. Direct OpenAI (if OPENAI_API_KEY exists) - Fallback
 */

import { ChatOpenAI } from "@langchain/openai";

/**
 * Model names available through OpenRouter
 * Use these constants to ensure consistency across the app
 */
export const FAL_MODELS = {
  // Claude models (Anthropic)
  CLAUDE_SONNET_4_5: "anthropic/claude-sonnet-4.5", // Latest Sonnet
  CLAUDE_SONNET_3_5: "anthropic/claude-3.5-sonnet", // Fallback if 4.5 not available
  CLAUDE_OPUS_3_5: "anthropic/claude-3.5-opus",

  // Alternative models if Claude not available
  GPT_4O: "openai/gpt-4o",
  GPT_4O_MINI: "openai/gpt-4o-mini",
  GEMINI_FLASH: "google/gemini-2.5-flash",
  GEMINI_PRO: "google/gemini-2.0-flash-thinking-exp",
} as const;

/**
 * Default model to use across the application
 * Change this to switch models globally
 */
export const DEFAULT_MODEL = FAL_MODELS.CLAUDE_SONNET_4_5;
export const DEFAULT_MINI_MODEL = FAL_MODELS.CLAUDE_SONNET_3_5; // For faster, cheaper operations

/**
 * OpenAI fallback models (when FAL_KEY not available)
 */
const OPENAI_FALLBACK_MODELS = {
  MAIN: "gpt-4o",
  MINI: "gpt-4o-mini",
} as const;

/**
 * fal OpenRouter base configuration
 */
const FAL_OPENROUTER_CONFIG = {
  baseURL: "https://fal.run/openrouter/router/openai/v1",
  defaultHeaders: {
    Authorization: `Key ${process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_KEY}`,
  },
} as const;

/**
 * Check if FAL is available
 */
function isFalAvailable(): boolean {
  return !!(process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_KEY);
}

/**
 * Check if OpenAI is available as fallback
 */
function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Create a ChatOpenAI instance with automatic fallback
 *
 * Priority:
 * 1. fal OpenRouter (if FAL_KEY exists) - Uses specified model
 * 2. Direct OpenAI (if OPENAI_API_KEY exists) - Uses GPT-4o
 * 3. Error if neither is available
 *
 * @param modelName - Model to use with fal (defaults to Claude Sonnet 4.5)
 * @param temperature - Temperature setting (0-1, default 0.7)
 * @param options - Additional ChatOpenAI options
 * @returns Configured ChatOpenAI instance
 */
export function createFalChatModel(
  modelName: string = DEFAULT_MODEL,
  temperature: number = 0.7,
  options: any = {},
) {
  // Try fal OpenRouter first
  if (isFalAvailable()) {
    console.log(`[AI] Using fal OpenRouter with model: ${modelName}`);
    return new ChatOpenAI({
      modelName,
      temperature,
      configuration: FAL_OPENROUTER_CONFIG,
      ...options,
    });
  }

  // Fallback to direct OpenAI
  if (isOpenAIAvailable()) {
    console.warn(
      `[AI] FAL_KEY not found, falling back to OpenAI with model: ${OPENAI_FALLBACK_MODELS.MAIN}`,
    );
    return new ChatOpenAI({
      modelName: OPENAI_FALLBACK_MODELS.MAIN,
      temperature,
      ...options,
    });
  }

  // Neither available - throw error
  throw new Error(
    "No AI provider configured. Please add FAL_KEY or OPENAI_API_KEY to your .env file.",
  );
}

/**
 * Create a mini model for faster, cheaper operations with automatic fallback
 *
 * Priority:
 * 1. fal OpenRouter (if FAL_KEY exists) - Uses Claude Sonnet 3.5
 * 2. Direct OpenAI (if OPENAI_API_KEY exists) - Uses GPT-4o-mini
 * 3. Error if neither is available
 */
export function createFalMiniModel(
  temperature: number = 0.7,
  options: any = {},
) {
  // Try fal OpenRouter first
  if (isFalAvailable()) {
    console.log(`[AI] Using fal OpenRouter with model: ${DEFAULT_MINI_MODEL}`);
    return new ChatOpenAI({
      modelName: DEFAULT_MINI_MODEL,
      temperature,
      configuration: FAL_OPENROUTER_CONFIG,
      ...options,
    });
  }

  // Fallback to direct OpenAI
  if (isOpenAIAvailable()) {
    console.warn(
      `[AI] FAL_KEY not found, falling back to OpenAI with model: ${OPENAI_FALLBACK_MODELS.MINI}`,
    );
    return new ChatOpenAI({
      modelName: OPENAI_FALLBACK_MODELS.MINI,
      temperature,
      ...options,
    });
  }

  // Neither available - throw error
  throw new Error(
    "No AI provider configured. Please add FAL_KEY or OPENAI_API_KEY to your .env file.",
  );
}

/**
 * Validate that at least one AI provider is configured
 */
export function validateAIConfig() {
  if (isFalAvailable()) {
    return { provider: "fal", valid: true };
  }
  if (isOpenAIAvailable()) {
    return { provider: "openai", valid: true };
  }
  throw new Error(
    "No AI provider configured. Please add FAL_KEY or OPENAI_API_KEY to your .env file.",
  );
}

/**
 * Get configuration info for debugging
 */
export function getAIConfigInfo() {
  const hasFalKey = isFalAvailable();
  const hasOpenAIKey = isOpenAIAvailable();

  return {
    provider: hasFalKey ? "fal" : hasOpenAIKey ? "openai" : "none",
    baseURL: hasFalKey
      ? FAL_OPENROUTER_CONFIG.baseURL
      : "https://api.openai.com/v1",
    hasFalKey,
    hasOpenAIKey,
    defaultModel: hasFalKey ? DEFAULT_MODEL : OPENAI_FALLBACK_MODELS.MAIN,
    defaultMiniModel: hasFalKey
      ? DEFAULT_MINI_MODEL
      : OPENAI_FALLBACK_MODELS.MINI,
    fallbackAvailable: hasOpenAIKey,
  };
}
