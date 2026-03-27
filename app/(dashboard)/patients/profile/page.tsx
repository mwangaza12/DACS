"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientById, fetchMedicalRecords, fetchAppointments, fetchBills } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge, TypeBadge } from "@/components/appointments/status-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, User, Calendar, FileText, CreditCard,
  Phone, MapPin, Shield, AlertCircle, Clock,
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";

type Tab = "overview" | "records" | "appointments" | "billing";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",     label: "Overview",     icon: <User size={13} /> },
  { id: "records",      label: "Medical records", icon: <FileText size={13} /> },
  { id: "appointments", label: "Appointments", icon: <Calendar size={13} /> },
  { id: "billing",      label: "Billing",      icon: <CreditCard size={13} /> },
];

const BILL_STATUS_STYLES: Record<string, string> = {
  pending:          "bg-warning/10 text-warning border-warning/20",
  paid:             "bg-success/10 text-success border-success/20",
  partially_paid:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  insurance_pending:"bg-violet-500/10 text-violet-400 border-violet-500/20",
  written_off:      "bg-border text-text-muted border-border",
};

function fmt(val: string | null | undefined) {
  const n = Number(val ?? 0);
  return isNaN(n) ? "—" : `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => fetchPatientById(id),
    enabled: !!id,
  });

  const { data: records } = useQuery({
    queryKey: ["medical-records", id],
    queryFn: () => fetchMedicalRecords(id),
    enabled: tab === "records" && !!id,
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments", "patient", id],
    queryFn: () => fetchAppointments({ patientId: id, limit: 20 }),
    enabled: tab === "appointments" && !!id,
  });

  const { data: bills } = useQuery({
    queryKey: ["bills", id],
    queryFn: () => fetchBills(id),
    enabled: tab === "billing" && !!id,
  });

  const age = (() => {
    if (!patient?.dateOfBirth) return null;
    try { return differenceInYears(new Date(), parseISO(patient.dateOfBirth)); }
    catch { return null; }
  })();

  return (
    <div className="flex flex-col gap-5 animate-fade-up max-w-4xl">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h2 className="font-display font-bold text-lg text-text-primary tracking-tight">Patient profile</h2>
      </div>

      {/* Hero card */}
      {isLoading ? (
        <div className="rounded-2xl bg-card border border-border p-6 flex items-center gap-5">
          <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ) : patient && (
        <div className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <div className="relative z-10 flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-2xl text-primary-400">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-xl text-text-primary tracking-tight mb-1">
                {patient.firstName} {patient.lastName}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {age !== null && (
                  <span className="text-xs text-text-secondary font-body">{age} years old</span>
                )}
                <span className="text-text-muted">·</span>
                <span className="text-xs text-text-secondary font-body capitalize">{patient.gender}</span>
                {patient.nationalId && (
                  <>
                    <span className="text-text-muted">·</span>
                    <span className="text-xs font-mono text-text-muted">{patient.nationalId}</span>
                  </>
                )}
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-3 mt-3">
                {patient.insuranceProvider && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-body">
                    <Shield size={11} className="text-teal-400" />
                    <span className="text-text-secondary">{patient.insuranceProvider}</span>
                  </div>
                )}
                {patient.emergencyContactName && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-body">
                    <AlertCircle size={11} className="text-warning" />
                    <span className="text-text-secondary">{patient.emergencyContactName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push(`/appointments/new`)}
              >
                <Calendar size={13} /> Book appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-body font-medium transition-all duration-150 cursor-pointer whitespace-nowrap border-b-2 -mb-px",
              tab === t.id
                ? "text-primary-400 border-primary-400"
                : "text-text-tertiary border-transparent hover:text-text-secondary hover:border-border",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">

        {/* Overview */}
        {tab === "overview" && patient && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Calendar size={14} />, label: "Date of birth", value: (() => { try { return format(parseISO(patient.dateOfBirth), "MMMM d, yyyy"); } catch { return patient.dateOfBirth; } })() },
              { icon: <User size={14} />,       label: "Gender",     value: patient.gender, className: "capitalize" },
              { icon: <Phone size={14} />,      label: "Emergency contact", value: patient.emergencyContactName ? `${patient.emergencyContactName} · ${patient.emergencyContactPhone ?? ""}` : "—" },
              { icon: <MapPin size={14} />,     label: "Address",    value: patient.address ?? "—" },
              { icon: <Shield size={14} />,     label: "Insurance",  value: patient.insuranceProvider ?? "—" },
              { icon: <Shield size={14} />,     label: "Insurance #", value: patient.insuranceNumber ?? "—" },
            ].map(({ icon, label, value, className }) => (
              <div key={label} className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <span className="text-text-tertiary mt-0.5 flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-[11px] text-text-muted font-body uppercase tracking-wider mb-0.5">{label}</p>
                  <p className={cn("text-sm text-text-primary font-body", className)}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medical records */}
        {tab === "records" && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => router.push("/medical-records")}>
                <FileText size={13} /> All records
              </Button>
            </div>
            {!records?.length ? (
              <div className="flex items-center justify-center h-32 rounded-2xl border border-dashed border-border text-text-muted text-sm font-body">
                No medical records yet
              </div>
            ) : records.map((r) => (
              <div key={r.medicalRecordId} className="p-4 rounded-2xl bg-card border border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-body font-medium text-text-muted">
                    {(() => { try { return format(parseISO(r.recordDate), "MMMM d, yyyy"); } catch { return r.recordDate; } })()}
                  </p>
                  {r.followUpDate && (
                    <div className="flex items-center gap-1 text-[11px] text-warning font-body">
                      <Clock size={10} />
                      Follow-up: {(() => { try { return format(parseISO(r.followUpDate), "MMM d, yyyy"); } catch { return r.followUpDate; } })()}
                    </div>
                  )}
                </div>
                {r.diagnosis && (
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-body mb-0.5">Diagnosis</p>
                    <p className="text-sm font-medium text-text-primary font-body">{r.diagnosis}</p>
                  </div>
                )}
                {r.symptoms && (
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-body mb-0.5">Symptoms</p>
                    <p className="text-sm text-text-secondary font-body">{r.symptoms}</p>
                  </div>
                )}
                {r.prescription && (
                  <div className="p-3 rounded-xl bg-surface border border-border/60">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-body mb-0.5">Prescription</p>
                    <p className="text-sm text-text-primary font-body font-mono">{r.prescription}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Appointments */}
        {tab === "appointments" && (
          <div className="flex flex-col gap-3">
            {!appointments?.length ? (
              <div className="flex items-center justify-center h-32 rounded-2xl border border-dashed border-border text-text-muted text-sm font-body">
                No appointments yet
              </div>
            ) : appointments.map((a) => (
              <div
                key={a.appointmentId}
                onClick={() => router.push(`/appointments/${a.appointmentId}`)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary-500/30 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TypeBadge type={a.appointmentType} size="sm" />
                    <span className="text-[11px] text-text-muted font-body">
                      {(() => { try { return format(parseISO(a.appointmentDate), "MMM d, yyyy"); } catch { return a.appointmentDate; } })()} at {a.appointmentTime.slice(0,5)}
                    </span>
                  </div>
                  {a.reason && <p className="text-xs text-text-tertiary font-body truncate">{a.reason}</p>}
                </div>
                <StatusBadge status={a.appointmentStatus} size="sm" />
              </div>
            ))}
          </div>
        )}

        {/* Billing */}
        {tab === "billing" && (
          <div className="flex flex-col gap-3">
            {!bills?.length ? (
              <div className="flex items-center justify-center h-32 rounded-2xl border border-dashed border-border text-text-muted text-sm font-body">
                No bills yet
              </div>
            ) : bills.map((b) => (
              <div
                key={b.billId}
                onClick={() => router.push(`/billing/${b.billId}`)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary-500/30 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={16} className="text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary font-body">{fmt(b.amount)}</p>
                  <p className="text-xs text-text-tertiary font-body">
                    Patient owes: <span className="text-text-primary">{fmt(b.patientPayable)}</span>
                    {b.insuranceCovered && Number(b.insuranceCovered) > 0
                      ? ` · Insurance: ${fmt(b.insuranceCovered)}` : ""}
                  </p>
                </div>
                <span className={cn(
                  "flex-shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-semibold font-body capitalize",
                  BILL_STATUS_STYLES[b.billStatus] ?? BILL_STATUS_STYLES.pending,
                )}>
                  {b.billStatus.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}