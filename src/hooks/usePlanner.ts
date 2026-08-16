"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plannerApi } from "@/api/planner.api";

export function useTodayPlan(date: string) {
  return useQuery({
    queryKey: ["planner", "today", date],
    queryFn: async () => {
      const res = await plannerApi.today(date);
      const payload = (res as any).data ?? res;
      return (payload.data ?? payload) as TodayPlan;
    },
    enabled: !!date,
    staleTime: 60 * 1000,
  });
}

export function useOptimise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      const res = await plannerApi.optimise(date);
      const payload = (res as any).data ?? res;
      return (payload.data ?? payload) as TodayPlan;
    },
    onSuccess: (_, date) => {
      qc.invalidateQueries({ queryKey: ["planner", "today", date] });
      qc.invalidateQueries({ queryKey: ["planner", "gaps", date] });
    },
  });
}

export function useGaps(date: string) {
  return useQuery({
    queryKey: ["planner", "gaps", date],
    queryFn: async () => {
      const res = await plannerApi.gaps(date);
      const payload = (res as any).data ?? res;
      return (payload.data ?? payload) as GapCandidate[];
    },
    enabled: !!date,
    staleTime: 60 * 1000,
  });
}

// Types
export interface PlannerJob {
  id: string;
  address: string;
  lat: number;
  lng: number;
  appointment_time: string;
  signing_duration_mins: number;
  scanback_duration_mins: number;
  signing_type: string;
  fee: number;
  platform_fee: number;
  net_earnings: number;
  status: string;
  client_name: string | null;
  platform_name: string | null;
  route_sequence: number | null;
  drive_from_prev_mins: number | null;
  drive_from_prev_miles: number | null;
  signing_ends_at: string | null;
  scanback_ends_at: string | null;
}

export interface ScanbackBlock {
  jobId: string;
  startsAt: string;
  endsAt: string;
  durationMins: number;
}

export interface Conflict {
  fromJobId: string;
  toJobId: string;
  shortfallMins: number;
  message: string;
}

export interface TodayPlan {
  jobs: PlannerJob[];
  scanback_blocks: ScanbackBlock[];
  summary: {
    total_jobs: number;
    total_drive_mins: number;
    total_earnings: number;
    total_miles: number;
    naive_total_drive_mins?: number | null;
    saved_drive_mins?: number | null;
  };
  optimised: boolean;
  conflicts: Conflict[];
}

export interface GapCandidate {
  gap_start: string;
  gap_end: string;
  gap_mins: number;
  prev_job_id: string;
  next_job_id: string;
  prev_job_label: string;
  next_job_label: string;
  candidates: GapCandidateJob[];
}

export interface GapCandidateJob {
  id: string;
  address: string;
  fee: number;
  net_earnings: number;
  signing_type: string;
  signing_duration_mins: number;
  scanback_duration_mins: number;
  platform_name: string | null;
  client_name: string | null;
  appointment_time: string;
  miles_from: number | null;
  miles_from_label: string | null;
}
