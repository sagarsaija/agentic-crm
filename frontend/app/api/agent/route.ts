import { crmAssistantGraph } from "@/lib/agents/crm-assistant-graph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

export const runtime = "nodejs";

/**
 * Local agent endpoint
 * POST /api/agent
 */
export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Agent request:", { messageCount: messages.length });

    // Convert messages to LangChain format
    const langchainMessages = messages.map((msg: any) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    });

    // Stream the graph execution
    const stream = await crmAssistantGraph.stream(
      {
        messages: langchainMessages,
      },
      {
        configurable: {
          thread_id: `thread_${Date.now()}`,
        },
        streamMode: "messages",
      },
    );

    // Create a plain ReadableStream for streaming text
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          for await (const chunk of stream) {
            const [message, metadata] = chunk;

            if (message && message.content && message._getType() === "ai") {
              const content =
                typeof message.content === "string"
                  ? message.content
                  : JSON.stringify(message.content);

              // Send text chunks
              controller.enqueue(encoder.encode(content));
            }
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Agent error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
