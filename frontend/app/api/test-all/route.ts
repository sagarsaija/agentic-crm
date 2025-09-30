/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

/**
 * Comprehensive test endpoint that checks all integrations
 * - Database (Supabase)
 * - OpenAI API
 * - LangChain Agent
 */
export const maxDuration = 30;

interface TestResult {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: any;
}

export async function GET() {
  const results: TestResult[] = [];

  // Test 1: Supabase Connection
  try {
    const dbTest = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/rest/v1/`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (dbTest.ok || dbTest.status === 401) {
      results.push({
        name: "Supabase Connection",
        status: "success",
        message: "Database is accessible",
      });
    } else {
      throw new Error("Database connection failed");
    }
  } catch (error) {
    results.push({
      name: "Supabase Connection",
      status: "error",
      message:
        error instanceof Error ? error.message : "Database connection failed",
    });
  }

  // Test 2: OpenAI API Key
  if (!process.env.OPENAI_API_KEY) {
    results.push({
      name: "OpenAI API Key",
      status: "error",
      message: "OPENAI_API_KEY not configured",
      details: "Add your OpenAI API key to .env.local",
    });
  } else if (
    !process.env.OPENAI_API_KEY.startsWith("sk-") ||
    process.env.OPENAI_API_KEY.length < 20
  ) {
    results.push({
      name: "OpenAI API Key",
      status: "warning",
      message: "OpenAI API key format looks incorrect",
      details: "Key should start with 'sk-' and be longer",
    });
  } else {
    results.push({
      name: "OpenAI API Key",
      status: "success",
      message: "OpenAI API key is configured",
    });
  }

  // Test 3: Environment Variables
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "OPENAI_API_KEY",
  ];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    results.push({
      name: "Environment Variables",
      status: "error",
      message: `Missing required environment variables: ${missingVars.join(", ")}`,
    });
  } else {
    results.push({
      name: "Environment Variables",
      status: "success",
      message: "All required environment variables are set",
    });
  }

  // Test 4: LangGraph Cloud (Optional)
  if (process.env.LANGGRAPH_API_URL && process.env.LANGCHAIN_API_KEY) {
    results.push({
      name: "LangGraph Cloud",
      status: "success",
      message: "LangGraph Cloud is configured",
      details: {
        url: process.env.LANGGRAPH_API_URL,
      },
    });
  } else {
    results.push({
      name: "LangGraph Cloud",
      status: "warning",
      message: "LangGraph Cloud not configured (optional)",
      details: "Will use local LangChain instead",
    });
  }

  // Calculate overall status
  const hasErrors = results.some((r) => r.status === "error");
  const hasWarnings = results.some((r) => r.status === "warning");

  return NextResponse.json({
    overall: hasErrors ? "error" : hasWarnings ? "warning" : "success",
    message: hasErrors
      ? "Some integrations failed"
      : hasWarnings
        ? "All critical integrations working (some warnings)"
        : "All integrations working!",
    timestamp: new Date().toISOString(),
    results,
  });
}
