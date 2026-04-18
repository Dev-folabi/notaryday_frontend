"use client";

import { useMutation } from "@tanstack/react-query";
import { cittApi } from "@/api/citt.api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

interface CITTCheckParams {
  address: string;
  appointment_time: string;
  signing_type: string;
  fee: number;
  platform_fee?: number;
  signing_duration_mins?: number;
  scanback_duration_mins?: number;
}

interface CITCResult {
  can_make_it: boolean;
  drive_time_mins: number | null;
  drive_distance_miles: number | null;
  mileage_cost: number;
  net_earnings: number;
  effective_hourly: number;
  scanback_conflict: boolean;
  scanback_conflict_detail?: string;
  verdict: "TAKE_IT" | "RISKY" | "DECLINE";
}

export function useCITTCheck() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: CITTCheckParams) => {
      const res = await cittApi.check(params);
      return res as unknown as CITCResult;
    },
    onSuccess: (data, variables) => {
      const key = queryKeys.citt.check({
        address: variables.address,
        appointment_time: variables.appointment_time,
        signing_type: variables.signing_type,
      });
      qc.setQueryData(key, data);
    },
  });
}
