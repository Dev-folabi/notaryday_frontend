import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, Check } from "lucide-react";

export function Pricing() {
  const freeFeatures = [
    "Unlimited job storage",
    "Can I Take This? (full accuracy, unlimited)",
    "Real earnings calculator (IRS mileage rate)",
    "Notarial journal (legally compliant)",
    "Manual mileage log",
    "Basic income summary",
  ];

  const proFeatures = [
    "Everything in Free",
    "Route optimisation + scanback blocking",
    "Gap Finder (pending jobs that fit your day)",
    "Booking page (notaryday.app/book/you)",
    "Email import from Snapdocs + SigningOrder",
    "One-tap invoicing + Stripe payment links",
    "Auto GPS mileage tracking",
    "Tax report export (IRS Schedule C ready)",
    "Appointment reminders to clients",
  ];

  return (
    <div id="pricing" className="bg-slate-50 px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          Simple pricing
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
          Start free. Upgrade when it pays for itself.
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          Pro pays for itself in under one extra signing per month. Most
          notaries upgrade after their first CITT check.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[760px] grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-1 flex-col rounded-[12px] border-[1.5px] border-border bg-white p-[18px] md:p-[22px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-[3px] rounded bg-border px-2 py-[3px] text-[10px] font-semibold tracking-[0.2px] text-slate-500 uppercase">
              Free
            </span>
          </div>
          <div className="my-2.5 font-sora text-[28px] font-bold leading-none text-navy">
            $0{" "}
            <span className="font-inter text-sm font-normal text-slate-500">
              forever
            </span>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            No credit card. No expiry.
          </p>
          <div className="mb-3.5 h-px bg-border"></div>
          <div className="flex-1">
            {freeFeatures.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 py-1 text-xs text-slate-600"
              >
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600"
                  strokeWidth={3}
                />
                {f}
              </div>
            ))}
          </div>
          <Link href="/signup" className="mt-5 block w-full">
            <Button
              variant="secondary"
              className="h-11 w-full text-[13px]"
              fullWidth
            >
              Start for free
            </Button>
          </Link>
        </div>

        <div className="flex flex-1 flex-col rounded-[12px] border-2 border-navy bg-white p-[18px] md:p-[22px]">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-[3px] rounded bg-amber-500 px-2 py-[3px] text-[10px] font-bold tracking-[0.2px] text-navy uppercase">
              Pro
            </span>
            <span className="text-[11px] font-medium text-teal-600">
              Most popular
            </span>
          </div>
          <div className="my-[5px] font-sora text-[28px] font-bold leading-none text-navy">
            $29{" "}
            <span className="font-inter text-sm font-normal text-slate-500">
              /month
            </span>
          </div>
          <p className="mb-1 text-xs text-slate-400">or $249/year — save $99</p>
          <p className="mb-3.5 text-xs font-medium text-teal-600">
            Less than the fee from one extra signing.
          </p>
          <div className="mb-3.5 h-px bg-border"></div>
          <div className="flex-1">
            {proFeatures.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 py-1 text-xs text-slate-600"
              >
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600"
                  strokeWidth={3}
                />
                {f}
              </div>
            ))}
          </div>
          <Link href="/signup" className="mt-5 block w-full">
            <Button
              variant="pro"
              className="h-[48px] w-full text-[14px] font-bold"
              fullWidth
            >
              <Sparkles className="h-[13px] w-[13px]" /> Start Pro — $19/month
            </Button>
          </Link>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Cancel any time · No commitment
          </p>
        </div>
      </div>
    </div>
  );
}
