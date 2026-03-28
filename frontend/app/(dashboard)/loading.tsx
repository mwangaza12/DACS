import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* KPI row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="w-20 h-8 rounded-lg" />
              <Skeleton className="w-28 h-3.5 rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Content skeletons */}
      <div className="grid grid-cols-12 gap-4">
        <Skeleton className="col-span-12 lg:col-span-8 h-72 rounded-2xl" />
        <Skeleton className="col-span-12 lg:col-span-4 h-72 rounded-2xl" />
        <Skeleton className="col-span-12 lg:col-span-7 h-64 rounded-2xl" />
        <Skeleton className="col-span-12 lg:col-span-5 h-64 rounded-2xl" />
      </div>
    </div>
  );
}