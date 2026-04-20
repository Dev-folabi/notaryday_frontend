import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, Check } from "lucide-react";

export function Hero() {
  return (
    <div className="bg-white px-6 md:px-12 pt-16 md:pt-[72px] pb-10 md:pb-[60px] text-center">
      <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.3px] text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
        Now in beta · Free plan available
      </div>
      <h1 className="mb-5 font-sora text-[36px] md:text-[52px] font-extrabold leading-[1.1] tracking-[-1.5px] text-navy">
        Your signing day,
        <br />
        <em className="font-sora not-italic text-blue-600">planned for you.</em>
      </h1>
      <p className="mx-auto mb-9 max-w-[560px] text-lg leading-[1.7] text-slate-500">
        The only scheduling tool built for how mobile notaries actually work —
        signings, mandatory scanbacks, mileage costs, and all. Know your real
        earnings before you accept any job.
      </p>
      <div className="mb-4 flex flex-wrap justify-center gap-3">
        <Link href="/signup">
          <Button className="h-[52px] rounded-[10px] px-7 text-[15px]">
            <ArrowRight className="h-4 w-4" /> Start for free — no credit card
          </Button>
        </Link>
        <Link href="#features">
          <Button
            variant="secondary"
            className="h-[52px] rounded-[10px] px-6 text-[15px]"
          >
            <Zap className="h-4 w-4" /> Try Can I Take This?
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3 text-teal-700" strokeWidth={3} />
          <span>Free plan · unlimited jobs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3 text-teal-700" strokeWidth={3} />
          <span>Pro from $19/month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3 text-teal-700" strokeWidth={3} />
          <span>No commitment · cancel any time</span>
        </div>
      </div>
    </div>
  );
}
