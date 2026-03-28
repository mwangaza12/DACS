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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export function AppSidebar() {
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-3 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="2" fill="white"/>
            </svg>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-display font-bold text-base text-foreground leading-none tracking-tight">DACS</p>
            <p className="text-[11px] text-muted-foreground mt-1">Healthcare OS</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-6"> {/* Increased top/bottom padding */}
        {/* Navigation */}
        <SidebarGroup>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1"> {/* Added spacing between items */}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const badge = item.badgeQuery ? unreadCount : 0;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.label}
                      className="group-data-[collapsible=icon]:justify-center py-2.5" // Increased vertical padding
                    >
                      <Link href={item.href} className="relative flex items-center">
                        <span className="group-data-[collapsible=icon]:mr-0 mr-3 flex-shrink-0">
                          {item.icon}
                        </span>
                        <span className="group-data-[collapsible=icon]:hidden flex-1">
                          {item.label}
                        </span>
                        {badge > 0 && (
                          <>
                            {/* Badge for expanded state */}
                            <Badge className="group-data-[collapsible=icon]:hidden ml-auto h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              {badge > 99 ? "99+" : badge}
                            </Badge>
                            {/* Badge for collapsed state */}
                            <Badge className="group-data-[collapsible=icon]:inline-flex hidden absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold items-center justify-center">
                              {badge > 9 ? "9+" : badge}
                            </Badge>
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

      <SidebarFooter className="border-t border-border pt-4 pb-6"> {/* Better footer spacing */}
        <SidebarMenu className="space-y-1"> {/* Spacing for footer items */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="group-data-[collapsible=icon]:justify-center py-2.5"
            >
              <Link href="/settings">
                <Settings className="group-data-[collapsible=icon]:mr-0 mr-3 h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="group-data-[collapsible=icon]:justify-center py-2.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="group-data-[collapsible=icon]:mr-0 mr-3 h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}