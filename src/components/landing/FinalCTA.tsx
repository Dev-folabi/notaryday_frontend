import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <div className="bg-navy px-6 py-[72px] text-center md:px-12">
      <div className="mb-3.5 font-sora text-3xl md:text-3xl lg:text-4xl font-bold leading-[1.2] tracking-[-0.5px] text-white">
        Stop leaving money on the table.
        <br />
        Start planning your day with data.
      </div>
      <p className="mx-auto mb-8 max-w-[480px] text-base leading-[1.7] text-white/60">
        Every day you drive without Notary Day, you&apos;re estimating.
        That&apos;s fine. But you&apos;re also leaving $100–$200 on the table.
        The free plan costs nothing. The CITT check takes 15 seconds.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/signup">
          <Button
            variant="secondary"
            className="h-[52px] rounded-[10px] bg-white px-7 text-[15px] hover:bg-white/90"
          >
            <ArrowRight className="h-4 w-4 text-navy" />
            <span className="text-navy">Create free account</span>
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            variant="pro"
            className="h-[52px] rounded-[10px] bg-amber-500 px-6 text-[15px] hover:bg-amber-600"
          >
            <Sparkles className="h-4 w-4 text-navy" />
            <span className="text-navy">Start Pro — $29/mo</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
