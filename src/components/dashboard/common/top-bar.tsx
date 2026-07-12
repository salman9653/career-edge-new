"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, List, LayoutGrid } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { Button, Tooltip } from "@/components/ui";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
}

export function TopBar({ title: fallbackTitle }: TopBarProps) {
  const router = useRouter();
  const { headerTitle, headerSubtitle, headerBackHref, viewMode, setViewMode, showViewSwitcher } = useUIStore();

  const title = headerTitle || fallbackTitle;
  
  // Capitalize helper
  const capitalizedTitle = title
    ? title
        .split(/[\s-_]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  return (
    <header className="h-16 border-b border-neutral-200/30 dark:border-neutral-800/30 flex items-center justify-between px-6 sm:px-8 mt-16 md:mt-0 bg-background/50 backdrop-blur-md z-20 flex-shrink-0">
      <div className="flex items-center gap-3">
        {headerBackHref && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div className="flex flex-col text-left">
          <h2 className="text-base font-extrabold tracking-tight text-foreground leading-tight">
            {capitalizedTitle}
          </h2>
          {headerSubtitle && (
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-none">
              {headerSubtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {showViewSwitcher && (
          <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 p-1 rounded-xl gap-1">
            <Tooltip content="List View" side="bottom">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer h-8 w-8",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm border border-neutral-200/20 dark:border-neutral-800/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Card View" side="bottom">
              <button
                onClick={() => setViewMode("card")}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer h-8 w-8",
                  viewMode === "card"
                    ? "bg-background text-foreground shadow-sm border border-neutral-200/20 dark:border-neutral-800/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </header>
  );
}
