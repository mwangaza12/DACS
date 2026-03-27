"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAppointmentById, updateAppointment, cancelAppointment } from "@/lib/queries";
import { StatusBadge, TypeBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  X, Calendar, Clock, User, Stethoscope, FileText,
  CheckCircle, XCircle, AlertTriangle, RotateCcw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { APPOINTMENT_STATUSES, STATUS_LABELS } from "@/lib/appointment-utils";

interface AppointmentDrawerProps {
  appointmentId: string | null;
  onClose: () => void;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  scheduled:   ["confirmed", "cancelled", "no_show"],
  confirmed:   ["in_progress", "cancelled", "no_show"],
  in_progress: ["completed", "cancelled"],
  rescheduled: ["confirmed", "cancelled"],
  completed:   [],
  cancelled:   [],
  no_show:     [],
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  confirmed:   <CheckCircle size={13} />,
  in_progress: <RotateCcw size={13} />,
  completed:   <CheckCircle size={13} />,
  cancelled:   <XCircle size={13} />,
  no_show:     <AlertTriangle size={13} />,
};

export function AppointmentDrawer({ appointmentId, onClose }: AppointmentDrawerProps) {
  const { isAdmin, isDoctor } = useAuthStore();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);

  const canEdit = isAdmin() || isDoctor();

  const { data: appt, isLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => fetchAppointmentById(appointmentId!),
    enabled: !!appointmentId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowCancelInput(false);
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (!appointmentId) return;
    if (newStatus === "cancelled") {
      setShowCancelInput(true);
      return;
    }
    updateMutation.mutate({ id: appointmentId, data: { appointmentStatus: newStatus } });
  };

  const handleCancel = () => {
    if (!appointmentId) return;
    cancelMutation.mutate({ id: appointmentId, reason: cancelReason });
  };

  const transitions = appt ? (STATUS_TRANSITIONS[appt.appointmentStatus] ?? []) : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-canvas/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          appointmentId ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50",
        "transition-transform duration-300 ease-out overflow-y-auto",
        appointmentId ? "translate-x-0" : "translate-x-full",
      )}>
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="font-display font-bold text-base text-text-primary">Appointment details</p>
            {appt && <p className="text-xs text-text-tertiary font-body mt-0.5">{appt.appointmentId.slice(0, 8)}…</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-text-secondary hover:text-text-primary hover:border-primary-500/40 transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {isLoading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {appt && (
            <>
              {/* Status + type */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={appt.appointmentStatus} />
                <TypeBadge type={appt.appointmentType} />
              </div>

              {/* Details grid */}
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: <Calendar size={14} />,
                    label: "Date",
                    value: (() => { try { return format(parseISO(appt.appointmentDate), "EEEE, MMMM d yyyy"); } catch { return appt.appointmentDate; } })(),
                  },
                  {
                    icon: <Clock size={14} />,
                    label: "Time",
                    value: `${appt.appointmentTime.slice(0, 5)} – ${appt.endTime.slice(0, 5)}`,
                  },
                  {
                    icon: <User size={14} />,
                    label: "Patient ID",
                    value: appt.patientId.slice(0, 16) + "…",
                  },
                  {
                    icon: <Stethoscope size={14} />,
                    label: "Doctor ID",
                    value: appt.doctorId.slice(0, 16) + "…",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/60">
                    <span className="text-text-tertiary mt-0.5 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-sm text-text-primary font-body">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reason / notes */}
              {(appt.reason || appt.notes) && (
                <div className="flex flex-col gap-2">
                  {appt.reason && (
                    <div className="p-3 rounded-xl bg-card border border-border/60">
                      <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <FileText size={11} /> Reason
                      </p>
                      <p className="text-sm text-text-secondary font-body leading-relaxed">{appt.reason}</p>
                    </div>
                  )}
                  {appt.notes && (
                    <div className="p-3 rounded-xl bg-card border border-border/60">
                      <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <FileText size={11} /> Notes
                      </p>
                      <p className="text-sm text-text-secondary font-body leading-relaxed">{appt.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cancellation reason */}
              {appt.appointmentStatus === "cancelled" && appt.cancellationReason && (
                <div className="p-3 rounded-xl bg-danger/5 border border-danger/20">
                  <p className="text-[11px] text-danger/70 font-body uppercase tracking-wider mb-1">Cancellation reason</p>
                  <p className="text-sm text-danger/80 font-body">{appt.cancellationReason}</p>
                </div>
              )}

              {/* Status actions — admin/doctor only */}
              {canEdit && transitions.length > 0 && !showCancelInput && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-text-secondary font-body">Update status</p>
                  <div className="flex flex-wrap gap-2">
                    {transitions.map((newStatus) => (
                      <button
                        key={newStatus}
                        type="button"
                        onClick={() => handleStatusChange(newStatus)}
                        disabled={updateMutation.isPending}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium font-body",
                          "transition-all duration-150 cursor-pointer disabled:opacity-50",
                          newStatus === "cancelled" || newStatus === "no_show"
                            ? "bg-danger/10 text-danger border-danger/20 hover:bg-danger/20"
                            : newStatus === "completed"
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                            : "bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20",
                        )}
                      >
                        {STATUS_ICONS[newStatus]}
                        {STATUS_LABELS[newStatus]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancel with reason */}
              {showCancelInput && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-danger/5 border border-danger/20">
                  <p className="text-sm font-medium text-danger font-body">Cancel appointment</p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)…"
                    rows={3}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary font-body placeholder:text-text-muted resize-none focus:outline-none focus:border-danger/50 focus:ring-2 focus:ring-danger/20"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCancelInput(false)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancelMutation.isPending}
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Confirm cancellation
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}