"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDoctorById, fetchDoctorAvailability, updateDoctorAvailability } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, Building2, CreditCard, Hash, Clock, Plus, Trash2, CheckCircle } from "lucide-react";

const DAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

type AvailabilitySlot = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

type AvailabilityRecord = {
  doctorAvailabilityId: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => fetchDoctorById(id),
    enabled: !!id,
  });

  const { data: availability, isLoading: avLoading } = useQuery({
    queryKey: ["doctor-availability", id],
    queryFn: () => fetchDoctorAvailability(id),
    enabled: !!id,
  });

  // Sync availability into editable slots when not editing
  const currentSlots = editingAvailability
    ? slots
    : (availability ?? []).map((s: AvailabilityRecord) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration,
        isActive: s.isActive ?? true,
      }));

  const startEditing = () => {
    setSlots(
      (availability ?? []).map((s: AvailabilityRecord) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration,
        isActive: s.isActive ?? true,
      }))
    );
    setEditingAvailability(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => updateDoctorAvailability(id, slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-availability", id] });
      setEditingAvailability(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { dayOfWeek: "1", startTime: "08:00:00", endTime: "17:00:00", slotDuration: 30, isActive: true },
    ]);
  };

  const removeSlot = (i: number) => setSlots((prev) => prev.filter((_, idx) => idx !== i));

  const updateSlot = (i: number, field: keyof AvailabilitySlot, value: string | number | boolean) => {
    setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h2 className="font-display font-bold text-lg text-text-primary tracking-tight">Doctor profile</h2>
      </div>

      {/* Hero card */}
      {isLoading ? (
        <div className="rounded-2xl bg-card border border-border p-6 flex items-center gap-5 mb-4">
          <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ) : doctor && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-xl text-teal-400">
                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl text-text-primary mb-1 tracking-tight">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              {doctor.specialization && (
                <p className="text-sm text-teal-400 font-body mb-2">{doctor.specialization}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {([
                  { icon: <Building2 size={11} />, value: doctor.department },
                  { icon: <Hash size={11} />, value: doctor.licenseNumber },
                  { icon: <CreditCard size={11} />, value: doctor.consultationFee ? `KES ${Number(doctor.consultationFee).toLocaleString()}` : null },
                ] as { icon: React.ReactNode; value: string | null | undefined }[]).filter((i) => i.value).map(({ icon, value }) => (
                  <div key={String(value)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-body text-text-secondary">
                    <span className="text-text-muted">{icon}</span>
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Availability section */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Clock size={13} className="text-primary-400" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-text-primary">Availability schedule</p>
              <p className="text-xs text-text-tertiary font-body mt-0.5">Weekly working hours</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-success font-body animate-fade-in">
                <CheckCircle size={12} /> Saved
              </div>
            )}
            {editingAvailability ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditingAvailability(false)}>Cancel</Button>
                <Button size="sm" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save changes</Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={startEditing}>Edit schedule</Button>
            )}
          </div>
        </div>

        {avLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : !editingAvailability ? (
          currentSlots.length === 0 ? (
            <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-border text-text-muted text-sm font-body">
              No schedule set — click &ldquo;Edit schedule&rdquo; to add working hours
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {currentSlots.map((slot, i) => {
                const day = DAYS.find((d) => d.value === slot.dayOfWeek)?.label ?? slot.dayOfWeek;
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    slot.isActive ? "bg-surface border-border/60" : "bg-surface/50 border-border/30 opacity-50",
                  )}>
                    <div className="w-20 flex-shrink-0">
                      <p className="text-xs font-medium text-text-primary font-body">{day}</p>
                      {!slot.isActive && <p className="text-[10px] text-text-muted font-body">Inactive</p>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary font-body flex-1">
                      <Clock size={11} className="text-text-muted" />
                      {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}
                    </div>
                    <span className="text-[11px] text-text-muted font-body px-2 py-1 rounded-lg bg-card border border-border/60">
                      {slot.slotDuration} min slots
                    </span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {slots.map((slot, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface border border-border/60 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <select
                    value={slot.dayOfWeek}
                    onChange={(e) => updateSlot(i, "dayOfWeek", e.target.value)}
                    className="flex-1 h-8 px-2 rounded-lg bg-card border border-border text-xs text-text-primary font-body appearance-none cursor-pointer focus:outline-none focus:border-primary-500/50"
                  >
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value} className="bg-card">{d.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateSlot(i, "isActive", !slot.isActive)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[11px] font-medium font-body border transition-all cursor-pointer",
                      slot.isActive ? "bg-success/10 text-success border-success/20" : "bg-border text-text-muted border-border",
                    )}
                  >
                    {slot.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[11px] text-text-muted font-body w-10">Start</span>
                    <input type="time" value={slot.startTime.slice(0, 5)}
                      onChange={(e) => updateSlot(i, "startTime", e.target.value + ":00")}
                      className="flex-1 h-8 px-2 rounded-lg bg-card border border-border text-xs text-text-primary font-body focus:outline-none focus:border-primary-500/50" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[11px] text-text-muted font-body w-8">End</span>
                    <input type="time" value={slot.endTime.slice(0, 5)}
                      onChange={(e) => updateSlot(i, "endTime", e.target.value + ":00")}
                      className="flex-1 h-8 px-2 rounded-lg bg-card border border-border text-xs text-text-primary font-body focus:outline-none focus:border-primary-500/50" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-text-muted font-body">Slot</span>
                    <select value={slot.slotDuration} onChange={(e) => updateSlot(i, "slotDuration", Number(e.target.value))}
                      className="h-8 px-2 rounded-lg bg-card border border-border text-xs text-text-primary font-body appearance-none cursor-pointer focus:outline-none">
                      {[15, 20, 30, 45, 60].map((m) => (
                        <option key={m} value={m} className="bg-card">{m} min</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSlot}
              className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border text-xs text-text-muted hover:text-primary-400 hover:border-primary-500/40 transition-all cursor-pointer font-body"
            >
              <Plus size={13} /> Add day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}