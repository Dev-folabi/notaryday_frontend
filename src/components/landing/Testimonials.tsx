"use client";

import { testimonials } from "@/config/marketing";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { HalftoneGradient } from "@/components/landing/backgrounds/HalftoneGradient";
import { Quote } from "lucide-react";

export function Testimonials() {
  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-6 py-12 md:px-12 md:py-[72px] overflow-hidden">
      {/* Halftone gradient background */}
      <HalftoneGradient
        fromColor="#2563EB"
        toColor="#3B82F6"
        opacity={0.04}
        direction="to-br"
      />

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <div className="mx-auto max-w-[600px] text-center">
          <AnimateIn variant="fade">
            <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50/80 backdrop-blur-sm px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600 shadow-sm">
              {testimonials.eyebrow}
            </span>
          </AnimateIn>

          <AnimateIn variant="slide-up" delay={100}>
            <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
              {testimonials.title}
            </h2>
          </AnimateIn>

          <AnimateIn variant="slide-up" delay={200}>
            <p className="text-base leading-[1.7] text-slate-500">
              {testimonials.subtitle}
            </p>
          </AnimateIn>
        </div>

        <div className="mt-[36px] grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.items.map((t, index) => (
            <AnimateIn key={t.name} variant="slide-up" delay={300 + index * 100}>
              <div className="group relative rounded-[14px] border border-border/50 bg-white/60 backdrop-blur-sm p-[22px] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:-translate-y-1 hover:border-blue-200">
                {/* Glassmorphic gradient overlay */}
                <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quote icon decoration */}
                <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Quote className="h-12 w-12 text-navy" strokeWidth={1.5} />
                </div>

                <div className="relative">
                  <div className="mb-4 text-sm italic leading-[1.7] text-slate-600">
                    &ldquo;{t.quote}&rdquo;
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-active text-xs font-semibold text-white shadow-md">
                      {t.init}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-navy">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </div>
  );
}
