"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { notificationsApi } from "@/api/notifications.api";
import { plannerApi } from "@/api/planner.api";
import { queryKeys } from "@/lib/queryClient";
import { toDateInputValue } from "@/lib/utils";
import type { ApiResponse } from "@/lib/api";
import type { Job } from "@/types/job";

interface NotificationItem {
  is_read?: boolean;
}

interface GapCandidate {
  candidates: unknown[];
}

export function useNavStatus(isPro = false) {
  const today = toDateInputValue(new Date());

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", "sidebar-active", today],
    queryFn: async () => {
      const res = (await jobsApi.list({
        date: today,
      })) as unknown as ApiResponse<Job[]>;
      return res.data ?? [];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const hasActiveSigning = jobs.some(
    (j) => j.status === "IN_PROGRESS" || j.status === "SCANNING",
  );

  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const res = (await notificationsApi.list()) as unknown as ApiResponse<
        NotificationItem[]
      >;
      return res.data ?? [];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const { data: gaps = [] } = useQuery({
    queryKey: ["planner", "gaps", today],
    queryFn: async () => {
      const res = (await plannerApi.gaps(today)) as unknown as ApiResponse<
        GapCandidate[]
      >;
      return res.data ?? [];
    },
    enabled: isPro,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const gapCount = gaps.filter((g) => g.candidates.length > 0).length;

  return { hasActiveSigning, unreadCount, gapCount };
}
