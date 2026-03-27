import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-r from-card via-border/40 to-card",
        "bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}