"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { notificationsApi } from "@/api/notifications.api";
import { plannerApi } from "@/api/planner.api";
import { bookingApi, jobImportApi } from "@/api/booking.api";
import { queryKeys } from "@/lib/queryClient";
import { toDateInputValue, unwrap } from "@/lib/utils";
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

  // Active signing across any date (not just today) so past-date
  // in-progress jobs still surface the Live badge.
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", "sidebar-active"],
    queryFn: async () => {
      const res = (await jobsApi.list({
        status: "IN_PROGRESS,SCANNING",
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
    queryKey: queryKeys.planner.gaps(today),
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

  const { data: imports = [] } = useQuery({
    queryKey: ["imports", "pending"],
    queryFn: async () => {
      const res = await jobImportApi.list();
      return unwrap<unknown[]>(res) ?? [];
    },
    enabled: isPro,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const importCount = imports.length;

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", "pending-review"],
    queryFn: async () => {
      const res = await bookingApi.list("PENDING_REVIEW");
      return unwrap<unknown[]>(res) ?? [];
    },
    enabled: isPro,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const bookingCount = bookings.length;

  return {
    hasActiveSigning,
    unreadCount,
    gapCount,
    importCount,
    bookingCount,
  };
}
