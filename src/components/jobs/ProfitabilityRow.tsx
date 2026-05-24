import React from "react";
import { formatCurrency, profitabilityColor } from "@/lib/utils";

interface ProfitabilityRowProps {
  fee: number;
  mileageCost: number;
  mileageMiles?: number;
  netEarnings: number;
  effectiveHourly: number;
  irsRate?: number;
}

export default function ProfitabilityRow({
  fee,
  mileageCost,
  mileageMiles,
  netEarnings,
  effectiveHourly,
  irsRate = 0.67,
}: ProfitabilityRowProps) {
  const netColor = profitabilityColor(netEarnings);

  return (
    <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-[10px] overflow-hidden">
      <div className="bg-white py-3 px-2 text-center">
        <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide block mb-1.5">
          Offered fee
        </span>
        <span className="font-sora text-base font-bold text-slate-body block">
          {formatCurrency(fee)}
        </span>
      </div>
      <div className="bg-white py-3 px-2 text-center">
        <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide block mb-1.5">
          Mileage cost
        </span>
        <span className="font-sora text-base font-bold text-amber-warning block">
          −{formatCurrency(mileageCost)}
        </span>
        {mileageMiles != null && mileageMiles > 0 && (
          <span className="font-inter text-[10px] text-slate-secondary block mt-1">
            {mileageMiles.toFixed(1)} mi × ${irsRate.toFixed(2)}
          </span>
        )}
      </div>
      <div className="bg-white py-3 px-2 text-center">
        <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide block mb-1.5">
          Net earnings
        </span>
        <span className={`font-sora text-base font-bold block ${netColor}`}>
          {formatCurrency(netEarnings)}
        </span>
        {effectiveHourly > 0 && (
          <span className="font-inter text-[10px] text-slate-secondary block mt-1">
            {formatCurrency(effectiveHourly)}/hr eff.
          </span>
        )}
      </div>
    </div>
  );
}
