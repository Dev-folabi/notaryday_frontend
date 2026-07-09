"use client";

import { Sparkles, ChevronRight, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import type { GapCandidate } from "@/hooks/usePlanner";

export default function GapFinderCard({ gap }: { gap: GapCandidate }) {
  const { openCITT } = useUIStore();
  const best = gap.candidates[0];
  if (!best) return null;

  return (
    <div className="bg-violet-light border border-violet-200 border-l-[3px] border-l-violet rounded-r-10px p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 bg-violet-100 rounded-8px flex items-center justify-center flex-shrink-0 text-violet">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-inter text-[13px] font-semibold text-primary-navy mb-0.5">
          Gap: {format(parseISO(gap.gap_start), "h:mm")}–{format(parseISO(gap.gap_end), "h:mm a")} ({gap.gap_mins} min)
        </div>
        <div className="font-inter text-xs text-slate-secondary flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{best.address}</span>
          <span className="ml-1 font-semibold text-teal-success">{formatCurrency(best.net_earnings)}</span>
        </div>
      </div>
      <button
        onClick={() => openCITT()}
        className="font-inter text-xs font-semibold text-violet flex items-center gap-0.5 flex-shrink-0"
      >
        CITT <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
