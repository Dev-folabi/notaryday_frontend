"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/routes";
import { cta } from "@/config/marketing";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { HalftoneGradient } from "@/components/landing/backgrounds/HalftoneGradient";

export function CTABand() {
  const { isAuthenticated, user, isLoadingUser } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return ROUTES.AUTH.LOGIN;
    if (user.onboarding_completed) return ROUTES.APP.TODAY;
    if (user.onboarding_step === 2) return ROUTES.ONBOARDING.SCANBACK;
    if (user.onboarding_step === 3) return ROUTES.ONBOARDING.SIGNING_TYPES;
    if (user.onboarding_step === 4) return ROUTES.ONBOARDING.PLAN;
    return ROUTES.ONBOARDING.HOME;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-active to-navy px-6 py-[72px] text-center md:px-12">
      {/* Halftone gradient overlay */}
      <HalftoneGradient
        fromColor="#2563EB"
        toColor="#3B82F6"
        opacity={0.08}
        direction="to-br"
      />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10">
        <AnimateIn variant="slide-up" delay={100}>
          <div className="mb-3.5 font-sora text-3xl md:text-3xl lg:text-4xl font-bold leading-[1.2] tracking-[-0.5px] text-white">
            {cta.titleA}
            <br />
            {cta.titleB}
          </div>
        </AnimateIn>

        <AnimateIn variant="slide-up" delay={200}>
          <p className="mx-auto mb-8 max-w-[480px] text-base leading-[1.7] text-white/70">
            {cta.subtitle}
          </p>
        </AnimateIn>

        <AnimateIn variant="slide-up" delay={300}>
          <div className="flex flex-wrap justify-center gap-3">
            {!isLoadingUser && isAuthenticated ? (
              <Link href={getDashboardRoute()}>
                <Button
                  variant="secondary"
                  className="group h-[52px] rounded-[10px] bg-white px-7 text-[15px] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowRight className="h-4 w-4 text-navy transition-transform group-hover:translate-x-1" />
                  <span className="text-navy">Go to Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href={cta.primary.href}>
                  <Button
                    variant="secondary"
                    className="group h-[52px] rounded-[10px] bg-white/95 backdrop-blur-sm px-7 text-[15px] hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <ArrowRight className="h-4 w-4 text-navy transition-transform group-hover:translate-x-1" />
                    <span className="text-navy">{cta.primary.label}</span>
                  </Button>
                </Link>
                <Link href={cta.secondary.href}>
                  <Button
                    variant="pro"
                    className="group relative h-[52px] rounded-[10px] px-6 text-[15px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                  >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Sparkles className="relative h-4 w-4 text-navy" />
                    <span className="relative text-navy">{cta.secondary.label}</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
