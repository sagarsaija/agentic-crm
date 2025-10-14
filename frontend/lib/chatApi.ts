import { LangChainMessage } from "@assistant-ui/react-langgraph";

// Generate a simple thread ID for local development
const generateThreadId = () => {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

export const createThread = async () => {
  // For local development, just generate a thread ID
  const thread_id = generateThreadId();
  return { thread_id };
};

export const getThreadState = async (threadId: string) => {
  // For local development, return minimal state
  // In production, this would fetch from the backend
  return {
    values: {
      messages: [],
    },
  };
};

export const sendMessage = async (params: {
  threadId: string;
  messages?: LangChainMessage[];
}) => {
  // Use our local agent endpoint
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      threadId: params.threadId,
      messages: params.messages || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent request failed: ${response.statusText}`);
  }

  // Return the response body as a stream
  return response.body;
};
