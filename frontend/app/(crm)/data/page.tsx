import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Building2,
  Activity,
  Workflow,
  Bot,
  Mail,
  Zap,
} from "lucide-react";

// Fetch functions
async function getDataSummary() {
  const supabase = await createClient();

  const [
    { count: leadsCount },
    { count: companiesCount },
    { count: activitiesCount },
    { count: workflowsCount },
    { count: agentsCount },
    { data: leadsByStatus },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("workflows")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("leads")
      .select("status")
      .in("status", ["new", "qualified", "contacted"]),
  ]);

  return {
    leadsCount: leadsCount || 0,
    companiesCount: companiesCount || 0,
    activitiesCount: activitiesCount || 0,
    workflowsCount: workflowsCount || 0,
    agentsCount: agentsCount || 0,
    activeLeadsCount: leadsByStatus?.length || 0,
  };
}

async function getLeads() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*, companies(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

async function getCompanies() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*, leads(count)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

async function getActivities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("*, leads(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

async function getWorkflows() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

async function getWorkflowRuns() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workflow_runs")
    .select("*, workflows(name), leads(first_name, last_name)")
    .order("started_at", { ascending: false })
    .limit(100);
  return data || [];
}

async function getAgents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

async function getAgentRuns() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agent_runs")
    .select("*, agents(name, type), leads(first_name, last_name)")
    .order("started_at", { ascending: false })
    .limit(100);
  return data || [];
}

async function getEmailTemplates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

async function getEmailCampaigns() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("email_campaigns")
    .select("*, email_templates(name)")
    .order("created_at", { ascending: false });
  return data || [];
}

async function getIntegrations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("integrations")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

// Helper functions
function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    researching: "bg-purple-100 text-purple-800",
    qualified: "bg-green-100 text-green-800",
    contacted: "bg-yellow-100 text-yellow-800",
    engaged: "bg-indigo-100 text-indigo-800",
    nurturing: "bg-orange-100 text-orange-800",
    won: "bg-emerald-100 text-emerald-800",
    lost: "bg-red-100 text-red-800",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    paused: "bg-yellow-100 text-yellow-800",
    draft: "bg-gray-100 text-gray-800",
    scheduled: "bg-blue-100 text-blue-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 font-bold";
  if (score >= 60) return "text-yellow-600 font-semibold";
  return "text-gray-600";
}

