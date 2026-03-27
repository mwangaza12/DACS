"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  accent?: "indigo" | "teal" | "amber" | "green" | "red";
  loading?: boolean;
  className?: string;
}

const ACCENTS = {
  indigo: {
    icon:    "bg-primary-500/15 border-primary-500/25 text-primary-400",
    glow:    "after:bg-primary-500/10",
    trend:   "text-primary-400",
    badge:   "bg-primary-500/10 text-primary-400 border-primary-500/20",
  },
  teal: {
    icon:    "bg-teal-500/15 border-teal-500/25 text-teal-400",
    glow:    "after:bg-teal-500/10",
    trend:   "text-teal-400",
    badge:   "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  amber: {
    icon:    "bg-warning/15 border-warning/25 text-warning",
    glow:    "after:bg-warning/10",
    trend:   "text-warning",
    badge:   "bg-warning/10 text-warning border-warning/20",
  },
  green: {
    icon:    "bg-success/15 border-success/25 text-success",
    glow:    "after:bg-success/10",
    trend:   "text-success",
    badge:   "bg-success/10 text-success border-success/20",
  },
  red: {
    icon:    "bg-danger/15 border-danger/25 text-danger",
    glow:    "after:bg-danger/10",
    trend:   "text-danger",
    badge:   "bg-danger/10 text-danger border-danger/20",
  },
};

const TREND_ICONS = {
  up:      TrendingUp,
  down:    TrendingDown,
  neutral: Minus,
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent = "indigo",
  loading = false,
  className,
}: StatCardProps) {
  const a = ACCENTS[accent];
  const TrendIcon = trend ? TREND_ICONS[trend.direction] : null;

  if (loading) {
    return (
      <div className={cn("rounded-2xl bg-card border border-border p-5 flex flex-col gap-4", className)}>
        <div className="flex items-start justify-between">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-24 h-3.5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-card border border-border p-5",
        "flex flex-col gap-4 overflow-hidden",
        "transition-all duration-200 hover:border-border/80 hover:shadow-card-hover",
        // Ambient glow via pseudo-element
        "after:absolute after:top-0 after:right-0 after:w-32 after:h-32",
        "after:rounded-full after:blur-2xl after:-translate-x-4 after:-translate-y-4",
        "after:pointer-events-none after:opacity-60",
        a.glow,
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0",
          a.icon,
        )}>
          {icon}
        </div>

        {/* Trend badge */}
        {trend && TrendIcon && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold font-body border",
            trend.direction === "up"      ? "bg-success/10 text-success border-success/20" :
            trend.direction === "down"    ? "bg-danger/10 text-danger border-danger/20" :
                                            "bg-border text-text-muted border-border",
          )}>
            <TrendIcon size={11} />
            {trend.value}
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-0.5">
        <p className="font-display font-bold text-3xl text-text-primary leading-none tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-text-secondary font-body mt-1">{label}</p>
        {trend?.label && (
          <p className="text-[11px] text-text-tertiary font-body">{trend.label}</p>
        )}
      </div>
    </div>
  );
}