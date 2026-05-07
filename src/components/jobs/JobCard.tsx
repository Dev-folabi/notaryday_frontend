import React from "react";
import { Clock, MapPin, Navigation } from "lucide-react";
import { format } from "date-fns";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  showNav?: boolean;
}

function getTypeChipClasses(type: string) {
  const t = type.toUpperCase();
  if (t === "LOAN_REFI") return "bg-blue-100 text-blue-700";
  if (t === "GENERAL") return "bg-emerald-100 text-emerald-800";
  if (t === "HYBRID") return "bg-violet-100 text-violet-700";
  return "bg-slate-100 text-slate-500";
}

function getTypeLabel(type: string) {
  const t = type.toUpperCase();
  if (t === "LOAN_REFI") return "Loan Refi";
  if (t === "GENERAL") return "General";
  if (t === "HYBRID") return "Hybrid";
  if (t === "PURCHASE_CLOSING") return "Purchase";
  if (t === "FIELD_INSPECTION") return "Field Inspection";
  if (t === "APOSTILLE") return "Apostille";
  return type;
}

export default function JobCard({ job, showNav = true }: JobCardProps) {
  const time = new Date(job.appointment_time);
  const formattedTime = format(time, "h:mm a");

  const fee = job.profitability_net_earnings ?? 0;
  let feeColorClass = "text-slate-body";
  if (fee >= 30) feeColorClass = "text-teal-success";
  else if (fee >= 10) feeColorClass = "text-amber-warning";
  else if (fee < 10) feeColorClass = "text-red-danger";

  const handleNav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = encodeURIComponent(job.address);
    // Prefer Google Maps by default if user setting not passed
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`,
      "_blank",
    );
  };

  const needsScanback =
    job.signing_type === "LOAN_REFI" ||
    job.signing_type === "HYBRID" ||
    job.signing_type === "PURCHASE_CLOSING";

  return (
    <div className="bg-white border border-border rounded-[12px] shadow-sm p-3.5 px-4 mb-2.5 flex items-start justify-between gap-3 w-full text-left">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-primary-navy flex items-center gap-1.5 mb-1">
          <Clock className="w-3 h-3 text-primary-navy" />
          <span>
            {formattedTime} &middot; {job.signing_duration_mins} min
          </span>
        </div>
        <div className="text-[12px] font-medium text-slate-body whitespace-nowrap overflow-hidden text-ellipsis mb-[7px] flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{job.address}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-[3px] px-[7px] py-[3px] rounded bg-opacity-20 text-[10px] font-semibold tracking-[0.2px] uppercase whitespace-nowrap ${getTypeChipClasses(job.signing_type)}`}
          >
            {getTypeLabel(job.signing_type)}
          </span>
          {job.platform_name && (
            <span className="inline-flex items-center gap-[3px] px-[7px] py-[3px] rounded bg-slate-100 text-slate-500 text-[10px] font-semibold tracking-[0.2px] uppercase whitespace-nowrap">
              {job.platform_name}
            </span>
          )}
          {needsScanback && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-warning inline-block"
              title="Scanback required"
            />
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-[15px] font-bold mb-[1px] ${feeColorClass}`}>
          ${fee.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-secondary mb-[7px]">
          net after mileage
        </div>
        {showNav && (
          <div
            onClick={handleNav}
            className="flex items-center gap-[3px] text-[11px] font-semibold text-interactive-blue cursor-pointer justify-end"
          >
            <Navigation className="w-3 h-3" />
            <span>Navigate</span>
          </div>
        )}
      </div>
    </div>
  );
}
