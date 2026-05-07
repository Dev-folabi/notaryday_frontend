import React from "react";
import { Check, AlertTriangle, X, Plus } from "lucide-react";
import type { CITCResult } from "@/hooks/useCITT";
import { format } from "date-fns";

interface CITTVerdictCardProps {
  result: CITCResult;
  onClose: () => void;
  jobData: any;
}

export default function CITTVerdictCard({ result, onClose, jobData }: CITTVerdictCardProps) {
  const isTakeIt = result.verdict === "TAKE_IT";
  const isRisky = result.verdict === "RISKY";
  const isDecline = result.verdict === "DECLINE";

  let headerColor = "";
  let headerBg = "";
  let headerBorder = "";
  let Icon = Check;
  let title = "";
  let subtitle = "";

  if (isTakeIt) {
    headerColor = "text-teal-success";
    headerBg = "bg-teal-success/10";
    headerBorder = "border-teal-success/30";
    Icon = Check;
    title = "Take it";
    subtitle = "Schedule fits, no conflicts. This signing is profitable and ready to book.";
  } else if (isRisky) {
    headerColor = "text-amber-warning";
    headerBg = "bg-amber-warning/10";
    headerBorder = "border-amber-warning/30";
    Icon = AlertTriangle;
    title = "Risky";
    subtitle = "This signing can technically fit, but two things need your attention before you commit.";
  } else {
    headerColor = "text-red-danger";
    headerBg = "bg-red-danger/10";
    headerBorder = "border-red-danger/30";
    Icon = X;
    title = "Decline";
    subtitle = "This signing conflicts directly with a committed schedule block or has critically low earnings.";
  }

  const {
    net_earnings,
    mileage_cost,
    effective_hourly,
    drive_distance_miles,
    drive_time_mins,
    scanback_conflict,
    scanback_conflict_detail,
    can_make_it,
  } = result;

  return (
    <div className="flex flex-col h-full -mx-[22px] -mb-5 relative w-full overflow-hidden rounded-b-[16px]">
      {/* VERDICT HEADER */}
      <div
        className={`px-6 pt-7 pb-6 text-center border-b ${headerBg} ${headerBorder} shrink-0`}
      >
        <div
          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-4 ${
            isTakeIt ? "bg-teal-success" : isRisky ? "bg-amber-warning" : "bg-red-danger"
          }`}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={isTakeIt ? 2.5 : 3} />
        </div>
        <div className={`font-sora text-[26px] font-bold mb-1.5 ${headerColor}`}>
          {title}
        </div>
        <div className="text-[14px] text-slate-secondary leading-snug max-w-[300px] mx-auto">
          {subtitle}
        </div>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-10">
        {/* EARNINGS ROW */}
        <span className="text-[10px] font-semibold text-slate-secondary tracking-[0.6px] uppercase mb-2.5 block">
          Earnings breakdown
        </span>
        <div className="grid grid-cols-3 gap-[1px] border border-border rounded-[10px] overflow-hidden bg-border mb-2">
          <div className="bg-white p-3 text-center flex flex-col">
            <span className="text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.4px] mb-1.5">
              Offered fee
            </span>
            <span className="font-sora text-[18px] font-bold text-slate-body leading-none">
              ${jobData?.fee?.toFixed(2) || "0.00"}
            </span>
            <span className="text-[10px] text-slate-secondary mt-1">gross</span>
          </div>
          <div className="bg-white p-3 text-center flex flex-col">
            <span className="text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.4px] mb-1.5">
              Mileage cost
            </span>
            <span className="font-sora text-[18px] font-bold text-amber-warning leading-none">
              -${mileage_cost.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-secondary mt-1">
              {drive_distance_miles?.toFixed(1) || "0"} mi rt
            </span>
          </div>
          <div className="bg-white p-3 text-center flex flex-col">
            <span className="text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.4px] mb-1.5">
              Net earnings
            </span>
            <span
              className={`font-sora text-[18px] font-bold leading-none ${
                net_earnings >= 30
                  ? "text-teal-success"
                  : net_earnings >= 10
                  ? "text-amber-warning"
                  : "text-red-danger"
              }`}
            >
              ${net_earnings.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-secondary mt-1">
              ${effective_hourly.toFixed(0)}/hr eff.
            </span>
          </div>
        </div>
        <div className="text-[12px] text-slate-secondary text-center mb-4">
          {drive_distance_miles?.toFixed(1) || "0"} mi round trip &middot;{" "}
          {jobData?.signing_duration_mins || 45} min signing &middot;{" "}
          {drive_time_mins || 0} min drive &middot; ${effective_hourly.toFixed(2)}{" "}
          effective hourly rate
        </div>

        <div className="h-[1px] bg-border my-4" />

        {/* CHECKS */}
        <span className="text-[10px] font-semibold text-slate-secondary tracking-[0.6px] uppercase mb-2.5 block">
          What we checked
        </span>
        <div className="bg-white border border-border rounded-[12px] p-1 px-4 mb-4">
          {/* Schedule Fit */}
          <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                can_make_it
                  ? "bg-teal-success/10 text-teal-success"
                  : "bg-red-danger/10 text-red-danger"
              }`}
            >
              {can_make_it ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-primary-navy mb-[2px]">
                Schedule fit
              </div>
              <div className="text-[12px] text-slate-secondary leading-snug">
                {can_make_it
                  ? "Schedule fits with enough time for the appointment and driving."
                  : (result as any).conflict_detail || "Overlaps with another job."}
              </div>
            </div>
          </div>
          
          {/* Scanback Conflict */}
          <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                scanback_conflict
                  ? "bg-red-danger/10 text-red-danger"
                  : "bg-teal-success/10 text-teal-success"
              }`}
            >
              {!scanback_conflict ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-primary-navy mb-[2px]">
                Scanback conflicts
              </div>
              <div className="text-[12px] text-slate-secondary leading-snug">
                {!scanback_conflict
                  ? "No scanback window conflicts."
                  : scanback_conflict_detail || "Conflicts with an existing scanback window."}
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
             <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                net_earnings >= 30
                  ? "bg-teal-success/10 text-teal-success"
                  : net_earnings >= 10
                  ? "bg-amber-warning/10 text-amber-warning"
                  : "bg-red-danger/10 text-red-danger"
              }`}
            >
              {net_earnings >= 30 ? (
                <Check className="w-4 h-4" />
              ) : net_earnings >= 10 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-primary-navy mb-[2px]">
                Net earnings
              </div>
              <div className="text-[12px] text-slate-secondary leading-snug">
                {net_earnings >= 30
                  ? "Solid profitability. Good effective hourly rate."
                  : net_earnings >= 10
                  ? "Marginal profitability. Decide if the time investment is worth it."
                  : "Extremely low net earnings after mileage. Recommended decline."}
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS FOR RISKY/DECLINE */}
        {scanback_conflict && (
          <div className="bg-red-danger/10 border border-red-danger/30 rounded-[8px] p-3 flex items-start gap-2.5 mb-4">
             <X className="w-4 h-4 text-red-danger shrink-0 mt-[1px]" />
             <div>
               <div className="text-[13px] font-semibold text-red-danger mb-[3px]">Direct scanback conflict</div>
               <div className="text-[12px] text-slate-secondary leading-snug">{scanback_conflict_detail}</div>
             </div>
          </div>
        )}

        <div className="h-[1px] bg-border my-4" />

        {/* ACTIONS */}
        <div className="flex flex-col gap-2.5 mt-2">
          {isTakeIt ? (
            <button className="bg-teal-success text-white border-none rounded-button h-12 text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90">
              <Plus className="w-4 h-4" />
              <span>Add to my day</span>
            </button>
          ) : isRisky ? (
            <button className="bg-amber-warning text-white border-none rounded-button h-12 text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90">
              <AlertTriangle className="w-4 h-4" />
              <span>Accept anyway — I understand the risk</span>
            </button>
          ) : null}

          <button
            onClick={onClose}
            className={`bg-transparent rounded-button h-11 text-[13px] font-semibold flex items-center justify-center gap-1.5 ${
              isDecline
                ? "text-red-danger border border-red-danger/30"
                : "text-slate-secondary border border-border"
            }`}
          >
            <X className="w-4 h-4" />
            <span>{isDecline ? "Decline this signing" : isRisky ? "Decline — not worth the risk" : "Decline — not taking it"}</span>
          </button>
          
          {isDecline && (
             <button className="bg-transparent text-red-danger border border-red-danger/30 rounded-button h-11 font-semibold text-[13px] flex items-center justify-center gap-1.5">
               <AlertTriangle className="w-4 h-4" />
               <span>Override and accept anyway</span>
             </button>
          )}
        </div>
        
        {isDecline && (
          <div className="text-[11px] text-slate-secondary text-center mt-2">
            Overriding a direct conflict is not recommended. You will likely miss your deadline.
          </div>
        )}

      </div>
    </div>
  );
}
