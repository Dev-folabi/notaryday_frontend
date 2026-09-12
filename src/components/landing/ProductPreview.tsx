"use client";

import { ScanText, Sparkles } from "lucide-react";
import { productPreview } from "@/config/marketing";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";

export function ProductPreview() {
  return (
    <div className="relative bg-slate-50 px-6 md:px-12 pb-0 pt-0">
      <div className="mx-auto max-w-[680px]">
        <div className="py-10 pb-5 text-center">
          <AnimateIn variant="fade">
            <span className="text-xs font-semibold tracking-[0.5px] text-slate-500 uppercase">
              {productPreview.eyebrow}
            </span>
          </AnimateIn>
        </div>

        <AnimateIn variant="scale" delay={200}>
          <div className="relative group">
            {/* Holographic gradient border effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-br from-blue to-blue-hover opacity-20 rounded-[15px] blur-sm group-hover:opacity-40 transition-opacity duration-500" />
            
            <div className="relative overflow-hidden rounded-[14px] shadow-[0_24px_64px_rgba(15,44,78,0.16)] transition-all duration-500 group-hover:shadow-[0_32px_80px_rgba(15,44,78,0.24)]">
              {/* Header with glassmorphic effect */}
              <div className="relative flex items-center justify-between bg-gradient-to-br from-navy to-navy-active px-[18px] py-3 backdrop-blur-sm">
                <div>
                  <div className="font-sora text-[13px] font-bold text-white">
                    {productPreview.headerDay}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/50">
                    {productPreview.headerMeta}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <div className="text-[11px] text-white/45">
                      {productPreview.netLabel}
                    </div>
                    <div className="font-sora text-lg font-bold text-amber-500">
                      {productPreview.netValue}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/45">
                      {productPreview.driveLabel}
                    </div>
                    <div className="font-sora text-lg font-bold text-white">
                      {productPreview.driveValue}
                    </div>
                  </div>
                </div>
              </div>

              {productPreview.jobs.map((job, index) => (
                <div
                  key={job.address}
                  className="flex items-start justify-between border-b border-border bg-white px-[18px] py-3 hover:bg-blue-bg/30 transition-colors duration-200"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div>
                    <div className="mb-[3px] text-xs font-bold text-navy">
                      {job.time}
                    </div>
                    <div className="mb-[5px] text-[11px] text-slate-500">
                      {job.address}
                    </div>
                    <div className="flex gap-[5px]">
                      <span
                        className={`rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold uppercase ${job.typeClass}`}
                      >
                        {job.type}
                      </span>
                      {job.platform && (
                        <span className="rounded-[3px] bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500">
                          {job.platform}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[15px] font-bold ${job.feeClass}`}>
                      {job.fee}
                    </div>
                    <div className="text-[10px] text-slate-500">{job.note}</div>
                  </div>
                </div>
              ))}

              <div className="relative border-b border-border border-l-[3px] border-l-amber-600 bg-amber-50 px-[18px] py-[9px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber/5 to-transparent" />
                <span className="relative flex items-center gap-[5px] text-[11px] italic text-amber-600">
                  <ScanText className="h-[11px] w-[11px]" />
                  <span>{productPreview.scanback}</span>
                </span>
              </div>

              <div className="relative border-l-[3px] border-l-violet-600 bg-violet-100 px-[18px] py-[9px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet/10 to-transparent" />
                <div className="relative">
                  <div className="mb-[3px] flex items-center gap-[5px] text-[11px] font-bold text-violet-600">
                    <Sparkles className="h-[10px] w-[10px]" />
                    <span>{productPreview.gap.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {productPreview.gap.detail}
                    </span>
                    <span className="text-[11px] font-bold text-teal-600">
                      {productPreview.gap.net}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimateIn>

        <div className="py-4 pb-10 text-center">
          <AnimateIn variant="fade" delay={400}>
            <span className="text-xs text-slate-400">{productPreview.footer}</span>
          </AnimateIn>
        </div>
      </div>
    </div>
  );
}
