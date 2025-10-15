"use client";

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { CRMQueryResult } from "@/components/assistant-ui/crm-query-result";

interface ToolCall {
  id: string;
  name: string;
  args: any;
  result?: any;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  name?: string;
}

export function MyAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize or load conversation
  useEffect(() => {
    const loadConversation = async () => {
      // Try to get existing conversation ID from localStorage
      const storedConversationId = localStorage.getItem(
        "currentConversationId",
      );

      if (storedConversationId) {
        setConversationId(storedConversationId);

        // Load existing messages
        try {
          const response = await fetch(
            `/api/conversations/${storedConversationId}/messages`,
          );
          if (response.ok) {
            const { messages: loadedMessages } = await response.json();
            setMessages(
              loadedMessages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              })),
            );
          }
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    };

    loadConversation();
  }, []);

  // Save message to database
  const saveMessage = async (
    role: "user" | "assistant",
    content: string,
    messageId: string,
  ) => {
    try {
      // Create conversation if it doesn't exist
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: null, // No auth yet - will be added later
            title: "New Chat",
          }),
        });

        if (response.ok) {
          const { conversation } = await response.json();
          currentConversationId = conversation.id;
          setConversationId(currentConversationId);
          if (currentConversationId) {
            localStorage.setItem(
              "currentConversationId",
              currentConversationId,
            );
          }
        } else {
          console.error("Failed to create conversation");
          return;
        }
      }

      if (!currentConversationId) {
        console.error("No conversation ID available");
        return;
      }

      // Save message
      await fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          content,
        }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== handleSubmit called ===");
    if (!input.trim() || isLoading) {
      console.log("Blocked: empty input or already loading");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    console.log("User message:", userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to database
    await saveMessage("user", userMessage.content, userMessage.id);

    try {
      console.log("Fetching /api/agent...");
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      console.log("Response received:", response.status, response.ok);
      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      console.log("Starting to read SSE stream...");

      // Parse SSE stream
      let buffer = "";
      let currentEvent = "";
      const toolCalls: ToolCall[] = [];

      while (true) {
        const { done, value } = await reader.read();
        console.log("Read chunk:", { done, valueLength: value?.length });
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            if (currentEvent === "message") {
              try {
                const data = JSON.parse(line.slice(6));
                const [message] = data;
                console.log(
                  "===RAW MESSAGE===",
                  JSON.stringify(message, null, 2),
                );

                // Check if this is a LangChain serialized message
                const lc_kwargs = message?.lc_kwargs || message?.kwargs;
                const actualMessage = lc_kwargs || message;

                console.log("Processed message:", {
                  id: actualMessage?.id,
                  type: actualMessage?.type,
                  content: actualMessage?.content,
                  tool_calls: actualMessage?.tool_calls,
                  name: actualMessage?.name,
                });

                const messageType = actualMessage?.type;

                // Handle AI messages with content
                if (messageType === "ai" || message?.kwargs?.content) {
                  const messageContent =
                    message?.kwargs?.content || message?.content;

                  if (messageContent && typeof messageContent === "string") {
                    assistantContent += messageContent;
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        ...assistantMessage,
                        content: assistantContent,
                        toolCalls:
                          toolCalls.length > 0 ? [...toolCalls] : undefined,
                      };
                      return newMessages;
                    });
                  }

                  // Handle tool calls in AI message
                  const toolCallsData =
                    message?.kwargs?.tool_calls || message?.tool_calls;
                  if (toolCallsData && Array.isArray(toolCallsData)) {
                    for (const tc of toolCallsData) {
                      toolCalls.push({
                        id: tc.id || Date.now().toString(),
                        name: tc.name,
                        args: tc.args,
                      });
                    }
                  }
                }

                // Handle tool result messages
                if (messageType === "tool" || message?.kwargs?.name) {
                  const toolName = message?.kwargs?.name || message?.name;
                  const toolContent =
                    message?.kwargs?.content || message?.content;
                  const toolCallId =
                    message?.kwargs?.tool_call_id || message?.tool_call_id;

                  // Find the matching tool call and add the result
                  const toolCall = toolCalls.find((tc) => tc.id === toolCallId);
                  if (toolCall) {
                    try {
                      toolCall.result =
                        typeof toolContent === "string"
                          ? JSON.parse(toolContent)
                          : toolContent;
                    } catch {
                      toolCall.result = toolContent;
                    }

                    // Update messages with tool results
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        ...assistantMessage,
                        content: assistantContent,
                        toolCalls: [...toolCalls],
                      };
                      return newMessages;
                    });
                  }
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            } else if (currentEvent === "end") {
              // Stream completed - extract any JSON tool results from content
              if (assistantContent) {
                // Find the JSON object with success: true and results array
                // Use a more robust approach: find the start of the JSON and extract it properly
                let cleanContent = assistantContent;
                const successIndex =
                  assistantContent.indexOf('"success": true');

                if (successIndex !== -1) {
                  // Work backwards to find the opening brace
                  let startIndex = successIndex;
                  while (
                    startIndex > 0 &&
                    assistantContent[startIndex] !== "{"
                  ) {
                    startIndex--;
                  }

                  // Work forwards to find the closing brace (matching braces)
                  let braceCount = 0;
                  let endIndex = startIndex;
                  for (let i = startIndex; i < assistantContent.length; i++) {
                    if (assistantContent[i] === "{") braceCount++;
                    if (assistantContent[i] === "}") braceCount--;
                    if (braceCount === 0) {
                      endIndex = i + 1;
                      break;
                    }
                  }

                  // Extract the JSON
                  const jsonStr = assistantContent.substring(
                    startIndex,
                    endIndex,
                  );
                  try {
                    const result = JSON.parse(jsonStr);
                    if (result.success && result.results) {
                      // Add as a tool call
                      toolCalls.push({
                        id: Date.now().toString(),
                        name: "query_crm",
                        args: { query: result.query },
                        result: result,
                      });

                      // Remove ALL JSON from the content (everything before the natural language response)
                      const textAfterJson =
                        assistantContent.substring(endIndex);
                      cleanContent = textAfterJson.trim();
                    }
                  } catch (e) {
                    console.error("Failed to parse JSON:", e);
                  }
                }

                // Update the message with cleaned content and tool calls
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...assistantMessage,
                    content: cleanContent,
                    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                  };
                  return newMessages;
                });

                // Save to database
                await saveMessage(
                  "assistant",
                  cleanContent,
                  assistantMessage.id,
                );
              }
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Hello there!</h2>
              <p className="text-muted-foreground">How can I help you today?</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-3xl px-5 py-2.5 ${
                msg.role === "user"
                  ? "bg-muted text-foreground"
                  : "bg-background text-foreground"
              }`}
            >
              {/* Render message content */}
              {msg.content && (
                <div
                  className="[&>li]:my-1 [&>ol]:my-2 [&>p]:m-0 [&>p]:leading-normal [&>ul]:my-2"
                  dangerouslySetInnerHTML={{
                    __html: marked(msg.content, { breaks: true }),
                  }}
                />
              )}

              {/* Render tool results */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mt-4 space-y-4">
                  {msg.toolCalls.map((toolCall) => {
                    // Render CRM query results with custom component
                    if (toolCall.name === "query_crm" && toolCall.result) {
                      return (
                        <div key={toolCall.id} className="not-prose">
                          <CRMQueryResult
                            toolName={toolCall.name}
                            result={toolCall.result}
                            args={toolCall.args as any}
                            status={{ type: "complete" } as any}
                            toolCallId={toolCall.id}
                            argsText={""}
                            part={{} as any}
                            addResult={() => {}}
                          />
                        </div>
                      );
                    }

                    // Fallback rendering for other tools
                    if (toolCall.result) {
                      return (
                        <div
                          key={toolCall.id}
                          className="rounded border bg-muted/50 p-3"
                        >
                          <div className="mb-2 text-xs font-semibold text-muted-foreground">
                            {toolCall.name}
                          </div>
                          <pre className="overflow-auto text-xs">
                            {typeof toolCall.result === "string"
                              ? toolCall.result
                              : JSON.stringify(toolCall.result, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-3xl bg-background px-5 py-2.5 text-foreground">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 rounded-3xl border bg-muted px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-primary px-6 py-2 text-primary-foreground disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
