"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { queryKeys } from "@/lib/queryClient";
import type { CreateJobInput, Job, JobStatus } from "@/types/job";

export function useJobs(params?: {
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: async () => {
      const res = await jobsApi.list(params);
      return res as Job[];
    },
    staleTime: 30 * 1000,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: async () => {
      const res = await jobsApi.get(id);
      return res as Job;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobInput) =>
      jobsApi.create(data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobInput> }) =>
      jobsApi.update(id, data as Record<string, unknown>),
    onSuccess: (_data: unknown, vars: { id: string }) => {
      qc.invalidateQueries({ queryKey: queryKeys.job(vars.id) });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      jobsApi.updateStatus(id, { status }),
    onSuccess: (_data: unknown, vars: { id: string }) => {
      qc.invalidateQueries({ queryKey: queryKeys.job(vars.id) });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
