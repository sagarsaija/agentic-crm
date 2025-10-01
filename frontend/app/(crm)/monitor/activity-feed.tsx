"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Activity {
  id: string;
  subject: string;
  content: string;
  type: string;
  created_at: string;
  metadata?: {
    agent?: string;
    timestamp?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({
  activities: initialActivities,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState(initialActivities);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("activities")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: "type=eq.agent_action",
        },
        (payload) => {
          console.log("Activity update:", payload);

          if (payload.eventType === "INSERT") {
            setActivities((prev) => [payload.new as Activity, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setActivities((prev) =>
              prev.map((activity) =>
                activity.id === payload.new.id
                  ? (payload.new as Activity)
                  : activity,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  function getAgentIcon(agent?: string) {
    if (agent?.includes("enrichment")) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (agent?.includes("workflow")) {
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No agent activity yet
      </div>
    );
  }

  return (
    <div className="max-h-[600px] space-y-3 overflow-y-auto">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent/50"
        >
          <div className="mt-0.5">{getAgentIcon(activity.metadata?.agent)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="leading-none font-medium">{activity.subject}</p>
              <Badge variant="outline" className="text-xs">
                {activity.metadata?.agent || "agent"}
              </Badge>
            </div>
            {activity.content && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {activity.content}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {getRelativeTime(activity.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
