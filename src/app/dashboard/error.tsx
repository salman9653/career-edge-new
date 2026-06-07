"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center bg-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
        Error Loading Dashboard Content
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        An error occurred while loading this section of your dashboard. Try retrying the action.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground/60">
          Ref: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => unstable_retry()}
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry Section
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Dashboard Home
        </Button>
      </div>
    </div>
  );
}
