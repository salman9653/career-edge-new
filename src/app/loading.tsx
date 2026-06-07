export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Modern premium spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading Career Edge...
        </p>
      </div>
    </div>
  );
}
