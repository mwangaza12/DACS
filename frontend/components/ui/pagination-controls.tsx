"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  isFetching = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Build page list: always show first, last, current ±1, with ellipsis gaps
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pageNumbers.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  const withEllipsis = visible.reduce<(number | "…")[]>((acc, p, idx, arr) => {
    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
    acc.push(p);
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between pt-1">
      {/* Page pills */}
      <div className="flex items-center gap-1">
        {withEllipsis.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-text-muted font-body select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
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
          onClick={() => onPageChange(Math.max(1, page - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
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
  );
}