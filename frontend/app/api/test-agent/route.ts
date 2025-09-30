import { testAgent } from "@/lib/agents/test-agent";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY not configured",
          hint: "Add your OpenAI API key to .env.local",
        },
        { status: 500 },
      );
    }

    // Test the agent with a simple query
    const response = await testAgent(
      "Introduce yourself in one sentence and mention you're a CRM assistant.",
    );

    return NextResponse.json({
      success: true,
      message: "LangChain agent test successful!",
      agent_response: response,
      model: "gpt-4o-mini",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check your OPENAI_API_KEY and ensure LangChain is properly installed",
      },
      { status: 500 },
    );
  }
}
