"use client";

import { Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ScanbackBlock as ScanbackBlockType } from "@/hooks/usePlanner";

export default function ScanbackBlock({ block }: { block: ScanbackBlockType }) {
  return (
    <div className="bg-scanback-bg border-l-[3px] border-l-amber-warning rounded-r-8px px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-amber-warning" />
        <div>
          <span className="font-inter text-xs font-semibold text-amber-warning italic">
            Scanback
          </span>
          <span className="font-inter text-[11px] text-slate-secondary ml-2">
            {block.durationMins} min
          </span>
        </div>
      </div>
      <span className="font-inter text-[10px] text-muted">
        {format(parseISO(block.startsAt), "h:mm")}–{format(parseISO(block.endsAt), "h:mm a")}
      </span>
    </div>
  );
}
