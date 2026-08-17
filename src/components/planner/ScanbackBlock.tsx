import { Scan } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { PlannerJob } from "@/hooks/usePlanner";

interface ScanbackBlockProps {
  job: PlannerJob;
  sequence: number;
}

export default function ScanbackBlock({ job, sequence }: ScanbackBlockProps) {
  return (
    <div className="tl-sb">
      <div className="flex justify-between gap-2 flex-wrap">
        <span className="text-[10px] italic text-amber flex gap-1 items-center">
          <Scan className="w-3 h-3" /> Scanback Job {sequence}
        </span>
        <span className="text-[9px] text-amber font-medium">
          {format(parseISO(job.appointment_time), "h:mm a")} to{" "}
          {format(parseISO(job.scanback_ends_at ?? job.appointment_time), "h:mm a")}
        </span>
      </div>
    </div>
  );
}
