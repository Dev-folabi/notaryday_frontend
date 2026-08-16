"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useUIStore } from "@/store/uiStore";
import { ROUTES } from "@/config/routes";
import CITTModal from "@/components/citt/CITTModal";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { useNavStatus } from "@/hooks/useNavStatus";
import { LOGO_URL } from "@/lib/logo";

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
  const { hasActiveSigning, unreadCount } = useNavStatus();

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

  // While checking auth, show the logo (this is the launch screen on mobile)
  if (isLoadingUser || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-bg">
        <Image
          src={LOGO_URL}
          alt="Notary Day"
          width={56}
          height={56}
          unoptimized
          className="animate-pulse"
          priority
        />
      </div>
    );
  }

  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";
  const initials = (user?.full_name || user?.username || "??")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Desktop sidebar */}
      <Sidebar
        isPro={isPro}
        username={user?.username}
        notifCount={unreadCount}
        hasActiveSigning={hasActiveSigning}
      />

      {/* Mobile drawer (hamburger menu) */}
      <MobileDrawer
        isPro={isPro}
        username={user?.username}
        notifCount={unreadCount}
        hasActiveSigning={hasActiveSigning}
      />

      {/* Main content area */}
      <main className="flex-1 min-w-0 flex flex-col lg:ml-0">
        {/* Mobile top bar: 56px height per prototype */}
        <TopNav isPro={isPro} initials={initials} />

        {/* Page content */}
        <div className="flex-1 min-h-0 pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </div>

        {/* Mobile bottom nav: 64px height */}
        <BottomNav
          unreadCount={unreadCount}
          hasActiveSigning={hasActiveSigning}
        />

        {/* Global CITT Modal */}
        <CITTModal />

        {/* PWA install prompt */}
        <InstallPrompt />
      </main>
    </div>
  );
}
