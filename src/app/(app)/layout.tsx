"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CITTButton } from "@/components/layout/CITTButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";

const ONBOARDING_STEPS = [
  "/onboarding/home",
  "/onboarding/scanback",
  "/onboarding/signing-types",
  "/onboarding/booking",
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoadingUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const { setOnboardingStep } = useUIStore();

  // Redirect to onboarding if authenticated but onboarding not complete
  useEffect(() => {
    if (
      !isLoadingUser &&
      isAuthenticated &&
      user &&
      !user.onboarding_completed
    ) {
      const step = user.onboarding_step ?? 1;
      setOnboardingStep(step);
      const targetStep = ONBOARDING_STEPS[step - 1] ?? "/onboarding/home";
      router.replace(targetStep);
    }
  }, [isLoadingUser, isAuthenticated, user, router, setOnboardingStep]);

  // While checking auth, show nothing
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          <span className="font-inter text-sm text-slate-secondary">
            Loading…
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated — should have been caught by middleware, but safety redirect
  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <Sidebar isPro={isPro} username={user?.username} />

      {/* Main content area */}
      <main className="flex-1 min-w-0 lg:ml-0">
        {/* Mobile top bar — 56px height per prototype */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-border h-[56px] flex items-center justify-between px-4 safe-area-top">
          <span className="font-sora font-semibold text-base text-primary-navy">
            Notary Day
          </span>
        </div>

        {/* Page content — offset for mobile top bar (56px) */}
        <div className="pt-[56px] lg:pt-0 pb-[60px] lg:pb-0">{children}</div>

        {/* Mobile bottom nav — 60px height */}
        <BottomNav isPro={isPro} username={user?.username} />

        {/* CITT floating action button — 50px circle, positioned above bottom nav */}
        <CITTButton />
      </main>
    </div>
  );
}
