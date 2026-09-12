"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featureHighlights, site } from "@/config/marketing";
import { iconMap } from "@/components/landing/icons";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { DotGrid } from "@/components/landing/backgrounds/DotGrid";

export function FeatureHighlights() {
  return (
    <div className="relative bg-white px-6 py-12 md:px-12 md:py-[72px] overflow-hidden">
      {/* Subtle dot grid background */}
      <DotGrid className="opacity-15" dotSpacing={32} dotSize={1} />

      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-l from-amber/8 via-amber/4 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-r from-blue/8 via-blue/4 to-transparent rounded-full blur-[120px] pointer-events-none" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.04),transparent_70%)]" />

      <div className="relative z-10">
        <div className="mx-auto max-w-[600px] text-center">
          <AnimateIn variant="fade">
            <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50/80 backdrop-blur-sm px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600 shadow-sm">
              Everything in one place
            </span>
          </AnimateIn>

          <AnimateIn variant="slide-up" delay={100}>
            <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
              Built for how you actually work
            </h2>
          </AnimateIn>

          <AnimateIn variant="slide-up" delay={200}>
            <p className="text-base leading-[1.7] text-slate-500">
              Five core features. Each one solves a real daily pain. None of them
              exist in any other notary tool.
            </p>
          </AnimateIn>
        </div>

        <div className="mx-auto mt-10 grid max-w-[860px] grid-cols-1 gap-6 md:grid-cols-3">
          {featureHighlights.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <AnimateIn key={feature.title} variant="slide-up" delay={300 + index * 100}>
                <Link
                  href={feature.href}
                  className="group relative block rounded-[14px] border-2 border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-[0_12px_40px_rgba(37,99,235,0.18)] hover:-translate-y-1"
                >
                  {/* Glassmorphic hover overlay with noise */}
                  <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-blue/10 to-blue-hover/8 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
                      backgroundSize: '200px 200px'
                    }}
                  />

                  {/* Subtle glow on hover */}
                  <div className="absolute -inset-[1px] rounded-[14px] bg-gradient-to-br from-blue/20 to-blue-hover/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10" />

                  <div className="relative">
                    <div className="mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>

                    <div className="mb-2 font-sora text-base font-bold text-navy">
                      {feature.title}
                    </div>

                    <div className="text-[13px] leading-[1.6] text-slate-500 mb-3">
                      {feature.desc}
                    </div>

                    <div className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 group-hover:gap-2 transition-all duration-300">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </AnimateIn>
            );
          })}
        </div>

        <AnimateIn variant="fade" delay={800}>
          <div className="mt-8 text-center">
            <Link
              href="/features"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-hover transition-colors duration-200"
            >
              Explore all of {site.name}&apos;s features
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
