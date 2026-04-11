"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAppointmentById, updateAppointment, cancelAppointment } from "@/lib/queries";
import { StatusBadge, TypeBadge } from "@/components/appointments/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft, Calendar, Clock, User, Stethoscope,
  FileText, CheckCircle, XCircle, RotateCcw, AlertTriangle,
  Phone, Mail, Banknote,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/appointment-utils";
import { useState } from "react";
import type { AppointmentStatus, AppointmentType } from "@/types";

const TRANSITIONS: Record<string, AppointmentStatus[]> = {
  scheduled:   ["confirmed", "cancelled", "no_show"],
  confirmed:   ["in_progress", "cancelled", "no_show"],
  in_progress: ["completed", "cancelled"],
  rescheduled: ["confirmed", "cancelled"],
  completed:   [],
  cancelled:   [],
  no_show:     [],
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  confirmed:   <CheckCircle size={14} />,
  in_progress: <RotateCcw size={14} />,
  completed:   <CheckCircle size={14} />,
  cancelled:   <XCircle size={14} />,
  no_show:     <AlertTriangle size={14} />,
};

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, isDoctor } = useAuthStore();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);

  const { data: appt, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => fetchAppointmentById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<{ appointmentStatus: AppointmentStatus; appointmentType: AppointmentType }>) =>
      updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowCancelInput(false);
      setCancelReason("");
    },
  });

  const canEdit = isAdmin() || isDoctor();
  const transitions = appt ? (TRANSITIONS[appt.appointmentStatus] ?? []) : [];

  // Derived display values from relations
  const patientName = appt
    ? `${appt.patient.firstName} ${appt.patient.lastName}`
    : null;
  const doctorName = appt
    ? `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`
    : null;
  const patientEmail = appt?.patient?.user?.email ?? null;
  const patientPhone = appt?.patient?.user?.phone ?? null;
  const consultationFee = appt?.doctor?.consultationFee ?? null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h2 className="font-display font-bold text-lg text-text-primary tracking-tight">
          Appointment details
        </h2>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-card border border-border p-6 flex flex-col gap-4">
          <Skeleton className="h-7 w-48 rounded-full" />
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !appt ? (
        <div className="rounded-2xl bg-card border border-border p-12 text-center text-text-tertiary font-body">
          Appointment not found
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {/* Status banner */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <StatusBadge status={appt.appointmentStatus} />
              <TypeBadge type={appt.appointmentType} />
              <span className="text-xs text-text-muted font-body font-mono">
                {appt.appointmentId.slice(0, 16)}…
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: <Calendar size={14} />,
                  label: "Date",
                  value: (() => {
                    try { return format(parseISO(appt.appointmentDate), "EEEE, MMMM d yyyy"); }
                    catch { return appt.appointmentDate; }
                  })(),
                },
                {
                  icon: <Clock size={14} />,
                  label: "Time",
                  value: `${appt.appointmentTime.slice(0, 5)} – ${appt.endTime.slice(0, 5)}`,
                },
                {
                  icon: <User size={14} />,
                  label: "Patient",
                  value: patientName ?? appt.patientId.slice(0, 16) + "…",
                },
                {
                  icon: <Stethoscope size={14} />,
                  label: "Doctor",
                  value: doctorName ?? appt.doctorId.slice(0, 16) + "…",
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-surface border border-border/60">
                  <div className="flex items-center gap-1.5 text-text-muted mb-1">
                    {icon}
                    <span className="text-[10px] uppercase tracking-wider font-body font-semibold">
                      {label}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary font-body leading-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Patient contact + fee */}
          {(patientEmail || patientPhone || consultationFee) && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-3">
                Contact & billing
              </p>
              <div className="flex flex-col gap-2">
                {patientEmail && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-body">
                    <Mail size={13} className="text-text-muted shrink-0" />
                    {patientEmail}
                  </div>
                )}
                {patientPhone && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-body">
                    <Phone size={13} className="text-text-muted shrink-0" />
                    {patientPhone}
                  </div>
                )}
                {consultationFee && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-body">
                    <Banknote size={13} className="text-text-muted shrink-0" />
                    Consultation fee: <span className="font-semibold text-text-primary">
                      KES {parseFloat(consultationFee).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bill summary (if appointment is completed and bill exists) */}
          {appt.bill && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-3">
                Bill summary
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total",     value: `KES ${parseFloat(appt.bill.amount ?? "0").toLocaleString()}` },
                  { label: "Insurance", value: `KES ${parseFloat(appt.bill.insuranceCovered ?? "0").toLocaleString()}` },
                  { label: "Payable",   value: `KES ${parseFloat(appt.bill.patientPayable).toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-surface border border-border/60 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-text-primary font-body">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-text-muted font-body">Status</span>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  appt.bill.billStatus === "paid"
                    ? "bg-green-500/10 text-green-500"
                    : appt.bill.billStatus === "pending"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-text-muted/10 text-text-muted"
                )}>
                  {appt.bill.billStatus}
                </span>
              </div>
            </div>
          )}

          {/* Reason / Notes */}
          {(appt.reason || appt.notes) && (
            <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3">
              {appt.reason && (
                <div>
                  <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText size={11} /> Reason for visit
                  </p>
                  <p className="text-sm text-text-secondary font-body leading-relaxed">{appt.reason}</p>
                </div>
              )}
              {appt.notes && (
                <div>
                  <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText size={11} /> Notes
                  </p>
                  <p className="text-sm text-text-secondary font-body leading-relaxed">{appt.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation reason */}
          {appt.appointmentStatus === "cancelled" && appt.cancellationReason && (
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-5">
              <p className="text-[11px] text-red-500/60 font-body uppercase tracking-wider mb-1.5">
                Cancellation reason
              </p>
              <p className="text-sm text-red-500/80 font-body">{appt.cancellationReason}</p>
            </div>
          )}

          {/* Status actions */}
          {canEdit && transitions.length > 0 && !showCancelInput && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <p className="text-xs font-medium text-text-secondary font-body mb-3">Update status</p>
              <div className="flex flex-wrap gap-2">
                {transitions.map((s) => {
                  const isDestructive = s === "cancelled" || s === "no_show";
                  const isSuccess = s === "completed";
                  return (
                    <Button
                      key={s}
                      variant={isDestructive ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() =>
                        s === "cancelled"
                          ? setShowCancelInput(true)
                          : updateMutation.mutate({ appointmentStatus: s })
                      }
                      disabled={updateMutation.isPending}
                      className={cn(
                        "flex items-center gap-1.5",
                        isDestructive && "bg-red-500/10 text-red-500 hover:bg-red-500/20",
                        isSuccess && "bg-green-500/10 text-green-500 hover:bg-green-500/20",
                      )}
                    >
                      {STATUS_ICONS[s]}
                      {STATUS_LABELS[s]}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancel form */}
          {showCancelInput && (
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-5 flex flex-col gap-3">
              <p className="text-sm font-medium text-red-500 font-body">Cancel appointment</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)…"
                rows={3}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary font-body placeholder:text-text-muted resize-none focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelInput(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(cancelReason)}
                  className="flex-1"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Confirm cancellation"}
                </Button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}