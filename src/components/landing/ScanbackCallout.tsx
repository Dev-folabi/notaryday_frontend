import { Check } from "lucide-react";
import { scanback } from "@/config/marketing";

export function ScanbackCallout() {
  return (
    <div className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto mb-9 max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          {scanback.eyebrow}
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
          {scanback.title}
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          {scanback.intro}
        </p>
      </div>

      <div className="mx-0 flex flex-col gap-10 rounded-2xl bg-navy px-6 py-7 md:mx-12 md:flex-row md:items-center md:px-12 md:py-10">
        <div className="flex-1">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-white/50">
            {scanback.sectionLabel}
          </div>
          <div className="mb-3 font-sora text-[22px] font-bold leading-[1.3] text-white">
            {scanback.sectionTitle}
          </div>
          <p className="mb-5 text-sm leading-[1.7] text-white/65">
            {scanback.sectionDesc}
          </p>
          <div className="flex flex-col gap-2">
            {scanback.points.map((point) => (
              <div
                key={point}
                className="flex items-start gap-[9px] text-[13px] text-white/75"
              >
                <Check
                  className="mt-0.5 h-[13px] w-[13px] shrink-0 text-teal-500"
                  strokeWidth={3}
                />
                {point}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full shrink-0 rounded-xl border border-amber-200 bg-amber-50 p-5 md:w-auto md:min-w-[220px]">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-amber-600">
            Your calendar
          </div>
          {scanback.events.map((row) => (
            <div
              key={row.label}
              className={`mb-[5px] flex items-center gap-2.5 rounded-[7px] py-2 px-2.5 ${
                row.kind === "job"
                  ? "bg-white"
                  : row.kind === "scanback"
                    ? "border-l-[3px] border-l-amber-600 bg-amber-50"
                    : "bg-transparent opacity-60"
              }`}
            >
              <span
                className={`w-[52px] shrink-0 text-[10px] font-semibold ${
                  row.kind === "scanback"
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {row.time}
              </span>
              <span
                className={`text-[12px] ${
                  row.kind === "scanback"
                    ? "font-normal italic text-amber-600"
                    : "font-medium text-navy"
                }`}
              >
                {row.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
