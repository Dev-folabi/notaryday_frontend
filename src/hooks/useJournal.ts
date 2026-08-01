"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { journalApi } from "@/api/accounting.api";
import { queryKeys } from "@/lib/queryClient";
import type { ApiResponse } from "@/lib/api";
import type { CreateJournalEntryInput, JournalEntry } from "@/types/journal";

export function useJournal() {
  return useQuery({
    queryKey: queryKeys.journal.all,
    queryFn: async () => {
      const res = (await journalApi.list()) as unknown as ApiResponse<JournalEntry[]>;
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntryInput) =>
      journalApi.create(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}

export function useUpdateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateJournalEntryInput>;
    }) => journalApi.update(id, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}
