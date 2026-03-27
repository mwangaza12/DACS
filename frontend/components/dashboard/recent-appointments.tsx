"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAppointments } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Calendar, Clock } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  scheduled:   "bg-primary-500/10 text-primary-400 border-primary-500/20",
  confirmed:   "bg-teal-500/10 text-teal-400 border-teal-500/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  completed:   "bg-success/10 text-success border-success/20",
  cancelled:   "bg-danger/10 text-danger border-danger/20",
  no_show:     "bg-border text-text-muted border-border",
  rescheduled: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled:   "Scheduled",
  confirmed:   "Confirmed",
  in_progress: "In progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
  no_show:     "No-show",
  rescheduled: "Rescheduled",
};

const TYPE_LABELS: Record<string, string> = {
  regular:      "Regular",
  follow_up:    "Follow-up",
  emergency:    "Emergency",
  consultation: "Consultation",
  procedure:    "Procedure",
};

export function RecentAppointments() {
  const { data, isLoading } = useQuery({
    queryKey: ["appointments", "recent"],
    queryFn: () => fetchAppointments({ limit: 6, page: 1 }),
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-sm text-text-primary">Recent appointments</p>
          <p className="text-xs text-text-tertiary font-body mt-0.5">Latest activity</p>
        </div>
        <a
          href="/appointments"
          className="text-xs text-primary-400 hover:text-primary-300 font-medium font-body transition-colors"
        >
          View all →
        </a>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/60">
                <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))
          : !data?.length
          ? (
              <div className="flex items-center justify-center h-32 text-text-tertiary text-sm font-body">
                No appointments yet
              </div>
            )
          : data.map((appt) => {
              const dateStr = (() => {
                try {
                  return format(parseISO(appt.appointmentDate), "MMM d, yyyy");
                } catch {
                  return appt.appointmentDate;
                }
              })();
              const timeStr = appt.appointmentTime.slice(0, 5);

              return (
                <a
                  key={appt.appointmentId}
                  href={`/appointments/${appt.appointmentId}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/60 hover:border-primary-500/30 hover:bg-card transition-all duration-150 group"
                >
                  {/* Date block */}
                  <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex flex-col items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-primary-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary font-body truncate">
                      {TYPE_LABELS[appt.appointmentType] ?? appt.appointmentType}
                      {appt.reason ? ` — ${appt.reason}` : ""}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} className="text-text-muted" />
                      <p className="text-[11px] text-text-tertiary font-body">
                        {dateStr} at {timeStr}
                      </p>
                    </div>
                  </div>

                  <span className={cn(
                    "flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold font-body border",
                    STATUS_STYLES[appt.appointmentStatus] ?? STATUS_STYLES.scheduled,
                  )}>
                    {STATUS_LABELS[appt.appointmentStatus] ?? appt.appointmentStatus}
                  </span>
                </a>
              );
            })}
      </div>
    </div>
  );
}