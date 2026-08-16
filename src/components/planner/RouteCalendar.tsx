"use client";

import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MapPin, Navigation, Car } from "lucide-react";
import ScanbackBlock from "./ScanbackBlock";
import type {
  PlannerJob,
  ScanbackBlock as ScanbackBlockType,
} from "@/hooks/usePlanner";

interface RouteCalendarProps {
  jobs: PlannerJob[];
  scanbackBlocks: ScanbackBlockType[];
  optimised: boolean;
  origin?: string | null;
}

export default function RouteCalendar({
  jobs,
  scanbackBlocks,
  optimised,
  origin,
}: RouteCalendarProps) {
  // Build timeline items interleaving jobs, drive segments, and scanback blocks
  const getBlockForJob = (jobId: string) =>
    scanbackBlocks.find((b) => b.jobId === jobId);

  return (
    <div className="relative">
      {/* Optimised badge */}
      {optimised && (
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-bg text-teal-success rounded text-[10px] font-bold">
            ✓ Route optimised
          </span>
        </div>
      )}

      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

        {jobs.map((job, i) => {
          const scanback = getBlockForJob(job.id);
          const statusColor =
            job.status === "IN_PROGRESS" || job.status === "SCANNING"
              ? "border-amber-warning bg-amber-bg/30"
              : "border-teal-success/50 bg-white";

          return (
            <div key={job.id}>
              {/* Drive segment */}
              {job.drive_from_prev_mins != null &&
                job.drive_from_prev_mins > 0 && (
                  <div className="relative flex items-center gap-2 py-1.5 ml-2">
                    <div className="absolute -left-[19px] w-4 h-4 rounded-full bg-bg border border-border flex items-center justify-center">
                      <Car className="w-2.5 h-2.5 text-slate-secondary" />
                    </div>
                    <span className="font-inter text-[10px] text-muted italic">
                      {job.drive_from_prev_mins} min drive
                      {job.drive_from_prev_miles
                        ? ` · ${job.drive_from_prev_miles.toFixed(1)} mi`
                        : ""}
                    </span>
                  </div>
                )}

              {/* Job block */}
              <div className="relative mb-1">
                {/* Timeline dot */}
                <div className="absolute -left-[19px] w-5 h-5 rounded-full bg-primary-navy text-white text-[10px] font-bold flex items-center justify-center">
                  {job.route_sequence ?? i + 1}
                </div>

                <div
                  className={cn("border rounded-10px p-3 ml-2", statusColor)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-inter text-xs font-semibold text-primary-navy">
                          {format(parseISO(job.appointment_time), "h:mm a")}
                        </span>
                        <span className="font-inter text-[10px] text-muted">
                          {job.signing_duration_mins} min
                        </span>
                      </div>
                      <div className="font-inter text-[11px] text-slate-secondary flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{job.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-sora text-sm font-bold text-teal-success">
                        {formatCurrency(job.net_earnings)}
                      </span>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}&travelmode=driving${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`,
                            "_blank",
                          )
                        }
                        className="w-7 h-7 rounded-full bg-primary-navy text-white flex items-center justify-center"
                      >
                        <Navigation className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanback block */}
              {scanback && (
                <div className="ml-2 mb-1">
                  <ScanbackBlock block={scanback} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
