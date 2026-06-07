import Link from "next/link";
import { FolderIcon, MoveRight } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center bg-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
        <FolderIcon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
        Dashboard View Not Found
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        The dashboard module or sub-page you are trying to view does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Go to Dashboard Home
          <MoveRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
