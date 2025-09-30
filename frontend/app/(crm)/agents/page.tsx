"use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyAssistant } from "@/components/MyAssistant";

export default function AgentsPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground">
          Interact with AI agents and monitor their activity
        </p>
      </div>

      {/* Full-width AI Assistant Chatbot */}
      <div className="flex-1">
        <MyAssistant />
      </div>

      {/* Agent Monitor - Commented out for now */}
      {/* <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Agent Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time agent monitoring coming soon
            </p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
