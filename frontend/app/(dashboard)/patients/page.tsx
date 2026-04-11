"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, ColumnDef, SortingState,
} from "@tanstack/react-table";
import { fetchPatients } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { cn } from "@/lib/utils";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, parseISO, differenceInYears } from "date-fns";

type PatientRow = {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  insuranceProvider: string | null;
  nationalId: string | null;
};

const GENDER_BADGE: Record<string, string> = {
  male:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  female: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  other:  "bg-border text-text-muted border-border",
};

const PAGE_SIZE = 12;

export default function PatientsPage() {
  const router = useRouter();
  const [sorting, setSorting]           = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [page, setPage]                 = useState(1);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => fetchPatients(1, 500),
  });

  // Map PatientWithUser → PatientRow so columns and data share the same type.
  // PatientWithUser extends PatientProfile, so firstName/lastName etc. are
  // directly on the object — not nested under .user
  const rows = useMemo<PatientRow[]>(
    () =>
      (patients ?? []).map((p) => ({
        patientId:         p.patientId,
        firstName:         p.firstName,
        lastName:          p.lastName,
        dateOfBirth:       p.dateOfBirth,
        gender:            p.gender,
        insuranceProvider: p.insuranceProvider ?? null,
        nationalId:        p.nationalId ?? null,
      })),
    [patients]
  );

  const columns = useMemo<ColumnDef<PatientRow>[]>(
    () => [
      {
        id: "name",
        header: "Patient",
        accessorFn: (r) => `${r.firstName} ${r.lastName}`,
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {row.original.firstName} {row.original.lastName}
              </p>
              {row.original.nationalId && (
                <p className="text-[11px] text-text-muted font-mono truncate">
                  {row.original.nationalId}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "dateOfBirth",
        header: "Age",
        cell: ({ getValue }) => {
          const dob = getValue<string>();
          const age = (() => {
            try { return differenceInYears(new Date(), parseISO(dob)); }
            catch { return "—"; }
          })();
          const dobStr = (() => {
            try { return format(parseISO(dob), "MMM d, yyyy"); }
            catch { return dob; }
          })();
          return (
            <div className="whitespace-nowrap">
              <p className="text-sm text-text-primary">{age} yrs</p>
              <p className="text-[11px] text-text-muted">{dobStr}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ getValue }) => {
          const g = getValue<string>();
          return (
            <span className={cn(
              "inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize whitespace-nowrap",
              GENDER_BADGE[g] ?? GENDER_BADGE.other,
            )}>
              {g}
            </span>
          );
        },
      },
      {
        accessorKey: "insuranceProvider",
        header: "Insurance",
        cell: ({ getValue }) => (
          <span className="text-xs text-text-secondary truncate block">
            {getValue<string | null>() ?? <span className="text-text-muted italic">None</span>}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/patients/${row.original.patientId}`); }}
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium whitespace-nowrap"
          >
            View <ArrowRight size={11} />
          </button>
        ),
      },
    ],
    [router]
  );

  const filtered = useMemo(() => {
    let data = rows;
    if (genderFilter !== "all") data = data.filter((r) => r.gender === genderFilter);
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter(
        (r) =>
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
          r.nationalId?.toLowerCase().includes(q) ||
          r.insuranceProvider?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [rows, globalFilter, genderFilter]);

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleGlobalFilter = (val: string) => { setGlobalFilter(val); setPage(1); };
  const handleGenderFilter = (val: string) => { setGenderFilter(val); setPage(1); };

  const table = useReactTable({
    data: pageRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="flex flex-col gap-5 animate-fade-up">

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border">
              <Search size={13} />
              <input
                value={globalFilter}
                onChange={(e) => handleGlobalFilter(e.target.value)}
                placeholder="Search patients…"
                className="bg-transparent text-sm w-44 outline-none"
              />
            </div>

            <select
              value={genderFilter}
              onChange={(e) => handleGenderFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-card border text-sm"
            >
              <option value="all">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <p className="text-xs">
            {isLoading
              ? "Loading…"
              : `${total} patient${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border">
          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-[650px] w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-border bg-card">
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          onClick={h.column.getToggleSortingHandler()}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getCanSort() && (
                              h.column.getIsSorted() === "asc"  ? <ChevronUp size={12} /> :
                              h.column.getIsSorted() === "desc" ? <ChevronDown size={12} /> :
                              <ChevronsUpDown size={12} />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {isLoading
                    ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <tr key={i}>
                          {columns.map((_, ci) => (
                            <td key={ci} className="px-4 py-3 max-w-0">
                              <Skeleton className="h-4 w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : table.getRowModel().rows.length === 0
                    ? (
                        <tr>
                          <td colSpan={columns.length} className="text-center py-16">
                            No patients found
                          </td>
                        </tr>
                      )
                    : table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => router.push(`/patients/${row.original.patientId}`)}
                          className="border-b hover:bg-card/60 cursor-pointer"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 max-w-0">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}