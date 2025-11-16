import { NextResponse } from "next/server";
import {
  createFalChatModel,
  createFalMiniModel,
  getAIConfigInfo,
  validateAIConfig,
} from "@/lib/fal-openrouter-config";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Test endpoint for AI configuration with fallback support
 * GET /api/test-fal
 * 
 * Tests:
 * 1. fal OpenRouter (primary)
 * 2. Direct OpenAI (fallback)
 */
export async function GET() {
  const tests: any[] = [];

  // Test 1: Check AI provider configuration
  try {
    const validation = validateAIConfig();
    const configInfo = getAIConfigInfo();
    
    tests.push({
      name: "AI Provider Configuration",
      status: "success",
      message: `Using ${validation.provider.toUpperCase()} as AI provider`,
      details: {
        provider: configInfo.provider,
        baseURL: configInfo.baseURL,
        hasFalKey: configInfo.hasFalKey,
        hasOpenAIKey: configInfo.hasOpenAIKey,
        defaultModel: configInfo.defaultModel,
        defaultMiniModel: configInfo.defaultMiniModel,
        fallbackAvailable: configInfo.fallbackAvailable,
      },
    });
  } catch (error) {
    tests.push({
      name: "AI Provider Configuration",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      hint: "Add FAL_KEY or OPENAI_API_KEY to your .env.local file",
    });
    return NextResponse.json({ tests, success: false });
  }

  // Test 2: Test mini model (quick test)
  try {
    const miniModel = createFalMiniModel(0);
    const parser = new StringOutputParser();
    const chain = miniModel.pipe(parser);

    const response = await chain.invoke(
      "Say 'Hello from AI!' and nothing else."
    );

    const configInfo = getAIConfigInfo();
    tests.push({
      name: "Mini Model Test",
      status: "success",
      message: "Mini model connection successful!",
      details: {
        provider: configInfo.provider,
        model: configInfo.defaultMiniModel,
        response: response.substring(0, 100),
      },
    });
  } catch (error) {
    tests.push({
      name: "Mini Model Test",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      details: "Failed to connect to AI provider",
    });
  }

  // Test 3: Test main model
  try {
    const mainModel = createFalChatModel();
    const parser = new StringOutputParser();
    const chain = mainModel.pipe(parser);

    const response = await chain.invoke(
      "In one sentence, what model are you and who provides you?"
    );

    const configInfo = getAIConfigInfo();
    tests.push({
      name: "Main Model Test",
      status: "success",
      message: "Main model connection successful!",
      details: {
        provider: configInfo.provider,
        model: configInfo.defaultModel,
        response: response.substring(0, 200),
      },
    });
  } catch (error) {
    tests.push({
      name: "Main Model Test",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      details: "Failed to connect to AI provider",
    });
  }

  const success = tests.every((test) => test.status === "success");

  return NextResponse.json({
    success,
    tests,
    summary: {
      total: tests.length,
      passed: tests.filter((t) => t.status === "success").length,
      failed: tests.filter((t) => t.status === "error").length,
    },
  });
}

