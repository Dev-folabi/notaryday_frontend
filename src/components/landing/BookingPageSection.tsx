import { Link2, Check } from "lucide-react";
import { bookingPage } from "@/config/marketing";

export function BookingPageSection() {
  return (
    <div
      id="booking-page"
      className="scroll-mt-24 bg-white px-6 py-12 md:px-12 md:py-[72px]"
    >
      <div className="mx-auto grid max-w-[860px] items-center gap-10 md:grid-cols-2">
        <div>
          <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
            {bookingPage.eyebrow}
          </span>
          <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
            {bookingPage.title}
          </h2>
          <p className="mb-5 text-base leading-[1.7] text-slate-500">
            {bookingPage.subtitle}
          </p>
          <div className="flex flex-col gap-2.5">
            {bookingPage.bullets.map((bullet) => (
              <div
                key={bullet}
                className="flex items-start gap-[9px] text-[13px] text-slate-600"
              >
                <Check
                  className="mt-0.5 h-[13px] w-[13px] shrink-0 text-teal-600"
                  strokeWidth={3}
                />
                {bullet}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[300px] rounded-[14px] border border-border bg-slate-50 p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <Link2 className="h-3.5 w-3.5" />
              Share your booking link
            </div>
            <div className="mb-4 flex items-center justify-between rounded-[8px] border border-border bg-white px-3 py-2.5">
              <span className="truncate font-mono text-[11px] text-navy">
                {bookingPage.urlSample}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { time: "9:00 AM", state: "available" },
                { time: "10:30 AM", state: "available" },
                { time: "12:00 PM", state: "unavailable" },
                { time: "2:00 PM", state: "available" },
              ].map((slot) => (
                <div
                  key={slot.time}
                  className="flex items-center justify-between rounded-[8px] border border-border bg-white px-3 py-2"
                >
                  <span className="text-xs font-medium text-slate-600">
                    {slot.time}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      slot.state === "available"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {slot.state}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400">
              Scanback windows already blocked out
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
