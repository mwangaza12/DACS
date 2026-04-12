"use client";

import { Bell, Search, X, Calendar, FileText, CreditCard, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNotifications, markNotificationRead } from "@/lib/queries";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { NotificationWithRelations } from "@/types";

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

// ── Command palette entries ───────────────────────────────────────────────────
const COMMANDS = [
  { label: "Appointments",     href: "/appointments",    icon: <Calendar size={14} /> },
  { label: "New appointment",  href: "/appointments/new",icon: <Calendar size={14} /> },
  { label: "Patients",         href: "/patients",         icon: <Users size={14} /> },
  { label: "Medical records",  href: "/medical-records",  icon: <FileText size={14} /> },
  { label: "Billing",          href: "/billing",          icon: <CreditCard size={14} /> },
  { label: "Reports",          href: "/reports",          icon: <FileText size={14} /> },
  { label: "Notifications",    href: "/notifications",    icon: <Bell size={14} /> },
];

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const results = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setActiveIdx(0); }, [query]);

  const go = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) go(results[activeIdx].href);
    if (e.key === "Escape") onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4">
        <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden animate-fade-up">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
            <Search size={15} className="text-text-muted shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search pages and actions…"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none font-body"
            />
            <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Results */}
          <div className="py-2 max-h-72 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-sm text-text-muted font-body text-center py-6">No results for "{query}"</p>
            ) : (
              results.map((cmd, i) => (
                <button
                  key={cmd.href}
                  onClick={() => go(cmd.href)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body transition-colors text-left",
                    i === activeIdx
                      ? "bg-primary-500/10 text-primary-400"
                      : "text-text-secondary hover:bg-surface"
                  )}
                >
                  <span className={cn(
                    "shrink-0",
                    i === activeIdx ? "text-primary-400" : "text-text-muted"
                  )}>
                    {cmd.icon}
                  </span>
                  {cmd.label}
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-border/60 flex items-center gap-3 text-[10px] text-text-muted font-body">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Notifications dropdown ────────────────────────────────────────────────────
function NotificationIcon({ type }: { type: string }) {
  const cls = "shrink-0";
  if (type === "email")  return <Bell size={13} className={cls} />;
  if (type === "sms")    return <Bell size={13} className={cls} />;
  return <Bell size={13} className={cls} />;
}

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const ref    = useRef<HTMLDivElement>(null);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications", "header"],
    queryFn:  () => fetchAllNotifications(1, 10),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const unread = notifications.filter(
    (n) => n.notificationsStatus === "pending" || n.notificationsStatus === "sent"
  );

  const handleMark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationRead(id);
    refetch();
  };

  const fmtTime = (d: string) => {
    try { return format(parseISO(d), "MMM d, h:mm a"); }
    catch { return ""; }
  };

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden animate-fade-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-primary font-body">Notifications</p>
          {unread.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary-500/15 text-primary-400 text-[10px] font-semibold">
              {unread.length}
            </span>
          )}
        </div>
        <button
          onClick={() => { router.push("/notifications"); onClose(); }}
          className="text-xs text-primary-400 hover:underline font-body"
        >
          View all
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-text-muted font-body">
            No notifications
          </div>
        ) : (
          (notifications as NotificationWithRelations[]).map((n) => {
            const isUnread = n.notificationsStatus === "pending" || n.notificationsStatus === "sent";
            return (
              <div
                key={n.notificationId}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 transition-colors cursor-default",
                  isUnread ? "bg-primary-500/5 hover:bg-primary-500/8" : "hover:bg-surface/60"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5",
                  isUnread
                    ? "bg-primary-500/10 border-primary-500/20 text-primary-400"
                    : "bg-surface border-border text-text-muted"
                )}>
                  <NotificationIcon type={n.notificationType} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {n.subject && (
                    <p className="text-xs font-semibold text-text-primary font-body truncate">{n.subject}</p>
                  )}
                  <p className="text-xs text-text-secondary font-body line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  {/* Linked appointment context */}
                  {n.appointment && (
                    <p className="text-[10px] text-text-muted font-body mt-0.5">
                      {n.appointment.appointmentType} ·{" "}
                      {(() => {
                        try { return format(parseISO(n.appointment.appointmentDate), "MMM d"); }
                        catch { return n.appointment.appointmentDate; }
                      })()}
                      {" at "}{n.appointment.appointmentTime.slice(0, 5)}
                    </p>
                  )}
                  <p className="text-[10px] text-text-muted font-body mt-1">
                    {fmtTime(n.sentAt ?? n.createdAt)}
                  </p>
                </div>

                {/* Mark read dot */}
                {isUnread && (
                  <button
                    onClick={(e) => handleMark(n.notificationId, e)}
                    title="Mark as read"
                    className="w-2 h-2 rounded-full bg-primary-400 shrink-0 mt-2 hover:bg-primary-300 transition-colors"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border/60 text-center">
        <button
          onClick={() => { router.push("/notifications"); onClose(); }}
          className="text-xs text-text-muted hover:text-text-secondary font-body transition-colors"
        >
          See all notifications →
        </button>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header() {
  const pathname = usePathname();
  const { displayName } = useAuthStore();
  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifsOpen, setNotifsOpen]   = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", "header"],
    queryFn:  () => fetchAllNotifications(1, 10),
    refetchInterval: 60_000, // poll every minute
  });

  const unreadCount = notifications.filter(
    (n) => n.notificationsStatus === "pending" || n.notificationsStatus === "sent"
  ).length;

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  )?.[1] ?? "DACS";

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-border/60 bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="lg:hidden" />
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
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border text-text-tertiary hover:border-primary-500/40 hover:text-text-secondary transition-all duration-150 text-xs font-body cursor-pointer"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-border/80 text-[10px] font-mono text-text-muted">
              ⌘K
            </kbd>
          </button>

          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setNotifsOpen((v) => !v)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border text-text-tertiary hover:border-primary-500/40 hover:text-text-secondary transition-all duration-150 cursor-pointer"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-400 ring-1 ring-surface" />
              )}
            </button>

            {notifsOpen && (
              <NotificationsDropdown onClose={() => setNotifsOpen(false)} />
            )}
          </div>
        </div>
      </header>

      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} />}
    </>
  );
}