"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Workflow } from "lucide-react";

export function WorkflowButton({ leadId }: { leadId: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch("/api/workflows/lead-processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error("Workflow error:", error);
      setResult({ error: "Failed to run workflow" });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleRunWorkflow}
        disabled={isRunning}
        size="lg"
        className="w-full"
      >
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Workflow...
          </>
        ) : (
          <>
            <Workflow className="mr-2 h-4 w-4" />
            Run Processing Workflow
          </>
        )}
      </Button>

      {result && (
        <div className="rounded-lg border bg-slate-50 p-4">
          {result.success ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">
                ✅ Workflow Completed!
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Score:</strong> {result.summary.finalScore}/100
                </p>
                <p>
                  <strong>New Status:</strong>{" "}
                  <span className="capitalize">
                    {result.summary.finalStatus}
                  </span>
                </p>
                <p>
                  <strong>Duration:</strong> {result.summary.duration}s
                </p>
                <div className="mt-3">
                  <strong>Steps Completed:</strong>
                  <ul className="mt-1 ml-4 space-y-1 text-xs">
                    {result.summary.steps.map((step: any, idx: number) => (
                      <li key={idx}>
                        {step.status === "completed" ? "✅" : "❌"} {step.name}{" "}
                        ({step.duration}s)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-700">
              <h4 className="font-semibold">❌ Workflow Failed</h4>
              <p className="mt-1 text-sm">
                {result.error || result.context?.error || "Unknown error"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
