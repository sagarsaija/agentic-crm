import { crmAssistantGraph } from "@/lib/agents/crm-assistant-graph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

export const runtime = "nodejs";

/**
 * Local agent endpoint for LangGraph streaming
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
      let content = "";

      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .map((part: any) => {
            if (part.type === "text") return part.text;
            return "";
          })
          .join("");
      }

      if (msg.role === "user") {
        return new HumanMessage(content);
      } else if (msg.role === "assistant") {
        return new AIMessage(content);
      }
      return new HumanMessage(content);
    });

    // Create a ReadableStream for LangGraph SSE format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the graph execution
          const graphStream = await crmAssistantGraph.stream(
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

          // Process LangGraph stream and write SSE events
          for await (const chunk of graphStream) {
            const [message, metadata] = chunk;

            // Stream all message types (ai, tool, function, etc)
            if (message) {
              // Write as SSE event
              const eventData = JSON.stringify([message, metadata]);
              controller.enqueue(
                encoder.encode(`event: message\ndata: ${eventData}\n\n`),
              );
            }
          }

          // Signal completion
          controller.enqueue(encoder.encode(`event: end\ndata: {}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          });
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${errorData}\n\n`),
          );
          controller.error(error);
        }
      },
    });

    // Return response with SSE headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
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
