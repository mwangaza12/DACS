"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAppointments } from "@/lib/queries";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function MiniCalendar() {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0 = Sunday

  const { data: appointments } = useQuery({
    queryKey: ["appointments", "calendar"],
    queryFn: () => fetchAppointments({ limit: 100, page: 1 }),
  });

  // Count appointments per date
  const countByDate: Record<string, number> = {};
  (appointments ?? []).forEach((a) => {
    const d = a.appointmentDate.slice(0, 10);
    countByDate[d] = (countByDate[d] ?? 0) + 1;
  });

  const todayStr = format(today, "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-sm text-text-primary">
          {MONTH_LABELS[today.getMonth()]} {today.getFullYear()}
        </p>
        <a href="/appointments" className="text-xs text-primary-400 hover:text-primary-300 font-body transition-colors">
          Full calendar →
        </a>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] text-text-muted font-body font-medium py-1">
            {d}
          </div>
        ))}

        {/* Empty padding cells */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const str = format(day, "yyyy-MM-dd");
          const count = countByDate[str] ?? 0;
          const isToday = str === todayStr;
          const isPast = day < today && !isToday;

          return (
            <div
              key={str}
              className={cn(
                "aspect-square flex items-center justify-center rounded-lg text-[11px] font-body relative",
                "transition-all duration-100 cursor-default",
                isToday && "bg-primary-500 text-white font-bold shadow-glow-sm",
                !isToday && count > 0 && count < 3 && "bg-primary-500/15 text-primary-400",
                !isToday && count >= 3 && count < 6 && "bg-primary-500/30 text-primary-300",
                !isToday && count >= 6 && "bg-primary-500/50 text-primary-200",
                !isToday && count === 0 && isPast && "text-text-muted",
                !isToday && count === 0 && !isPast && "text-text-secondary hover:bg-surface",
              )}
              title={count > 0 ? `${count} appointment${count !== 1 ? "s" : ""}` : undefined}
            >
              {day.getDate()}
              {/* Dot for appointments */}
              {count > 0 && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[10px] text-text-muted font-body">Appointment density:</span>
        <div className="flex items-center gap-1">
          {[
            { label: "Low",  cls: "bg-primary-500/15" },
            { label: "Med",  cls: "bg-primary-500/30" },
            { label: "High", cls: "bg-primary-500/50" },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("w-3 h-3 rounded", cls)} />
              <span className="text-[10px] text-text-muted font-body">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}