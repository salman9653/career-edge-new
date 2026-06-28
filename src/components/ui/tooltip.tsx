"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  // Position classes for the tooltip container relative to its trigger
  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
    left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
    right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left",
  };

  // Tooltip content panel classes - adaptive to light & dark modes
  const contentPanelClasses = "bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-neutral-100 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center whitespace-nowrap leading-snug backdrop-blur-sm shadow-lg";

  return (
    <div className={cn("relative group/tooltip inline-flex", className)}>
      {children}
      <div
        className={cn(
          "absolute flex z-[100] pointer-events-none opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 shadow-2xl",
          sideClasses[side]
        )}
      >
        <div className={contentPanelClasses}>
          {content}
        </div>
      </div>
    </div>
  );
}
