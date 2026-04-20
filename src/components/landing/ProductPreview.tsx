import { ScanText, Sparkles } from "lucide-react";

export function ProductPreview() {
  return (
    <div className="bg-slate-50 px-6 md:px-12 pb-0 pt-0">
      <div className="mx-auto max-w-[680px]">
        <div className="py-10 pb-5 text-center">
          <span className="text-xs font-semibold tracking-[0.5px] text-slate-500 uppercase">
            The Smart Day Planner in action
          </span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-border shadow-[0_12px_48px_rgba(15,44,78,0.12)]">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-navy px-[18px] py-3">
            <div>
              <div className="font-sora text-[13px] font-bold text-white">
                Tuesday, Mar 18
              </div>
              <div className="mt-0.5 text-[11px] text-white/50">
                4 signings · Route optimised
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-[11px] text-white/45">Est. net</div>
                <div className="font-sora text-lg font-bold text-amber-500">
                  $412
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-white/45">Drive time</div>
                <div className="font-sora text-lg font-bold text-white">
                  1h 22m
                </div>
              </div>
            </div>
          </div>

          {/* Job 1 */}
          <div className="flex items-start justify-between border-b border-border bg-white px-[18px] py-3">
            <div>
              <div className="mb-[3px] text-xs font-bold text-navy">
                9:00 AM · 45 min
              </div>
              <div className="mb-[5px] text-[11px] text-slate-500">
                3847 Wilshire Blvd, Los Angeles
              </div>
              <div className="flex gap-[5px]">
                <span className="rounded-[3px] bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700">
                  Loan Refi
                </span>
                <span className="rounded-[3px] bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500">
                  Snapdocs
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[15px] font-bold text-teal-600">$175</div>
              <div className="text-[10px] text-slate-500">
                net after mileage
              </div>
            </div>
          </div>

          {/* Scanback Block */}
          <div className="border-b border-border border-l-[3px] border-l-amber-600 bg-amber-50 px-[18px] py-[9px]">
            <span className="flex items-center gap-[5px] text-[11px] italic text-amber-600">
              <ScanText className="h-[11px] w-[11px]" />
              <span>Scanback — Job #1 · 9:45–10:15 AM · Auto-blocked</span>
            </span>
          </div>

          {/* Job 2 */}
          <div className="flex items-start justify-between border-b border-border bg-white px-[18px] py-3">
            <div>
              <div className="mb-[3px] text-xs font-bold text-navy">
                10:28 AM · 30 min
              </div>
              <div className="mb-[5px] text-[11px] text-slate-500">
                917 S Olive St, Los Angeles
              </div>
              <div className="flex gap-[5px]">
                <span className="rounded-[3px] bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-teal-800">
                  General
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[15px] font-bold text-amber-600">$95</div>
              <div className="text-[10px] text-slate-500">
                net after mileage
              </div>
            </div>
          </div>

          {/* Gap Opportunity */}
          <div className="border-l-[3px] border-l-violet-600 bg-violet-100 px-[18px] py-[9px]">
            <div className="mb-[3px] flex items-center gap-[5px] text-[11px] font-bold text-violet-600">
              <Sparkles className="h-[10px] w-[10px]" />
              <span>Gap opportunity · 2:00 PM · 90 min available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                1847 Crenshaw Blvd, Hawthorne · $125 offered
              </span>
              <span className="text-[11px] font-bold text-teal-600">
                Est. $108 net →
              </span>
            </div>
          </div>
        </div>
        <div className="py-4 pb-10 text-center">
          <span className="text-xs text-slate-400">
            Route optimised · Scanback auto-blocked · Gap opportunity surfaced —
            all automatically
          </span>
        </div>
      </div>
    </div>
  );
}
