"use client";

import { useUIStore } from "@/store/uiStore";
import { useTodayPlan } from "@/hooks/usePlanner";
import { useAuth } from "@/hooks/useAuth";
import { toDateInputValue } from "@/lib/utils";
import ProGate from "@/components/ui/ProGate";
import DaySummaryStrip from "@/components/planner/DaySummaryStrip";
import DayMap from "@/components/map/DayMap";

export default function DayPage() {
  const { user } = useAuth();
  const { activeDate } = useUIStore();
  const date = activeDate || toDateInputValue(new Date());
  const { data: plan, isLoading } = useTodayPlan(date);
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const content = (
    <div className="flex flex-col h-full">
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
      <div className="flex-1 relative min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : (
          <DayMap jobs={plan?.jobs ?? []} />
        )}
      </div>
    </div>
  );

  if (!isPro) {
    return (
      <div className="h-full">
        <ProGate feature="Map View">{content}</ProGate>
      </div>
    );
  }

  return content;
}
