"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllNotifications, markNotificationRead } from "@/lib/queries";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell, Mail, MessageSquare, Smartphone, CheckCheck, CheckCircle } from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  email:  <Mail size={14} />,
  sms:    <MessageSquare size={14} />,
  push:   <Smartphone size={14} />,
  in_app: <Bell size={14} />,
};

const TYPE_STYLES: Record<string, string> = {
  email:  "bg-blue-500/10 border-blue-500/20 text-blue-400",
  sms:    "bg-teal-500/10 border-teal-500/20 text-teal-400",
  push:   "bg-violet-500/10 border-violet-500/20 text-violet-400",
  in_app: "bg-primary-500/10 border-primary-500/20 text-primary-400",
};

const STATUS_STYLES: Record<string, string> = {
  sent:      "text-success",
  delivered: "text-success",
  pending:   "text-warning",
  failed:    "text-danger",
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: rawNotifications, isLoading } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn:  () => fetchAllNotifications(),
    enabled:  isAuthenticated && !!user,
  });
  const notifications = rawNotifications as Awaited<ReturnType<typeof fetchAllNotifications>> | undefined;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = () => {
    const unread = (notifications ?? []).filter(
      (n) => n.notificationsStatus === "pending" || n.notificationsStatus === "sent"
    );
    unread.forEach((n) => markReadMutation.mutate(n.notificationId));
  };

  const unreadCount = (notifications ?? []).filter(
    (n) => n.notificationsStatus === "pending" || n.notificationsStatus === "sent"
  ).length;

  const totalCount = notifications?.length ?? 0;

  return (
    <div className="flex flex-col gap-5 animate-fade-up max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-7 w-24 rounded-xl" />
          ) : (
            <>
              {unreadCount > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <span className="text-xs font-medium text-primary-400 font-body">
                    {unreadCount} unread
                  </span>
                </div>
              )}
              <span className="text-xs text-text-tertiary font-body">
                {totalCount} notification{totalCount !== 1 ? "s" : ""} total
              </span>
            </>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markReadMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-text-secondary border border-border hover:border-primary-500/40 hover:text-primary-400 hover:bg-primary-500/5 transition-all cursor-pointer font-body disabled:opacity-50"
          >
            <CheckCircle size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !totalCount && (
        <div className="flex flex-col items-center justify-center gap-4 h-64 rounded-2xl border border-dashed border-border text-text-muted">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-secondary font-body">No notifications yet</p>
            <p className="text-xs text-text-muted font-body mt-1">Appointment reminders and alerts will appear here</p>
          </div>
        </div>
      )}

      {/* List */}
      {!isLoading && totalCount > 0 && (
        <div className="flex flex-col gap-2">
          {notifications!.map((n) => {
            const isUnread = n.notificationsStatus === "pending" || n.notificationsStatus === "sent";
            const timeAgo = (() => {
              try { return formatDistanceToNow(parseISO(n.sentAt ?? n.createdAt), { addSuffix: true }); }
              catch { return ""; }
            })();

            return (
              <div
                key={n.notificationId}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150",
                  isUnread
                    ? "bg-primary-500/5 border-primary-500/15"
                    : "bg-card border-border",
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5",
                  TYPE_STYLES[n.notificationType] ?? TYPE_STYLES.in_app,
                )}>
                  {TYPE_ICONS[n.notificationType] ?? <Bell size={14} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {n.subject && (
                    <p className="text-sm font-medium text-text-primary font-body mb-0.5 leading-snug">
                      {n.subject}
                    </p>
                  )}
                  <p className="text-sm text-text-secondary font-body leading-relaxed">{n.message}</p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn(
                      "text-[11px] font-medium font-body capitalize",
                      STATUS_STYLES[n.notificationsStatus] ?? "text-text-muted",
                    )}>
                      {n.notificationsStatus}
                    </span>
                    <span className="text-text-muted text-[11px]">·</span>
                    <span className="text-[11px] text-text-muted font-body capitalize">
                      {n.notificationType.replace("_", " ")}
                    </span>
                    {timeAgo && (
                      <>
                        <span className="text-text-muted text-[11px]">·</span>
                        <span className="text-[11px] text-text-muted font-body">{timeAgo}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mark read button */}
                {isUnread && (
                  <button
                    onClick={() => markReadMutation.mutate(n.notificationId)}
                    disabled={markReadMutation.isPending}
                    title="Mark as read"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-text-tertiary hover:text-primary-400 hover:bg-primary-500/10 transition-all cursor-pointer font-body flex-shrink-0 disabled:opacity-50"
                  >
                    <CheckCheck size={13} />
                    Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}