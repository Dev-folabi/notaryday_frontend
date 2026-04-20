import { Check } from "lucide-react";

export function ScanbackCallout() {
  const points = [
    "Auto-inserted after every Loan Refi or Hybrid signing",
    "Duration based on your real scanback time (configurable per job)",
    "CITT checks honour it — no false positives",
    "Route engine builds around it, not through it",
  ];

  const calendarEvents = [
    {
      t: "9:00 AM",
      l: "Loan Refi · Wilshire Blvd",
      c: "text-navy",
      bg: "bg-white",
    },
    {
      t: "9:45 AM",
      l: "Scanback — Job #1 (auto)",
      c: "text-amber-600",
      bg: "bg-amber-50",
      sb: true,
    },
    {
      t: "10:15 AM",
      l: "12 min drive",
      c: "text-slate-400",
      bg: "bg-transparent",
      drive: true,
    },
    { t: "10:28 AM", l: "General · Olive St", c: "text-navy", bg: "bg-white" },
  ];

  return (
    <div className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto mb-9 max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          The problem no tool solves
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
          After every loan signing, you&apos;re locked for 30 minutes
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          Every tool plans your schedule as if signings end when you walk out
          the door. But you know that&apos;s not true. After every Loan Refi or
          Hybrid, you have to scan and send the documents — and that takes 20–45
          minutes. You can&apos;t drive. You can&apos;t start the next job.
          Every tool ignores this. Notary Day doesn&apos;t.
        </p>
      </div>

      <div className="mx-0 flex flex-col gap-10 rounded-2xl bg-navy px-6 py-7 md:mx-12 md:flex-row md:items-center md:px-12 md:py-10">
        <div className="flex-1">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-white/50">
            What no other tool does
          </div>
          <div className="mb-3 font-sora text-[22px] font-bold leading-[1.3] text-white">
            Scanback auto-blocking
          </div>
          <p className="mb-5 text-sm leading-[1.7] text-white/65">
            Notary Day inserts a time block after every loan signing
            automatically — equal to your actual scanback duration. Your day
            will never be double-booked. Route optimisation accounts for it.
            CITT checks against it. It&apos;s the scheduling moat no competitor
            has.
          </p>
          <div className="flex flex-col gap-2">
            {points.map((point, i) => (
              <div
                key={i}
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
          {calendarEvents.map((r, i) => (
            <div
              key={i}
              className={`mb-[5px] flex items-center gap-2.5 rounded-[7px] py-2 px-2.5 ${r.bg} ${
                r.sb ? "border-l-[3px] border-l-amber-600" : ""
              } ${r.drive ? "opacity-60" : ""}`}
            >
              <span
                className={`w-[52px] shrink-0 text-[10px] font-semibold ${
                  r.sb ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {r.t}
              </span>
              <span
                className={`text-[12px] ${r.sb ? "font-normal italic" : "font-medium"} ${r.c}`}
              >
                {r.l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
