import api from "@/lib/api";

export const reportsApi = {
  getEarnings: (params?: { from?: string; to?: string; groupBy?: string }) =>
    api.get("/reports/earnings", { params }),

  getMileage: (year: number) =>
    api.get("/reports/mileage", { params: { year } }),
};
