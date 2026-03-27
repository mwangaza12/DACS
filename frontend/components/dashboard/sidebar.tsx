"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  FileText, CreditCard, BarChart3, Bell,
  LogOut, Settings, Menu, X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { fetchAllNotifications } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badgeQuery?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["admin", "doctor", "patient"] },
  { href: "/appointments", label: "Appointments", icon: <Calendar className="h-4 w-4" />, roles: ["admin", "doctor", "patient"] },
  { href: "/patients", label: "Patients", icon: <Users className="h-4 w-4" />, roles: ["admin", "doctor"] },
  { href: "/doctors", label: "Doctors", icon: <Stethoscope className="h-4 w-4" />, roles: ["admin"] },
  { href: "/medical-records", label: "Medical records", icon: <FileText className="h-4 w-4" />, roles: ["admin", "doctor", "patient"] },
  { href: "/billing", label: "Billing", icon: <CreditCard className="h-4 w-4" />, roles: ["admin", "patient"] },
  { href: "/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" />, roles: ["admin", "doctor"] },
  { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" />, roles: ["admin", "doctor", "patient"], badgeQuery: true },
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  patient: "Patient",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  doctor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  patient: "bg-primary/10 text-primary border-primary/20",
};

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, displayName, clearAuth } = useAuthStore();
  const role = (user?.role ?? "patient") as UserRole;

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

  const getInitials = () => {
    const name = displayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="9" cy="9" r="2" fill="white"/>
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-sm text-foreground leading-none tracking-tight">DACS</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Healthcare OS</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent border border-border">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate leading-none mb-1">
              {displayName()}
            </p>
            <Badge variant="outline" className={cn("text-[10px] font-medium px-1.5 py-0", ROLE_COLORS[role])}>
              {ROLE_LABELS[role]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const badge = item.badgeQuery ? unreadCount : 0;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span className={cn(
                  "transition-colors flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {badge > 0 && (
                  <Badge className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {badge > 99 ? "99+" : badge}
                  </Badge>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
        <Link
          href="/settings"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 justify-start w-full h-auto"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-background border-r border-border fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-background border-border text-muted-foreground hover:text-foreground shadow-md"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border z-50 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}