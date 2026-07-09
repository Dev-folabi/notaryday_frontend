"use client";

import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Download } from "lucide-react";

interface MileageEntry {
  date: string;
  address: string;
  miles: number;
  deduction: number;
}

interface MileageLogProps {
  entries: MileageEntry[];
  totalMiles: number;
  totalDeduction: number;
  irsRate: number;
  year: number;
}

export default function MileageLog({
  entries,
  totalMiles,
  totalDeduction,
  irsRate,
  year,
}: MileageLogProps) {
  const exportCSV = () => {
    const rows = [["Date", "Address", "Miles", "Deduction"]];
    for (const e of entries) {
      rows.push([
        format(parseISO(e.date), "yyyy-MM-dd"),
        e.address,
        e.miles.toFixed(1),
        `$${e.deduction.toFixed(2)}`,
      ]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mileage-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-border rounded-12px p-4 text-center">
          <div className="font-sora text-xl font-bold text-primary-navy">
            {totalMiles.toFixed(1)}
          </div>
          <div className="font-inter text-[10px] text-slate-secondary">
            Total miles
          </div>
        </div>
        <div className="bg-white border border-border rounded-12px p-4 text-center">
          <div className="font-sora text-xl font-bold text-teal-success">
            {formatCurrency(totalDeduction)}
          </div>
          <div className="font-inter text-[10px] text-slate-secondary">
            IRS deduction
          </div>
        </div>
        <div className="bg-white border border-border rounded-12px p-4 text-center">
          <div className="font-sora text-xl font-bold text-slate-body">
            ${irsRate}/mi
          </div>
          <div className="font-inter text-[10px] text-slate-secondary">
            IRS rate
          </div>
        </div>
      </div>

      {/* Export */}
      <button
        onClick={exportCSV}
        className="mb-4 inline-flex items-center gap-2 h-9 px-4 border border-border rounded-8px font-inter text-xs font-semibold text-primary-navy hover:bg-bg transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Export CSV
      </button>

      {/* Table */}
      <div className="bg-white border border-border rounded-12px overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-bg border-b border-border font-inter text-[10px] font-semibold text-slate-secondary uppercase">
          <span>Date</span>
          <span>Address</span>
          <span className="text-right">Miles</span>
          <span className="text-right">Deduction</span>
        </div>
        {entries.length === 0 ? (
          <div className="px-4 py-8 text-center font-inter text-sm text-slate-secondary">
            No mileage entries for this year
          </div>
        ) : (
          entries.slice(0, 50).map((e, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-2 px-4 py-2.5 border-b border-border last:border-b-0 font-inter text-xs"
            >
              <span className="text-slate-secondary">
                {format(parseISO(e.date), "MMM d")}
              </span>
              <span className="text-primary-navy truncate">{e.address}</span>
              <span className="text-right text-primary-navy font-medium">
                {e.miles.toFixed(1)}
              </span>
              <span className="text-right text-teal-success font-medium">
                {formatCurrency(e.deduction)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
