"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchMedicalRecordById } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ArrowLeft, FileText, Calendar, Stethoscope, Clock, User, Pill } from "lucide-react";

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: record, isLoading } = useQuery({
    queryKey: ["medical-record", id],
    queryFn: () => fetchMedicalRecordById(id),
    enabled: !!id,
  });

  const fmtDate = (d: string) => {
    try { return format(parseISO(d), "EEEE, MMMM d yyyy"); }
    catch { return d; }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h2 className="font-display font-bold text-lg text-text-primary tracking-tight">Medical record</h2>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : !record ? (
        <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-border text-text-muted font-body text-sm">
          Record not found
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Meta */}
          <div className="rounded-2xl bg-card border border-border p-5 grid grid-cols-2 gap-3">
            {[
              { icon: <Calendar size={14} />,    label: "Record date",  value: fmtDate(record.recordDate) },
              { icon: <Clock size={14} />,       label: "Follow-up",    value: record.followUpDate ? fmtDate(record.followUpDate) : "None scheduled" },
              { icon: <User size={14} />,        label: "Patient ID",   value: record.patientId?.slice(0, 16) + "…" },
              { icon: <Stethoscope size={14} />, label: "Doctor ID",    value: record.doctorId?.slice(0, 16) + "…" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="p-3 rounded-xl bg-surface border border-border/60">
                <div className="flex items-center gap-1.5 text-text-muted mb-1">
                  {icon}
                  <span className="text-[10px] uppercase tracking-wider font-body font-semibold">{label}</span>
                </div>
                <p className="text-sm text-text-primary font-body">{value}</p>
              </div>
            ))}
          </div>

          {/* Clinical details */}
          {[
            { icon: <FileText size={14} />,   label: "Diagnosis",   value: record.diagnosis,   mono: false },
            { icon: <FileText size={14} />,   label: "Symptoms",    value: record.symptoms,    mono: false },
            { icon: <Pill size={14} />,       label: "Prescription", value: record.prescription, mono: true },
            { icon: <FileText size={14} />,   label: "Notes",       value: record.notes,       mono: false },
          ].map(({ icon, label, value, mono }) =>
            value ? (
              <div key={label} className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                    {icon}
                  </div>
                  <p className="text-xs font-semibold text-text-secondary font-body uppercase tracking-wider">{label}</p>
                </div>
                <p className={`text-sm text-text-primary leading-relaxed ${mono ? "font-mono" : "font-body"}`}>
                  {value}
                </p>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}