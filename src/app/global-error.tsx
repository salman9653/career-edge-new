"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background text-foreground antialiased font-sans flex items-center justify-center">
        <div className="flex flex-col items-center justify-center px-4 text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
            Critical error occurred
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A critical system error has occurred. Please attempt to retry the operation or reload the page.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs font-mono text-muted-foreground/60">
              Digest: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row w-full">
            <button
              onClick={() => unstable_retry()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/95 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
