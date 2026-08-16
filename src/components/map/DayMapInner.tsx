"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { formatCurrency, formatDuration, formatMiles } from "@/lib/utils";
import { Navigation, Plus, Minus, Route } from "lucide-react";
import type { PlannerJob } from "@/hooks/usePlanner";

interface DayMapInnerProps {
  jobs: PlannerJob[];
  homeBase?: { lat: number; lng: number } | null;
  now?: number;
  className?: string;
}

function numberedIcon(n: number, current: boolean): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${
      current ? "#2563EB" : "#0F2C4E"
    };color:#fff;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-size:12px;font-weight:700;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#64748B;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-size:11px;font-weight:700;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)">H</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute top-2.5 right-2.5 z-[1000] flex flex-col gap-1">
      <button
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
        className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-primary-navy text-lg cursor-pointer shadow-sm"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-primary-navy text-lg cursor-pointer shadow-sm"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function DayMapInner({
  jobs,
  homeBase,
  now,
  className,
}: DayMapInnerProps) {
  const totalDriveMins = jobs.reduce(
    (sum, j) => sum + (j.drive_from_prev_mins ?? 0),
    0,
  );
  const totalMiles = jobs.reduce(
    (sum, j) => sum + (j.drive_from_prev_miles ?? 0),
    0,
  );

  const currentIdx = useMemo(() => {
    if (now == null) return jobs.length - 1;
    const idx = jobs.findIndex(
      (j) => new Date(j.appointment_time).getTime() > now,
    );
    return idx === -1 ? jobs.length - 1 : idx;
  }, [jobs, now]);

  const icons = useMemo(
    () => jobs.map((_, i) => numberedIcon(i + 1, i === currentIdx)),
    [jobs, currentIdx],
  );

  return (
    <div className={`flex flex-col h-full ${className ?? ""}`}>
      <div className="flex-1 relative min-h-[250px]">
        <MapContainer
          center={[jobs[0].lat, jobs[0].lng]}
          zoom={11}
          className="h-full w-full z-0"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {homeBase && (
            <Marker
              position={[homeBase.lat, homeBase.lng]}
              icon={homeIcon}
            />
          )}
          <Polyline
            positions={[
              ...(homeBase
                ? ([[homeBase.lat, homeBase.lng] as [number, number]])
                : []),
              ...jobs.map((j) => [j.lat, j.lng] as [number, number]),
            ]}
            color="#0F2C4E"
            weight={3}
            opacity={0.7}
          />
          {jobs.map((job, i) => (
            <Marker
              key={job.id}
              position={[job.lat, job.lng]}
              icon={icons[i]}
            >
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

        <ZoomControls />

        <div className="absolute top-2.5 left-2.5 z-[1000] bg-white border border-border rounded-lg px-2.5 py-1.5 text-[10px] max-w-[70%] shadow-sm">
          <div className="flex gap-1 items-center text-primary-navy font-semibold mb-1">
            <Route className="w-3 h-3" /> Route optimised,{" "}
            {formatMiles(totalMiles)} total
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className="flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-primary-navy" />
              <span className="text-slate-secondary text-[9px]">Confirmed</span>
            </span>
            <span className="flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-blue" />
              <span className="text-slate-secondary text-[9px]">Current</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border bg-white max-h-[220px] overflow-y-auto">
        <div className="px-4 py-2.5 flex justify-between border-b border-border flex-wrap gap-1.5">
          <span className="text-[12px] font-semibold text-primary-navy">
            Today&apos;s route, {jobs.length} stops
          </span>
          <span className="text-[10px] text-slate-secondary">
            {formatDuration(totalDriveMins)} total drive
          </span>
        </div>
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border last:border-b-0"
          >
            <div
              className={`w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                i === currentIdx ? "bg-blue" : "bg-primary-navy"
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-primary-navy mb-0.5 truncate">
                {job.appointment_time
                  ? `${new Intl.DateTimeFormat("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(job.appointment_time))} · ${job.signing_type ?? "Job"}`
                  : job.signing_type ?? "Job"}
              </div>
              <div className="text-[10px] text-slate-secondary truncate">
                {job.drive_from_prev_mins
                  ? `${job.drive_from_prev_mins} min drive · `
                  : ""}
                {job.address}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[12px] font-bold text-teal">
                {formatCurrency(job.net_earnings)}
              </div>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}&travelmode=driving`,
                    "_blank",
                  )
                }
                className="text-[10px] font-semibold text-blue flex gap-0.5 items-center cursor-pointer mt-0.5 justify-end"
              >
                <Navigation className="w-2.5 h-2.5" /> Go
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
