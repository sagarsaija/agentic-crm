import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

export const CRMQueryResult: ToolCallMessagePartComponent = ({
  toolName,
  result,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Debug logging
  console.log("CRMQueryResult rendering:", { toolName, result });

  if (!result) {
    console.log("No result");
    return null;
  }

  if (typeof result !== "object") {
    console.log("Result is not an object");
    return null;
  }

  if (!("success" in result)) {
    console.log("Result has no success field");
    return null;
  }

  const data = result as {
    success: boolean;
    results?: any[];
    count?: number;
    query?: string;
    hasMore?: boolean;
    offset?: number;
    limit?: number;
    error?: string;
  };

  console.log("Parsed data:", data);

  if (!data.success) {
    return (
      <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          <strong>Query failed:</strong> {data.error || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!data.results || data.results.length === 0) {
    return (
      <div className="mb-4 rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">No results found.</p>
      </div>
    );
  }

  // Determine if we're showing leads or companies
  const isLeads = data.results[0]?.first_name !== undefined;
  const totalCount = data.count || data.results.length;
  const showingFrom = (data.offset || 0) + 1;
  const showingTo = Math.min(
    (data.offset || 0) + data.results.length,
    totalCount,
  );

  return (
    <div className="mb-4 w-full rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {totalCount} {totalCount === 1 ? "result" : "results"}
          </Badge>
          {data.hasMore && (
            <span className="text-sm text-muted-foreground">
              (Showing {showingFrom}-{showingTo})
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <>
              Show <ChevronDownIcon className="ml-1 size-4" />
            </>
          ) : (
            <>
              Hide <ChevronUpIcon className="ml-1 size-4" />
            </>
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="max-h-96 overflow-auto p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                {isLeads ? (
                  <>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Funding</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.map((row: any, idx: number) => (
                <TableRow
                  key={
                    row.id ||
                    `query-result-${idx}-${row.email || row.name || idx}`
                  }
                >
                  {isLeads ? (
                    <>
                      <TableCell className="font-medium">
                        {row.first_name} {row.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.title || "-"}
                      </TableCell>
                      <TableCell>{row.company_name || "-"}</TableCell>
                      <TableCell>
                        {row.score !== null && row.score !== undefined ? (
                          <Badge
                            variant={
                              row.score >= 70
                                ? "default"
                                : row.score >= 40
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {row.score}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "qualified"
                              ? "default"
                              : row.status === "contacted"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.location || "-"}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.industry || "-"}
                      </TableCell>
                      <TableCell>{row.size || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.location || "-"}
                      </TableCell>
                      <TableCell>
                        {row.funding_stage || "-"}
                        {row.funding_amount &&
                          ` ($${(row.funding_amount / 1000000).toFixed(1)}M)`}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data.hasMore && !isCollapsed && (
        <div className="border-t bg-muted/30 px-4 py-2 text-center text-sm text-muted-foreground">
          Ask "show me more" to see additional results
        </div>
      )}
    </div>
  );
};
