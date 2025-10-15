import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * GET /api/conversations/[id]/messages
 * Get all messages for a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error in GET /api/conversations/[id]/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Add a message to a conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: conversationId } = await params;
    const supabase = createServiceRoleClient();
    const body = await request.json();
    const { role, content, toolCalls, toolCallId, name, metadata } = body;

    if (!role || (!content && !toolCalls)) {
      return NextResponse.json(
        { error: "role and (content or toolCalls) are required" },
        { status: 400 },
      );
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        tool_calls: toolCalls || [],
        tool_call_id: toolCallId,
        name,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error in POST /api/conversations/[id]/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
