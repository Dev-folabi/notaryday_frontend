import type { Metadata } from "next";
import { PageHeader } from "@/components/landing/PageHeader";
import { CTABand } from "@/components/landing/CTABand";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { DotGrid } from "@/components/landing/backgrounds/DotGrid";
import { faq } from "@/config/marketing";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions notaries ask us about CITT, scanbacks, the booking page, and data safety.",
};

export default function FAQPage() {
  return (
    <>
      <PageHeader eyebrow={faq.eyebrow} title={faq.title} />
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/20 to-white px-6 pb-16 md:px-12 md:pb-[72px]">
        <DotGrid className="opacity-20" dotSpacing={30} />

        <div className="relative z-10 mx-auto grid max-w-[860px] grid-cols-1 gap-5 md:grid-cols-2">
          {faq.items.map((item, index) => (
            <AnimateIn key={item.q} variant="slide-up" delay={100 + index * 50}>
              <div className="group rounded-[12px] border border-border bg-white/60 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200">
                <div className="absolute inset-0 rounded-[12px] bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative">
                  <div className="mb-2 text-sm font-semibold text-navy">
                    {item.q}
                  </div>
                  <div className="text-[13px] leading-[1.6] text-slate-500">
                    {item.a}
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
      <CTABand />
    </>
  );
}
