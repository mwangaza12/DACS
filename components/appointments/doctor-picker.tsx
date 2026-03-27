"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDoctors } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Check, Stethoscope } from "lucide-react";

interface DoctorPickerProps {
  value: string;
  onChange: (doctorId: string) => void;
}

export function DoctorPicker({ value, onChange }: DoctorPickerProps) {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchDoctors(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!doctors?.length) {
    return (
      <div className="flex items-center justify-center h-24 rounded-2xl border border-border bg-surface text-text-tertiary text-sm font-body">
        No doctors available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {doctors.map((doc) => {
        const isSelected = value === doc.doctorId;
        return (
          <button
            key={doc.doctorId}
            type="button"
            onClick={() => onChange(doc.doctorId)}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border text-left",
              "transition-all duration-150 cursor-pointer group",
              isSelected
                ? "bg-primary-500/10 border-primary-500/40 shadow-glow-sm"
                : "bg-surface border-border hover:border-primary-500/30 hover:bg-card",
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
              isSelected
                ? "bg-primary-500/20 border border-primary-500/40 text-primary-400"
                : "bg-card border border-border text-text-muted group-hover:text-text-secondary",
            )}>
              <Stethoscope size={16} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium font-body truncate",
                isSelected ? "text-primary-300" : "text-text-primary",
              )}>
                Dr. {doc.firstName} {doc.lastName}
              </p>
              <p className="text-xs text-text-tertiary font-body truncate mt-0.5">
                {doc.specialization ?? "General Practice"}
                {doc.consultationFee ? ` · KES ${Number(doc.consultationFee).toLocaleString()}` : ""}
              </p>
            </div>

            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}