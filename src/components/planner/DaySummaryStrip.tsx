"use client";

import { formatCurrency } from "@/lib/utils";

interface DaySummaryStripProps {
  totalJobs: number;
  totalDriveMins: number;
  totalEarnings: number;
  totalMiles: number;
}

export default function DaySummaryStrip({ totalJobs, totalDriveMins, totalEarnings, totalMiles }: DaySummaryStripProps) {
  return (
    <div className="bg-primary-navy rounded-10px p-3 px-4 flex items-center gap-0">
      <div className="flex-1 text-center">
        <div className="font-sora text-[17px] font-bold text-white leading-none">{totalJobs}</div>
        <div className="text-[10px] text-white/50 mt-1">Signings</div>
      </div>
      <div className="w-px h-7 bg-white/10" />
      <div className="flex-1 text-center">
        <div className="font-sora text-[17px] font-bold text-white leading-none">{formatCurrency(totalEarnings)}</div>
        <div className="text-[10px] text-white/50 mt-1">Est. net</div>
      </div>
      <div className="w-px h-7 bg-white/10" />
      <div className="flex-1 text-center">
        <div className="font-sora text-[17px] font-bold text-white leading-none">{totalDriveMins}m</div>
        <div className="text-[10px] text-white/50 mt-1">Drive</div>
      </div>
      <div className="w-px h-7 bg-white/10" />
      <div className="flex-1 text-center">
        <div className="font-sora text-[17px] font-bold text-white leading-none">{totalMiles.toFixed(1)}</div>
        <div className="text-[10px] text-white/50 mt-1">Miles</div>
      </div>
    </div>
  );
}
