"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check } from "lucide-react";
import { hero } from "@/config/marketing";
import { DotGrid } from "@/components/landing/backgrounds/DotGrid";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { StaggerContainer } from "@/components/landing/animations/StaggerContainer";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-slate-50/40 px-6 md:px-12 pt-16 md:pt-[72px] pb-10 md:pb-[60px] text-center">
      {/* Dot grid background */}
      <DotGrid className="opacity-30" dotSpacing={24} />

      {/* Holographic gradient orbs - more prominent */}
      <div
        className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-blue/12 via-blue/8 to-transparent rounded-full blur-[140px] pointer-events-none animate-pulse"
        style={{ animationDuration: "4s" }}
      />
      <div
        className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-amber/10 via-amber/6 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: "5s", animationDelay: "1s" }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-t from-blue/8 via-blue/4 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,119,6,0.06),transparent_50%)]" />

      <div className="relative z-10">
        <AnimateIn variant="fade" delay={100}>
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-navy/90 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.3px] text-white shadow-lg border border-navy/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {hero.badge}
          </div>
        </AnimateIn>

        <AnimateIn variant="slide-up" delay={200}>
          <h1 className="mb-5 font-sora text-[36px] md:text-[52px] font-extrabold leading-[1.1] tracking-[-1.5px] text-navy">
            {hero.titleA}
            <br />
            <em className="font-sora not-italic text-blue-600">
              {hero.titleB}
            </em>
          </h1>
        </AnimateIn>

        <AnimateIn variant="slide-up" delay={300}>
          <p className="mx-auto mb-9 max-w-[560px] text-lg leading-[1.7] text-slate-500">
            {hero.subtitle}
          </p>
        </AnimateIn>

        <AnimateIn variant="slide-up" delay={400}>
          <div className="mb-4 flex flex-wrap justify-center gap-3">
            <Link href={hero.primaryCta.href}>
              <Button className="group h-[52px] rounded-[10px] px-7 text-[15px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />{" "}
                {hero.primaryCta.label}
              </Button>
            </Link>
            <Link href={hero.secondaryCta.href}>
              <Button
                variant="secondary"
                className="group h-[52px] rounded-[10px] px-6 text-[15px] backdrop-blur-sm bg-white/80 hover:bg-white transition-all duration-300"
              >
                {hero.secondaryCta.label}
              </Button>
            </Link>
          </div>
        </AnimateIn>

        <StaggerContainer
          className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400"
          staggerDelay={80}
        >
          {hero.trust.map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-teal-700" strokeWidth={3} />
              <span>{item}</span>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
