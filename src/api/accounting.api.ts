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

export const reportsApi = {
  earnings: (
    from: string,
    to: string,
    groupBy?: string,
    compare?: boolean,
  ) =>
    api.get("/reports/earnings", {
      params: { from, to, group_by: groupBy, compare },
    }),
  mileage: (year?: number) =>
    api.get("/reports/mileage", { params: year ? { year } : undefined }),
  createMileageEntry: (data: {
    miles_date: string;
    miles: number;
    description: string;
  }) => api.post("/reports/mileage", data),
  updateMileageEntry: (
    id: string,
    data: {
      miles_date?: string;
      miles?: number;
      description?: string;
    },
  ) => api.patch(`/reports/mileage/${id}`, data),
  deleteMileageEntry: (id: string) => api.delete(`/reports/mileage/${id}`),
  tax: (from: string, to: string) =>
    api.get("/reports/tax", { params: { from, to } }),
  taxPdf: (from: string, to: string) =>
    api.get("/reports/tax/pdf", { params: { from, to }, responseType: "blob" }),
};

export const journalApi = {
  list: (params?: { from?: string; to?: string; search?: string }) =>
    api.get("/journal", { params }),
  create: (data: Record<string, unknown>) => api.post("/journal", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/journal/${id}`, data),
  delete: (id: string) => api.delete(`/journal/${id}`),
};
