import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Mail,
  MapPin,
  Users,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Edit,
  Eye,
  Calendar,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export const LookupResult: ToolCallMessagePartComponent = ({
  toolName,
  result,
}) => {
  if (!result || typeof result !== "object" || !("success" in result)) {
    return null;
  }

  const data = result as any;

  if (!data.success) {
    return (
      <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          <strong>Lookup failed:</strong> {data.error || "Unknown error"}
        </p>
      </div>
    );
  }

  // Company Details Display
  if (toolName === "get_company_details" && data.company) {
    const { company, relatedLeads, recentActivities, similarCompanies } = data;

    return (
      <div className="mb-4 space-y-4">
        {/* Company Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="size-6" />
                  {company.name}
                </CardTitle>
                {company.domain && (
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <ExternalLink className="size-3" />
                    <a
                      href={`https://${company.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {company.domain}
                    </a>
                  </CardDescription>
                )}
              </div>
              <Link href={`/crm/companies/${company.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 size-4" />
                  View Full Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                {company.industry && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Industry:</strong> {company.industry}
                    </span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Size:</strong> {company.size} employees
                    </span>
                  </div>
                )}
                {company.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Location:</strong> {company.location}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {company.funding_stage && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Funding:</strong> {company.funding_stage}
                      {company.funding_amount &&
                        ` ($${(company.funding_amount / 1000000).toFixed(1)}M)`}
                    </span>
                  </div>
                )}
                {company.revenue && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Revenue:</strong> $
                      {(company.revenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                )}
              </div>
            </div>
            {company.description && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {company.description}
                </p>
              </div>
            )}
            {company.tech_stack && Array.isArray(company.tech_stack) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {company.tech_stack.map((tech: string, idx: number) => (
                  <Badge key={`tech-${idx}-${tech}`} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Leads */}
        {relatedLeads && relatedLeads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Related Leads ({relatedLeads.length})
              </CardTitle>
              <CardDescription>People at this company</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedLeads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.title || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lead.status === "qualified"
                              ? "default"
                              : lead.status === "contacted"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.score !== null && lead.score !== undefined ? (
                          <Badge
                            variant={
                              lead.score >= 70
                                ? "default"
                                : lead.score >= 40
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {lead.score}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/crm/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Similar Companies */}
        {similarCompanies && similarCompanies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Companies</CardTitle>
              <CardDescription>
                Other companies in {company.industry}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {similarCompanies.map((similar: any) => (
                  <div
                    key={similar.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{similar.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {similar.size && `${similar.size} employees`}
                        {similar.location && ` • ${similar.location}`}
                      </p>
                    </div>
                    <Link href={`/crm/companies/${similar.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Lead Details Display (by email)
  if (toolName === "get_lead_by_email" && data.lead) {
    const { lead, recentActivities, colleagueLeads, conversations } = data;

    return (
      <div className="mb-4 space-y-4">
        {/* Lead Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">
                  {lead.first_name} {lead.last_name}
                </CardTitle>
                <CardDescription className="mt-1 space-y-1">
                  {lead.title && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="size-3" />
                      {lead.title}
                    </div>
                  )}
                  {lead.company_name && (
                    <div className="flex items-center gap-1">
                      <Building2 className="size-3" />
                      {lead.company_name}
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {lead.email}
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {lead.location}
                    </div>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href={`/crm/leads/${lead.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 size-4" />
                    View Full Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge
                  variant={
                    lead.status === "qualified"
                      ? "default"
                      : lead.status === "contacted"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {lead.status}
                </Badge>
              </div>
              {lead.score !== null && lead.score !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Score:</span>
                  <Badge
                    variant={
                      lead.score >= 70
                        ? "default"
                        : lead.score >= 40
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {lead.score}/100
                  </Badge>
                </div>
              )}
            </div>

            {/* Research Summary */}
            {lead.research_summary && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Research Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {lead.research_summary}
                </p>
              </div>
            )}

            {/* Pain Points */}
            {lead.pain_points && Array.isArray(lead.pain_points) && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Pain Points</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {lead.pain_points.map((point: string, idx: number) => (
                    <li key={`pain-${idx}-${point.substring(0, 20)}`}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buying Signals */}
            {lead.buying_signals && Array.isArray(lead.buying_signals) && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Buying Signals</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {lead.buying_signals.map((signal: string, idx: number) => (
                    <li key={`signal-${idx}-${signal.substring(0, 20)}`}>
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="default">
                <Sparkles className="mr-2 size-4" />
                Enrich Lead
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="mr-2 size-4" />
                Update Status
              </Button>
              <Link href={`/crm/leads/${lead.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="mr-2 size-4" />
                  View Full Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        {recentActivities && recentActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()} at{" "}
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Colleagues at Same Company */}
        {colleagueLeads && colleagueLeads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Other Contacts at {lead.company_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleagueLeads.map((colleague: any) => (
                    <TableRow key={colleague.id}>
                      <TableCell className="font-medium">
                        {colleague.first_name} {colleague.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {colleague.title || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            colleague.status === "qualified"
                              ? "default"
                              : colleague.status === "contacted"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {colleague.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {colleague.score !== null &&
                        colleague.score !== undefined ? (
                          <Badge
                            variant={
                              colleague.score >= 70
                                ? "default"
                                : colleague.score >= 40
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {colleague.score}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/crm/leads/${colleague.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};
