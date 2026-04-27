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
import { fetchMedicalRecords } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function MedicalRecordsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: raw, isLoading, isFetching } = useQuery({
    queryKey: ["medical-records"],
    queryFn: () => fetchMedicalRecords(),
  });

  const records = raw ?? [];

  const filtered = useMemo(() => {
    let rows = [...records];
    
    // Sort by creation date (most recent first)
    rows = rows.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.recordDate).getTime();
      const dateB = new Date(b.createdAt || b.recordDate).getTime();
      return dateB - dateA;
    });

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.diagnosis?.toLowerCase().includes(q) ||
          r.symptoms?.toLowerCase().includes(q) ||
          r.prescription?.toLowerCase().includes(q)
      );
    }
    
    return rows;
  }, [records, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (safePage !== page) setPage(safePage);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "recordDate",
        header: "Record Date",
        cell: ({ row }) => {
          const dateStr = (() => {
            try {
              return format(parseISO(row.original.recordDate), "MMM d, yyyy");
            } catch {
              return row.original.recordDate;
            }
          })();
          return (
            <span className="text-sm font-medium whitespace-nowrap">
              {dateStr}
            </span>
          );
        },
      },
      {
        accessorKey: "diagnosis",
        header: "Diagnosis",
        cell: ({ getValue }) => (
          <span className="text-sm text-text-primary line-clamp-2">
            {getValue<string | null>() ?? (
              <span className="italic text-text-muted">No diagnosis</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "symptoms",
        header: "Symptoms",
        cell: ({ getValue }) => (
          <span className="text-xs text-text-secondary line-clamp-2">
            {getValue<string | null>() ?? (
              <span className="italic text-text-muted">No symptoms</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "prescription",
        header: "Prescription",
        cell: ({ getValue }) => (
          <span className="text-xs font-mono text-text-primary line-clamp-1">
            {getValue<string | null>() ?? (
              <span className="italic text-text-muted font-body">No prescription</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "followUpDate",
        header: "Follow-up",
        cell: ({ getValue }) => {
          const date = getValue<string | null>();
          if (!date) return <span className="text-xs italic text-text-muted">—</span>;
          
          const followStr = (() => {
            try {
              return format(parseISO(date), "MMM d, yyyy");
            } catch {
              return date;
            }
          })();
          
          return (
            <span className="text-xs text-warning whitespace-nowrap">
              {followStr}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/medical-records/${row.original.medicalRecordId}`);
            }}
            className="text-xs font-medium whitespace-nowrap text-primary-400 hover:text-primary-300 transition-colors"
          >
            View →
          </button>
        ),
      },
    ],
    [router]
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
            : `${total} record${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Table */}
      <div className="border rounded-2xl">
        <div className="w-full overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div
              className={cn(
                "transition-opacity duration-150",
                isStale && "opacity-60"
              )}
            >
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
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() &&
                              (header.column.getIsSorted() === "asc" ? (
                                <ChevronUp size={12} />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown size={12} />
                              ) : (
                                <ChevronsUpDown
                                  size={12}
                                  className="opacity-40"
                                />
                              ))}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {isLoading ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/40 last:border-0"
                      >
                        {columns.map((_, ci) => (
                          <td key={ci} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center py-16 text-text-muted text-sm"
                      >
                        No medical records found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() =>
                          router.push(
                            `/medical-records/${row.original.medicalRecordId}`
                          )
                        }
                        className="border-b border-border/40 last:border-0 hover:bg-surface/60 cursor-pointer transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
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

      <PaginationControls
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}