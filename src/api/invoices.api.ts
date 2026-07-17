import api from "@/lib/api";

export const invoicesApi = {
  list: (params?: { is_paid?: boolean }) => api.get("/invoices", { params }),

  get: (id: string) => api.get(`/invoices/${id}`),

  generate: (jobId: string) => api.post(`/jobs/${jobId}/invoice`),

  send: (id: string, recipientEmail?: string) =>
    api.post(`/invoices/${id}/send`, recipientEmail ? { recipientEmail } : {}),

  markPaid: (id: string, paymentMethod?: string) =>
    api.patch(`/invoices/${id}/mark-paid`, paymentMethod ? { paymentMethod } : {}),
};
