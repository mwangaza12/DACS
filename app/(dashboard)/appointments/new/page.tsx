"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createAppointment } from "@/lib/queries";
import { DoctorPicker } from "@/components/appointments/doctor-picker";
import { SlotPicker } from "@/components/appointments/slot-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle, ChevronRight, Calendar, Stethoscope, Clock, ClipboardList } from "lucide-react";
import { format, addMinutes, parse } from "date-fns";
import { APPOINTMENT_TYPES, TYPE_LABELS } from "@/lib/appointment-utils";

type Step = "doctor" | "datetime" | "details" | "confirm";

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "doctor",   label: "Doctor",   icon: <Stethoscope size={14} /> },
  { id: "datetime", label: "Date & time", icon: <Calendar size={14} /> },
  { id: "details",  label: "Details",  icon: <ClipboardList size={14} /> },
  { id: "confirm",  label: "Confirm",  icon: <CheckCircle size={14} /> },
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const { user, isPatient } = useAuthStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("doctor");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [apptType, setApptType] = useState("regular");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      router.push("/appointments");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to create appointment.";
      setServerError(msg);
    },
  });

  // Calculate endTime = slot + 30 min
  const endTime = (() => {
    if (!slot) return "";
    try {
      const base = parse(slot, "HH:mm:ss", new Date());
      return format(addMinutes(base, 30), "HH:mm:ss");
    } catch {
      return "";
    }
  })();

  const handleSubmit = () => {
    if (!user) return;
    setServerError(null);
    mutation.mutate({
      patientId: user.userId,
      doctorId,
      appointmentDate: date,
      appointmentTime: slot,
      endTime,
      appointmentType: apptType,
      reason: reason || undefined,
      notes: notes || undefined,
    });
  };

  const canNext = () => {
    if (step === "doctor")   return !!doctorId;
    if (step === "datetime") return !!date && !!slot;
    if (step === "details")  return true;
    return false;
  };

  const next = () => {
    const order: Step[] = ["doctor", "datetime", "details", "confirm"];
    const i = order.indexOf(step);
    if (i < order.length - 1) setStep(order[i + 1]);
  };

  const back = () => {
    const order: Step[] = ["doctor", "datetime", "details", "confirm"];
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h2 className="font-display font-bold text-lg text-text-primary tracking-tight">Book appointment</h2>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                // Allow going back to completed steps
                if (i < stepIndex) setStep(s.id);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-body transition-all",
                i === stepIndex && "bg-primary-500 text-white shadow-glow-sm",
                i < stepIndex  && "bg-primary-500/15 text-primary-400 border border-primary-500/25 cursor-pointer hover:bg-primary-500/25",
                i > stepIndex  && "bg-surface text-text-muted border border-border cursor-default",
              )}
            >
              {i < stepIndex ? <CheckCircle size={12} /> : s.icon}
              {s.label}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-text-muted flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-card border border-border p-6">

        {serverError && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-danger/30 flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-danger/20 border border-danger/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-danger" />
            </div>
            <p className="text-sm text-danger/90 font-body">{serverError}</p>
          </div>
        )}

        {/* Step 1 — Doctor */}
        {step === "doctor" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-display font-bold text-base text-text-primary mb-1">Choose a doctor</h3>
              <p className="text-sm text-text-tertiary font-body">Select the doctor you want to book with</p>
            </div>
            <DoctorPicker value={doctorId} onChange={setDoctorId} />
          </div>
        )}

        {/* Step 2 — Date & time */}
        {step === "datetime" && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="font-display font-bold text-base text-text-primary mb-1">Pick a date & time</h3>
              <p className="text-sm text-text-tertiary font-body">Choose from the available slots</p>
            </div>
            <Input
              label="Appointment date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSlot(""); }}
              min={format(new Date(), "yyyy-MM-dd")}
              leftIcon={<Calendar size={15} />}
            />
            {date && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider font-body flex items-center gap-1.5">
                  <Clock size={12} /> Available slots
                </label>
                <SlotPicker
                  doctorId={doctorId}
                  date={date}
                  value={slot}
                  onChange={setSlot}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Details */}
        {step === "details" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-display font-bold text-base text-text-primary mb-1">Appointment details</h3>
              <p className="text-sm text-text-tertiary font-body">Tell us a bit more about your visit</p>
            </div>
            <Select
              label="Appointment type"
              value={apptType}
              onChange={(e) => setApptType(e.target.value)}
              options={APPOINTMENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider font-body">
                Reason for visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or the purpose of your visit…"
                rows={3}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted resize-none focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider font-body">
                Additional notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any allergies, current medications, or other relevant information…"
                rows={2}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted resize-none focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 4 — Confirm */}
        {step === "confirm" && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="font-display font-bold text-base text-text-primary mb-1">Confirm booking</h3>
              <p className="text-sm text-text-tertiary font-body">Review your appointment before confirming</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: <Stethoscope size={14} />, label: "Doctor",   value: `Doctor ID: ${doctorId.slice(0, 16)}…` },
                { icon: <Calendar size={14} />,    label: "Date",     value: date },
                { icon: <Clock size={14} />,       label: "Time",     value: slot ? `${slot.slice(0,5)} – ${endTime.slice(0,5)}` : "—" },
                { icon: <ClipboardList size={14} />, label: "Type",   value: TYPE_LABELS[apptType] ?? apptType },
                ...(reason ? [{ icon: <ClipboardList size={14} />, label: "Reason", value: reason }] : []),
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border/60">
                  <span className="text-text-tertiary mt-0.5 flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm text-text-primary font-body leading-relaxed">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Glow CTA */}
            <div className="relative overflow-hidden rounded-2xl bg-primary-500/10 border border-primary-500/25 p-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/15 rounded-full blur-2xl -translate-x-4 -translate-y-4 pointer-events-none" />
              <p className="text-sm text-text-secondary font-body relative z-10">
                By confirming, your appointment will be <span className="text-primary-400 font-medium">scheduled</span> and the doctor will be notified.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-5 border-t border-border/60">
          {step !== "doctor" && (
            <Button variant="secondary" onClick={back} className="flex-1">
              <ArrowLeft size={14} /> Back
            </Button>
          )}
          {step !== "confirm" ? (
            <Button
              onClick={next}
              disabled={!canNext()}
              className="flex-1 font-display font-bold"
            >
              Continue <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={mutation.isPending}
              className="flex-1 font-display font-bold"
            >
              Confirm booking <CheckCircle size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}