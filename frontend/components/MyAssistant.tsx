"use client";

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function MyAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
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

      // Parse SSE stream
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
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

                // Handle LangChain serialized format
                const messageContent =
                  message?.kwargs?.content || message?.content;

                if (messageContent) {
                  const content =
                    typeof messageContent === "string"
                      ? messageContent
                      : JSON.stringify(messageContent);

                  assistantContent += content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      ...assistantMessage,
                      content: assistantContent,
                    };
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            } else if (currentEvent === "end") {
              // Stream completed
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
              className={`max-w-[80%] rounded-3xl px-5 py-2.5 ${
                msg.role === "user"
                  ? "bg-muted text-foreground"
                  : "bg-background text-foreground"
              }`}
            >
              <div
                className="[&>li]:my-1 [&>ol]:my-2 [&>p]:m-0 [&>p]:leading-normal [&>ul]:my-2"
                dangerouslySetInnerHTML={{
                  __html: marked(msg.content, { breaks: true }),
                }}
              />
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
