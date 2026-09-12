"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";

export function PricingTeaser() {
  return (
    <div className="relative bg-slate-50 px-6 py-12 md:px-12 md:py-[72px] overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue/3 to-transparent blur-3xl pointer-events-none" />

      <AnimateIn variant="scale" delay={100}>
        <div className="relative mx-auto max-w-[860px]">
          {/* Holographic animated border */}
          <div className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-r from-blue to-blue-hover opacity-15 blur-md animate-pulse" />
          <div className="absolute -inset-[1px] rounded-[18px] bg-gradient-to-br from-blue to-blue-hover opacity-20" />

          <div className="relative grid items-center gap-8 rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-[0_20px_60px_rgba(37,99,235,0.15)] md:grid-cols-[1fr_auto] md:p-10 overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue/5 to-amber/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Simple Pricing</span>
              </div>
              <div className="mb-1.5 font-sora text-2xl font-bold leading-[1.2] tracking-[-0.5px] text-navy">
                Free forever.{" "}
                <span className="bg-gradient-to-r from-blue to-amber bg-clip-text text-transparent">
                  Pro from $19/month.
                </span>
              </div>
              <p className="text-sm leading-[1.7] text-slate-500">
                Start with unlimited CITT checks and a legally compliant journal,
                no credit card. Upgrade when one extra signing per month pays for
                it.
              </p>
            </div>

            <div className="relative z-10 flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Link
                href="/signup"
                className="group inline-flex h-11 items-center justify-center rounded-[8px] bg-gradient-to-r from-navy to-navy-active px-5 text-[13px] font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Start for free
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] border-2 border-navy/20 bg-white/60 backdrop-blur-sm px-5 text-[13px] font-semibold text-navy transition-all duration-300 hover:border-navy hover:bg-white hover:shadow-md"
              >
                Compare plans
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </AnimateIn>
    </div>
  );
}
