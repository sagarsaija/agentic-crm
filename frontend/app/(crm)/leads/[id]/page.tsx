import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { EnrichButton } from "./enrich-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  ExternalLink,
  Edit,
} from "lucide-react";
import { notFound } from "next/navigation";

async function getLead(id: string) {
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      `
      *,
      companies (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching lead:", error);
    return null;
  }

  if (!lead) {
    console.log("No lead found for id:", id);
    return null;
  }

  // Get activities for this lead
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return { ...lead, activities: activities || [] };
}

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
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

function getScoreBadge(score: number) {
  if (score >= 80) return <Badge className="bg-green-500">High: {score}</Badge>;
  if (score >= 60)
    return <Badge className="bg-yellow-500">Medium: {score}</Badge>;
  return <Badge variant="secondary">Low: {score}</Badge>;
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {lead.first_name} {lead.last_name}
            </h1>
            <p className="text-lg text-muted-foreground">{lead.title}</p>
            <p className="text-sm text-muted-foreground">
              {lead.companies?.name || lead.company_name}
            </p>
          </div>
          <div className="flex gap-2">
            <EnrichButton leadId={lead.id} />
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
          {getScoreBadge(lead.score)}
          <Badge variant="outline" className="capitalize">
            {lead.source}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.phone}</span>
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.location}</span>
                    </div>
                  )}
                  {lead.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={lead.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {lead.research_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Research Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{lead.research_summary}</p>
                  </CardContent>
                </Card>
              )}

              {lead.personal_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{lead.personal_notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Research Tab */}
            <TabsContent value="research">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>
                    Automated research and intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lead.research_summary ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          {lead.research_summary}
                        </p>
                      </div>
                      {lead.pain_points &&
                        Array.isArray(lead.pain_points) &&
                        lead.pain_points.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-medium">Pain Points</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                              {lead.pain_points.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      {lead.buying_signals &&
                        Array.isArray(lead.buying_signals) &&
                        lead.buying_signals.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-medium">Buying Signals</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                              {lead.buying_signals.map((signal, i) => (
                                <li key={i}>{signal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="mb-4 text-muted-foreground">
                        No research data yet
                      </p>
                      <Button>Run AI Research</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.activities.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No activities yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {lead.activities.map(
                        (activity: {
                          id: string;
                          subject?: string;
                          content?: string;
                          type: string;
                          created_at: string;
                        }) => (
                          <div
                            key={activity.id}
                            className="flex gap-4 rounded-lg border p-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {activity.subject}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {activity.type}
                                </Badge>
                              </div>
                              {activity.content && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {activity.content}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(activity.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conversations Tab */}
            <TabsContent value="conversations">
              <Card>
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="py-8 text-center text-muted-foreground">
                    Email integration coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks & Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="py-8 text-center text-muted-foreground">
                    Task management coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{lead.score}/100</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium capitalize">{lead.source}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Added</p>
                <p className="font-medium">
                  {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
              {lead.last_contacted_at && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Last Contacted
                  </p>
                  <p className="font-medium">
                    {new Date(lead.last_contacted_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {lead.companies && (
            <Card>
              <CardHeader>
                <CardTitle>Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{lead.companies.name}</span>
                </div>
                {lead.companies.industry && (
                  <p className="text-sm text-muted-foreground">
                    {lead.companies.industry}
                  </p>
                )}
                {lead.companies.location && (
                  <p className="text-sm text-muted-foreground">
                    {lead.companies.location}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
