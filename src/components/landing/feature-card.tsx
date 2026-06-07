import React from "react";
import { TrendingUp, ChevronRight, LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  highlight: string;
  badge?: string;
}

export function FeatureCard({ title, description, icon: IconComp, highlight, badge }: FeatureCardProps) {
  return (
    <div
      className="relative p-8 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/40 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 group hover:border-indigo-500/20 overflow-hidden flex flex-col justify-between min-h-[250px]"
    >
      {/* Decorative background grid pattern inside card */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-indigo-500/5 to-transparent" />

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
            <IconComp className="w-6 h-6" />
          </div>
          {/* Badge if exists */}
          {badge && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/30 dark:border-indigo-800/20">
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Highlights section at bottom of card */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-xs font-semibold text-indigo-500 dark:text-indigo-400 mt-6 relative z-10">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-500" /> {highlight}
        </span>
        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
          Learn More <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
