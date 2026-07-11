"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckSquare, SlidersHorizontal, Download, X, Trash2, ArrowRightLeft, ShieldCheck, ShieldX, ShieldAlert, ArrowUpDown, ArrowLeft, List, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";
import { TabItem } from "./data-table";

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
  onSort?: (key: string | null) => void;
  onDeleteSelected?: () => void;
  tabs?: TabItem[];
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
  sortableColumns = [],
  sortKey = null,
  sortOrder = "asc",
  onSort,
  onDeleteSelected,
  tabs,
}: DataTableToolbarProps) {
  const router = useRouter();
  const { headerTitle, headerBackHref, showViewSwitcher, setViewMode } = useUIStore();
  
  const capitalizedTitle = headerTitle
    ? headerTitle
        .split(/[\s-_]+/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

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
        <div className="flex items-center justify-between sm:justify-start gap-4 flex-grow">
          <div className="flex items-center gap-3">
            {capitalizedTitle && (
              <h1 className="hidden md:block text-base md:text-lg font-extrabold tracking-tight text-foreground whitespace-nowrap opacity-60">
                {capitalizedTitle}
              </h1>
            )}
            <span className="hidden md:block h-4 w-px bg-neutral-200/50 dark:bg-neutral-800/50" />
            <span className="text-xs font-bold text-foreground flex-shrink-0">
              {selectedCount} selected
            </span>
          </div>
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

          <Tooltip content="Export Selected CSV" side="bottom">
            <Button
              variant="ghost"
              onClick={onExportCSV}
              disabled={isExportDisabled}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer transition-opacity",
                isExportDisabled && "opacity-40 cursor-not-allowed pointer-events-none"
              )}
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </Tooltip>
          {onDeleteSelected && (
            <Button
              variant="ghost"
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className={cn(
                "h-8 px-2.5 sm:px-3 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 text-xs font-bold gap-1.5 cursor-pointer flex-grow sm:flex-grow-0 justify-center",
                selectedCount === 0 && "opacity-40 cursor-not-allowed pointer-events-none"
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Layout (Search & Action Buttons in a Single Row) */}
      <div className="flex sm:hidden flex-row items-center gap-2 w-full">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 w-full text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Tooltip content="Select Rows" side="bottom">
            <Button
              variant="ghost"
              onClick={() => setSelectMode(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer p-0"
            >
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Tooltip>

          {/* Card View Sort Dropdown */}
          {viewMode === "card" && sortableColumns.length > 0 && onSort && (
            <div className="relative" ref={sortMenuRef}>
              <Tooltip content="Sort Options" side="bottom">
                <Button
                  variant="ghost"
                  onClick={() => setSortMenuOpen(!sortMenuOpen)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer p-0"
                >
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </Tooltip>
              {sortMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 bg-background/95 backdrop-blur-md">
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Sort By
                    </span>
                    {sortKey && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSort) onSort(null);
                          setSortMenuOpen(false);
                        }}
                        className="text-muted-foreground hover:text-foreground cursor-pointer rounded transition-colors"
                        title="Clear Sorting"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-1" />
                  {sortableColumns.map((col) => {
                    const isSorted = sortKey === col.key;
                    return (
                      <button
                        key={col.key}
                        onClick={() => {
                          onSort(col.key);
                          setSortMenuOpen(false);
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
            <Tooltip content="Filter Options" side="bottom">
              <Button
                variant="ghost"
                onClick={onFilterClick}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer overflow-visible p-0"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Tooltip>
            {appliedFiltersCount > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters?.(e);
                }}
                onMouseEnter={() => setIsBadgeHovered(true)}
                onMouseLeave={() => setIsBadgeHovered(false)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary hover:bg-red-500 text-primary-foreground hover:text-white flex items-center justify-center text-[8px] font-extrabold shadow-md cursor-pointer transition-all duration-150 select-none z-10 animate-in zoom-in-50 duration-200"
                title="Clear all filters"
              >
                {isBadgeHovered ? <X className="w-2.5 h-2.5 stroke-[3]" /> : appliedFiltersCount}
              </span>
            )}
          </div>

          <Tooltip content="Export CSV" side="bottom">
            <Button
              variant="ghost"
              onClick={onExportCSV}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer p-0"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="hidden sm:flex flex-col lg:flex-row gap-4 w-full">
        {/* Title Area - full width on tablet, auto on desktop */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {headerBackHref && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(headerBackHref)}
              className="w-9 h-9 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer flex-shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </Button>
          )}
          {tabs && tabs.length > 0 ? (
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 p-1 rounded-xl gap-1 flex-shrink-0 h-10 sm:h-11">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={tab.onClick}
                  className={cn(
                    "px-4 h-8 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap",
                    tab.isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            capitalizedTitle && (
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-foreground whitespace-nowrap">
                {capitalizedTitle}
              </h1>
            )
          )}
        </div>

        {/* Search & Actions Row on Tablet, Inline on Desktop */}
        <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between flex-grow w-full lg:w-auto">
          {/* Search input */}
          <div className="relative flex-grow max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 w-full"
            />
          </div>

          {/* Action Toolbar buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <Tooltip content="Select Rows" side="bottom">
              <Button
                variant="ghost"
                onClick={() => setSelectMode(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer p-0"
              >
                <CheckSquare className="w-4.5 h-4.5 text-muted-foreground" />
              </Button>
            </Tooltip>

            {/* Card View Sort Dropdown */}
            {viewMode === "card" && sortableColumns.length > 0 && onSort && (
              <div className="relative" ref={sortMenuRef}>
                <Tooltip content="Sort Options" side="bottom">
                  <Button
                    variant="ghost"
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer p-0"
                  >
                    <ArrowUpDown className="w-4.5 h-4.5 text-muted-foreground" />
                  </Button>
                </Tooltip>
                {sortMenuOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 bg-background/95 backdrop-blur-md">
                    <div className="flex items-center justify-between px-2.5 py-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Sort By
                      </span>
                      {sortKey && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSort) onSort(null);
                            setSortMenuOpen(false);
                          }}
                          className="text-muted-foreground hover:text-foreground cursor-pointer rounded transition-colors"
                          title="Clear Sorting"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-1" />
                    {sortableColumns.map((col) => {
                      const isSorted = sortKey === col.key;
                      return (
                        <button
                          key={col.key}
                          onClick={() => {
                            onSort(col.key);
                            setSortMenuOpen(false);
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
              <Tooltip content="Filter Options" side="bottom">
                <Button
                  variant="ghost"
                  onClick={onFilterClick}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer overflow-visible p-0"
                >
                  <SlidersHorizontal className="w-4.5 h-4.5 text-muted-foreground" />
                </Button>
              </Tooltip>
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
            <Tooltip content="Export CSV" side="bottom">
              <Button
                variant="ghost"
                onClick={onExportCSV}
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer p-0"
              >
                <Download className="w-4.5 h-4.5 text-muted-foreground" />
              </Button>
            </Tooltip>

            {/* Unified View Switcher inside Toolbar */}
            {showViewSwitcher && (
              <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 p-1 rounded-xl gap-1 flex-shrink-0 h-10 sm:h-11">
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

            {primaryAction && (
              <Button onClick={primaryAction.onClick} variant="premium" className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 rounded-xl font-bold text-xs">
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
