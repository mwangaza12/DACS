"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, Bell, Palette, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  patient: "Patient",
};

const SETTING_SECTIONS = [
  {
    label: "Account",
    icon: <User size={14} />,
    items: [
      { label: "Email", desc: "Your login email address" },
      { label: "Password", desc: "Change your password" },
      { label: "Phone number", desc: "Contact number on file" },
    ],
  },
  {
    label: "Notifications",
    icon: <Bell size={14} />,
    items: [
      { label: "Appointment reminders", desc: "Email and SMS reminders", toggle: true, defaultOn: true },
      { label: "Billing alerts", desc: "Payment due notifications", toggle: true, defaultOn: true },
      { label: "System notifications", desc: "Platform announcements", toggle: true, defaultOn: false },
    ],
  },
  {
    label: "Preferences",
    icon: <Palette size={14} />,
    items: [
      { label: "Theme", desc: "Dark mode is always on — we designed it that way ✦" },
      { label: "Language", desc: "English (Kenya)" },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, displayName, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-up flex flex-col gap-6">

      {/* Profile banner */}
      <div className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-2xl text-primary-400">
              {displayName().charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-display font-bold text-lg text-text-primary tracking-tight">{displayName()}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-tertiary font-body">{user?.email}</span>
              <span className="text-text-muted">·</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-body bg-primary-500/10 text-primary-400 border border-primary-500/20">
                {ROLE_LABELS[user?.role ?? "patient"]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings sections */}
      {SETTING_SECTIONS.map((section) => (
        <div key={section.label} className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60 bg-surface/50">
            <span className="text-text-muted">{section.icon}</span>
            <p className="text-xs font-semibold text-text-secondary font-body uppercase tracking-wider">{section.label}</p>
          </div>

          {/* Items */}
          <div className="divide-y divide-border/40">
            {section.items.map((item, i) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-text-primary font-body">{item.label}</p>
                  <p className="text-xs text-text-tertiary font-body mt-0.5">{item.desc}</p>
                </div>
                {"toggle" in item ? (
                  <Toggle defaultOn={item.defaultOn ?? false} />
                ) : (
                  <button className="text-xs text-primary-400 hover:text-primary-300 font-medium font-body transition-colors cursor-pointer">
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-danger/20 bg-danger/5">
          <Shield size={14} className="text-danger" />
          <p className="text-xs font-semibold text-danger/70 font-body uppercase tracking-wider">Danger zone</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary font-body">Sign out</p>
            <p className="text-xs text-text-tertiary font-body mt-0.5">End your current session</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut size={13} /> Sign out
          </Button>
        </div>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-text-muted font-body pb-2">
        DACS v1.0.0 · Healthcare OS · Built with Next.js 15
      </p>
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultOn} />
      <div className={cn(
        "w-9 h-5 rounded-full border transition-all duration-200",
        "bg-border border-border/80",
        "peer-checked:bg-primary-500 peer-checked:border-primary-500/60",
        "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
        "after:w-4 after:h-4 after:rounded-full after:bg-white/80",
        "after:transition-all after:duration-200",
        "peer-checked:after:translate-x-4 peer-checked:after:bg-white",
      )} />
    </label>
  );
}