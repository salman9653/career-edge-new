"use client";

import React from "react";
import { CheckSquare, Square, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "./data-table";

interface DataTableContentProps<T> {
  columns: ColumnDef<T>[];
  processedData: T[];
  selectMode: boolean;
  selectedIds: Set<string>;
  toggleSelectAll: (e: React.MouseEvent) => void;
  toggleSelectRow: (id: string, e: React.MouseEvent) => void;
  handleSort: (key: string) => void;
  onRowClick?: (row: T) => void;
  loaderRef?: React.RefObject<HTMLDivElement | null>;
}

export function DataTableContent<T extends Record<string, any>>({
  columns,
  processedData,
  selectMode,
  selectedIds,
  toggleSelectAll,
  toggleSelectRow,
  handleSort,
  onRowClick,
  loaderRef,
}: DataTableContentProps<T>) {
  return (
    <div className="w-full flex-1 min-h-0 rounded-2xl glass border border-neutral-200/30 dark:border-neutral-800/50 overflow-hidden shadow-xl flex flex-col">
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-card/95 backdrop-blur-md z-10 border-b border-neutral-200/40 dark:border-neutral-800/50">
            <tr className="bg-neutral-50/20 dark:bg-neutral-950/20">
              {columns.map((col) => {
                if (col.key === "sNo" && selectMode) {
                  return (
                    <th key={col.key} className="p-4 w-12 text-center select-none">
                      <button
                        onClick={toggleSelectAll}
                        className="cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        {selectedIds.size === processedData.length && processedData.length > 0 ? (
                          <CheckSquare className="w-4.5 h-4.5 text-primary" />
                        ) : (
                          <Square className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </th>
                  );
                }
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={cn(
                      "p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none",
                      col.sortable && "cursor-pointer hover:text-foreground transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/75" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/50 dark:divide-neutral-900/50">
            {processedData.length > 0 ? (
              processedData.map((row, rIndex) => {
                const rowId = row.id || row._id || row.userId || String(rIndex);
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "transition-all duration-200 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-primary/5 border-l-2 border-primary pl-3.5"
                    )}
                  >
                    {columns.map((col) => {
                      if (col.key === "sNo" && selectMode) {
                        return (
                          <td
                            key={col.key}
                            className="p-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => toggleSelectRow(rowId, e)}
                              className="cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4.5 h-4.5 text-primary" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-muted-foreground" />
                              )}
                            </button>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className="p-4 text-sm font-medium text-foreground">
                          {col.render ? col.render(row, rIndex) : row[col.key] ?? "N/A"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-muted-foreground text-sm">
                  No records found.
                </td>
              </tr>
            )}
            {loaderRef && (
              <tr>
                <td colSpan={columns.length} className="p-0 border-0 bg-transparent">
                  <div ref={loaderRef} className="w-full py-4 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
