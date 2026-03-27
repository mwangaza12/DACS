"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientDemographics } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#6366f1", "#14b8a6", "#f59e0b"];
const GENDER_LABELS: Record<string, string> = {
  male: "Male", female: "Female", other: "Other",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { gender: string; total: number } }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card">
      <p className="text-xs text-text-secondary font-body mb-0.5">{GENDER_LABELS[d.gender] ?? d.gender}</p>
      <p className="text-sm font-display font-bold text-text-primary">{Number(d.total).toLocaleString()} patients</p>
    </div>
  );
};

export function DemographicsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-demographics"],
    queryFn: fetchPatientDemographics,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-28 h-28 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const chartData = (data?.byGender ?? []).map((d) => ({
    ...d,
    total: Number(d.total),
  }));

  const total = chartData.reduce((s, d) => s + d.total, 0);

  if (!chartData.length || total === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-display font-bold text-sm text-text-primary">Patient demographics</p>
        <div className="flex items-center justify-center h-32 text-text-tertiary text-sm font-body">
          No patient data yet
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-display font-bold text-sm text-text-primary">Patient demographics</p>
        <p className="text-xs text-text-tertiary font-body mt-0.5">Gender distribution</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total"
                innerRadius={32}
                outerRadius={50}
                strokeWidth={0}
                paddingAngle={3}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="font-display font-bold text-base text-text-primary leading-none">{total}</p>
            <p className="text-[10px] text-text-tertiary font-body">total</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1">
          {chartData.map((d, i) => {
            const pct = total > 0 ? Math.round((d.total / total) * 100) : 0;
            return (
              <div key={d.gender} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs text-text-secondary font-body flex-1">
                  {GENDER_LABELS[d.gender] ?? d.gender}
                </span>
                <span className="text-xs font-medium text-text-primary font-body">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}