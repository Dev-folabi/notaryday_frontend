import api from "@/lib/api";

export const invoicesApi = {
  list: (params?: { status?: string }) => api.get("/invoices", { params }),

  get: (id: string) => api.get(`/invoices/${id}`),

  markPaid: (id: string) => api.patch(`/invoices/${id}/mark-paid`),
};
