"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Root Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Something went wrong!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        An unexpected error occurred. We have logged this issue and our team is looking into it.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground/60">
          Error ID: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        <Button
          onClick={() => unstable_retry()}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
        >
          Go back home
        </Button>
      </div>
    </div>
  );
}
