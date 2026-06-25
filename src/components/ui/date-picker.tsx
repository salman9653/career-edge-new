"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // Expected in YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generates years list: default from 1950 to current year + 10
const startYear = 1950;
const endYear = new Date().getFullYear() + 10;
const YEARS = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date value
  const initialDate = value ? new Date(value) : null;
  const isValidDate = initialDate && !isNaN(initialDate.getTime());

  // Calendar viewport state
  const [currentMonth, setCurrentMonth] = useState(
    isValidDate ? initialDate.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    isValidDate ? initialDate.getFullYear() : new Date().getFullYear()
  );

  // Sync state if value prop changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [value]);

  // Click outside to close
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

  // Format date for input display (e.g., "07 Sep 2004")
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Days calculations
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  // Date selection click handler
  const handleDateClick = (dayNum: number) => {
    const selectedMonth = String(currentMonth + 1).padStart(2, "0");
    const selectedDay = String(dayNum).padStart(2, "0");
    const selectedDateStr = `${currentYear}-${selectedMonth}-${selectedDay}`;
    onChange(selectedDateStr);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Generate grid days
  const calendarDays = [];
  
  // Padding from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    calendarDays.push({ dayNum, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ dayNum: i, isCurrentMonth: true });
  }

  // Padding for next month to complete standard 6 rows (42 items)
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ dayNum: i, isCurrentMonth: false });
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full pl-11 pr-10 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-left flex items-center justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none select-none",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate">
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        {value && !disabled && (
          <span
            onClick={handleClear}
            className="p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-850/50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 p-4 w-[280px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-2xl shadow-xl space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>

            <div className="flex items-center gap-1">
              {/* Month Dropdown */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="bg-transparent text-xs font-bold text-foreground border-none outline-none focus:ring-0 cursor-pointer py-0.5 px-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx} className="bg-white dark:bg-neutral-950 text-foreground">
                    {m.slice(0, 3)}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="bg-transparent text-xs font-bold text-foreground border-none outline-none focus:ring-0 cursor-pointer py-0.5 px-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-neutral-950 text-foreground">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ dayNum, isCurrentMonth }, idx) => {
              const isSelected =
                isValidDate &&
                isCurrentMonth &&
                initialDate.getDate() === dayNum &&
                initialDate.getMonth() === currentMonth &&
                initialDate.getFullYear() === currentYear;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isCurrentMonth}
                  onClick={() => handleDateClick(dayNum)}
                  className={cn(
                    "h-7 w-7 text-[11px] font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground font-extrabold shadow-sm scale-105"
                      : isCurrentMonth
                      ? "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      : "text-muted-foreground/30 pointer-events-none"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
