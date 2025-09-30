import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
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

    // Simple test call to OpenAI
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Say 'Hello from OpenAI!' and nothing else.",
    });

    return NextResponse.json({
      success: true,
      message: "OpenAI API connection successful!",
      response: result.text,
      model: "gpt-4o-mini",
      usage: result.usage,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check your OPENAI_API_KEY in .env.local",
      },
      { status: 500 },
    );
  }
}
