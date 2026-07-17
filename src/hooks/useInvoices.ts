"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "@/api/invoices.api";

export interface Invoice {
  id: string;
  user_id: string;
  job_id: string;
  invoice_number: string;
  recipient_name: string | null;
  recipient_email: string | null;
  subtotal: number;
  travel_fee: number;
  total: number;
  is_paid: boolean;
  paid_at: string | null;
  payment_method_used: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  job?: {
    address: string;
    signing_type: string;
    appointment_time: string;
  };
}

export function useInvoices(params?: { is_paid?: boolean }) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const res = await invoicesApi.list(params);
      const payload = (res as any).data ?? res;
      return (payload.data ?? payload) as Invoice[];
    },
    staleTime: 30 * 1000,
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, recipientEmail }: { id: string; recipientEmail?: string }) =>
      invoicesApi.send(id, recipientEmail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useMarkInvoicePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod?: string }) =>
      invoicesApi.markPaid(id, paymentMethod),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
