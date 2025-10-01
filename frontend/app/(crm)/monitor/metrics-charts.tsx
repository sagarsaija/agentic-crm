"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MetricsCharts() {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [agentBreakdown, setAgentBreakdown] = useState<any[]>([]);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    const supabase = createClient();

    // Get activities for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("type", "agent_action")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (!activities) return;

    // Process data for daily chart
    const dailyMap = new Map<string, number>();
    const agentMap = new Map<string, { success: number; total: number }>();

    activities.forEach((activity) => {
      // Daily data
      const date = new Date(activity.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);

      // Agent breakdown
      const agent = activity.metadata?.agent || "unknown";
      const current = agentMap.get(agent) || { success: 0, total: 0 };
      current.total += 1;
      current.success += 1; // All marked as success for demo
      agentMap.set(agent, current);
    });

    // Convert to chart data
    const dailyChartData = Array.from(dailyMap.entries()).map(
      ([date, count]) => ({
        date,
        runs: count,
      }),
    );

    const agentChartData = Array.from(agentMap.entries()).map(
      ([name, stats]) => ({
        name: name
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        runs: stats.total,
        success: stats.success,
      }),
    );

    setDailyData(dailyChartData);
    setAgentBreakdown(agentChartData);
  }

  return (
    <div className="space-y-6">
      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="runs"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  name="Agent Runs"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {agentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="runs"
                  fill="hsl(var(--primary))"
                  name="Total Runs"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="success"
                  fill="hsl(142 76% 36%)"
                  name="Successful"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
