"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { InvoiceCard } from "./invoice-card";
import { FilterDropdown } from "./filter-dropdown";
import Image from "next/image";

type Status = "draft" | "pending" | "paid";

export function InvoiceList() {
  const [filters, setFilters] = useState<Status[]>([]);

  const statusArg = filters.length === 1 ? filters[0] : undefined;
  const invoices = useQuery(api.invoices.list, { status: statusArg });

  const filtered =
    filters.length > 1
      ? invoices?.filter((inv) => filters.includes(inv.status as Status))
      : invoices;

  const count = filtered?.length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-ink dark:text-white">
            Invoices
          </h1>
          <p className="text-sm text-muted mt-1">
            {count === 0
              ? "No invoices"
              : `There are ${count} total invoice${count !== 1 ? "s" : ""}`}
          </p>
        </div>

        <FilterDropdown selected={filters} onChange={setFilters} />

        <button className="flex items-center gap-4 bg-primary hover:bg-primary-hover transition-colors text-white font-bold text-sm rounded-full pl-2 pr-5 py-2">
          <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Plus size={16} className="text-primary" />
          </span>
          New Invoice
        </button>
      </div>

      {/* List */}
      {invoices === undefined ? (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-18 bg-white dark:bg-dark-surface rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((invoice) => (
            <InvoiceCard key={invoice._id} invoice={invoice} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-10">
      <Image
        src="/empty-state.svg"
        alt="Empty state illustration"
        aria-hidden="true"
        width={242}
        height={200}
        className="w-60.5"
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-ink dark:text-white">
          There is nothing here
        </h2>
        <p className="text-muted dark:text-lavender text-[13px] leading-relaxed max-w-48.25 mx-auto">
          Create an invoice by clicking the{" "}
          <span className="font-bold">New Invoice</span> button and get started
        </p>
      </div>
    </div>
  );
}
