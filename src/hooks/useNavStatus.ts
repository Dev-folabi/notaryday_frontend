"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { notificationsApi } from "@/api/notifications.api";
import { queryKeys } from "@/lib/queryClient";
import { toDateInputValue } from "@/lib/utils";
import type { ApiResponse } from "@/lib/api";
import type { Job } from "@/types/job";

interface NotificationItem {
  is_read?: boolean;
}

export function useNavStatus() {
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

  return { hasActiveSigning, unreadCount };
}
