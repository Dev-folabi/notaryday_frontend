"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { ROUTES } from "@/config/routes";
import CITTModal from "@/components/citt/CITTModal";
import InstallPrompt from "@/components/pwa/InstallPrompt";

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
  const initials = (user?.full_name || user?.username || "??")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <Sidebar isPro={isPro} username={user?.username} notifCount={0} />

      {/* Mobile drawer (hamburger menu) */}
      <MobileDrawer isPro={isPro} username={user?.username} notifCount={0} />

      {/* Main content area */}
      <main className="flex-1 min-w-0 flex flex-col lg:ml-0">
        {/* Mobile top bar: 56px height per prototype */}
        <TopNav isPro={isPro} initials={initials} />

        {/* Page content */}
        <div className="flex-1 min-h-0 pb-[72px] lg:pb-0">
          {children}
        </div>

        {/* Mobile bottom nav: 64px height */}
        <BottomNav isPro={isPro} username={user?.username} />

        {/* Global CITT Modal */}
        <CITTModal />

        {/* PWA install prompt */}
        <InstallPrompt />
      </main>
    </div>
  );
}
