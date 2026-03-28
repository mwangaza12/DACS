"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  // Track whether Zustand has rehydrated from localStorage yet
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist rehydration is synchronous after the first render
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, router]);

  // Show a minimal spinner while Zustand rehydrates — prevents flash to /login
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="#818CF8" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2" fill="#818CF8"/>
              </svg>
            </div>
          </div>
          <p className="text-xs text-text-tertiary font-body tracking-wider uppercase">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}