import React from "react";
import type { JobStatus } from "@/types/job";

interface JobStatusBadgeProps {
  status: JobStatus;
}

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {
  let bgColor = "bg-slate-100";
  let textColor = "text-slate-500";
  let label = status.toLowerCase();

  switch (status) {
    case "PENDING":
      bgColor = "bg-amber-100";
      textColor = "text-amber-700";
      label = "Pending";
      break;
    case "PENDING_REVIEW":
      bgColor = "bg-amber-100";
      textColor = "text-amber-700";
      label = "Pending Review";
      break;
    case "CONFIRMED":
      bgColor = "bg-blue-100";
      textColor = "text-blue-700";
      label = "Confirmed";
      break;
    case "IN_PROGRESS":
      bgColor = "bg-violet-100";
      textColor = "text-violet-700";
      label = "In Progress";
      break;
    case "SCANNING":
      bgColor = "bg-amber-warning/20";
      textColor = "text-amber-warning";
      label = "Scanning";
      break;
    case "COMPLETE":
      bgColor = "bg-teal-100";
      textColor = "text-teal-success";
      label = "Complete";
      break;
    case "DECLINED":
    case "CANCELLED":
      bgColor = "bg-red-100";
      textColor = "text-red-danger";
      label = status === "DECLINED" ? "Declined" : "Cancelled";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-[3px] px-[7px] py-[3px] rounded ${bgColor} ${textColor} text-[10px] font-semibold tracking-[0.2px] uppercase whitespace-nowrap`}
    >
      {label}
    </span>
  );
}
