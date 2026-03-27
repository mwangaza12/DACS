import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES, TYPE_LABELS, TYPE_STYLES } from "@/lib/appointment-utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.scheduled;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-body font-semibold",
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      s.bg, s.text, s.border,
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", s.dot)} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface TypeBadgeProps {
  type: string;
  size?: "sm" | "md";
}

export function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-lg font-body font-medium",
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      TYPE_STYLES[type] ?? TYPE_STYLES.regular,
    )}>
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}