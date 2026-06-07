"use client";

import React, { useState } from "react";
import { Search, CheckSquare, SlidersHorizontal, Download, X, Trash2, ArrowRightLeft, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchPlaceholder?: string;
  selectMode: boolean;
  setSelectMode: (mode: boolean) => void;
  selectedCount: number;
  onClearSelection: () => void;
  onExportCSV: () => void;
  onFilterClick: () => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  appliedFiltersCount?: number;
  onClearFilters?: (e: React.MouseEvent) => void;
}

export function DataTableToolbar({
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Search...",
  selectMode,
  setSelectMode,
  selectedCount,
  onClearSelection,
  onExportCSV,
  onFilterClick,
  primaryAction,
  appliedFiltersCount = 0,
  onClearFilters,
}: DataTableToolbarProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);
  const isExportDisabled = selectMode && selectedCount === 0;

  if (selectMode) {
    return (
      <div className="flex items-center justify-between h-11 px-4 bg-neutral-50/50 dark:bg-neutral-900/40 backdrop-blur-md rounded-xl animate-in fade-in duration-200 text-left relative">
        <div className="flex items-center">
          <span className="text-xs font-bold text-foreground">
            {selectedCount} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onClearSelection}
            className="h-8 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="h-8 px-3 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" /> Change Status
            </Button>

            {statusMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setStatusMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-36 rounded-xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 bg-background/95 backdrop-blur-md">
                  <button
                    onClick={() => setStatusMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active
                  </button>
                  <button
                    onClick={() => setStatusMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors text-left"
                  >
                    <ShieldX className="w-4 h-4 text-amber-500" /> Inactive
                  </button>
                  <button
                    onClick={() => setStatusMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors text-left"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Banned
                  </button>
                </div>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={onExportCSV}
            disabled={isExportDisabled}
            className={cn(
              "h-8 px-3 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold gap-1.5 cursor-pointer transition-opacity",
              isExportDisabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" /> Export
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between">
      <div className="relative flex-grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 w-full"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Button
          variant="ghost"
          onClick={() => setSelectMode(true)}
          className="h-11 px-4.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium text-xs gap-2 cursor-pointer"
        >
          <CheckSquare className="w-4 h-4" /> Select
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={onFilterClick}
            className="h-11 px-4.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium text-xs gap-2 cursor-pointer overflow-visible"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filter
          </Button>
          {appliedFiltersCount > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters?.(e);
              }}
              onMouseEnter={() => setIsBadgeHovered(true)}
              onMouseLeave={() => setIsBadgeHovered(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary hover:bg-red-500 text-primary-foreground hover:text-white flex items-center justify-center text-[10px] font-extrabold shadow-md cursor-pointer transition-all duration-150 select-none z-10 animate-in zoom-in-50 duration-200"
              title="Clear all filters"
            >
              {isBadgeHovered ? <X className="w-3 h-3 stroke-[3]" /> : appliedFiltersCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={onExportCSV}
          className="h-11 px-4.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium text-xs gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export
        </Button>
        {primaryAction && (
          <Button onClick={primaryAction.onClick} variant="premium" className="h-11 px-5 rounded-xl font-bold text-xs">
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
