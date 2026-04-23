"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "draft" | "pending" | "paid";

const OPTIONS: { value: Status; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

interface FilterDropdownProps {
  selected: Status[];
  onChange: (statuses: Status[]) => void;
}

export function FilterDropdown({ selected, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(status: Status) {
    onChange(
      selected.includes(status)
        ? selected.filter((s) => s !== status)
        : [...selected, status]
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 font-bold text-sm dark:text-white hover:text-muted transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="hidden sm:inline">Filter by status</span>
        <span className="sm:hidden">Filter</span>
        <ChevronDown
          size={16}
          className={cn(
            "text-primary transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-dark-element rounded-lg shadow-xl p-6 flex flex-col gap-4 z-50">
          {OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-4 cursor-pointer group select-none"
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors shrink-0",
                  selected.includes(value)
                    ? "bg-primary border-primary"
                    : "border-lavender dark:border-muted-light hover:border-primary"
                )}
                role="checkbox"
                aria-checked={selected.includes(value)}
                onClick={() => toggle(value)}
              >
                {selected.includes(value) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={selected.includes(value)}
                onChange={() => toggle(value)}
              />
              <span className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
