"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { InvoiceCard } from "./invoice-card";
import { FilterDropdown } from "./filter-dropdown";
import { InvoiceForm } from "./invoice-form";
import Image from "next/image";

type Status = "draft" | "pending" | "paid";

export function InvoiceList() {
  const [filters, setFilters] = useState<Status[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  const statusArg = filters.length === 1 ? filters[0] : undefined;
  const invoices = useQuery(api.invoices.list, { status: statusArg });

  const filtered =
    filters.length > 1
      ? invoices?.filter((inv) => filters.includes(inv.status as Status))
      : invoices;

  const count = filtered?.length ?? 0;

  return (
    <>
      <InvoiceForm open={formOpen} onClose={() => setFormOpen(false)} />

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-ink dark:text-white">
              Invoices
            </h1>
            <p className="mt-1 text-sm text-muted">
              {count === 0
                ? "No invoices"
                : `There are ${count} total invoice${count !== 1 ? "s" : ""}`}
            </p>
          </div>

          <FilterDropdown selected={filters} onChange={setFilters} />

          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 sm:gap-4 rounded-full bg-primary py-2 pl-2 pr-4 sm:pr-5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shrink-0">
              <Plus size={16} className="text-primary" />
            </span>
            <span className="hidden sm:inline">New Invoice</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* List */}
        {invoices === undefined ? (
          <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-18 animate-pulse rounded-lg bg-white dark:bg-dark-surface"
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
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-16 text-center">
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
        <p className="mx-auto max-w-48.25 text-[13px] leading-relaxed text-muted dark:text-lavender">
          Create an invoice by clicking the{" "}
          <span className="font-bold">New Invoice</span> button and get started
        </p>
      </div>
    </div>
  );
}
