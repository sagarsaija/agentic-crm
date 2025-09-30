import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, TrendingUp, Bot, Mail } from "lucide-react";

async function getDashboardStats() {
  const supabase = await createClient();

  // Get lead count
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  // Get qualified leads (score > 70)
  const { count: qualifiedLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gt("score", 70);

  // Get active agents
  const { count: activeAgents } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Get recent activities
  const { data: recentActivities } = await supabase
    .from("activities")
    .select(
      `
      *,
      leads (first_name, last_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalLeads: totalLeads || 0,
    qualifiedLeads: qualifiedLeads || 0,
    activeAgents: activeAgents || 0,
    recentActivities: recentActivities || [],
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your leads.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Qualified Leads
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Score &gt; 70 points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">Running workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">+4% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions with your leads</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity. Start by adding some leads!
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.content}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()} -{" "}
                      {activity.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
