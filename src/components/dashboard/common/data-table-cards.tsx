"use client";

import React from "react";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "./data-table";

interface DataTableCardsProps<T> {
  columns: ColumnDef<T>[];
  processedData: T[];
  selectMode: boolean;
  selectedIds: Set<string>;
  toggleSelectRow: (id: string, e: React.MouseEvent) => void;
  onRowClick?: (row: T) => void;
  renderCard?: (
    row: T,
    isSelected: boolean,
    toggleSelect: (e: React.MouseEvent) => void,
    selectMode: boolean
  ) => React.ReactNode;
}

export function DataTableCards<T extends Record<string, any>>({
  columns,
  processedData,
  selectMode,
  selectedIds,
  toggleSelectRow,
  onRowClick,
  renderCard,
}: DataTableCardsProps<T>) {
  return (
    <div className="w-full flex-1 overflow-y-auto min-h-0 pr-1 pb-20 sm:pb-4">
      {processedData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedData.map((row, rIndex) => {
            const rowId = String(row.id || row._id || row.userId || rIndex);
            const isSelected = selectedIds.has(rowId);

            const toggleSelect = (e: React.MouseEvent) => {
              toggleSelectRow(rowId, e);
            };

            const handleClick = () => {
              if (onRowClick) {
                onRowClick(row);
              }
            };

            if (renderCard) {
              return (
                <div
                  key={rowId}
                  onClick={handleClick}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {renderCard(row, isSelected, toggleSelect, selectMode)}
                </div>
              );
            }

            // Fallback generic card if renderCard is not provided
            return (
              <div
                key={rowId}
                onClick={handleClick}
                className={cn(
                  "relative rounded-2xl glass border p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg group text-left",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-neutral-200/30 dark:border-neutral-800/50 bg-card hover:border-neutral-300 dark:hover:border-neutral-700",
                  onRowClick && "cursor-pointer"
                )}
              >
                {selectMode && (
                  <button
                    onClick={toggleSelect}
                    className="absolute top-4 right-4 cursor-pointer text-muted-foreground hover:text-foreground z-10 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary animate-in zoom-in-50 duration-150" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                )}

                {columns.map((col) => {
                  if (col.key === "sNo") return null;
                  return (
                    <div key={col.key} className="flex flex-col gap-1 text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        {col.label}
                      </span>
                      <span className="font-medium text-foreground">
                        {col.render ? col.render(row, rIndex) : row[col.key] ?? "N/A"}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground text-sm rounded-2xl glass border border-neutral-200/30 dark:border-neutral-800/50">
          No records found.
        </div>
      )}
    </div>
  );
}
