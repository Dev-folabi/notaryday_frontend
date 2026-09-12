"use client";

import { features, featuresPage, moreFeatures } from "@/config/marketing";
import { iconMap } from "@/components/landing/icons";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { DotGrid } from "@/components/landing/backgrounds/DotGrid";

export function Features({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/20 to-white px-6 py-12 md:px-12 md:py-[72px]">
      <DotGrid className="opacity-20" dotSpacing={32} />

      {showHeader && (
        <div className="relative z-10 mx-auto max-w-[600px] text-center">
          <AnimateIn variant="fade">
            <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50/80 backdrop-blur-sm px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600 shadow-sm">
              {featuresPage.eyebrow}
            </span>
          </AnimateIn>
          <AnimateIn variant="slide-up" delay={100}>
            <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
              {featuresPage.title}
            </h2>
          </AnimateIn>
          <AnimateIn variant="slide-up" delay={200}>
            <p className="text-base leading-[1.7] text-slate-500">
              {featuresPage.subtitle}
            </p>
          </AnimateIn>
        </div>
      )}
      <div className={`relative z-10 ${showHeader ? "mt-10" : ""} grid grid-cols-1 gap-7 md:grid-cols-3`}>
        {features.map((f, index) => {
          const Icon = iconMap[f.icon];
          return (
            <AnimateIn key={f.title} variant="slide-up" delay={showHeader ? 300 + index * 50 : index * 50}>
              <div
                id={f.id}
                className="group scroll-mt-24 rounded-[14px] border border-border bg-white/60 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
              >
                <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative">
                  <div className="mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 transition-all duration-300 group-hover:scale-110">
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div className="mb-2 font-sora text-base font-bold text-navy">
                    {f.title}
                  </div>
                  <div className="text-[13px] leading-[1.6] text-slate-500">
                    {f.desc}
                  </div>
                  <span
                    className={`mt-2.5 inline-block rounded md:rounded-md px-2 py-[3px] text-[10px] font-semibold ${
                      f.badge === "free"
                        ? "border border-teal-200 bg-teal-50 text-teal-700"
                        : "border border-amber-200 bg-amber-50 text-amber-600"
                    }`}
                  >
                    {f.badge === "free" ? "Free forever" : "Pro feature"}
                  </span>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto mt-20 max-w-[600px] text-center">
        <AnimateIn variant="fade">
          <h3 className="mb-3 font-sora text-2xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
            {featuresPage.moreTitle}
          </h3>
        </AnimateIn>
        <AnimateIn variant="fade" delay={100}>
          <p className="text-base leading-[1.7] text-slate-500">
            {featuresPage.moreSubtitle}
          </p>
        </AnimateIn>
      </div>
      <div className="relative z-10 mt-10 grid grid-cols-1 gap-7 md:grid-cols-3">
        {moreFeatures.map((f, index) => {
          const Icon = iconMap[f.icon];
          return (
            <AnimateIn key={f.title} variant="slide-up" delay={200 + index * 50}>
              <div className="group rounded-[14px] border border-border bg-white/60 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200">
                <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative">
                  <div className="mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-gradient-to-br from-navy to-navy-active text-white transition-all duration-300 group-hover:scale-110">
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div className="mb-2 font-sora text-base font-bold text-navy">
                    {f.title}
                  </div>
                  <div className="text-[13px] leading-[1.6] text-slate-500">
                    {f.desc}
                  </div>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </div>
  );
}
