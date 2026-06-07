import Link from "next/link";
import { MoveLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
        <Search className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        404
      </h1>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        Page not found
      </h2>
      <p className="mt-2 text-base text-muted-foreground max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. Perhaps you typed the wrong URL or the page has been moved.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <MoveLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
