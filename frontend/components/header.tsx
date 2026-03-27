"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { fetchAllNotifications } from "@/lib/queries";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":       "Dashboard",
  "/appointments":    "Appointments",
  "/patients":        "Patients",
  "/doctors":         "Doctors",
  "/medical-records": "Medical records",
  "/billing":         "Billing",
  "/reports":         "Reports",
  "/notifications":   "Notifications",
  "/settings":        "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { displayName, user } = useAuthStore();

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn:  () => fetchAllNotifications(),
    enabled:  !!user,
    staleTime: 60_000,
  });

  const unreadCount = (notifications ?? []).filter(
    (n) => n.notificationsStatus === "pending" || n.notificationsStatus === "sent"
  ).length;

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  )?.[1] ?? "DACS";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border/60 bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
      {/* Left: title (offset for mobile hamburger) */}
      <div className="pl-12 lg:pl-0">
        <h1 className="font-display font-bold text-base lg:text-lg text-text-primary leading-none tracking-tight">
          {title}
        </h1>
        {pathname === "/dashboard" && (
          <p className="text-[11px] text-text-tertiary font-body mt-0.5 hidden sm:block">
            {greeting}, {displayName().split(" ")[0]}
          </p>
        )}
      </div>

      {/* Right: search + notifications */}
      <div className="flex items-center gap-2">
        {/* Search — hidden on smallest screens */}
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border text-text-tertiary hover:border-primary-500/40 hover:text-text-secondary transition-all duration-150 text-xs font-body cursor-pointer">
          <Search size={13} />
          <span className="hidden md:inline">Search…</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-border/80 text-[10px] font-mono text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Notifications bell */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border text-text-tertiary hover:border-primary-500/40 hover:text-text-secondary transition-all duration-150 cursor-pointer"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full",
              "bg-primary-500 text-white text-[9px] font-bold font-body flex items-center justify-center",
              "ring-2 ring-surface",
            )}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}