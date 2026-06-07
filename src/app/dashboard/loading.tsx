export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
        <div className="h-10 w-28 rounded bg-muted" />
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-muted-foreground/10 bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-16 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Areas Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-muted-foreground/10 bg-card p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-muted-foreground/10 bg-card p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
                <div className="h-6 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
