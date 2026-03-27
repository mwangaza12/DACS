export const APPOINTMENT_STATUSES = [
  "scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show", "rescheduled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_TYPES = [
  "regular", "follow_up", "emergency", "consultation", "procedure",
] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const STATUS_LABELS: Record<string, string> = {
  scheduled:   "Scheduled",
  confirmed:   "Confirmed",
  in_progress: "In progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
  no_show:     "No-show",
  rescheduled: "Rescheduled",
};

export const TYPE_LABELS: Record<string, string> = {
  regular:      "Regular",
  follow_up:    "Follow-up",
  emergency:    "Emergency",
  consultation: "Consultation",
  procedure:    "Procedure",
};

export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  scheduled:   { bg: "bg-primary-500/10",  text: "text-primary-400", border: "border-primary-500/20",  dot: "bg-primary-400" },
  confirmed:   { bg: "bg-teal-500/10",     text: "text-teal-400",    border: "border-teal-500/20",     dot: "bg-teal-400" },
  in_progress: { bg: "bg-warning/10",      text: "text-warning",     border: "border-warning/20",      dot: "bg-warning" },
  completed:   { bg: "bg-success/10",      text: "text-success",     border: "border-success/20",      dot: "bg-success" },
  cancelled:   { bg: "bg-danger/10",       text: "text-danger",      border: "border-danger/20",       dot: "bg-danger" },
  no_show:     { bg: "bg-border",          text: "text-text-muted",  border: "border-border",          dot: "bg-text-muted" },
  rescheduled: { bg: "bg-violet-500/10",   text: "text-violet-400",  border: "border-violet-500/20",   dot: "bg-violet-400" },
};

export const TYPE_STYLES: Record<string, string> = {
  regular:      "bg-primary-500/8  text-primary-400",
  follow_up:    "bg-teal-500/8     text-teal-400",
  emergency:    "bg-danger/8       text-danger",
  consultation: "bg-warning/8      text-warning",
  procedure:    "bg-violet-500/8   text-violet-400",
};

export function statusBadgeClass(status: string) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.scheduled;
  return `${s.bg} ${s.text} ${s.border}`;
}