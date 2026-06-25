"use client";

import React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface FilterConfig {
  key: string;
  label: string;
  options: string[];
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filterConfigs: FilterConfig[];
  tempFilters: Record<string, string[]>;
  onToggleOption: (key: string, option: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

export function FilterSheet({
  isOpen,
  onClose,
  filterConfigs,
  tempFilters,
  onToggleOption,
  onClearFilters,
  onApplyFilters,
}: FilterSheetProps) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      footer={(
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="flex-grow h-11 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
          >
            Clear Filters
          </Button>
          <Button
            onClick={onApplyFilters}
            className="flex-grow h-11 rounded-xl bg-primary hover:opacity-90 text-white font-bold text-xs cursor-pointer shadow-md"
          >
            Apply Filters
          </Button>
        </div>
      )}
    >
      <div className="space-y-6">
        {filterConfigs.map((config) => (
          <div
            key={config.key}
            className="space-y-3.5 text-left border-b border-neutral-200/10 dark:border-neutral-800/10 pb-5 last:border-b-0"
          >
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              {config.label}
            </h4>
            <div className="space-y-2.5">
              {config.options.map((opt) => {
                const active = (tempFilters[config.key] || []).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => onToggleOption(config.key, opt)}
                    className="w-full flex items-center gap-2.5 text-xs font-bold text-foreground cursor-pointer text-left select-none group"
                  >
                    <div
                      className={cn(
                        "w-4.5 h-4.5 rounded border border-neutral-300 dark:border-neutral-700 flex items-center justify-center transition-all group-hover:border-primary",
                        active ? "border-primary bg-primary text-white" : ""
                      )}
                    >
                      {active && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
