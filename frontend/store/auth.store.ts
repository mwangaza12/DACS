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

  // Derived helpers
  isAdmin: () => boolean;
  isDoctor: () => boolean;
  isPatient: () => boolean;
  displayName: () => string;
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
        // Also store tokens in localStorage for axios interceptors
        localStorage.setItem("dacs_access_token", accessToken);
        localStorage.setItem("dacs_refresh_token", refreshToken);

        set({ user, profile, accessToken, refreshToken, isAuthenticated: true });
      },

      setTokens: (accessToken) => {
        localStorage.setItem("dacs_access_token", accessToken);
        set({ accessToken });
      },

      clearAuth: () => {
        clearAuthTokens();
        set({
          user: null,
          profile: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      isAdmin: () => get().user?.role === "admin",
      isDoctor: () => get().user?.role === "doctor",
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
      // Don't persist the full token — we handle that manually so the axios
      // interceptors always read from localStorage["dacs_access_token"] directly
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
