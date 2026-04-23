"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { ChevronDown } from "lucide-react";
import { DatePicker } from "./date-picker";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";

type InvoiceDoc = Doc<"invoices">;

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  invoice?: InvoiceDoc;
}

const PAYMENT_TERMS = [
  { label: "Net 1 Day", value: 1 },
  { label: "Net 7 Days", value: 7 },
  { label: "Net 14 Days", value: 14 },
  { label: "Net 30 Days", value: 30 },
];

function buildDefaults(invoice?: InvoiceDoc): InvoiceFormValues {
  if (invoice) {
    return {
      senderAddress: invoice.senderAddress,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      issueDate: format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      paymentTerms: invoice.paymentTerms,
      description: invoice.description,
      items: invoice.items,
    };
  }
  return {
    senderAddress: { street: "", city: "", postCode: "", country: "" },
    clientName: "",
    clientEmail: "",
    clientAddress: { street: "", city: "", postCode: "", country: "" },
    issueDate: format(new Date(), "yyyy-MM-dd"),
    paymentTerms: 30,
    description: "",
    items: [
      {
        name: "",
        quantity: 1,
        price: undefined as unknown as number,
        total: 0,
      },
    ],
  };
}

export function InvoiceForm({ open, onClose, invoice }: InvoiceFormProps) {
  const createInvoice = useMutation(api.invoices.create);
  const updateInvoice = useMutation(api.invoices.update);
  const isEdit = !!invoice;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: buildDefaults(invoice),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  // Keep each item's total in sync with qty * price
  useEffect(() => {
    if (!watchedItems) return;

    watchedItems.forEach((item, index) => {
      const total = Number(item.quantity ?? 0) * Number(item.price ?? 0);
      if (Number(item.total ?? 0) !== total) {
        setValue(`items.${index}.total`, total, { shouldValidate: false });
      }
    });
  }, [setValue, watchedItems]);

  // Reset when editing a different invoice
  useEffect(() => {
    reset(buildDefaults(invoice));
  }, [invoice, reset]);

  // Reset + clear error when drawer closes
  useEffect(() => {
    if (!open) {
      reset(buildDefaults(invoice));
    }
  }, [open, invoice, reset]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function computePayload(values: InvoiceFormValues) {
    const issueDate = new Date(values.issueDate).getTime();
    const dueDate = addDays(
      new Date(values.issueDate),
      values.paymentTerms
    ).getTime();
    const total = values.items.reduce((sum, item) => sum + item.total, 0);
    return { ...values, issueDate, dueDate, total };
  }

  async function submitValidated(
    values: InvoiceFormValues,
    status: "draft" | "pending"
  ) {
    setSubmitError(null);
    try {
      const payload = computePayload(values);
      if (isEdit && invoice) {
        await updateInvoice({ id: invoice._id, ...payload, status });
      } else {
        await createInvoice({ ...payload, status });
      }
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  // Save as Draft bypasses validation — partial data is allowed
  async function saveDraft() {
    setSubmitError(null);
    try {
      const values = getValues();
      const payload = computePayload(values);
      if (isEdit && invoice) {
        await updateInvoice({ id: invoice._id, ...payload, status: "draft" });
      } else {
        await createInvoice({ ...payload, status: "draft" });
      }
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  function handleClose() {
    reset(buildDefaults(invoice));
    setSubmitError(null);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          isEdit ? `Edit invoice ${invoice?.invoiceNumber}` : "New invoice"
        }
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-full max-w-154",
          "flex flex-col bg-white dark:bg-dark-surface",
          "transition-transform duration-300 ease-in-out",
          "md:left-25.75 md:rounded-r-[20px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Title */}
        <div className="shrink-0 px-6 pt-10 pb-6 md:px-14">
          <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            {isEdit ? (
              <>
                Edit{" "}
                <span className="text-muted before:content-['#']">
                  {invoice.invoiceNumber}
                </span>
              </>
            ) : (
              "New Invoice"
            )}
          </h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-14">
          <form id="invoice-form" className="flex flex-col gap-10 pb-8">
            {/* Bill From */}
            <section className="flex flex-col gap-5">
              <h3 className="text-sm font-bold text-primary">Bill From</h3>

              <Field
                label="Street Address"
                error={errors.senderAddress?.street?.message}
              >
                <Input
                  hasError={!!errors.senderAddress?.street}
                  {...register("senderAddress.street")}
                />
              </Field>

              <div className="grid grid-cols-3 gap-6">
                <Field label="City" error={errors.senderAddress?.city?.message}>
                  <Input
                    hasError={!!errors.senderAddress?.city}
                    {...register("senderAddress.city")}
                  />
                </Field>
                <Field
                  label="Post Code"
                  error={errors.senderAddress?.postCode?.message}
                >
                  <Input
                    hasError={!!errors.senderAddress?.postCode}
                    {...register("senderAddress.postCode")}
                  />
                </Field>
                <Field
                  label="Country"
                  error={errors.senderAddress?.country?.message}
                >
                  <Input
                    hasError={!!errors.senderAddress?.country}
                    {...register("senderAddress.country")}
                  />
                </Field>
              </div>
            </section>

            {/* Bill To */}
            <section className="flex flex-col gap-5">
              <h3 className="text-sm font-bold text-primary">Bill To</h3>

              <Field label="Client's Name" error={errors.clientName?.message}>
                <Input
                  hasError={!!errors.clientName}
                  {...register("clientName")}
                />
              </Field>

              <Field label="Client's Email" error={errors.clientEmail?.message}>
                <Input
                  hasError={!!errors.clientEmail}
                  type="email"
                  {...register("clientEmail")}
                />
              </Field>

              <Field
                label="Street Address"
                error={errors.clientAddress?.street?.message}
              >
                <Input
                  hasError={!!errors.clientAddress?.street}
                  {...register("clientAddress.street")}
                />
              </Field>

              <div className="grid grid-cols-3 gap-6">
                <Field label="City" error={errors.clientAddress?.city?.message}>
                  <Input
                    hasError={!!errors.clientAddress?.city}
                    {...register("clientAddress.city")}
                  />
                </Field>
                <Field
                  label="Post Code"
                  error={errors.clientAddress?.postCode?.message}
                >
                  <Input
                    hasError={!!errors.clientAddress?.postCode}
                    {...register("clientAddress.postCode")}
                  />
                </Field>
                <Field
                  label="Country"
                  error={errors.clientAddress?.country?.message}
                >
                  <Input
                    hasError={!!errors.clientAddress?.country}
                    {...register("clientAddress.country")}
                  />
                </Field>
              </div>
            </section>

            {/* Date, Terms, Description */}
            <section className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-6">
                <Field
                  label={isEdit ? "Invoice Date" : "Issue Date"}
                  error={errors.issueDate?.message}
                >
                  <Controller
                    control={control}
                    name="issueDate"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isEdit}
                        hasError={!!errors.issueDate}
                      />
                    )}
                  />
                </Field>

                <Field
                  label="Payment Terms"
                  error={errors.paymentTerms?.message}
                >
                  <Controller
                    control={control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <PaymentTermsSelect
                        value={field.value}
                        onChange={field.onChange}
                        hasError={!!errors.paymentTerms}
                      />
                    )}
                  />
                </Field>
              </div>

              <Field
                label="Project Description"
                error={errors.description?.message}
              >
                <Input
                  hasError={!!errors.description}
                  {...register("description")}
                />
              </Field>
            </section>

            {/* Item List */}
            <section className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-[#777f98]">Item List</h3>

              {fields.length > 0 && (
                <div className="hidden grid-cols-[1fr_56px_96px_72px_20px] gap-4 md:grid">
                  {["Item Name", "Qty.", "Price", "Total", ""].map((h) => (
                    <span key={h} className="text-xs text-muted">
                      {h}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {fields.map((field, index) => {
                  const qty = Number(watchedItems?.[index]?.quantity ?? 0);
                  const price = Number(watchedItems?.[index]?.price ?? 0);
                  const total = qty * price;

                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_56px_96px_72px_20px] items-center gap-4"
                    >
                      <Input
                        hasError={!!errors.items?.[index]?.name}
                        placeholder="Item name"
                        {...register(`items.${index}.name`)}
                      />
                      <Input
                        hasError={!!errors.items?.[index]?.quantity}
                        type="number"
                        className="text-center"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                      <Input
                        hasError={!!errors.items?.[index]?.price}
                        type="number"
                        step={0.01}
                        {...register(`items.${index}.price`, {
                          valueAsNumber: true,
                        })}
                      />
                      <span className="self-center text-sm font-bold text-muted">
                        {formatAmount(total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label="Remove item"
                        className="self-center text-muted transition-colors hover:text-danger [&>svg_path]:fill-current"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  );
                })}
              </div>

              {errors.items && typeof errors.items.message === "string" && (
                <p className="text-xs text-danger">{errors.items.message}</p>
              )}

              <button
                type="button"
                onClick={() =>
                  append({
                    name: "",
                    quantity: 1,
                    price: undefined as unknown as number,
                    total: 0,
                  })
                }
                className="w-full rounded-3xl bg-light-bg py-4 text-sm font-bold text-muted transition-colors hover:bg-lavender dark:bg-dark-element dark:text-lavender dark:hover:bg-dark-surface"
              >
                + Add New Item
              </button>
            </section>

            {/* Submission error */}
            {submitError && (
              <p className="text-xs text-danger">{submitError}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-8 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:px-14 dark:shadow-[0_-8px_24px_rgba(0,0,0,0.3)]">
          {isEdit ? (
            <div className="flex justify-end gap-2">
              <FooterBtn
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </FooterBtn>
              <FooterBtn
                variant="primary"
                disabled={isSubmitting}
                onClick={handleSubmit((v) =>
                  submitValidated(
                    v,
                    invoice.status === "draft" ? "draft" : "pending"
                  )
                )}
              >
                {isSubmitting ? "Saving…" : "Save Changes"}
              </FooterBtn>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FooterBtn
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Discard
              </FooterBtn>
              <div className="flex-1" />
              <FooterBtn
                variant="dark"
                disabled={isSubmitting}
                onClick={saveDraft}
              >
                {isSubmitting ? "Saving…" : "Save as Draft"}
              </FooterBtn>
              <FooterBtn
                variant="primary"
                disabled={isSubmitting}
                onClick={handleSubmit((v) => submitValidated(v, "pending"))}
              >
                {isSubmitting ? "Saving…" : "Save & Send"}
              </FooterBtn>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const amountFormatter = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(value: number) {
  return amountFormatter.format(isNaN(value) ? 0 : value);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg
      width="13"
      height="16"
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.44442 0L9.33333 0.888875H12.4444V2.66667H0V0.888875H3.11108L4 0H8.44442ZM2.66667 16C1.68442 16 0.888875 15.2045 0.888875 14.2222V3.55554H11.5555V14.2222C11.5555 15.2045 10.76 16 9.77779 16H2.66667Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Payment Terms custom dropdown ────────────────────────────────────────────

interface PaymentTermsSelectProps {
  value: number;
  onChange: (value: number) => void;
  hasError: boolean;
}

function PaymentTermsSelect({
  value,
  onChange,
  hasError,
}: PaymentTermsSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = PAYMENT_TERMS.find((t) => t.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          inputBase(hasError),
          "flex items-center justify-between cursor-pointer"
        )}
      >
        <span>{selected?.label ?? "Select"}</span>
        <ChevronDown
          size={16}
          className={cn(
            "text-primary transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-[8px] bg-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:bg-dark-element dark:shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
          {PAYMENT_TERMS.map((t, i) => (
            <li key={t.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(t.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-6 py-4 text-left text-sm font-bold transition-colors",
                  "text-ink dark:text-white hover:text-primary dark:hover:text-primary",
                  i !== PAYMENT_TERMS.length - 1 &&
                    "border-b border-lavender dark:border-dark-surface",
                  value === t.value && "text-primary"
                )}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function inputBase(hasError: boolean) {
  return cn(
    "w-full rounded-sm border px-5 py-4 text-sm font-bold",
    "text-ink dark:text-white",
    "bg-white dark:bg-dark-element",
    "transition-colors focus:outline-none focus:border-primary",
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
    hasError ? "border-danger" : "border-lavender dark:border-dark-element"
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

function Input({ hasError = false, className, ...props }: InputProps) {
  return <input className={cn(inputBase(hasError), className)} {...props} />;
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs",
            error ? "text-danger" : "text-muted dark:text-muted-light"
          )}
        >
          {label}
        </span>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "dark";

interface FooterBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: BtnVariant;
}

function FooterBtn({ variant, className, children, ...props }: FooterBtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-6 py-4 text-sm font-bold transition-colors disabled:opacity-60",
        variant === "primary" && "bg-primary text-white hover:bg-primary-hover",
        variant === "ghost" &&
          "bg-light-bg text-muted hover:bg-lavender dark:bg-dark-element dark:text-lavender dark:hover:bg-dark-surface",
        variant === "dark" &&
          "bg-draft text-lavender hover:bg-ink dark:bg-dark-element dark:text-lavender dark:hover:bg-dark-bg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
