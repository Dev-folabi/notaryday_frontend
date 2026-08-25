"use client";

import { Car, Clock, MapPin, Navigation, Sparkles, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn, formatCurrency, formatMiles, profitabilityColor } from "@/lib/utils";
import type { GapCandidate, PlannerJob } from "@/hooks/usePlanner";
import { jobTypeChipClass, jobTypeLabel } from "@/components/jobs/JobCard";
import ScanbackBlock from "./ScanbackBlock";

const HOUR_PX = 84;
const PX_PER_MIN = HOUR_PX / 60;

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function hourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

interface RouteCalendarProps {
  jobs: PlannerJob[];
  date: string;
  now: number;
  gap?: GapCandidate;
  onJobClick: (jobId: string) => void;
  onGapClick: (gap: GapCandidate) => void;
}

export default function RouteCalendar({
  jobs,
  date,
  now,
  gap,
  onJobClick,
  onGapClick,
}: RouteCalendarProps) {
  const parsedJobs = jobs.map((job) => {
    const start = new Date(job.appointment_time);
    const end = new Date(
      job.scanback_ends_at ?? job.signing_ends_at ?? job.appointment_time,
    );
    return { job, start, end };
  });
  const gridStartHour = parsedJobs.length
    ? Math.floor(Math.min(...parsedJobs.map(({ start }) => minutesOfDay(start))) / 60)
    : 8;
  const gridEndHour = parsedJobs.length
    ? Math.max(
        15,
        Math.ceil(Math.max(...parsedJobs.map(({ end }) => minutesOfDay(end))) / 60),
      )
    : 15;
  const gridLabels = Array.from(
    { length: gridEndHour - gridStartHour + 1 },
    (_, index) => gridStartHour + index,
  );
  const offsetPx = (value: Date) =>
    (minutesOfDay(value) - gridStartHour * 60) * PX_PER_MIN;
  const currentTime = new Date(now);
  const nowMins = minutesOfDay(currentTime);
  const showNowMarker =
    date === format(currentTime, "yyyy-MM-dd") &&
    nowMins >= gridStartHour * 60 &&
    nowMins < (gridEndHour + 1) * 60;
  const bestCandidate = gap?.candidates[0];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="tl-wrap" style={{ padding: "16px 16px 0" }}>
        <div className="tl-times">
          {gridLabels.map((hour) => (
            <div key={hour} className="tl-tr">
              <span className="tl-label">{hourLabel(hour)}</span>
            </div>
          ))}
        </div>
        <div className="tl-body">
          <div className="tl-grid" style={{ height: gridLabels.length * HOUR_PX }}>
            {gridLabels.map((_, index) => (
              <div key={index} className="tl-hour" />
            ))}

            {showNowMarker && (
              <div
                className="now-wrap"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: offsetPx(currentTime),
                  margin: 0,
                }}
              >
                <div className="now-dot" />
                <div className="now-line" />
                <span className="now-lbl">NOW {format(currentTime, "h:mm a")}</span>
              </div>
            )}

            {parsedJobs.map(({ job, start }, index) => (
              <div
                key={job.id}
                style={{ position: "absolute", left: 0, right: 0, top: offsetPx(start) }}
              >
                <div
                  className="tl-job"
                  style={{ borderLeftColor: job.route_sequence ? "#0F2C4E" : "#2563EB" }}
                  onClick={() => onJobClick(job.id)}
                >
                  <div className="flex justify-between gap-2 mb-0.5 flex-wrap">
                    <div className="text-[11px] font-bold text-primary-navy flex gap-1 items-center">
                      <Clock className="w-3 h-3" /> {format(parseISO(job.appointment_time), "h:mm a")} -{" "}
                      {format(parseISO(job.signing_ends_at ?? job.appointment_time), "h:mm a")}
                    </div>
                    <span className={cn("text-[12px] font-bold", profitabilityColor(job.net_earnings))}>
                      {formatCurrency(job.net_earnings)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate mb-1 flex gap-1 items-center">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{job.address}</span>
                  </div>
                  <div className="flex justify-between gap-1.5 flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      <span className={cn("chip", jobTypeChipClass(job.signing_type))}>
                        {jobTypeLabel(job.signing_type)}
                      </span>
                      {job.platform_name && <span className="chip c-plat">{job.platform_name}</span>}
                    </div>
                    <div
                      className="text-[10px] font-semibold text-blue flex gap-1 items-center cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        window.open(
                          `https://maps.google.com/?q=${encodeURIComponent(job.address)}`,
                          "_blank",
                        );
                      }}
                    >
                      <Navigation className="w-3 h-3" /> Navigate
                    </div>
                  </div>
                </div>
                {job.scanback_duration_mins > 0 && (
                  <>
                    <ScanbackBlock job={job} sequence={index + 1} />
                    <div className="tl-drv">
                      <Car className="w-3 h-3" /> {job.drive_from_prev_mins ?? 0} min drive
                    </div>
                  </>
                )}
              </div>
            ))}

            {gap && bestCandidate && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: offsetPx(new Date(gap.gap_start)),
                }}
              >
                <div className="flex gap-1.5 items-center py-1 px-0 text-[11px] font-semibold text-violet">
                  <Sparkles className="w-3.5 h-3.5" /> Gap opportunity,{" "}
                  {format(parseISO(gap.gap_start), "h:mm a")}, {gap.gap_mins} min available
                </div>
                <div className="gap-card">
                  <div className="text-[12px] font-semibold text-primary-navy mb-1">
                    {bestCandidate.address}
                  </div>
                  <div className="text-[11px] text-slate-secondary mb-2 flex gap-1.5 flex-wrap">
                    <span>
                      Offered: <strong className="text-slate">{formatCurrency(bestCandidate.fee)}</strong>
                    </span>
                    <span>
                      Est. net:{" "}
                      <strong className="text-teal">{formatCurrency(bestCandidate.net_earnings)}</strong>
                    </span>
                    {bestCandidate.miles_from != null && (
                      <span>
                        {formatMiles(bestCandidate.miles_from)} from {bestCandidate.miles_from_label}
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-sm"
                    style={{ borderColor: "#C4B5FD", color: "#7C3AED" }}
                    onClick={() => onGapClick(gap)}
                  >
                    <Zap className="w-3 h-3" /> Run CITT check
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
