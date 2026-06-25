"use client";

import React, { useState, useRef } from "react";
import { Search, CheckSquare, SlidersHorizontal, Download, X, Trash2, ArrowRightLeft, ShieldCheck, ShieldX, ShieldAlert, List, LayoutGrid, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";

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
  viewMode?: "list" | "card";
  setViewMode?: (mode: "list" | "card") => void;
  sortableColumns?: { key: string; label: string }[];
  sortKey?: string | null;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
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
  viewMode = "list",
  setViewMode,
  sortableColumns = [],
  sortKey = null,
  sortOrder = "asc",
  onSort,
}: DataTableToolbarProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const isExportDisabled = selectMode && selectedCount === 0;
  
  const statusMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(statusMenuRef, () => {
    if (statusMenuOpen) {
      setStatusMenuOpen(false);
    }
  });

  const sortMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(sortMenuRef, () => {
    if (sortMenuOpen) {
      setSortMenuOpen(false);
    }
  });

  if (selectMode) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-neutral-50/50 dark:bg-neutral-900/40 backdrop-blur-md rounded-xl animate-in fade-in duration-200 text-left relative border border-neutral-200/30 dark:border-neutral-800/30">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-xs font-bold text-foreground flex-shrink-0">
            {selectedCount} selected
          </span>
          <Button
            variant="ghost"
            onClick={onClearSelection}
            className="h-8 px-2.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-grow sm:flex-grow-0" ref={statusMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="w-full sm:w-auto h-8 px-3 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold gap-1.5 cursor-pointer justify-center"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Change Status</span>
            </Button>

            {statusMenuOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-36 rounded-xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 bg-background/95 backdrop-blur-md">
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
            )}
          </div>

          <Button
            variant="ghost"
            onClick={onExportCSV}
            disabled={isExportDisabled}
            className={cn(
              "h-8 px-2.5 sm:px-3 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold gap-1.5 cursor-pointer transition-opacity flex-grow sm:flex-grow-0 justify-center",
              isExportDisabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-2.5 sm:px-3 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 text-xs font-bold gap-1.5 cursor-pointer flex-grow sm:flex-grow-0 justify-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
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
      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectMode(true)}
          className="h-10 sm:h-11 px-3 sm:px-4.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium text-xs gap-2 cursor-pointer"
        >
          <CheckSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Select</span>
        </Button>

        {/* Card View Sort Dropdown */}
        {viewMode === "card" && sortableColumns.length > 0 && onSort && (
          <div className="relative" ref={sortMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium text-xs gap-2 cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
            {sortMenuOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 bg-background/95 backdrop-blur-md">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Sort By
                </div>
                <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-1" />
                {sortableColumns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <button
                      key={col.key}
                      onClick={() => {
                        onSort(col.key);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors text-left",
                        isSorted
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      )}
                    >
                      <span>{col.label}</span>
                      {isSorted && (
                        <span className="text-[10px] font-extrabold uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          {sortOrder === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={onFilterClick}
            className="h-10 sm:h-11 px-3 sm:px-4.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium text-xs gap-2 cursor-pointer overflow-visible"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
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
          className="h-10 sm:h-11 px-3 sm:px-4.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-medium text-xs gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        {primaryAction && (
          <Button onClick={primaryAction.onClick} variant="premium" className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-xs">
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
