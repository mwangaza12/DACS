"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    icon: <User className="h-3.5 w-3.5" />,
    items: [
      { label: "Email", desc: "Your login email address", editable: true },
      { label: "Password", desc: "Change your password", editable: true },
      { label: "Phone number", desc: "Contact number on file", editable: true },
    ],
  },
  {
    label: "Notifications",
    icon: <Bell className="h-3.5 w-3.5" />,
    items: [
      { label: "Appointment reminders", desc: "Email and SMS reminders", toggle: true, defaultOn: true },
      { label: "Billing alerts", desc: "Payment due notifications", toggle: true, defaultOn: true },
      { label: "System notifications", desc: "Platform announcements", toggle: true, defaultOn: false },
    ],
  },
  {
    label: "Preferences",
    icon: <Palette className="h-3.5 w-3.5" />,
    items: [
      { label: "Theme", desc: "Dark mode is always on — we designed it that way ✦", editable: true },
      { label: "Language", desc: "English (Kenya)", editable: true },
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
    <div className="max-w-2xl mx-auto animate-fade-up flex flex-col gap-6 py-6 px-4">
      {/* Profile banner */}
      <div className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-2xl text-primary">
              {displayName().charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-display font-bold text-lg text-foreground tracking-tight">{displayName()}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{user?.email}</span>
              <span className="text-muted-foreground">·</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
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
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60 bg-accent/50">
            <span className="text-muted-foreground">{section.icon}</span>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</p>
          </div>

          {/* Items */}
          <div className="divide-y divide-border/40">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <div className="ml-4">
                  {"toggle" in item ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`switch-${item.label}`}
                        defaultChecked={item.defaultOn}
                      />
                      <Label
                        htmlFor={`switch-${item.label}`}
                        className="sr-only"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/80 h-8 px-3"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-red-500/20 bg-red-500/5">
          <Shield className="h-3.5 w-3.5 text-red-500" />
          <p className="text-xs font-semibold text-red-500/70 uppercase tracking-wider">Danger zone</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="text-xs text-muted-foreground mt-0.5">End your current session</p>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            className="gap-1"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        DACS v1.0.0 · Healthcare OS · Built with Next.js 15
      </p>
    </div>
  );
}