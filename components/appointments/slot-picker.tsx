"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAvailableSlots } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface SlotPickerProps {
  doctorId: string;
  date: string;
  value: string;
  onChange: (slot: string) => void;
}

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function SlotPicker({ doctorId, date, value, onChange }: SlotPickerProps) {
  const { data: slots, isLoading } = useQuery({
    queryKey: ["available-slots", doctorId, date],
    queryFn: () => fetchAvailableSlots(doctorId, date),
    enabled: !!doctorId && !!date,
  });

  if (!doctorId || !date) {
    return (
      <div className="flex items-center justify-center h-20 rounded-2xl border border-dashed border-border text-text-muted text-sm font-body">
        Select a doctor and date first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!slots?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border border-dashed border-border text-text-muted">
        <Clock size={18} />
        <p className="text-sm font-body">No available slots for this date</p>
      </div>
    );
  }

  // Group into AM / PM
  const am = slots.filter((s) => parseInt(s) < 12);
  const pm = slots.filter((s) => parseInt(s) >= 12);

  const SlotGroup = ({ label, items }: { label: string; items: string[] }) => (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-body font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {items.map((slot) => {
          const isSelected = value === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onChange(slot)}
              className={cn(
                "h-10 rounded-xl text-xs font-medium font-body border transition-all duration-100 cursor-pointer",
                isSelected
                  ? "bg-primary-500 text-white border-primary-500 shadow-glow-sm"
                  : "bg-surface border-border text-text-secondary hover:border-primary-500/40 hover:text-primary-400 hover:bg-primary-500/5",
              )}
            >
              {fmt12(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {am.length > 0 && <SlotGroup label="Morning" items={am} />}
      {pm.length > 0 && <SlotGroup label="Afternoon / Evening" items={pm} />}
    </div>
  );
}