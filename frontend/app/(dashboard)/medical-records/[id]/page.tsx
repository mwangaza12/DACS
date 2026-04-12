"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchMedicalRecordById } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft, FileText, Calendar, Stethoscope,
  Clock, User, Pill, Phone, Mail, BadgeCheck,
} from "lucide-react";
import type { MedicalRecordWithRelations } from "@/types";

function fmtDate(d: string) {
  try { return format(parseISO(d), "EEEE, MMMM d yyyy"); }
  catch { return d; }
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
          {icon}
        </div>
        <p className="text-xs font-semibold text-text-secondary font-body uppercase tracking-wider">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

function MetaCell({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-surface border border-border/60">
      <div className="flex items-center gap-1.5 text-text-muted mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-body font-semibold">{label}</span>
      </div>
      <p className="text-sm text-text-primary font-body leading-tight">{value}</p>
      {sub && <p className="text-xs text-text-muted font-body mt-0.5">{sub}</p>}
    </div>
  );
}

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: record, isLoading } = useQuery<MedicalRecordWithRelations>({
    queryKey: ["medical-record", id],
    queryFn:  () => fetchMedicalRecordById(id),
    enabled:  !!id,
  });

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h2 className="font-display font-bold text-lg text-text-primary tracking-tight">
          Medical record
        </h2>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : !record ? (
        <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-border text-text-muted font-body text-sm">
          Record not found
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {/* Meta grid */}
          <div className="rounded-2xl bg-card border border-border p-5 grid grid-cols-2 gap-3">
            <MetaCell
              icon={<Calendar size={14} />}
              label="Record date"
              value={fmtDate(record.recordDate)}
            />
            <MetaCell
              icon={<Clock size={14} />}
              label="Follow-up"
              value={record.followUpDate ? fmtDate(record.followUpDate) : "None scheduled"}
            />
            <MetaCell
              icon={<User size={14} />}
              label="Patient"
              value={`${record.patient.firstName} ${record.patient.lastName}`}
              sub={record.patient.user?.email}
            />
            <MetaCell
              icon={<Stethoscope size={14} />}
              label="Doctor"
              value={`Dr. ${record.doctor.firstName} ${record.doctor.lastName}`}
              sub={[record.doctor.specialization, record.doctor.department]
                .filter(Boolean)
                .join(" · ") || undefined}
            />
          </div>

          {/* Patient contact */}
          {(record.patient.user?.phone || record.patient.insuranceProvider) && (
            <Section icon={<User size={14} />} label="Patient details">
              <div className="flex flex-col gap-2">
                {record.patient.user?.email && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-body">
                    <Mail size={13} className="text-text-muted shrink-0" />
                    {record.patient.user.email}
                  </div>
                )}
                {record.patient.user?.phone && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-body">
                    <Phone size={13} className="text-text-muted shrink-0" />
                    {record.patient.user.phone}
                  </div>
                )}
                {record.patient.insuranceProvider && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-body">
                    <BadgeCheck size={13} className="text-text-muted shrink-0" />
                    {record.patient.insuranceProvider}
                    {record.patient.insuranceNumber && (
                      <span className="text-text-muted font-mono text-xs">
                        · {record.patient.insuranceNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Linked appointment context */}
          {record.appointment && (
            <Section icon={<Calendar size={14} />} label="Appointment">
              <div className="grid grid-cols-2 gap-3">
                <MetaCell
                  icon={<Calendar size={14} />}
                  label="Date"
                  value={fmtDate(record.appointment.appointmentDate)}
                />
                <MetaCell
                  icon={<Clock size={14} />}
                  label="Time"
                  value={record.appointment.appointmentTime.slice(0, 5)}
                  sub={record.appointment.appointmentType}
                />
                {record.appointment.reason && (
                  <div className="col-span-2 p-3 rounded-xl bg-surface border border-border/60">
                    <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-text-muted mb-1">
                      Reason
                    </p>
                    <p className="text-sm text-text-primary font-body">{record.appointment.reason}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Clinical details */}
          {record.diagnosis && (
            <Section icon={<FileText size={14} />} label="Diagnosis">
              <p className="text-sm text-text-primary font-body leading-relaxed">{record.diagnosis}</p>
            </Section>
          )}

          {record.symptoms && (
            <Section icon={<FileText size={14} />} label="Symptoms">
              <p className="text-sm text-text-primary font-body leading-relaxed">{record.symptoms}</p>
            </Section>
          )}

          {record.notes && (
            <Section icon={<FileText size={14} />} label="Notes">
              <p className="text-sm text-text-primary font-body leading-relaxed">{record.notes}</p>
            </Section>
          )}

          {/* Prescriptions — now a proper list from the relation */}
          {record.prescriptions?.length > 0 && (
            <Section icon={<Pill size={14} />} label={`Prescriptions (${record.prescriptions.length})`}>
              <div className="flex flex-col gap-3">
                {record.prescriptions.map((rx) => (
                  <div
                    key={rx.prescriptionId}
                    className="p-3 rounded-xl bg-surface border border-border/60 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary font-body">
                        {rx.medicationName}
                      </p>
                      {rx.dosage && (
                        <span className="text-xs font-mono text-text-secondary bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-full">
                          {rx.dosage}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {rx.frequency && (
                        <p className="text-xs text-text-muted font-body">
                          Frequency: <span className="text-text-secondary">{rx.frequency}</span>
                        </p>
                      )}
                      {rx.duration && (
                        <p className="text-xs text-text-muted font-body">
                          Duration: <span className="text-text-secondary">{rx.duration}</span>
                        </p>
                      )}
                    </div>
                    {rx.instructions && (
                      <p className="text-xs text-text-muted font-body italic">{rx.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>
      )}
    </div>
  );
}