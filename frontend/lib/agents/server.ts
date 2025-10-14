import { crmAssistantGraph } from "./crm-assistant-graph";

/**
 * Simple server wrapper for local development
 * This allows you to run the graph locally without deploying to LangGraph Cloud
 */

export async function handleChatMessage(
  threadId: string,
  messages: any[],
): Promise<any> {
  const graph = crmAssistantGraph;

  // Run the graph with the messages
  const result = await graph.invoke(
    {
      messages,
    },
    {
      configurable: {
        thread_id: threadId,
      },
    },
  );

  return result;
}

export async function streamChatMessage(
  threadId: string,
  messages: any[],
): Promise<AsyncGenerator<any>> {
  const graph = crmAssistantGraph;

  // Stream the graph execution
  const stream = await graph.stream(
    {
      messages,
    },
    {
      configurable: {
        thread_id: threadId,
      },
      streamMode: "messages",
    },
  );

  return stream;
}
