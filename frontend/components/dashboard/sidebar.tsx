"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  FileText, CreditCard, BarChart3, Bell,
  LogOut, Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { fetchAllNotifications } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badgeQuery?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",       label: "Dashboard",       icon: <LayoutDashboard size={16} />, roles: ["admin", "doctor", "patient"] },
  { href: "/appointments",    label: "Appointments",    icon: <Calendar size={16} />,        roles: ["admin", "doctor", "patient"] },
  { href: "/patients",        label: "Patients",        icon: <Users size={16} />,           roles: ["admin", "doctor"] },
  { href: "/doctors",         label: "Doctors",         icon: <Stethoscope size={16} />,     roles: ["admin"] },
  { href: "/medical-records", label: "Medical records", icon: <FileText size={16} />,        roles: ["admin", "doctor", "patient"] },
  { href: "/billing",         label: "Billing",         icon: <CreditCard size={16} />,      roles: ["admin", "patient"] },
  { href: "/reports",         label: "Reports",         icon: <BarChart3 size={16} />,       roles: ["admin", "doctor"] },
  { href: "/notifications",   label: "Notifications",   icon: <Bell size={16} />,            roles: ["admin", "doctor", "patient"], badgeQuery: true },
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator", doctor: "Doctor", patient: "Patient",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin:   "bg-warning/10 text-warning border-warning/20",
  doctor:  "bg-teal-500/10 text-teal-400 border-teal-500/20",
  patient: "bg-primary-500/10 text-primary-400 border-primary-500/20",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, displayName, clearAuth } = useAuthStore();

  const role = user?.role ?? "patient";

  // Unread notification count
  const { data: notifications } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => fetchAllNotifications(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const unreadCount = (notifications ?? []).filter(
    (n) => n.notificationsStatus === "pending" || n.notificationsStatus === "sent"
  ).length;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-surface border-r border-border/60 fixed left-0 top-0 bottom-0 z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/60">
        <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="9" cy="9" r="2" fill="white"/>
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-sm text-text-primary leading-none tracking-tight">DACS</p>
          <p className="text-[10px] text-text-muted font-body mt-0.5">Healthcare OS</p>
        </div>
      </div>

      {/* User badge */}
      <div className="px-4 py-4 border-b border-border/40">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/60">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-display font-bold text-primary-400">
              {displayName().charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary font-body truncate leading-none mb-1">
              {displayName()}
            </p>
            <span className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded-md border text-[10px] font-medium font-body",
              ROLE_COLORS[role],
            )}>
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const badge = item.badgeQuery ? unreadCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium",
                "transition-all duration-150 group relative",
                isActive
                  ? "bg-primary-500/15 text-primary-300 border border-primary-500/25"
                  : "text-text-secondary hover:bg-white/4 hover:text-text-primary border border-transparent",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-400 rounded-r-full" />
              )}

              <span className={cn(
                "transition-colors flex-shrink-0",
                isActive ? "text-primary-400" : "text-text-muted group-hover:text-text-secondary",
              )}>
                {item.icon}
              </span>

              <span className="flex-1 truncate">{item.label}</span>

              {badge > 0 && (
                <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] font-bold font-body flex items-center justify-center">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-border/60 flex flex-col gap-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-text-secondary hover:bg-white/4 hover:text-text-primary transition-all duration-150 group border border-transparent"
        >
          <Settings size={16} className="text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0" />
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-text-secondary hover:bg-red-500/8 hover:text-danger transition-all duration-150 group border border-transparent w-full text-left cursor-pointer"
        >
          <LogOut size={16} className="text-text-muted group-hover:text-danger transition-colors flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}