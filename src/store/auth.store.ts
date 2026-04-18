import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  plan: "FREE" | "PRO" | "PRO_ANNUAL" | "TEAM";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setHydrated: (value) =>
    set({
      isHydrated: value,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));