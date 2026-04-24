"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./status-badge";
import { InvoiceForm } from "./invoice-form";
import { invoiceFormSchema } from "@/lib/validations/invoice";
import { cn } from "@/lib/utils";

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sendError, setSendError] = useState(false);

  const invoice = useQuery(api.invoices.get, { id: id as Id<"invoices"> });
  const remove = useMutation(api.invoices.remove);
  const send = useMutation(api.invoices.send);
  const markAsPaid = useMutation(api.invoices.markAsPaid);

  if (invoice === undefined) return <PageSkeleton />;

  if (invoice === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted">Invoice not found.</p>
        <Link
          href="/"
          className="text-sm font-bold text-primary hover:text-primary-hover"
        >
          Go back
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    await remove({ id: invoice!._id });
    router.push("/");
  }

  function handleSend() {
    const result = invoiceFormSchema.safeParse({
      senderAddress: invoice!.senderAddress,
      clientName: invoice!.clientName,
      clientEmail: invoice!.clientEmail,
      clientAddress: invoice!.clientAddress,
      issueDate: format(new Date(invoice!.issueDate), "yyyy-MM-dd"),
      paymentTerms: invoice!.paymentTerms,
      description: invoice!.description,
      items: invoice!.items,
    });

    if (!result.success) {
      setSendError(true);
      setEditOpen(true);
      return;
    }

    send({ id: invoice!._id });
  }

  const issueDate = format(new Date(invoice.issueDate), "d MMM yyyy");
  const dueDate = format(new Date(invoice.dueDate), "d MMM yyyy");

  return (
    <>
      {invoice.status !== "paid" && (
        <InvoiceForm
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setSendError(false);
          }}
          invoice={invoice}
        />
      )}

      <DeleteModal
        open={deleteOpen}
        invoiceNumber={invoice.invoiceNumber}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <div className="flex flex-col gap-6 pb-24 md:pb-0">
        <Link
          href="/"
          className="flex w-fit items-center gap-4 text-sm font-bold text-ink transition-colors hover:text-muted dark:text-white dark:hover:text-muted"
        >
          <ChevronLeft size={16} className="text-primary" />
          Go back
        </Link>

        {sendError && (
          <p className="rounded-[8px] bg-danger/10 px-6 py-4 text-sm font-bold text-danger">
            This invoice is incomplete. Please fill in all required fields
            before sending.
          </p>
        )}

        {/* Status bar */}
        <div className="flex items-center gap-4 rounded-[8px] bg-white px-8 py-5 shadow-sm dark:bg-dark-surface">
          <span className="text-sm text-muted">Status</span>
          <StatusBadge status={invoice.status} />
          <div className="flex-1" />
          {/* Desktop-only actions */}
          <div className="hidden items-center gap-4 sm:flex">
            {invoice.status !== "paid" && (
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-full bg-light-bg px-6 py-4 text-sm font-bold text-muted-light transition-colors hover:text-primary dark:bg-dark-element dark:hover:bg-dark-surface"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setDeleteOpen(true)}
              className="rounded-full bg-danger px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-danger-hover"
            >
              Delete
            </button>
            {invoice.status === "draft" && (
              <button
                onClick={handleSend}
                className="rounded-full bg-primary px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
              >
                Send Invoice
              </button>
            )}
            {invoice.status === "pending" && (
              <button
                onClick={() => markAsPaid({ id: invoice._id })}
                className="rounded-full bg-primary px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>

        {/* Invoice card */}
        <div className="flex flex-col gap-10 rounded-[8px] bg-white px-8 py-10 shadow-sm dark:bg-dark-surface">
          {/* Header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-base font-bold text-ink dark:text-white">
                <span className="text-muted">#</span>
                {invoice.invoiceNumber}
              </p>
              <p className="mt-1 text-sm text-muted">{invoice.description}</p>
            </div>
            <div className="text-sm leading-6 text-muted sm:text-right">
              <p>{invoice.senderAddress.street}</p>
              <p>{invoice.senderAddress.city}</p>
              <p>{invoice.senderAddress.postCode}</p>
              <p>{invoice.senderAddress.country}</p>
            </div>
          </div>

          {/* Info grid — 2 cols on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-8">
              <div>
                <p className="mb-3 text-sm text-muted-light">Invoice Date</p>
                <p className="text-sm font-bold text-ink dark:text-white">
                  {issueDate}
                </p>
              </div>
              <div>
                <p className="mb-3 text-sm text-muted-light">Payment Due</p>
                <p className="text-sm font-bold text-ink dark:text-white">
                  {dueDate}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm text-muted-light">Bill To</p>
              <p className="mb-2 text-sm font-bold text-ink dark:text-white">
                {invoice.clientName}
              </p>
              <div className="text-sm leading-6 text-muted">
                <p>{invoice.clientAddress.street}</p>
                <p>{invoice.clientAddress.city}</p>
                <p>{invoice.clientAddress.postCode}</p>
                <p>{invoice.clientAddress.country}</p>
              </div>
            </div>

            {/* Sent to — full row on mobile, 3rd col on desktop */}
            <div className="col-span-2 sm:col-span-1">
              <p className="mb-3 text-sm text-muted-light">Sent to</p>
              <p className="text-sm font-bold text-ink dark:text-white">
                {invoice.clientEmail}
              </p>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-hidden rounded-[8px]">
            <div className="flex flex-col gap-6 bg-light-bg px-8 py-8 dark:bg-dark-element">
              {/* Desktop column headers */}
              <div className="hidden grid-cols-[1fr_64px_128px_128px] text-sm text-muted sm:grid">
                <span>Item Name</span>
                <span className="text-center">QTY.</span>
                <span className="text-right">Price</span>
                <span className="text-right">Total</span>
              </div>

              {invoice.items.map((item, i) => (
                <div key={i}>
                  {/* Desktop row */}
                  <div className="hidden grid-cols-[1fr_64px_128px_128px] items-center sm:grid">
                    <span className="text-sm font-bold text-ink dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-center text-sm font-bold text-primary">
                      {item.quantity}
                    </span>
                    <span className="text-right text-sm font-bold text-primary">
                      £ {formatAmount(item.price)}
                    </span>
                    <span className="text-right text-sm font-bold text-ink dark:text-white">
                      £ {formatAmount(item.total)}
                    </span>
                  </div>

                  {/* Mobile row */}
                  <div className="flex items-center justify-between sm:hidden">
                    <div>
                      <p className="text-sm font-bold text-ink dark:text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm font-bold text-primary">
                        {item.quantity} x £ {formatAmount(item.price)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-ink dark:text-white">
                      £ {formatAmount(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-draft px-8 py-6 dark:bg-dark-bg">
              <span className="text-sm text-white">
                <span className="hidden sm:inline">Amount Due</span>
                <span className="sm:hidden">Grand Total</span>
              </span>
              <span className="text-2xl font-bold text-white">
                £ {formatAmount(invoice.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed footer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 bg-white px-6 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] md:hidden dark:bg-dark-surface dark:shadow-[0_-8px_24px_rgba(0,0,0,0.3)]",
          editOpen && "hidden"
        )}
      >
        {invoice.status !== "paid" && (
          <button
            onClick={() => setEditOpen(true)}
            className="rounded-full bg-light-bg px-6 py-4 text-sm font-bold text-muted-light transition-colors hover:text-primary dark:bg-dark-element dark:hover:bg-dark-surface"
          >
            Edit
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => setDeleteOpen(true)}
          className="rounded-full bg-danger px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-danger-hover"
        >
          Delete
        </button>
        {invoice.status === "draft" && (
          <button
            onClick={handleSend}
            className="rounded-full bg-primary px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Send Invoice
          </button>
        )}
        {invoice.status === "pending" && (
          <button
            onClick={() => markAsPaid({ id: invoice._id })}
            className="rounded-full bg-primary px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Mark as Paid
          </button>
        )}
      </div>
    </>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const amountFormatter = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(value: number) {
  return amountFormatter.format(isNaN(value) ? 0 : value);
}

// ─── Delete confirmation modal ─────────────────────────────────────────────────

interface DeleteModalProps {
  open: boolean;
  invoiceNumber: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteModal({
  open,
  invoiceNumber,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="relative z-10 w-full max-w-120 rounded-[8px] bg-white p-12 dark:bg-dark-element"
      >
        <h2
          id="delete-title"
          className="mb-3 text-2xl font-bold text-ink dark:text-white"
        >
          Confirm Deletion
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          Are you sure you want to delete invoice #{invoiceNumber}? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-full bg-light-bg px-6 py-4 text-sm font-bold text-muted-light transition-colors hover:bg-lavender disabled:opacity-60 dark:bg-dark-surface dark:hover:bg-dark-bg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-full bg-danger px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-danger-hover disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-5 w-24 rounded bg-white dark:bg-dark-surface" />
      <div className="h-20 rounded-[8px] bg-white dark:bg-dark-surface" />
      <div className="h-96 rounded-[8px] bg-white dark:bg-dark-surface" />
    </div>
  );
}
