"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { fetchPatients, fetchDoctors } from "@/lib/queries";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Bell, Mail, MessageSquare, Smartphone, Send,
  Users, Stethoscope, User, CheckCircle, X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type NotifType = "email" | "sms" | "push" | "in_app";
type Recipient = "single" | "all_patients" | "all_doctors" | "all_users";

const NOTIF_TYPES: { value: NotifType; label: string; icon: React.ReactNode }[] = [
  { value: "email",  label: "Email",    icon: <Mail size={14} /> },
  { value: "in_app", label: "In-app",   icon: <Bell size={14} /> },
  { value: "sms",    label: "SMS",      icon: <MessageSquare size={14} /> },
  { value: "push",   label: "Push",     icon: <Smartphone size={14} /> },
];

const RECIPIENT_OPTIONS: { value: Recipient; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "single",       label: "Specific user",   icon: <User size={14} />,        desc: "Send to one patient or doctor" },
  { value: "all_patients", label: "All patients",    icon: <Users size={14} />,       desc: "Broadcast to every patient" },
  { value: "all_doctors",  label: "All doctors",     icon: <Stethoscope size={14} />, desc: "Broadcast to every doctor" },
  { value: "all_users",    label: "Everyone",        icon: <Bell size={14} />,        desc: "Send to all users in the system" },
];

// ── API helper ─────────────────────────────────────────────────────────────────
const sendNotification = async (payload: {
  userId: string;
  notificationType: NotifType;
  subject?: string;
  message: string;
}) => {
  const res = await api.post("/notifications/send", payload);
  return res.data;
};

// ── Sent log entry ─────────────────────────────────────────────────────────────
interface SentEntry {
  id: string;
  recipients: string;
  type: NotifType;
  subject: string;
  message: string;
  sentAt: string;
  count: number;
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SendNotificationsPage() {
  const router = useRouter();
  const { isAdmin, user } = useAuthStore();

  // Guard — admin only
  if (!isAdmin()) {
    router.replace("/dashboard");
    return null;
  }

  const [recipientMode, setRecipientMode] = useState<Recipient>("single");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [notifType, setNotifType] = useState<NotifType>("in_app");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentLog, setSentLog] = useState<SentEntry[]>([]);

  // Fetch users for the single-select dropdown
  const { data: patients } = useQuery({
    queryKey: ["patients", "all"],
    queryFn: () => fetchPatients(1, 200),
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => fetchDoctors(1, 200),
  });

  // Build a merged user list for the search
  const allUsers = [
    ...(patients ?? []).map((p: { patientId: string; firstName: string; lastName: string }) => ({
      id: p.patientId,
      name: `${p.firstName} ${p.lastName}`,
      role: "Patient",
    })),
    ...(doctors ?? []).map((d: { doctorId: string; firstName: string; lastName: string }) => ({
      id: d.doctorId,
      name: `Dr. ${d.firstName} ${d.lastName}`,
      role: "Doctor",
    })),
  ];

  const filteredUsers = allUsers.filter((u) =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!message.trim()) throw new Error("Message is required.");

      let targets: { id: string; name: string }[] = [];

      if (recipientMode === "single") {
        if (!selectedUserId) throw new Error("Please select a recipient.");
        const found = allUsers.find((u) => u.id === selectedUserId);
        targets = [{ id: selectedUserId, name: found?.name ?? "Unknown" }];
      } else if (recipientMode === "all_patients") {
        targets = (patients ?? []).map((p: { patientId: string; firstName: string; lastName: string }) => ({
          id: p.patientId,
          name: `${p.firstName} ${p.lastName}`,
        }));
      } else if (recipientMode === "all_doctors") {
        targets = (doctors ?? []).map((d: { doctorId: string; firstName: string; lastName: string }) => ({
          id: d.doctorId,
          name: `Dr. ${d.firstName} ${d.lastName}`,
        }));
      } else {
        // all_users — patients + doctors
        targets = allUsers.map((u) => ({ id: u.id, name: u.name }));
      }

      if (targets.length === 0) throw new Error("No recipients found.");

      // Send to each recipient sequentially
      for (const target of targets) {
        await sendNotification({
          userId: target.id,
          notificationType: notifType,
          subject: subject.trim() || undefined,
          message: message.trim(),
        });
      }

