import React from "react"
import { Compass } from "lucide-react"

interface UnderDevelopmentModuleProps {
  title: string
}

export function UnderDevelopmentModule({ title }: UnderDevelopmentModuleProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 mt-4">
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl glass border shadow-xl bg-neutral-50/20 dark:bg-neutral-900/5 relative overflow-hidden min-h-[400px]">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 shadow-sm border border-indigo-500/10">
          <Compass className="w-8 h-8 animate-spin-slow" style={{ animationDuration: "12s" }} />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">
          {title} Module
        </h1>
        
        <p className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-2">
          Under Development
        </p>

        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          Our engineering team is actively building this dashboard workspace. AI-driven matching, interactive tools, and direct integrations will be operational soon.
        </p>
      </div>
    </div>
  )
}
