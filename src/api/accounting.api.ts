import api from "@/lib/api";

export const expensesApi = {
  list: (params?: { category?: string; from?: string; to?: string }) =>
    api.get("/expenses", { params }),
  summary: (year?: number) =>
    api.get("/expenses/summary", { params: year ? { year } : undefined }),
  create: (data: Record<string, unknown>) => api.post("/expenses", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const invoicesApi = {
  list: (isPaid?: boolean) =>
    api.get("/invoices", {
      params: isPaid !== undefined ? { is_paid: isPaid } : undefined,
    }),
  get: (id: string) => api.get(`/invoices/${id}`),
  generate: (jobId: string) => api.post(`/invoices/generate/${jobId}`),
  markPaid: (id: string, method?: string) =>
    api.patch(`/invoices/${id}/mark-paid`, { payment_method_used: method }),
  send: (id: string, email?: string) =>
    api.post(`/invoices/${id}/send`, { recipient_email: email }),
};

export const reportsApi = {
  earnings: (from: string, to: string, groupBy?: string) =>
    api.get("/reports/earnings", { params: { from, to, group_by: groupBy } }),
  mileage: (year?: number) =>
    api.get("/reports/mileage", { params: year ? { year } : undefined }),
  tax: (year?: number) =>
    api.get("/reports/tax", { params: year ? { year } : undefined }),
};

export const journalApi = {
  list: (params?: { from?: string; to?: string; search?: string }) =>
    api.get("/journal", { params }),
  create: (data: Record<string, unknown>) => api.post("/journal", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/journal/${id}`, data),
  delete: (id: string) => api.delete(`/journal/${id}`),
};