function formatDuration(start: string, end?: string) {
  if (!end) return "-";
  const duration = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(duration / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default async function DataPage() {
  const [
    summary,
    leads,
    companies,
    activities,
    workflows,
    workflowRuns,
    agents,
    agentRuns,
    emailTemplates,
    emailCampaigns,
    integrations,
  ] = await Promise.all([
    getDataSummary(),
    getLeads(),
    getCompanies(),
    getActivities(),
    getWorkflows(),
    getWorkflowRuns(),
    getAgents(),
    getAgentRuns(),
    getEmailTemplates(),
    getEmailCampaigns(),
    getIntegrations(),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Explorer</h1>
        <p className="text-muted-foreground">
          View and explore all your CRM data
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.leadsCount}</div>
            <p className="text-xs text-muted-foreground">
              {summary.activeLeadsCount} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.companiesCount}</div>
            <p className="text-xs text-muted-foreground">Tracked companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activitiesCount}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workflows
            </CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.workflowsCount}</div>
            <p className="text-xs text-muted-foreground">
              {summary.agentsCount} active agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="workflow-runs">Runs</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="agent-runs">Agent Runs</TabsTrigger>
              <TabsTrigger value="email-templates">Templates</TabsTrigger>
              <TabsTrigger value="email-campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            {/* Leads Tab */}
            <TabsContent value="leads" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">All Leads ({leads.length})</h3>
              </div>
              {leads.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No leads found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <Link
                              href={`/leads/${lead.id}`}
                              className="font-medium hover:underline"
                            >
                              {lead.first_name} {lead.last_name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {lead.email || "-"}
                          </TableCell>
                          <TableCell>
                            {lead.companies?.name || lead.company_name || "-"}
                          </TableCell>
                          <TableCell>{lead.title || "-"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={getScoreColor(lead.score)}>
                              {lead.score}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize">
                            {lead.source}
                          </TableCell>
                          <TableCell>
                            {new Date(lead.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Companies Tab */}
            <TabsContent value="companies" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">All Companies ({companies.length})</h3>
              </div>
              {companies.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No companies found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Funding</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <Link
                              href={`/companies/${company.id}`}
                              className="font-medium hover:underline"
                            >
                              {company.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">
                            {company.domain || "-"}
                          </TableCell>
                          <TableCell>{company.industry || "-"}</TableCell>
                          <TableCell>{company.size || "-"}</TableCell>
                          <TableCell>{company.location || "-"}</TableCell>
                          <TableCell>{company.funding_stage || "-"}</TableCell>
                          <TableCell>
                            {new Date(company.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Recent Activities ({activities.length})</h3>
              </div>
              {activities.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No activities found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Lead</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {activity.type.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {activity.leads
                              ? `${activity.leads.first_name} ${activity.leads.last_name}`
                              : "-"}
                          </TableCell>
                          <TableCell>{activity.subject || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {activity.content || "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(activity.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Workflows Tab */}
            <TabsContent value="workflows" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">All Workflows ({workflows.length})</h3>
              </div>
              {workflows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No workflows found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflows.map((workflow) => (
                        <TableRow key={workflow.id}>
                          <TableCell className="font-medium">
                            {workflow.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            {workflow.type.replace("_", " ")}
                          </TableCell>
                          <TableCell className="capitalize">
                            {workflow.trigger}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={workflow.is_active ? "default" : "secondary"}
                            >
                              {workflow.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {workflow.description || "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(workflow.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Workflow Runs Tab */}
            <TabsContent value="workflow-runs" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Workflow Runs ({workflowRuns.length})</h3>
              </div>
              {workflowRuns.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No workflow runs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Workflow</TableHead>
                        <TableHead>Lead</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Node</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflowRuns.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">
                            {run.workflows?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {run.leads
                              ? `${run.leads.first_name} ${run.leads.last_name}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(run.status)}>
                              {run.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{run.current_node || "-"}</TableCell>
                          <TableCell>
                            {new Date(run.started_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {formatDuration(run.started_at, run.completed_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">All Agents ({agents.length})</h3>
              </div>
              {agents.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No agents found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">
                            {agent.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            {agent.type}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={agent.is_active ? "default" : "secondary"}
                            >
                              {agent.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {agent.description || "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(agent.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Agent Runs Tab */}
            <TabsContent value="agent-runs" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Agent Runs ({agentRuns.length})</h3>
              </div>
              {agentRuns.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No agent runs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Lead</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentRuns.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">
                            {run.agents?.name || "-"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {run.agents?.type || "-"}
                          </TableCell>
                          <TableCell>
                            {run.leads
                              ? `${run.leads.first_name} ${run.leads.last_name}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(run.status)}>
                              {run.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            ${(run.cost || 0).toFixed(4)}
                          </TableCell>
                          <TableCell>
                            {new Date(run.started_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {formatDuration(run.started_at, run.completed_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Email Templates Tab */}
            <TabsContent value="email-templates" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Email Templates ({emailTemplates.length})</h3>
              </div>
              {emailTemplates.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No email templates found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Variables</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">
                            {template.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {template.subject}
                          </TableCell>
                          <TableCell>{template.category || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={template.is_active ? "default" : "secondary"}
                            >
                              {template.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {Array.isArray(template.variables)
                              ? template.variables.length
                              : 0}
                          </TableCell>
                          <TableCell>
                            {new Date(template.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Email Campaigns Tab */}
            <TabsContent value="email-campaigns" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Email Campaigns ({emailCampaigns.length})</h3>
              </div>
              {emailCampaigns.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No email campaigns found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            {campaign.name}
                          </TableCell>
                          <TableCell>
                            {campaign.email_templates?.name || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {campaign.scheduled_at
                              ? new Date(campaign.scheduled_at).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Integrations ({integrations.length})</h3>
              </div>
              {integrations.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No integrations found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrations.map((integration) => (
                        <TableRow key={integration.id}>
                          <TableCell className="font-medium">
                            {integration.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            {integration.provider}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={integration.is_active ? "default" : "secondary"}
                            >
                              {integration.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(integration.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(integration.updated_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
