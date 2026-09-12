import type { Metadata } from "next";
import { PageHeader } from "@/components/landing/PageHeader";
import { Stats } from "@/components/landing/Stats";
import { CTABand } from "@/components/landing/CTABand";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { DotGrid } from "@/components/landing/backgrounds/DotGrid";
import { about } from "@/config/marketing";

export const metadata: Metadata = {
  title: "About",
  description: "Why Notary Day exists and the problems it was built to solve.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={about.eyebrow}
        title={about.title}
        subtitle={about.subtitle}
      />
      <div className="bg-white px-6 pb-12 md:px-12 md:pb-[72px]">
        <div className="mx-auto max-w-[640px] space-y-5">
          {about.story.map((paragraph, index) => (
            <AnimateIn key={paragraph.slice(0, 24)} variant="fade" delay={100 + index * 100}>
              <p className="text-[15px] leading-[1.8] text-slate-600">
                {paragraph}
              </p>
            </AnimateIn>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/10 to-slate-50 px-6 py-12 md:px-12 md:py-[72px]">
        <DotGrid className="opacity-20" dotSpacing={32} />

        <div className="relative z-10 mx-auto grid max-w-[860px] grid-cols-1 gap-6 md:grid-cols-3">
          {about.values.map((value, index) => (
            <AnimateIn key={value.title} variant="slide-up" delay={100 + index * 100}>
              <div className="group rounded-[14px] border border-border bg-white/80 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200">
                <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative">
                  <div className="mb-2 font-sora text-base font-bold text-navy">
                    {value.title}
                  </div>
                  <div className="text-[13px] leading-[1.6] text-slate-500">
                    {value.desc}
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
      <Stats />
      <CTABand />
    </>
  );
}
