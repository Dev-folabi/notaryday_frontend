"use client";

import dynamic from "next/dynamic";
import { useUIStore } from "@/store/uiStore";
import { useTodayPlan } from "@/hooks/usePlanner";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { Navigation } from "lucide-react";
import ProGate from "@/components/ui/ProGate";
import DaySummaryStrip from "@/components/planner/DaySummaryStrip";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);

export default function MapPage() {
  const { user } = useAuth();
  const { activeDate } = useUIStore();
  const date = activeDate || toDateInputValue(new Date());
  const { data: plan, isLoading } = useTodayPlan(date);

  const content = (
    <div className="flex flex-col h-full">
      {/* Summary */}
      {plan && (
        <div className="px-4 py-3 flex-shrink-0">
          <DaySummaryStrip
            totalJobs={plan.summary.total_jobs}
            totalDriveMins={plan.summary.total_drive_mins}
            totalEarnings={plan.summary.total_earnings}
            totalMiles={plan.summary.total_miles}
          />
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : plan && plan.jobs.length > 0 ? (
          <MapContainer
            center={[plan.jobs[0].lat, plan.jobs[0].lng]}
            zoom={11}
            className="h-full w-full z-0"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Route polyline */}
            <Polyline
              positions={plan.jobs.map((j) => [j.lat, j.lng] as [number, number])}
              color="#0F2C4E"
              weight={3}
              opacity={0.7}
            />
            {/* Job markers */}
            {plan.jobs.map((job, i) => (
              <Marker key={job.id} position={[job.lat, job.lng]}>
                <Popup>
                  <div className="text-xs">
                    <strong>#{i + 1}</strong> {job.address}
                    <br />
                    {formatCurrency(job.net_earnings)} net
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-secondary text-sm">
            No jobs to display on map
          </div>
        )}
      </div>

      {/* Job list below map */}
      {plan && plan.jobs.length > 0 && (
        <div className="flex-shrink-0 max-h-[200px] overflow-y-auto border-t border-border bg-white">
          {plan.jobs.map((job, i) => (
            <div key={job.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0">
              <div className="w-6 h-6 rounded-full bg-primary-navy text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-inter text-xs font-semibold text-primary-navy truncate">{job.address}</div>
                <div className="font-inter text-[10px] text-slate-secondary">
                  {job.drive_from_prev_mins ? `${job.drive_from_prev_mins} min drive · ` : ""}
                  {formatCurrency(job.net_earnings)}
                </div>
              </div>
              <button
                onClick={() => {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}&travelmode=driving`, "_blank");
                }}
                className="w-8 h-8 rounded-full bg-primary-navy text-white flex items-center justify-center flex-shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";
  if (!isPro) {
    return (
      <div className="h-full">
        <ProGate feature="Map View">{content}</ProGate>
      </div>
    );
  }

  return content;
}
