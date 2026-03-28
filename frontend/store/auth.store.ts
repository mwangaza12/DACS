"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, PatientProfile, DoctorProfile } from "@/types";
import { clearAuthTokens } from "@/lib/api";

interface AuthStore {
  user: User | null;
  profile: PatientProfile | DoctorProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (data: {
    user: User;
    profile: PatientProfile | DoctorProfile | null;
    accessToken: string;
    refreshToken: string;
  }) => void;

  setTokens: (accessToken: string) => void;
  clearAuth: () => void;

  isAdmin: () => boolean;
  isDoctor: () => boolean;
  isPatient: () => boolean;
  displayName: () => string;
}

/** Write a lightweight cookie readable by Next.js middleware (no httpOnly). */
function setAuthCookie(role: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `dacs_auth_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = "dacs_auth_role=; path=/; max-age=0; SameSite=Lax";
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, profile, accessToken, refreshToken }) => {
        // 1. Store tokens for axios interceptor
        localStorage.setItem("dacs_access_token", accessToken);
        localStorage.setItem("dacs_refresh_token", refreshToken);
        // 2. Set cookie for Next.js middleware (edge-readable, not httpOnly)
        setAuthCookie(user.role);

        set({ user, profile, accessToken, refreshToken, isAuthenticated: true });
      },

      setTokens: (accessToken) => {
        localStorage.setItem("dacs_access_token", accessToken);
        set({ accessToken });
      },

      clearAuth: () => {
        clearAuthTokens();
        clearAuthCookie();
        set({
          user: null,
          profile: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      isAdmin:   () => get().user?.role === "admin",
      isDoctor:  () => get().user?.role === "doctor",
      isPatient: () => get().user?.role === "patient",

      displayName: () => {
        const { profile, user } = get();
        if (!profile || !user) return user?.email ?? "User";
        if ("firstName" in profile) return `${profile.firstName} ${profile.lastName}`;
        return user.email;
      },
    }),
    {
      name: "dacs_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-sync cookie when store rehydrates from localStorage on page load
      onRehydrateStorage: () => (state) => {
        if (state?.user?.role && state.isAuthenticated) {
          setAuthCookie(state.user.role);
          // Also restore tokens to localStorage keys that axios reads
          if (state.accessToken)  localStorage.setItem("dacs_access_token",  state.accessToken);
          if (state.refreshToken) localStorage.setItem("dacs_refresh_token", state.refreshToken);
        }
      },
    }
  )
);