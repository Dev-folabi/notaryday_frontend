import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Toast types ───────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

// ─── CITT pre-fill types ──────────────────────────────────────────────────────

export interface CITTPreFill {
  address?: string;
  time?: string;
  type?: string;
  fee?: number;
}

// ─── UI Store interface ────────────────────────────────────────────────────────

interface UIState {
  // CITT modal
  isCITTOpen: boolean;
  cittPreFill: CITTPreFill | null;
  openCITT: (preFill?: CITTPreFill) => void;
  closeCITT: () => void;

  // Active date for Today view
  activeDate: string;
  setActiveDate: (date: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  // Mobile sidebar (desktop is always visible)
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Onboarding step (for redirect purposes)
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
}

// ─── Store implementation ────────────────────────────────────────────────────

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // CITT
      isCITTOpen: false,
      cittPreFill: null,
      openCITT: (preFill) =>
        set({ isCITTOpen: true, cittPreFill: preFill ?? null }),
      closeCITT: () => set({ isCITTOpen: false, cittPreFill: null }),

      // Active date
      activeDate: new Date().toISOString().split("T")[0],
      setActiveDate: (date) => set({ activeDate: date }),

      // Toasts
      toasts: [],
      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { ...toast, id: crypto.randomUUID(), duration: toast.duration ?? 4000 },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // Mobile menu
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      // Onboarding
      onboardingStep: 1,
      setOnboardingStep: (step) => set({ onboardingStep: step }),
    }),
    {
      name: "notaryday-ui",
      partialize: (state) => ({
        activeDate: state.activeDate,
        onboardingStep: state.onboardingStep,
      }),
    }
  )
);
