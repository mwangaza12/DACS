"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  fetchReportAppointments,
  fetchReportRevenue,
  fetchReportNoShow,
  fetchReportDemographics,
} from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BarChart3, TrendingUp, Users, AlertTriangle,
  Calendar, DollarSign,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  scheduled:   "#6366f1",
  confirmed:   "#14b8a6",
  in_progress: "#f59e0b",
  completed:   "#4ade80",
  cancelled:   "#f87171",
  no_show:     "#94a3b8",
  rescheduled: "#a78bfa",
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

const GENDER_COLORS = ["#6366f1", "#14b8a6", "#f59e0b"];
const GENDER_LABELS: Record<string, string> = {
  male: "Male", female: "Female", other: "Other",
};

const DATE_RANGES = [
  { label: "All time", from: "", to: "" },
  { label: "This year", from: `${new Date().getFullYear()}-01-01`, to: `${new Date().getFullYear()}-12-31` },
  { label: "Last 30 days", from: new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) },
];

function fmt(val: string | number | null | undefined) {
  const n = Number(val ?? 0);
  return isNaN(n) ? "—" : `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

const ChartTooltip = ({
  active, payload, labelKey = "label", valueKey = "total",
}: {
  active?: boolean;
  payload?: Array<{ payload: Record<string, unknown> }>;
  labelKey?: string;
  valueKey?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs font-body">
      <p className="text-text-secondary mb-0.5">{String(payload[0].payload[labelKey] ?? "")}</p>
      <p className="font-bold text-text-primary">{String(payload[0].payload[valueKey] ?? "")}</p>
    </div>
  );
};

export default function ReportsPage() {
  const [range, setRange] = useState(0);
  const { from, to } = DATE_RANGES[range];

  const { data: apptData, isLoading: apptLoading } = useQuery({
    queryKey: ["report-appointments", from, to],
    queryFn: () => fetchReportAppointments(from || undefined, to || undefined),
  });

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["report-revenue"],
    queryFn: fetchReportRevenue,
  });

  const { data: noShow, isLoading: nsLoading } = useQuery({
    queryKey: ["report-noshow"],
    queryFn: fetchReportNoShow,
  });

  const { data: demographics, isLoading: demoLoading } = useQuery({
    queryKey: ["report-demographics"],
    queryFn: fetchReportDemographics,
  });

  const apptChartData = (apptData ?? []).map((d) => ({
    ...d,
    label: STATUS_LABELS[d.status] ?? d.status,
    total: Number(d.total),
  }));

  const totalAppts = apptChartData.reduce((s, d) => s + d.total, 0);
  const completedAppts = apptChartData.find((d) => d.status === "completed")?.total ?? 0;
  const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;

  const genderData = (demographics?.byGender ?? []).map((d) => ({
    ...d,
    total: Number(d.total),
    label: GENDER_LABELS[d.gender] ?? d.gender,
  }));

  const totalPatients = genderData.reduce((s, d) => s + d.total, 0);

  // Simulated area chart data using appointment statuses as time proxies
  const areaData = apptChartData.map((d) => ({
    name: d.label,
    value: d.total,
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-up">

      {/* Header + date range filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-text-tertiary font-body uppercase tracking-wider mb-1">Analytics</p>
          <h2 className="font-display font-bold text-xl text-text-primary tracking-tight">Reports overview</h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border">
          {DATE_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRange(i)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium font-body transition-all cursor-pointer",
                range === i
                  ? "bg-primary-500 text-white shadow-glow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total appointments",
            value: totalAppts,
            icon: <Calendar size={16} />,
            accent: "text-primary-400",
            bg: "bg-primary-500/10 border-primary-500/20",
            loading: apptLoading,
          },
          {
            label: "Completion rate",
            value: `${completionRate}%`,
            icon: <TrendingUp size={16} />,
            accent: "text-success",
            bg: "bg-success/10 border-success/20",
            loading: apptLoading,
          },
          {
            label: "No-show rate",
            value: noShow?.rate ?? "0%",
            icon: <AlertTriangle size={16} />,
            accent: "text-warning",
            bg: "bg-warning/10 border-warning/20",
            loading: nsLoading,
          },
          {
            label: "Total revenue",
            value: fmt(revenue?.totalRevenue),
            icon: <DollarSign size={16} />,
            accent: "text-teal-400",
            bg: "bg-teal-500/10 border-teal-500/20",
            loading: revLoading,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-2xl bg-card border border-border">
            <div className={cn("w-8 h-8 rounded-xl border flex items-center justify-center mb-3", kpi.bg, kpi.accent)}>
              {kpi.icon}
            </div>
            {kpi.loading ? (
              <>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-3.5 w-32" />
              </>
            ) : (
              <>
                <p className={cn("font-display font-bold text-2xl leading-none mb-1", kpi.accent)}>
                  {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                </p>
                <p className="text-xs text-text-muted font-body">{kpi.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-12 gap-4">

        {/* Appointment status breakdown — 8 cols */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display font-bold text-sm text-text-primary">Appointments by status</p>
              <p className="text-xs text-text-tertiary font-body mt-0.5">{totalAppts.toLocaleString()} total</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <BarChart3 size={14} className="text-primary-400" />
            </div>
          </div>

          {apptLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : !apptChartData.length ? (
            <div className="flex items-center justify-center h-48 text-text-muted text-sm font-body">
              No data for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={apptChartData} barSize={32} barCategoryGap="25%">
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
                  axisLine={false} tickLine={false} width={28}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {apptChartData.map((d) => (
                    <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? "#6366f1"} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Patient demographics — 4 cols */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display font-bold text-sm text-text-primary">Patient demographics</p>
              <p className="text-xs text-text-tertiary font-body mt-0.5">{totalPatients} patients</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Users size={14} className="text-teal-400" />
            </div>
          </div>

          {demoLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : !genderData.length ? (
            <div className="flex items-center justify-center h-40 text-text-muted text-sm font-body">No data</div>
          ) : (
            <div className="flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="total"
                    innerRadius={38}
                    outerRadius={58}
                    strokeWidth={0}
                    paddingAngle={3}
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<ChartTooltip labelKey="label" valueKey="total" />}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col gap-2">
                {genderData.map((d, i) => {
                  const pct = totalPatients > 0 ? Math.round((d.total / totalPatients) * 100) : 0;
                  return (
                    <div key={d.gender} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: GENDER_COLORS[i % GENDER_COLORS.length] }} />
                      <span className="text-xs text-text-secondary font-body flex-1">{d.label}</span>
                      <span className="text-xs font-medium text-text-primary font-body">{d.total}</span>
                      <span className="text-xs text-text-muted font-body w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-12 gap-4">

        {/* Revenue breakdown — 5 cols */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
              <DollarSign size={14} className="text-success" />
            </div>
            <p className="font-display font-bold text-sm text-text-primary">Revenue breakdown</p>
          </div>

          {revLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: "Total billed",      value: revenue?.totalRevenue,   color: "text-text-primary",  bar: "bg-primary-500" },
                { label: "Patient paid",       value: revenue?.totalPaid,       color: "text-success",       bar: "bg-success" },
                { label: "Insurance covered",  value: revenue?.totalInsurance,  color: "text-teal-400",      bar: "bg-teal-400" },
              ].map(({ label, value, color, bar }) => {
                const n = Number(value ?? 0);
                const total = Number(revenue?.totalRevenue ?? 1);
                const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                return (
                  <div key={label} className="p-3 rounded-xl bg-surface border border-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-secondary font-body">{label}</span>
                      <span className={cn("text-sm font-bold font-display", color)}>{fmt(value)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-500", bar)}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20 mt-1">
                <span className="text-xs text-text-secondary font-body">Paid bills</span>
                <span className="text-sm font-bold font-display text-primary-400">
                  {Number(revenue?.billCount ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* No-show analysis — 3 cols */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
              <AlertTriangle size={14} className="text-warning" />
            </div>
            <p className="font-display font-bold text-sm text-text-primary">No-show analysis</p>
          </div>

          {nsLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Big rate number */}
              <div className="text-center py-4">
                <p className="font-display font-bold text-5xl text-warning leading-none">
                  {noShow?.rate ?? "0%"}
                </p>
                <p className="text-xs text-text-muted font-body mt-2">no-show rate</p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-700"
                  style={{ width: noShow?.rate ?? "0%" }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-surface border border-border/60 text-center">
                  <p className="font-display font-bold text-lg text-danger">{Number(noShow?.noShows ?? 0)}</p>
                  <p className="text-[10px] text-text-muted font-body">No-shows</p>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border/60 text-center">
                  <p className="font-display font-bold text-lg text-text-primary">{Number(noShow?.total ?? 0)}</p>
                  <p className="text-[10px] text-text-muted font-body">Total</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Distribution area chart — 4 cols */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <TrendingUp size={14} className="text-violet-400" />
            </div>
            <p className="font-display font-bold text-sm text-text-primary">Status distribution</p>
          </div>

          {apptLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-dm-sans)" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-dm-sans)" }}
                  axisLine={false} tickLine={false} width={24}
                />
                <Tooltip content={<ChartTooltip labelKey="name" valueKey="value" />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}