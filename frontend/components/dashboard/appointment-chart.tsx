"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchAppointmentReport } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  scheduled:    "#6366f1",
  confirmed:    "#14b8a6",
  in_progress:  "#f59e0b",
  completed:    "#4ade80",
  cancelled:    "#f87171",
  no_show:      "#94a3b8",
  rescheduled:  "#a78bfa",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled:   "Scheduled",
  confirmed:   "Confirmed",
  in_progress: "In progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
  no_show:     "No-show",
  rescheduled: "Rescheduled",
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { status: string; total: number } }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card">
      <p className="text-xs text-text-secondary font-body mb-0.5">
        {STATUS_LABELS[d.status] ?? d.status}
      </p>
      <p className="text-sm font-display font-bold text-text-primary">
        {d.total.toLocaleString()} appointments
      </p>
    </div>
  );
};

export function AppointmentChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["appointment-report"],
    queryFn: () => fetchAppointmentReport(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const chartData = (data ?? []).map((d) => ({
    ...d,
    label: STATUS_LABELS[d.status] ?? d.status,
    total: Number(d.total),
  }));

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-48 text-text-tertiary text-sm font-body">
        No appointment data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-sm text-text-primary">Appointments by status</p>
          <p className="text-xs text-text-tertiary font-body mt-0.5">All time breakdown</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
          <span className="text-[11px] font-medium text-primary-400 font-body">
            {chartData.reduce((s, d) => s + d.total, 0).toLocaleString()} total
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={28} barCategoryGap="30%">
          <XAxis
            dataKey="label"
            tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }} />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? "#6366f1"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}