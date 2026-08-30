import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { citt } from "@/config/marketing";
import { iconMap } from "@/components/landing/icons";

const verdictTone = {
  good: { icon: CheckCircle2, iconClass: "text-teal-600", labelClass: "bg-teal-50 text-teal-700 border-teal-200" },
  warn: { icon: AlertTriangle, iconClass: "text-amber-600", labelClass: "bg-amber-50 text-amber-700 border-amber-200" },
  bad: { icon: XCircle, iconClass: "text-red-600", labelClass: "bg-red-50 text-red-700 border-red-200" },
} as const;

export function CITTSection() {
  return (
    <div id="citt" className="scroll-mt-24 bg-slate-50 px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          {citt.eyebrow}
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
          {citt.title}
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">{citt.subtitle}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[760px] grid-cols-1 gap-5 md:grid-cols-2">
        {citt.checks.map((check) => {
          const Icon = iconMap[check.icon];
          return (
            <div
              key={check.title}
              className="flex items-start gap-4 rounded-[14px] border border-border bg-white p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-navy text-white">
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              <div>
                <div className="mb-1 font-sora text-base font-bold text-navy">
                  {check.title}
                </div>
                <div className="text-[13px] leading-[1.6] text-slate-500">
                  {check.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-[760px]">
        <div className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.5px] text-slate-500">
          Every check ends with a clear verdict
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {citt.verdicts.map((verdict) => {
            const tone = verdictTone[verdict.tone as keyof typeof verdictTone];
            const Icon = tone.icon;
            return (
              <div
                key={verdict.label}
                className="rounded-[14px] border border-border bg-white p-6 text-center"
              >
                <div className="mb-3 flex justify-center">
                  <Icon className={`h-7 w-7 ${tone.iconClass}`} strokeWidth={2} />
                </div>
                <span
                  className={`inline-block rounded-md border px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.2px] ${tone.labelClass}`}
                >
                  {verdict.label}
                </span>
                <p className="mt-3 text-[13px] leading-[1.6] text-slate-500">
                  {verdict.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[600px] rounded-[12px] border border-teal-200 bg-teal-50 p-5 text-center">
        <p className="text-[13px] leading-[1.7] text-teal-800">{citt.freeNote}</p>
      </div>
    </div>
  );
}
