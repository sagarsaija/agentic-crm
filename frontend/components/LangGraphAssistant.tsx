"use client";

import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import * as chatApi from "@/lib/chatApi";

export function LangGraphAssistant() {
  const runtime = useLangGraphRuntime({
    threadId: "default-thread",
    stream: async (messages) => {
      const stream = await chatApi.sendMessage({
        threadId: "default-thread",
        messages,
      });

      if (!stream) throw new Error("No stream returned");
      return stream;
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full w-full flex-col">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
