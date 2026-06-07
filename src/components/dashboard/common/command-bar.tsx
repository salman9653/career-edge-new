import { Search } from "lucide-react"

interface CommandBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  isCollapsed: boolean
  onExpandSidebar: () => void
}

export function CommandBar({
  searchQuery,
  setSearchQuery,
  isCollapsed,
  onExpandSidebar
}: CommandBarProps) {
  return (
    <div className="p-4 border-b border-neutral-200/30 dark:border-neutral-800/30">
      {isCollapsed ? (
        <div className="flex justify-center">
          <button
            onClick={onExpandSidebar}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/80" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full h-11 pl-10 pr-20 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100/30 dark:bg-[#07070b]/60 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all placeholder-muted-foreground/60"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="flex items-center justify-center w-6 h-6 rounded-lg border border-neutral-200/30 dark:border-neutral-800/30 bg-neutral-100/50 dark:bg-[#13141f]/75 text-[10px] font-mono text-muted-foreground/90">⌘</kbd>
            <kbd className="flex items-center justify-center w-6 h-6 rounded-lg border border-neutral-200/30 dark:border-neutral-800/30 bg-neutral-100/50 dark:bg-[#13141f]/75 text-[10px] font-mono text-muted-foreground/90">K</kbd>
          </div>
        </div>
      )}
    </div>
  )
}
