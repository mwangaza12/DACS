"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  email:  <Mail size={12} />,
  sms:    <MessageSquare size={12} />,
  push:   <Smartphone size={12} />,
  in_app: <Bell size={12} />,
};

const STATUS_STYLES: Record<string, string> = {
  sent:      "text-success",
  delivered: "text-success",
  pending:   "text-warning",
  failed:    "text-danger",
};

export function NotificationsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: fetchNotifications,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-sm text-text-primary">Notifications</p>
          <p className="text-xs text-text-tertiary font-body mt-0.5">Recent alerts</p>
        </div>
        <a href="/notifications" className="text-xs text-primary-400 hover:text-primary-300 font-body transition-colors">
          All →
        </a>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface border border-border/60">
                <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          : !data?.length
          ? (
              <div className="flex items-center justify-center h-20 text-text-tertiary text-xs font-body">
                No notifications yet
              </div>
            )
          : data.slice(0, 4).map((n) => {
              const timeAgo = (() => {
                try {
                  return formatDistanceToNow(parseISO(n.sentAt ?? n.createdAt), { addSuffix: true });
                } catch {
                  return "";
                }
              })();

              return (
                <div
                  key={n.notificationId}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border/60 hover:border-primary-500/20 transition-all duration-150"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {TYPE_ICONS[n.notificationType] ?? <Bell size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {n.subject && (
                      <p className="text-xs font-medium text-text-primary font-body truncate mb-0.5">
                        {n.subject}
                      </p>
                    )}
                    <p className="text-[11px] text-text-secondary font-body line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] font-medium font-body capitalize",
                        STATUS_STYLES[n.notificationsStatus] ?? "text-text-muted")}>
                        {n.notificationsStatus}
                      </span>
                      {timeAgo && (
                        <>
                          <span className="text-text-muted text-[10px]">·</span>
                          <span className="text-[10px] text-text-muted font-body">{timeAgo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}