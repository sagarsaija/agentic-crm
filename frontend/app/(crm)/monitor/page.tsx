import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityFeed } from "./activity-feed";
import { MetricsCharts } from "./metrics-charts";
import { AgentStatusCards } from "./agent-status-cards";
import { Activity, TrendingUp, Zap, Clock } from "lucide-react";

async function getDashboardData() {
  const supabase = await createClient();

  // Get recent agent runs (last 50)
  const { data: recentRuns } = await supabase
    .from("activities")
    .select("*")
    .eq("type", "agent_action")
    .order("created_at", { ascending: false })
    .limit(50);

  // Get workflow run counts by status
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("type", "agent_action");

  // Calculate metrics
  const totalRuns = activities?.length || 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const runsToday =
    activities?.filter(
      (a) => new Date(a.created_at).getTime() >= today.getTime(),
    ).length || 0;

  // Success rate (we'll mark all current runs as successful for demo)
  const successRate = totalRuns > 0 ? 100 : 0;

  // Average duration (mock for now)
  const avgDuration = 15;

  return {
    recentRuns: recentRuns || [],
    totalRuns,
    runsToday,
    successRate,
    avgDuration,
  };
}

export default async function AgentMonitorPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Agent Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time insights into AI agent activity and performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRuns}</div>
            <p className="text-xs text-muted-foreground">
              All-time agent executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.runsToday}</div>
            <p className="text-xs text-muted-foreground">
              Runs in the last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Successful completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgDuration}s</div>
            <p className="text-xs text-muted-foreground">
              Average execution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Cards */}
      <AgentStatusCards />

      {/* Charts and Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Metrics Charts */}
        <div className="lg:col-span-2">
          <MetricsCharts />
        </div>

        {/* Activity Feed */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest agent executions</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={data.recentRuns} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
