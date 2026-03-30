"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMedicalRecords } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { FileText, Clock, Search, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function MedicalRecordsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);

  const { data: records, isLoading } = useQuery({
    queryKey: ["medical-records"],
    queryFn: () => fetchMedicalRecords(),
  });

  const filtered = useMemo(() => {
    return (records ?? []).filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.diagnosis?.toLowerCase().includes(q) ||
        r.symptoms?.toLowerCase().includes(q) ||
        r.prescription?.toLowerCase().includes(q)
      );
    });
  }, [records, search]);

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      {/* Toolbar */}
      <div className="flex items-center gap-3 justify-between flex-wrap">
        <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <Search size={13} className="text-text-tertiary flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by diagnosis, symptoms…"
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-52 font-body"
          />
        </div>
        <p className="text-xs text-text-tertiary font-body">
          {isLoading
            ? "Loading…"
            : `${total} record${total !== 1 ? "s" : ""}${total > PAGE_SIZE ? ` · page ${safePage} of ${totalPages}` : ""}`
          }
        </p>
      </div>

      {/* Records grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border border-dashed border-border text-text-muted">
          <FileText size={24} />
          <p className="text-sm font-body">No medical records found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pageRows.map((r) => {
              const dateStr = (() => {
                try { return format(parseISO(r.recordDate), "MMMM d, yyyy"); }
                catch { return r.recordDate; }
              })();
              const followStr = r.followUpDate
                ? (() => {
                    try { return format(parseISO(r.followUpDate), "MMM d, yyyy"); }
                    catch { return r.followUpDate; }
                  })()
                : null;

              return (
                <div
                  key={r.medicalRecordId}
                  onClick={() => router.push(`/medical-records/${r.medicalRecordId}`)}
                  className="group rounded-2xl bg-card border border-border p-5 hover:border-primary-500/30 hover:shadow-card-hover transition-all cursor-pointer flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                        <FileText size={14} className="text-primary-400" />
                      </div>
                      <div>
                        <p className="text-[11px] text-text-muted font-body uppercase tracking-wider">Record date</p>
                        <p className="text-xs font-medium text-text-primary font-body">{dateStr}</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-text-muted group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Diagnosis */}
                  {r.diagnosis && (
                    <div>
                      <p className="text-[10px] text-text-muted font-body uppercase tracking-wider mb-1">Diagnosis</p>
                      <p className="text-sm font-medium text-text-primary font-body line-clamp-2">{r.diagnosis}</p>
                    </div>
                  )}

                  {/* Symptoms */}
                  {r.symptoms && (
                    <p className="text-xs text-text-secondary font-body line-clamp-2 leading-relaxed">{r.symptoms}</p>
                  )}

                  {/* Prescription */}
                  {r.prescription && (
                    <div className="px-3 py-2 rounded-xl bg-surface border border-border/60">
                      <p className="text-[10px] text-text-muted font-body uppercase tracking-wider mb-0.5">Rx</p>
                      <p className="text-xs text-text-primary font-mono line-clamp-1">{r.prescription}</p>
                    </div>
                  )}

                  {/* Follow-up */}
                  {followStr && (
                    <div className="flex items-center gap-1.5 text-xs text-warning font-body">
                      <Clock size={11} />
                      Follow-up: {followStr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <PaginationControls
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}