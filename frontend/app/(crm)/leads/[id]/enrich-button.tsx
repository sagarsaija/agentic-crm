"use client";

import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrichButton({ leadId }: { leadId: string }) {
  const [isEnriching, setIsEnriching] = useState(false);
  const router = useRouter();

  const handleEnrich = async () => {
    setIsEnriching(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/enrich`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Enrichment failed");
      }

      const data = await response.json();
      console.log("Enrichment result:", data);

      // Refresh the page to show new data
      router.refresh();

      alert("Lead enriched successfully! ✅");
    } catch (error) {
      console.error("Enrichment error:", error);
      alert("Failed to enrich lead. Check console for details.");
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <Button
      onClick={handleEnrich}
      disabled={isEnriching}
      variant="outline"
      className="gap-2"
    >
      {isEnriching ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enriching...
        </>
      ) : (
        <>
          <Bot className="h-4 w-4" />
          AI Enrich
        </>
      )}
    </Button>
  );
}
