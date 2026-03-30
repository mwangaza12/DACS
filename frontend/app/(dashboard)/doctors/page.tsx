"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctors } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useRouter } from "next/navigation";
import { Search, Stethoscope, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function DoctorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchDoctors(1, 500),
  });

  const departments = useMemo(
    () => Array.from(new Set((doctors ?? []).map((d) => d.department).filter(Boolean))) as string[],
    [doctors]
  );

  const filtered = useMemo(() => {
    return (doctors ?? []).filter((d) => {
      const name = `${d.firstName} ${d.lastName}`.toLowerCase();
      const matchSearch =
        !search ||
        name.includes(search.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "all" || d.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [doctors, search, deptFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleDept = (val: string) => { setDeptFilter(val); setPage(1); };

  return (
    <div className="flex flex-col gap-6 animate-fade-up py-6 px-3 sm:px-4 max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* Toolbar - improved wrapping for mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between w-full">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all flex-1 sm:flex-none min-w-[180px]">
            <Search size={13} className="text-text-tertiary flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search doctors…"
              className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-full font-body"
            />
          </div>

          {departments.length > 0 && (
            <div className="relative flex items-center flex-1 sm:flex-none">
              <Building2 size={12} className="absolute left-2.5 text-text-tertiary pointer-events-none" />
              <select
                value={deptFilter}
                onChange={(e) => handleDept(e.target.value)}
                className="h-9 pl-7 pr-3 rounded-xl bg-card border border-border text-sm text-text-secondary font-body appearance-none cursor-pointer focus:outline-none w-full sm:w-auto min-w-[140px]"
              >
                <option value="all">All departments</option>
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-card">{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <p className="text-xs text-text-tertiary font-body">
          {isLoading
            ? "Loading…"
            : `${total} doctor${total !== 1 ? "s" : ""}${total > PAGE_SIZE ? ` · page ${safePage} of ${totalPages}` : ""}`
          }
        </p>
      </div>

      {/* Doctor cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border border-dashed border-border text-text-muted">
          <Stethoscope size={24} />
          <p className="text-sm font-body">No doctors found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {pageRows.map((doc) => (
              <button
                key={doc.doctorId}
                onClick={() => router.push(`/doctors/${doc.doctorId}`)}
                className="group text-left p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary-500/30 hover:shadow-card-hover transition-all duration-150 cursor-pointer w-full"
              >
                {/* Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <span className="font-display font-bold text-base sm:text-lg text-teal-400">
                      {doc.firstName?.[0]}{doc.lastName?.[0]}
                    </span>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-text-muted group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-display font-bold text-sm text-text-primary mb-0.5 truncate">
                    Dr. {doc.firstName} {doc.lastName}
                  </p>
                  {doc.specialization && (
                    <p className="text-xs text-primary-400 font-body mb-1 truncate">{doc.specialization}</p>
                  )}
                  {doc.department && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-body truncate">
                      <Building2 size={10} className="flex-shrink-0" />
                      <span className="truncate">{doc.department}</span>
                    </div>
                  )}
                </div>

                {doc.consultationFee && (
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-text-muted font-body">Consultation fee</span>
                    <span className="text-xs font-bold font-display text-success whitespace-nowrap">
                      KES {Number(doc.consultationFee).toLocaleString()}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <PaginationControls
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}