"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  FileText, CreditCard, BarChart3, Bell,
  LogOut, Settings, AlertTriangle, X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { fetchAllNotifications } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

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
  { href: "/medical-records", label: "Medical Records", icon: <FileText size={16} />,        roles: ["admin", "doctor", "patient"] },
  { href: "/billing",         label: "Billing",         icon: <CreditCard size={16} />,      roles: ["admin", "patient"] },
  { href: "/reports",         label: "Reports",         icon: <BarChart3 size={16} />,       roles: ["admin", "doctor"] },
  { href: "/notifications",   label: "Notifications",   icon: <Bell size={16} />,            roles: ["admin", "doctor", "patient"], badgeQuery: true },
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin:   "Administrator",
  doctor:  "Doctor",
  patient: "Patient",
};

const ROLE_COLORS: Record<UserRole, { pill: string; avatar: string }> = {
  admin:   { pill: "bg-amber-500/10 text-amber-400 border-amber-500/20",    avatar: "bg-amber-500/15 text-amber-400" },
  doctor:  { pill: "bg-teal-500/10 text-teal-400 border-teal-500/20",      avatar: "bg-teal-500/15 text-teal-400" },
  patient: { pill: "bg-violet-500/10 text-violet-400 border-violet-500/20", avatar: "bg-violet-500/15 text-violet-400" },
};

/* ─── Logout Confirmation Dialog ─── */
function LogoutDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-text-primary leading-none">Sign out</p>
                <p className="text-xs text-text-tertiary font-body mt-1">DACS Healthcare OS</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <Separator className="bg-border/60" />

          {/* Body */}
          <div className="px-5 py-4">
            <p className="text-sm text-text-secondary font-body leading-relaxed">
              Are you sure you want to sign out? You will be redirected to the login page and any unsaved changes will be lost.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 pb-5">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 h-9 font-body cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onConfirm}
              className="flex-1 h-9 font-body bg-red-500 hover:bg-red-600 text-white border-0 cursor-pointer"
            >
              <LogOut size={13} className="mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Sidebar ─── */
export function AppSidebar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user, displayName, clearAuth } = useAuthStore();
  const role       = (user?.role ?? "patient") as UserRole;
  const [logoutOpen, setLogoutOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn:  () => fetchAllNotifications(),
    enabled:  !!user,
    staleTime: 60_000,
  });

  const unreadCount = (notifications ?? []).filter(
    (n) => n.notificationsStatus === "pending" || n.notificationsStatus === "sent"
  ).length;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogoutConfirm = () => {
    clearAuth();
    router.replace("/login");
  };

  const initials = displayName()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const roleStyle = ROLE_COLORS[role];

  return (
    <>
      <Sidebar collapsible="icon">

        {/* ── Brand header ── */}
        <SidebarHeader className="border-b border-border/60">
          <div className="flex items-center gap-3 px-3 py-[14px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="9" cy="9" r="2" fill="white" />
              </svg>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-display font-extrabold text-[15px] text-sidebar-foreground leading-none tracking-tight">
                DACS
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 font-body mt-[3px] tracking-widest uppercase">
                Healthcare OS
              </p>
            </div>
          </div>
        </SidebarHeader>

        {/* ── Nav items ── */}
        <SidebarContent className="px-2 py-3">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 font-body">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  const badge = item.badgeQuery ? unreadCount : 0;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "relative h-9 rounded-lg text-[13px] font-body font-medium transition-all duration-150",
                          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:mx-auto",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-2.5 w-full">
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="group-data-[collapsible=icon]:hidden flex-1 leading-none">
                            {item.label}
                          </span>
                          {badge > 0 && (
                            <>
                              {/* Expanded: pill counter */}
                              <span className="group-data-[collapsible=icon]:hidden ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-[10px] font-bold text-primary">
                                {badge > 99 ? "99+" : badge}
                              </span>
                              {/* Collapsed: dot */}
                              <span className="group-data-[collapsible=icon]:block hidden absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-sidebar" />
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="border-t border-border/60 p-2 pb-3">
          <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Settings"
                className={cn(
                  "h-9 rounded-lg text-[13px] font-body font-medium transition-all duration-150",
                  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:mx-auto",
                  pathname === "/settings"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Link href="/settings" className="flex items-center gap-2.5">
                  <Settings size={16} className="flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={() => setLogoutOpen(true)}
                className={cn(
                  "h-9 rounded-lg text-[13px] font-body font-medium transition-all duration-150 cursor-pointer",
                  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:mx-auto",
                  "text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/8"
                )}
              >
                <LogOut size={16} className="flex-shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden ml-2.5">Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* ── User profile (expanded) ── */}
          <div className="group-data-[collapsible=icon]:hidden mt-2">
            <Separator className="mb-3 bg-border/60" />
            <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-default">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold font-display",
                roleStyle.avatar
              )}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold font-body text-sidebar-foreground truncate leading-none mb-1">
                  {displayName()}
                </p>
                <span className={cn(
                  "inline-flex items-center px-1.5 py-[2px] rounded-md text-[10px] font-semibold font-body border leading-none",
                  roleStyle.pill
                )}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </div>
          </div>

          {/* ── User avatar (collapsed) ── */}
          <div className="group-data-[collapsible=icon]:flex hidden justify-center mt-2 pt-2 border-t border-border/60">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-display",
              roleStyle.avatar
            )}>
              {initials}
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <LogoutDialog
        open={logoutOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}