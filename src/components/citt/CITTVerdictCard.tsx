import React from "react";
import { Check, AlertTriangle, X, Plus, Sparkles } from "lucide-react";
import type { CITCResult } from "@/hooks/useCITT";
import { format } from "date-fns";

interface CITTVerdictCardProps {
  result: CITCResult;
  onClose: () => void;
  jobData: any;
}

export default function CITTVerdictCard({ result, onClose, jobData }: CITTVerdictCardProps) {
  const {
    net_earnings = 0,
    mileage_cost = 0,
    effective_hourly = 0,
    drive_distance_miles = 0,
    drive_time_mins = 0,
    scanback_conflict = false,
    scanback_conflict_detail = "",
    can_make_it = true,
    verdict = "TAKE_IT",
    reason = "",
    prev_job = null,
    next_job = null,
  } = result;

  const isTakeIt = verdict === "TAKE_IT";
  const isRisky = verdict === "RISKY";
  const isDecline = verdict === "DECLINE";

  let headerColor = "";
  let headerBg = "";
  let headerBorder = "";
  let iconBg = "";
  let Icon = Check;
  let title = "";
  let subtitle = "";

  if (isTakeIt) {
    headerColor = "text-[#0E7B6C]";
    headerBg = "bg-[#ECFDF5]";
    headerBorder = "border-[#6EE7B7]";
    iconBg = "bg-[#0E7B6C]";
    Icon = Check;
    title = "Take it";
    subtitle = "Schedule fits, no conflicts. This signing is profitable and ready to book.";
  } else if (isRisky) {
    headerColor = "text-[#D97706]";
    headerBg = "bg-[#FFFBEB]";
    headerBorder = "border-[#FDE68A]";
    iconBg = "bg-[#D97706]";
    Icon = AlertTriangle;
    title = "Risky";
    subtitle = "This signing can technically fit, but two things need your attention before you commit.";
  } else {
    headerColor = "text-[#C0392B]";
    headerBg = "bg-[#FEF2F2]";
    headerBorder = "border-[#FECACA]";
    iconBg = "bg-[#C0392B]";
    Icon = X;
    title = "Decline";
    subtitle = reason || "This signing conflicts directly with a committed schedule block or has critically low earnings.";
  }

  return (
    <div className="flex flex-col h-full relative w-full overflow-hidden rounded-[16px]">
      {/* Floating Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* VERDICT HEADER */}
      <div
        className={`px-6 pt-10 pb-8 text-center border-b ${headerBg} ${headerBorder} shrink-0`}
      >
        <div
          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={isTakeIt ? 2.5 : 3} />
        </div>
        <div className={`font-sora text-[26px] font-bold mb-1.5 ${headerColor}`}>
          {title}
        </div>
        <div className="text-[14px] text-[#64748B] leading-snug max-w-[300px] mx-auto">
          {subtitle}
        </div>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-10">
        {/* EARNINGS ROW */}
        <span className="text-[10px] font-semibold text-[#64748B] tracking-[0.6px] uppercase mb-2.5 block">
          Earnings breakdown
        </span>
        <div className="grid grid-cols-3 gap-[1px] border border-[#E2E8F0] rounded-[10px] overflow-hidden bg-[#E2E8F0] mb-2">
          <div className="bg-white p-3.5 text-center flex flex-col">
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.4px] mb-1.5">
              Offered fee
            </span>
            <span className="font-sora text-[18px] font-bold text-[#475569] leading-none">
              ${jobData?.fee?.toFixed(2) || "0.00"}
            </span>
            <span className="text-[10px] text-[#64748B] mt-1.5">gross</span>
          </div>
          <div className="bg-white p-3.5 text-center flex flex-col border-l border-[#E2E8F0]">
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.4px] mb-1.5">
              Mileage cost
            </span>
            <span className="font-sora text-[18px] font-bold text-[#D97706] leading-none">
              -${mileage_cost?.toFixed(2) || "0.00"}
            </span>
            <span className="text-[10px] text-[#64748B] mt-1.5">
              {drive_distance_miles?.toFixed(1) || "0"} mi rt
            </span>
          </div>
          <div className="bg-white p-3.5 text-center flex flex-col border-l border-[#E2E8F0]">
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.4px] mb-1.5">
              Net earnings
            </span>
            <span
              className={`font-sora text-[18px] font-bold leading-none ${
                net_earnings >= 30
                  ? "text-[#0E7B6C]"
                  : net_earnings >= 10
                  ? "text-[#D97706]"
                  : "text-[#C0392B]"
              }`}
            >
              ${net_earnings?.toFixed(2) || "0.00"}
            </span>
            <span className="text-[10px] text-[#64748B] mt-1.5">
              ${effective_hourly?.toFixed(0) || "0"}/hr eff.
            </span>
          </div>
        </div>
        <div className="text-[12px] text-[#64748B] text-center mb-4">
          {drive_distance_miles?.toFixed(1) || "0"} mi round trip &middot;{" "}
          {jobData?.signing_duration_mins || 45} min signing &middot;{" "}
          {drive_time_mins || 0} min drive &middot; ${effective_hourly?.toFixed(2) || "0.00"}{" "}
          effective hourly rate
        </div>

        <div className="h-[1px] bg-border my-4" />

        {/* CHECKS */}
        <span className="text-[10px] font-semibold text-[#64748B] tracking-[0.6px] uppercase mb-2.5 block">
          What we checked
        </span>
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-1 px-4 mb-6">
          {/* Schedule Fit */}
          <div className="flex items-start gap-3 py-3 border-b border-[#E2E8F0] last:border-b-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                can_make_it
                  ? "bg-[#ECFDF5] text-[#0E7B6C]"
                  : "bg-[#FEF2F2] text-[#C0392B]"
              }`}
            >
              {can_make_it ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#0F2C4E] mb-[2px]">
                Schedule fit
              </div>
              <div className="text-[12px] text-[#64748B] leading-snug">
                {can_make_it
                  ? "Schedule fits with enough time for the appointment and driving."
                  : (result as any).reason || "Overlaps with another job."}
              </div>
            </div>
          </div>
          
          {/* Scanback Conflict */}
          <div className="flex items-start gap-3 py-3 border-b border-[#E2E8F0] last:border-b-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                scanback_conflict
                  ? "bg-[#FEF2F2] text-[#C0392B]"
                  : "bg-[#ECFDF5] text-[#0E7B6C]"
              }`}
            >
              {!scanback_conflict ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#0F2C4E] mb-[2px]">
                Scanback conflicts
              </div>
              <div className="text-[12px] text-[#64748B] leading-snug">
                {!scanback_conflict
                  ? "No scanback window conflicts."
                  : scanback_conflict_detail || "Conflicts with an existing scanback window."}
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="flex items-start gap-3 py-3 border-b border-[#E2E8F0] last:border-b-0">
             <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                net_earnings >= 30
                  ? "bg-[#ECFDF5] text-[#0E7B6C]"
                  : net_earnings >= 10
                  ? "bg-[#FFFBEB] text-[#D97706]"
                  : "bg-[#FEF2F2] text-[#C0392B]"
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
              <div className="text-[13px] font-semibold text-[#0F2C4E] mb-[2px]">
                Net earnings
              </div>
              <div className="text-[12px] text-[#64748B] leading-snug">
                {net_earnings >= 30
                  ? "Solid profitability. Good effective hourly rate."
                  : net_earnings >= 10
                  ? "Marginal profitability. Decide if the time investment is worth it."
                  : "Extremely low net earnings after mileage. Recommended decline."}
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE CONTEXT */}
        {(prev_job || next_job) && (
          <>
            <div className="h-[1px] bg-border my-6" />
            <span className="text-[10px] font-semibold text-[#64748B] tracking-[0.6px] uppercase mb-2.5 block">
              Your schedule that day
            </span>
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden">
              {prev_job && (
                <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-[#94A3B8] w-20 shrink-0">
                    {new Date(prev_job.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[12px] font-medium text-[#475569]">
                    {prev_job.type.replace(/_/g, ' ')} · Committed
                  </span>
                </div>
              )}
              
              <div className={`px-4 py-3 flex items-center gap-3 ${isTakeIt ? 'bg-[#ECFDF5]' : isRisky ? 'bg-[#FFFBEB]' : 'bg-[#FEF2F2]'}`}>
                <span className="text-[11px] font-semibold text-[#94A3B8] w-20 shrink-0">
                  {jobData?.appointment_time ? new Date(jobData.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Proposed'}
                </span>
                <span className={`text-[12px] font-bold ${isTakeIt ? 'text-[#0E7B6C]' : isRisky ? 'text-[#D97706]' : 'text-[#C0392B]'}`}>
                   ← This job {isTakeIt ? 'fits here' : isRisky ? '(risky overlap)' : 'CONFLICT'}
                </span>
              </div>

              {next_job && (
                <div className="px-4 py-3 border-t border-[#E2E8F0] flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-[#94A3B8] w-20 shrink-0">
                    {new Date(next_job.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[12px] font-medium text-[#475569]">
                    {next_job.type.replace(/_/g, ' ')} · Committed
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="h-[1px] bg-border my-4" />

        {/* DETAILS FOR RISKY/DECLINE */}
        {scanback_conflict && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] p-3 flex items-start gap-2.5 mb-4">
             <X className="w-4 h-4 text-[#C0392B] shrink-0 mt-[1px]" />
             <div>
               <div className="text-[13px] font-semibold text-[#C0392B] mb-[3px]">Direct scanback conflict</div>
               <div className="text-[12px] text-[#64748B] leading-snug">{scanback_conflict_detail}</div>
             </div>
          </div>
        )}

        {isRisky && !can_make_it && (
           <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-3 flex items-start gap-2.5 mb-4">
             <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-[1px]" />
             <div>
               <div className="text-[13px] font-semibold text-[#D97706] mb-[3px]">Tight schedule buffer</div>
               <div className="text-[12px] text-[#64748B] leading-snug">{reason}</div>
             </div>
          </div>
        )}

        <div className="h-[1px] bg-border my-4" />

        {/* ACTIONS */}
        <div className="flex flex-col gap-2.5 mt-2">
          {isTakeIt ? (
            <button className="bg-[#0E7B6C] text-white border-none rounded-button h-12 text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90">
              <Plus className="w-4 h-4" />
              <span>Add to my day</span>
            </button>
          ) : isRisky ? (
            <button className="bg-[#D97706] text-white border-none rounded-button h-12 text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90">
              <AlertTriangle className="w-4 h-4" />
              <span>Accept anyway — I understand the risk</span>
            </button>
          ) : null}

          <button
            onClick={onClose}
            className={`bg-transparent rounded-button h-11 text-[13px] font-semibold flex items-center justify-center gap-1.5 ${
              isDecline
                ? "text-[#C0392B] border border-[#FECACA]"
                : "text-[#64748B] border border-[#E2E8F0]"
            }`}
          >
            <X className="w-4 h-4" />
            <span>{isDecline ? "Decline this signing" : isRisky ? "Decline — not worth the risk" : "Decline — not taking it"}</span>
          </button>
          
          {isDecline && (
             <button className="bg-transparent text-[#C0392B] border border-[#FECACA] rounded-button h-11 font-semibold text-[13px] flex items-center justify-center gap-1.5">
               <AlertTriangle className="w-4 h-4" />
               <span>Override and accept anyway</span>
             </button>
          )}
        </div>
        
        {isDecline && (
          <div className="text-[11px] text-[#94A3B8] text-center mt-4">
            Overriding a direct conflict is not recommended. You will likely miss your deadline.
          </div>
        )}

        {/* PRO NUDGE */}
        <div className="mt-8 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between gap-3">
          <div className="text-[12px] text-[#64748B] leading-snug flex-1">
            Want Notary Day to automatically plan your whole day around this job?
          </div>
          <button className="bg-[#F59E0B] text-[#0F2C4E] px-3.5 h-9 rounded-[8px] text-[12px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade to Pro</span>
          </button>
        </div>

      </div>
    </div>
  );
}
