"use client";

import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { DotGrid } from "@/components/landing/backgrounds/DotGrid";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/10 to-slate-50/20 px-6 pt-14 pb-10 text-center md:px-12 md:pt-[72px] md:pb-14">
      {/* Dot grid background */}
      <DotGrid className="opacity-30" dotSpacing={28} />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-blue/6 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[350px] h-[350px] bg-gradient-to-tl from-blue/4 to-transparent rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[680px]">
        <AnimateIn variant="fade" delay={100}>
          <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50/80 backdrop-blur-sm px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600 shadow-sm">
            {eyebrow}
          </span>
        </AnimateIn>

        <AnimateIn variant="slide-up" delay={200}>
          <h1 className="mb-4 font-sora text-[32px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-1px] text-navy">
            {title}
          </h1>
        </AnimateIn>

        {subtitle && (
          <AnimateIn variant="slide-up" delay={300}>
            <p className="mx-auto max-w-[560px] text-base leading-[1.7] text-slate-500">
              {subtitle}
            </p>
          </AnimateIn>
        )}
      </div>
    </div>
  );
}
