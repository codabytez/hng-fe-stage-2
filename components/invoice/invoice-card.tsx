"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { Doc } from "@/convex/_generated/dataModel";

type Invoice = Doc<"invoices">;

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const router = useRouter();

  const formattedDate = format(new Date(invoice.dueDate), "dd MMM yyyy");
  const formattedTotal = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(invoice.total);

  return (
    <button
      onClick={() => router.push(`/invoices/${invoice._id}`)}
      className="w-full bg-white dark:bg-dark-surface rounded-lg px-6 py-5 flex items-center gap-6 hover:ring-1 hover:ring-primary transition-all text-left group"
      aria-label={`View invoice ${invoice.invoiceNumber}`}
    >
      <span className="w-25 font-bold text-sm shrink-0">
        <span className="text-muted">#</span>
        {invoice.invoiceNumber}
      </span>

      <span className="hidden sm:block w-32.5 text-sm text-muted dark:text-lavender shrink-0">
        Due&nbsp;{formattedDate}
      </span>

      <span className="flex-1 text-sm text-muted dark:text-lavender truncate">
        {invoice.clientName}
      </span>

      <span className="w-27.5 text-right font-bold text-base shrink-0 dark:text-white">
        {formattedTotal}
      </span>

      <div className="w-32.5 shrink-0 flex justify-center">
        <StatusBadge status={invoice.status} />
      </div>

      <ChevronRight
        size={16}
        className="text-primary shrink-0 group-hover:translate-x-1 transition-transform"
      />
    </button>
  );
}
