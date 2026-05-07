"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { ROUTES } from "@/config/routes";
import CITTModal from "@/components/citt/CITTModal";

const ONBOARDING_STEPS = [
  ROUTES.ONBOARDING.HOME,
  ROUTES.ONBOARDING.SCANBACK,
  ROUTES.ONBOARDING.SIGNING_TYPES,
  ROUTES.ONBOARDING.PLAN,
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
      const targetStep = ONBOARDING_STEPS[step - 1] ?? ROUTES.ONBOARDING.HOME;
      router.replace(targetStep);
    }
  }, [isLoadingUser, isAuthenticated, user, router, setOnboardingStep]);

  // Safety redirect if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [isLoadingUser, isAuthenticated, router]);

  // While checking auth, show nothing
  if (isLoadingUser || !isAuthenticated) {
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

  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <Sidebar isPro={isPro} username={user?.username} />

      {/* Main content area */}
      <main className="flex-1 min-w-0 lg:ml-0">
        {/* Mobile top bar — 56px height per prototype */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-border h-[56px] flex items-center justify-between px-4 safe-area-top">
          <span className="font-sora font-bold text-[17px] text-primary-navy">
            Notary Day
          </span>
          {user && (
            <div className="flex items-center gap-3">
              {isPro ? (
                <span className="bg-pro-gold/15 text-primary-navy font-bold text-[10px] uppercase px-2 py-0.5 rounded-[4px] border border-pro-gold/30">
                  Pro
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-secondary font-bold text-[10px] uppercase px-2 py-0.5 rounded-[4px] border border-slate-200">
                  Free
                </span>
              )}
              <div className="w-8 h-8 rounded-full bg-primary-navy text-white text-[11px] font-semibold flex items-center justify-center font-inter border border-white/10 shadow-sm">
                {(user.full_name || user.username || "??").slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Page content — offset for mobile top bar (56px) */}
        <div className="pt-[56px] lg:pt-0 pb-[60px] lg:pb-0">{children}</div>

        {/* Mobile bottom nav — 60px height */}
        <BottomNav
          isPro={isPro}
          username={user?.username ?? user?.full_name?.split(" ")[0]}
        />

        {/* Global CITT Modal */}
        <CITTModal />
      </main>
    </div>
  );
}
