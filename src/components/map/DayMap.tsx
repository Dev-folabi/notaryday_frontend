"use client";

import dynamic from "next/dynamic";
import type { PlannerJob } from "@/hooks/usePlanner";

const DayMapInner = dynamic(
  () => import("./DayMapInner"),
  { ssr: false },
);

interface DayMapProps {
  jobs: PlannerJob[];
  homeBase?: { lat: number; lng: number } | null;
  homeBaseAddress?: string | null;
  now?: number;
  className?: string;
}

export default function DayMap({
  jobs,
  homeBase,
  homeBaseAddress,
  now,
  className,
}: DayMapProps) {
  if (jobs.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-full text-slate-secondary text-sm ${className ?? ""}`}
      >
        No jobs to display on map
      </div>
    );
  }

  return (
    <DayMapInner
      jobs={jobs}
      homeBase={homeBase}
      homeBaseAddress={homeBaseAddress}
      now={now}
      className={className}
    />
  );
}
