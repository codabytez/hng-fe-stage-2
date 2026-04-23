"use client";

import { useEffect, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  hasError,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value && isValid(parseISO(value)) ? parseISO(value) : null;
  const [view, setView] = useState(selected ?? new Date());

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(view), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(view), { weekStartsOn: 1 }),
  });

  function handleToggleOpen() {
    if (disabled) return;
    if (!open) setView(selected ?? new Date());
    setOpen((o) => !o);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggleOpen}
        className={cn(
          "w-full rounded-sm border px-5 py-4 text-sm font-bold",
          "flex items-center justify-between",
          "bg-white dark:bg-dark-element text-ink dark:text-white",
          "transition-colors focus:outline-none",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          open
            ? "border-primary"
            : hasError
              ? "border-danger"
              : "border-lavender dark:border-dark-element"
        )}
      >
        <span>{selected ? format(selected, "d MMM yyyy") : "Select date"}</span>
        <CalendarDays size={16} className="shrink-0 text-muted-light" />
      </button>

      {/* Calendar popup */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-68 rounded-[8px] bg-white p-6 shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:bg-dark-element dark:shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
          {/* Month navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setView((v) => subMonths(v, 1))}
              className="p-1 text-primary transition-colors hover:text-primary-hover"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold text-ink dark:text-white">
              {format(view, "MMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setView((v) => addMonths(v, 1))}
              className="p-1 text-primary transition-colors hover:text-primary-hover"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-3 grid grid-cols-7">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span
                key={d}
                className="py-1 text-center text-xs font-bold text-muted"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const isSelected = selected && isSameDay(day, selected);
              const inMonth = isSameMonth(day, view);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    onChange(format(day, "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-full text-xs font-bold transition-colors",
                    isSelected
                      ? "bg-primary text-white"
                      : inMonth
                        ? "text-ink hover:text-primary dark:text-white dark:hover:text-primary"
                        : "text-muted opacity-30 hover:text-primary"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
