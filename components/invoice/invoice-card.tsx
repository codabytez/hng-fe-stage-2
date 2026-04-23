"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { Doc } from "@/convex/_generated/dataModel";

type Invoice = Doc<"invoices">;

const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function fmt(n: number) {
  return formatter.format(isNaN(n) ? 0 : n);
}

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const router = useRouter();

  const dueDate = format(new Date(invoice.dueDate), "dd MMM yyyy");
  const total = fmt(invoice.total);

  return (
    <button
      onClick={() => router.push(`/invoices/${invoice._id}`)}
      className="w-full bg-white dark:bg-dark-surface rounded-lg px-6 py-5 hover:ring-1 hover:ring-primary transition-all text-left group"
      aria-label={`View invoice ${invoice.invoiceNumber}`}
    >
      {/* Desktop / tablet row */}
      <div className="hidden sm:flex items-center gap-6">
        <span className="w-25 font-bold text-sm shrink-0">
          <span className="text-muted">#</span>
          {invoice.invoiceNumber}
        </span>

        <span className="w-32.5 text-sm text-muted dark:text-lavender shrink-0">
          Due&nbsp;{dueDate}
        </span>

        <span className="flex-1 text-sm text-muted dark:text-lavender truncate">
          {invoice.clientName}
        </span>

        <span className="w-27.5 text-right font-bold text-base shrink-0 dark:text-white">
          {total}
        </span>

        <div className="w-32.5 shrink-0 flex justify-center">
          <StatusBadge status={invoice.status} />
        </div>

        <ChevronRight
          size={16}
          className="text-primary shrink-0 group-hover:translate-x-1 transition-transform"
        />
      </div>

      {/* Mobile stacked layout */}
      <div className="sm:hidden grid grid-cols-2 gap-y-3">
        {/* Row 1: number | client */}
        <span className="font-bold text-sm text-ink dark:text-white">
          <span className="text-muted">#</span>
          {invoice.invoiceNumber}
        </span>
        <span className="text-right text-sm text-muted dark:text-lavender">
          {invoice.clientName}
        </span>

        {/* Row 2: due date | status */}
        <span className="text-xs text-muted dark:text-lavender">
          Due&nbsp;{dueDate}
        </span>
        <div className="flex justify-end">
          <StatusBadge status={invoice.status} />
        </div>

        {/* Row 3: total */}
        <span className="font-bold text-base text-ink dark:text-white">
          {total}
        </span>
      </div>
    </button>
  );
}
