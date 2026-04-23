import { cn } from "@/lib/utils";

type Status = "paid" | "pending" | "draft";

const config: Record<Status, { label: string; classes: string }> = {
  paid: {
    label: "Paid",
    classes: "bg-[#33D69F]/[0.06] text-paid dark:bg-[#33D69F]/[0.06]",
  },
  pending: {
    label: "Pending",
    classes: "bg-[#FF8F00]/[0.06] text-pending dark:bg-[#FF8F00]/[0.06]",
  },
  draft: {
    label: "Draft",
    classes:
      "bg-[#373B53]/[0.06] text-draft dark:bg-[#DFE3FA]/[0.06] dark:text-lavender",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, classes } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold min-w-26 justify-center",
        classes
      )}
    >
      <span className="w-2 h-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
