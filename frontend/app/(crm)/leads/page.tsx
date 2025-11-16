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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function getLeads() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      `
      *,
      companies (name)
    `,
    )
    .order("created_at", { ascending: false });

  return leads || [];
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

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 font-bold";
  if (score >= 60) return "text-yellow-600 font-semibold";
  return "text-gray-600";
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your leads
          </p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No leads yet. Add your first lead to get started!
              </p>
              <Link href="/leads/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Lead
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium hover:underline"
                      >
                        {lead.first_name} {lead.last_name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {lead.email}
                      </div>
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
                    <TableCell className="capitalize">{lead.source}</TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
