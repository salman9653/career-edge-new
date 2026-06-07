"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  dropdownClassName?: string;
  openUpwards?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  icon,
  className,
  dropdownClassName,
  openUpwards = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus-visible:outline-none text-foreground cursor-pointer text-left",
          isOpen && "border-primary/80 ring-1 ring-primary/30",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <div className="shrink-0 text-muted-foreground">{icon}</div>}
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2",
            isOpen && "transform rotate-180 text-primary"
          )}
        />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-full rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-[#07070b]/95 backdrop-blur-md shadow-2xl p-1.5 animate-in fade-in duration-150 max-h-60 overflow-y-auto left-0",
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5",
            dropdownClassName
          )}
        >
          {placeholder && (
            <button
              type="button"
              onClick={() => handleSelect("")}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer mb-0.5 flex items-center gap-2"
            >
              <div className="w-4 h-4 shrink-0" />
              <span className="truncate">{placeholder}</span>
            </button>
          )}
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-2 mb-0.5",
                  isSelected
                    ? "bg-primary/10 text-primary dark:text-white"
                    : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
