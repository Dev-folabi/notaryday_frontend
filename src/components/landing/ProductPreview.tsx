import { ScanText, Sparkles } from "lucide-react";
import { productPreview } from "@/config/marketing";

export function ProductPreview() {
  return (
    <div className="bg-slate-50 px-6 md:px-12 pb-0 pt-0">
      <div className="mx-auto max-w-[680px]">
        <div className="py-10 pb-5 text-center">
          <span className="text-xs font-semibold tracking-[0.5px] text-slate-500 uppercase">
            {productPreview.eyebrow}
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border shadow-[0_12px_48px_rgba(15,44,78,0.12)]">
          <div className="flex items-center justify-between bg-navy px-[18px] py-3">
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

          {productPreview.jobs.map((job) => (
            <div
              key={job.address}
              className="flex items-start justify-between border-b border-border bg-white px-[18px] py-3"
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

          <div className="border-b border-border border-l-[3px] border-l-amber-600 bg-amber-50 px-[18px] py-[9px]">
            <span className="flex items-center gap-[5px] text-[11px] italic text-amber-600">
              <ScanText className="h-[11px] w-[11px]" />
              <span>{productPreview.scanback}</span>
            </span>
          </div>

          <div className="border-l-[3px] border-l-violet-600 bg-violet-100 px-[18px] py-[9px]">
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
        <div className="py-4 pb-10 text-center">
          <span className="text-xs text-slate-400">{productPreview.footer}</span>
        </div>
      </div>
    </div>
  );
}
