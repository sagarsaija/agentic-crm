"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isScraping, setIsScraping] = useState(false);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const response = await fetch(`/api/companies/${id}/scrape`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Scraping failed");
      }

      const data = await response.json();
      console.log("Scrape result:", data);
      alert("Company website scraped successfully! ✅");
    } catch (error) {
      console.error("Scraping error:", error);
      alert("Failed to scrape company website. Check console for details.");
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Company Detail</CardTitle>
            <Button
              onClick={handleScrape}
              disabled={isScraping}
              variant="outline"
              className="gap-2"
            >
              {isScraping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Scrape Website
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Company ID: {id}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Click "Scrape Website" to extract company intelligence
            automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