      return targets;
    },
    onSuccess: (targets) => {
      const entry: SentEntry = {
        id: crypto.randomUUID(),
        recipients:
          recipientMode === "single"
            ? allUsers.find((u) => u.id === selectedUserId)?.name ?? "Unknown"
            : RECIPIENT_OPTIONS.find((r) => r.value === recipientMode)?.label ?? recipientMode,
        type: notifType,
        subject: subject.trim() || "(no subject)",
        message: message.trim(),
        sentAt: new Date().toLocaleTimeString(),
        count: targets.length,
      };
      setSentLog((prev) => [entry, ...prev]);
      setMessage("");
      setSubject("");
      setError(null);
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
          (err as { message?: string })?.message ??
          "Failed to send notification."
      );
    },
  });

  const selectedUserName = allUsers.find((u) => u.id === selectedUserId)?.name;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-xl text-foreground">Send Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Broadcast messages to patients, doctors, or individual users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Compose form ── */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Recipient mode */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recipients
            </p>
            <div className="grid grid-cols-2 gap-2">
              {RECIPIENT_OPTIONS.map(({ value, label, icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setRecipientMode(value); setSelectedUserId(""); setUserSearch(""); }}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer",
                    recipientMode === value
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-accent border-border text-muted-foreground hover:border-primary/20 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-1.5 font-medium text-sm">
                    {icon} {label}
                  </div>
                  <p className="text-[11px] opacity-70">{desc}</p>
                </button>
              ))}
            </div>

            {/* Single user picker */}
            {recipientMode === "single" && (
              <div className="mt-4 flex flex-col gap-2">
                <Label className="text-xs">Search user</Label>
                <Input
                  placeholder="Type a name…"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setSelectedUserId(""); }}
                  className="h-8 text-sm"
                />
                {userSearch && !selectedUserId && (
                  <div className="border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-3">No users found</p>
                    ) : filteredUsers.slice(0, 10).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { setSelectedUserId(u.id); setUserSearch(u.name); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                      >
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {u.role}
                        </span>
                        {u.name}
                      </button>
                    ))}
                  </div>
                )}
                {selectedUserId && selectedUserName && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                    <CheckCircle size={13} className="text-primary" />
                    <span className="text-sm text-primary font-medium">{selectedUserName}</span>
                    <button
                      onClick={() => { setSelectedUserId(""); setUserSearch(""); }}
                      className="ml-auto text-primary/60 hover:text-primary"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification type */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Channel
            </p>
            <div className="grid grid-cols-4 gap-2">
              {NOTIF_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNotifType(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                    notifType === value
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-accent border-border text-muted-foreground hover:border-primary/20 hover:text-foreground",
                  )}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Message
            </p>

            {notifType === "email" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Appointment reminder"
                  className="h-9 text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Message body</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your notification message here…"
                rows={5}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground text-right">{message.length} chars</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2">
                <X size={13} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !message.trim()}
              className="w-full gap-2"
            >
              <Send size={14} />
              {mutation.isPending
                ? "Sending…"
                : recipientMode === "single"
                  ? "Send notification"
                  : `Broadcast to ${RECIPIENT_OPTIONS.find((r) => r.value === recipientMode)?.label}`}
            </Button>
          </div>
        </div>

        {/* ── Sent log ── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sent this session
          </p>

          {sentLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border border-dashed border-border text-muted-foreground">
              <Bell size={22} />
              <p className="text-sm">No notifications sent yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sentLog.map((entry) => (
                <div key={entry.id} className="p-4 rounded-2xl bg-card border border-border flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                        entry.type === "email"  && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                        entry.type === "in_app" && "bg-primary/10 text-primary border-primary/20",
                        entry.type === "sms"    && "bg-teal-500/10 text-teal-400 border-teal-500/20",
                        entry.type === "push"   && "bg-violet-500/10 text-violet-400 border-violet-500/20",
                      )}>
                        {entry.type}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{entry.sentAt}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-green-500">
                      <CheckCircle size={11} />
                      {entry.count} sent
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">→ {entry.recipients}</p>
                  {entry.subject !== "(no subject)" && (
                    <p className="text-xs text-muted-foreground truncate font-medium">{entry.subject}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2">{entry.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}