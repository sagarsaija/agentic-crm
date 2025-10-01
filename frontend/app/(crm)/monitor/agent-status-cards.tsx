"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Play, Pause, RotateCw } from "lucide-react";
import { useState } from "react";

const AGENTS = [
  {
    id: "lead-enrichment",
    name: "Lead Enrichment Agent",
    description: "Web research and AI analysis for lead profiles",
    status: "active",
    lastRun: "2 minutes ago",
    successRate: 100,
    avgDuration: 15,
  },
  {
    id: "lead-processing-workflow",
    name: "Lead Processing Workflow",
    description: "Multi-step pipeline for automated lead qualification",
    status: "active",
    lastRun: "5 minutes ago",
    successRate: 100,
    avgDuration: 25,
  },
  {
    id: "company-intelligence",
    name: "Company Intelligence",
    description: "Web scraping for company data and insights",
    status: "active",
    lastRun: "12 minutes ago",
    successRate: 100,
    avgDuration: 10,
  },
];

export function AgentStatusCards() {
  const [agents, setAgents] = useState(AGENTS);

  function toggleAgent(id: string) {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status: agent.status === "active" ? "paused" : "active",
            }
          : agent,
      ),
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Agent Status</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <Badge
                    variant={
                      agent.status === "active" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {agent.status}
                  </Badge>
                </div>
              </div>
              <CardTitle className="mt-2 text-base">{agent.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {agent.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="font-semibold">{agent.successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Duration</p>
                  <p className="font-semibold">{agent.avgDuration}s</p>
                </div>
              </div>

              <div className="border-t pt-2">
                <p className="mb-2 text-xs text-muted-foreground">
                  Last run: {agent.lastRun}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={agent.status === "active" ? "outline" : "default"}
                    className="flex-1"
                    onClick={() => toggleAgent(agent.id)}
                  >
                    {agent.status === "active" ? (
                      <>
                        <Pause className="mr-1 h-3 w-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
