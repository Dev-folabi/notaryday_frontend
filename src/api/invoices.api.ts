import api from "@/lib/api";

export const invoicesApi = {
  list: (params?: { is_paid?: boolean }) => api.get("/invoices", { params }),

  stats: () => api.get("/invoices/stats"),

  get: (id: string) => api.get(`/invoices/${id}`),

  generate: (jobId: string) => api.post(`/invoices/jobs/${jobId}/invoice`),

  update: (
    id: string,
    data: {
      recipient_name?: string;
      recipient_email?: string;
      final_fee?: number;
      note_to_client?: string;
    },
  ) => api.patch(`/invoices/${id}`, data),

  send: (id: string, recipientEmail?: string) =>
    api.post(`/invoices/${id}/send`, recipientEmail ? { recipient_email: recipientEmail } : {}),

  markPaid: (id: string, paymentMethod?: string) =>
    api.patch(`/invoices/${id}/mark-paid`, paymentMethod ? { payment_method_used: paymentMethod } : {}),
};
