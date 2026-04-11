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
import { PaginationControls } from "@/components/ui/pagination-controls";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  Plus, Search, ChevronUp, ChevronDown, ChevronsUpDown,
  SlidersHorizontal, Calendar,
} from "lucide-react";
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, STATUS_LABELS, TYPE_LABELS } from "@/lib/appointment-utils";
import type { AppointmentWithRelations } from "@/types";

const PAGE_SIZE = 10;

export default function AppointmentsPage() {
  const [sorting, setSorting]       = useState<SortingState>([]);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    clearTimeout((handleSearchChange as any)._t);
    (handleSearchChange as any)._t = setTimeout(() => setDebounced(val), 350);
  };

  const handleFilterChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };

  const { data: raw, isLoading, isFetching } = useQuery({
    queryKey: ["appointments", "list"],
    queryFn: () => fetchAppointments({ page: 1, limit: 500 }),
    placeholderData: (prev) => prev,
  });

  const allRows: AppointmentWithRelations[] = Array.isArray(raw)
    ? raw
    : (raw as any)?.data ?? [];

  const filtered = useMemo(() => {
    let rows = allRows;
    if (statusFilter !== "all")
      rows = rows.filter((r) => r.appointmentStatus === statusFilter);
    if (typeFilter !== "all")
      rows = rows.filter((r) => r.appointmentType === typeFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (r) =>
          // Search by patient name, doctor name, reason, or date
          `${r.patient.firstName} ${r.patient.lastName}`.toLowerCase().includes(q) ||
          `${r.doctor.firstName} ${r.doctor.lastName}`.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q) ||
          r.appointmentDate.includes(q) ||
          r.appointmentStatus.includes(q)
      );
    }
    return rows;
  }, [allRows, statusFilter, typeFilter, debouncedSearch]);

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const safePage = Math.min(page, totalPages);
  if (safePage !== page) setPage(safePage);

  const columns = useMemo<ColumnDef<AppointmentWithRelations>[]>(
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
              <span className="text-sm font-medium whitespace-nowrap">{dateStr}</span>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {row.original.appointmentTime.slice(0, 5)} – {row.original.endTime.slice(0, 5)}
              </span>
            </div>
          );
        },
      },
      {
        id: "patient",
        header: "Patient",
        cell: ({ row }) => {
          const { firstName, lastName } = row.original.patient;
          const email = row.original.patient.user?.email;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium whitespace-nowrap">
                {firstName} {lastName}
              </span>
              {email && (
                <span className="text-xs text-text-muted whitespace-nowrap">{email}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "doctor",
        header: "Doctor",
        cell: ({ row }) => {
          const { firstName, lastName } = row.original.doctor;
          return (
            <span className="text-sm whitespace-nowrap">
              Dr. {firstName} {lastName}
            </span>
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
          <span className="text-xs text-text-secondary line-clamp-2 md:line-clamp-1">
            {getValue<string | null>() ?? (
              <span className="italic text-text-muted">No reason given</span>
            )}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(row.original.appointmentId);
            }}
            className="text-xs font-medium whitespace-nowrap text-primary-400 hover:text-primary-300 transition-colors"
          >
            View →
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: pageRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const isStale = !isLoading && isFetching;

  return (
    <>
      <div className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="px-4 py-2">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border w-full sm:w-auto sm:min-w-[200px]">
              <Search size={13} className="text-text-muted shrink-0" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, date, reason…"
                className="bg-transparent text-sm w-full outline-none"
              />
            </div>

            <div className="relative flex items-center w-full sm:w-auto">
              <SlidersHorizontal size={12} className="absolute left-2.5 text-text-muted pointer-events-none" />
              <select
                value={statusFilter}
                onChange={handleFilterChange(setStatusFilter)}
                className="h-9 pl-7 pr-3 rounded-xl bg-card border w-full sm:w-auto text-sm"
              >
                <option value="all">All statuses</option>
                {APPOINTMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center w-full sm:w-auto">
              <Calendar size={12} className="absolute left-2.5 text-text-muted pointer-events-none" />
              <select
                value={typeFilter}
                onChange={handleFilterChange(setTypeFilter)}
                className="h-9 pl-7 pr-3 rounded-xl bg-card border w-full sm:w-auto text-sm"
              >
                <option value="all">All types</option>
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              onClick={() => (window.location.href = "/appointments/new")}
              className="w-full sm:w-auto ml-auto"
            >
              <Plus size={14} /> New appointment
            </Button>
          </div>

          <p className="text-xs text-text-muted mb-4">
            {isLoading
              ? "Loading…"
              : `${total} appointment${total !== 1 ? "s" : ""}`}
          </p>

          {/* Table */}
          <div className="border rounded-2xl">
            <div className="w-full overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className={cn("transition-opacity duration-150", isStale && "opacity-60")}>
                  <table className="min-w-[700px] w-full">
                    <thead>
                      {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id} className="border-b border-border/60">
                          {hg.headers.map((header) => (
                            <th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                              className="px-4 py-3 text-left text-xs text-text-muted font-medium cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() && (
                                  header.column.getIsSorted() === "asc"  ? <ChevronUp size={12} /> :
                                  header.column.getIsSorted() === "desc" ? <ChevronDown size={12} /> :
                                  <ChevronsUpDown size={12} className="opacity-40" />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>

                    <tbody>
                      {isLoading ? (
                        Array.from({ length: PAGE_SIZE }).map((_, i) => (
                          <tr key={i} className="border-b border-border/40 last:border-0">
                            {columns.map((_, ci) => (
                              <td key={ci} className="px-4 py-3">
                                <Skeleton className="h-4 w-full" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} className="text-center py-16 text-text-muted text-sm">
                            No appointments found
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            onClick={() => setSelectedId(row.original.appointmentId)}
                            className="border-b border-border/40 last:border-0 hover:bg-surface/60 cursor-pointer transition-colors"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-4 py-3">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isFetching={isFetching}
            />
          </div>
        </div>
      </div>

      <AppointmentDrawer appointmentId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}