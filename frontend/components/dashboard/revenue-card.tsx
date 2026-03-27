"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRevenueReport, fetchNoShowReport } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

function fmt(val: string | number) {
  const n = Number(val);
  if (isNaN(n)) return "—";
  return "KES " + n.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function RevenueCard() {
  const { data: rev, isLoading: revLoading } = useQuery({
    queryKey: ["revenue-report"],
    queryFn: fetchRevenueReport,
  });

  const { data: noShow, isLoading: nsLoading } = useQuery({
    queryKey: ["no-show-report"],
    queryFn: fetchNoShowReport,
  });

  const loading = revLoading || nsLoading;

  return (
    <div className="flex flex-col gap-5">
      {/* Revenue */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
            <DollarSign size={14} className="text-success" />
          </div>
          <p className="font-display font-bold text-sm text-text-primary">Revenue</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        ) : (
          <>
            <p className="font-display font-bold text-3xl text-text-primary leading-none tracking-tight">
              {fmt(rev?.totalRevenue ?? 0)}
            </p>
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-text-tertiary">Patient paid</span>
                <span className="text-text-primary font-medium">{fmt(rev?.totalPaid ?? 0)}</span>
              </div>
              <div className="w-full h-px bg-border/60" />
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-text-tertiary">Insurance covered</span>
                <span className="text-teal-400 font-medium">{fmt(rev?.totalInsurance ?? 0)}</span>
              </div>
              <div className="w-full h-px bg-border/60" />
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-text-tertiary">Paid bills</span>
                <span className="text-text-primary font-medium">{Number(rev?.billCount ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* No-show rate */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
            <AlertTriangle size={13} className="text-warning" />
          </div>
          <p className="font-display font-bold text-sm text-text-primary">No-show rate</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ) : (
          <>
            <p className="font-display font-bold text-3xl text-text-primary leading-none tracking-tight">
              {noShow?.rate ?? "0%"}
            </p>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-500"
                style={{ width: noShow?.rate ?? "0%" }}
              />
            </div>
            <p className="text-xs text-text-tertiary font-body">
              {Number(noShow?.noShows ?? 0).toLocaleString()} no-shows out of{" "}
              {Number(noShow?.total ?? 0).toLocaleString()} appointments
            </p>
          </>
        )}
      </div>
    </div>
  );
}