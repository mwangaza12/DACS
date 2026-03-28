"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { SidebarTrigger } from "@/components/ui/sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":      "Dashboard",
  "/appointments":   "Appointments",
  "/patients":       "Patients",
  "/doctors":        "Doctors",
  "/medical-records":"Medical records",
  "/billing":        "Billing",
  "/reports":        "Reports",
  "/notifications":  "Notifications",
  "/settings":       "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { displayName } = useAuthStore();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  )?.[1] ?? "DACS";

  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/60 bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-accent transition-colors" />
        <div>
          <h1 className="font-display font-bold text-lg text-text-primary leading-none tracking-tight">
            {title}
          </h1>
          {pathname === "/dashboard" && (
            <p className="text-xs text-text-tertiary font-body mt-0.5">
              {greeting}, {displayName().split(" ")[0]}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border text-text-tertiary hover:border-primary-500/40 hover:text-text-secondary transition-all duration-150 text-xs font-body cursor-pointer">
          <Search size={13} />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-border/80 text-[10px] font-mono text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Notifications bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border text-text-tertiary hover:border-primary-500/40 hover:text-text-secondary transition-all duration-150 cursor-pointer">
          <Bell size={15} />
          {/* Unread dot */}
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-400 ring-1 ring-surface" />
        </button>
      </div>
    </header>
  );
}