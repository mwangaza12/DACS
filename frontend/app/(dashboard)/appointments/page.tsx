"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { fetchAppointments } from "@/lib/queries";
import { StatusBadge, TypeBadge } from "@/components/appointments/status-badge";
import { AppointmentDrawer } from "@/components/appointments/appointment-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  Plus, Search, ChevronUp, ChevronDown, ChevronsUpDown,
  SlidersHorizontal, Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, STATUS_LABELS, TYPE_LABELS } from "@/lib/appointment-utils";

type ApptRow = {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  appointmentStatus: string;
  appointmentType: string;
  reason: string | null;
  notes: string | null;
  createdAt: string;
};

// Adjust this to match your API response shape.
// If your API returns { data: ApptRow[], total: number } wrap fetchAppointments accordingly.
// If it just returns ApptRow[], set total from data.length and disable server pagination.
type AppointmentsResponse = {
  data: ApptRow[];
  total: number;   // total records matching the current filters (for page count)
} | ApptRow[];     // fallback: plain array → client-side page count not available

const PAGE_SIZE = 15;

function isPagedResponse(r: AppointmentsResponse): r is { data: ApptRow[]; total: number } {
  return !Array.isArray(r) && "data" in r;
}

export default function AppointmentsPage() {
  const [sorting, setSorting]         = useState<SortingState>([]);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [selectedId, setSelectedId]   = useState<string | null>(null);

  // Debounce search so we don't fire a request on every keystroke
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    clearTimeout((handleSearchChange as any)._t);
    (handleSearchChange as any)._t = setTimeout(() => setDebounced(val), 350);
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1); // reset to page 1 whenever a filter changes
  };

  // All filter state is passed to the query — server does the work
  const queryParams = {
    page,
    limit: PAGE_SIZE,
    ...(debouncedSearch  && { search: debouncedSearch }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(typeFilter   !== "all" && { type: typeFilter }),
  };

  const { data: raw, isLoading, isFetching } = useQuery({
    queryKey: ["appointments", "list", queryParams],
    queryFn: () => fetchAppointments(queryParams),
    placeholderData: (prev) => prev, // keep previous data visible while fetching next page
  });

  // Normalise: support both { data, total } and plain array responses
  const rows: ApptRow[]  = raw ? (isPagedResponse(raw) ? raw.data : raw) : [];
  const total: number    = raw ? (isPagedResponse(raw) ? raw.total : (raw as ApptRow[]).length) : 0;
  const totalPages       = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev          = page > 1;
  const hasNext          = page < totalPages;

  const columns = useMemo<ColumnDef<ApptRow>[]>(
    () => [
      {
        accessorKey: "appointmentDate",
        header: "Date & time",
        cell: ({ row }) => {
          const dateStr = (() => {
            try { return format(parseISO(row.original.appointmentDate), "MMM d, yyyy"); }
            catch { return row.original.appointmentDate; }
          })();
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text-primary font-body">{dateStr}</span>
              <span className="text-xs text-text-tertiary font-body">
                {row.original.appointmentTime.slice(0, 5)} – {row.original.endTime.slice(0, 5)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "appointmentType",
        header: "Type",
        cell: ({ getValue }) => <TypeBadge type={getValue<string>()} size="sm" />,
      },
      {
        accessorKey: "appointmentStatus",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} size="sm" />,
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => (
          <span className="text-xs text-text-secondary font-body line-clamp-1 max-w-[180px]">
            {getValue<string | null>() ?? <span className="text-text-muted italic">No reason given</span>}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedId(row.original.appointmentId); }}
            className="text-xs text-primary-400 hover:text-primary-300 font-medium font-body transition-colors cursor-pointer"
          >
            View →
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // ⚠️ No getFilteredRowModel — filtering is server-side now
    manualFiltering: true,
    manualPagination: true,
  });

  const isStale = !isLoading && isFetching; // page transition in progress

  return (
    <>
      <div className="flex flex-col gap-5 animate-fade-up">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border text-text-tertiary focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
              <Search size={13} className="flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search appointments…"
                className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-48 font-body"
              />
            </div>

            {/* Status filter */}
            <div className="relative flex items-center">
              <SlidersHorizontal size={12} className="absolute left-2.5 text-text-tertiary pointer-events-none" />
              <select
                value={statusFilter}
                onChange={handleFilterChange(setStatusFilter)}
                className="h-9 pl-7 pr-3 rounded-xl bg-card border border-border text-sm text-text-secondary font-body appearance-none cursor-pointer focus:outline-none focus:border-primary-500/50"
              >
                <option value="all">All statuses</option>
                {APPOINTMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-card">{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            <div className="relative flex items-center">
              <Calendar size={12} className="absolute left-2.5 text-text-tertiary pointer-events-none" />
              <select
                value={typeFilter}
                onChange={handleFilterChange(setTypeFilter)}
                className="h-9 pl-7 pr-3 rounded-xl bg-card border border-border text-sm text-text-secondary font-body appearance-none cursor-pointer focus:outline-none focus:border-primary-500/50"
              >
                <option value="all">All types</option>
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-card">{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <Button size="sm" onClick={() => window.location.href = "/appointments/new"}>
            <Plus size={14} /> New appointment
          </Button>
        </div>

        {/* Count */}
        <p className="text-xs text-text-tertiary font-body -mt-2">
          {isLoading
            ? "Loading…"
            : `${total} appointment${total !== 1 ? "s" : ""}${total > PAGE_SIZE ? ` · page ${page} of ${totalPages}` : ""}`
          }
        </p>

        {/* Table */}
        <div className={cn("rounded-2xl border border-border overflow-hidden transition-opacity duration-150", isStale && "opacity-60")}>
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-card">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "px-4 py-3 text-left text-[11px] font-semibold text-text-muted font-body uppercase tracking-wider select-none",
                        header.column.getCanSort() && "cursor-pointer hover:text-text-secondary",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-text-muted">
                            {header.column.getIsSorted() === "asc"  ? <ChevronUp size={12} /> :
                             header.column.getIsSorted() === "desc" ? <ChevronDown size={12} /> :
                             <ChevronsUpDown size={12} />}
                          </span>
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
                    <tr key={i} className="border-b border-border/60">
                      {columns.map((_, ci) => (
                        <td key={ci} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : table.getRowModel().rows.length === 0
                ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center text-text-tertiary text-sm font-body">
                        No appointments found
                      </td>
                    </tr>
                  )
                : table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.original.appointmentId)}
                      className="border-b border-border/40 hover:bg-card/60 transition-colors cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination controls — only shown when there's more than one page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                // Show: first, last, current ±1, and ellipsis gaps
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-text-muted font-body select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        "h-7 min-w-[28px] px-2 rounded-lg text-xs font-medium font-body transition-colors",
                        p === page
                          ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                          : "text-text-tertiary hover:text-text-secondary hover:bg-card border border-transparent"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev || isFetching}
                className={cn(
                  "flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium font-body border transition-colors",
                  hasPrev && !isFetching
                    ? "border-border text-text-secondary hover:bg-card hover:text-text-primary cursor-pointer"
                    : "border-transparent text-text-muted cursor-not-allowed opacity-40"
                )}
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNext || isFetching}
                className={cn(
                  "flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium font-body border transition-colors",
                  hasNext && !isFetching
                    ? "border-border text-text-secondary hover:bg-card hover:text-text-primary cursor-pointer"
                    : "border-transparent text-text-muted cursor-not-allowed opacity-40"
                )}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AppointmentDrawer
        appointmentId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}