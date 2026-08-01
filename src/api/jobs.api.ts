import api from "@/lib/api";

export const jobsApi = {
  list: (params?: {
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }) => api.get("/jobs", { params }),

  create: (data: Record<string, unknown>, idempotencyKey?: string) =>
    api.post("/jobs", data, {
      headers: idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    }),

  get: (id: string) => api.get(`/jobs/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/jobs/${id}`, data),

  delete: (id: string) => api.delete(`/jobs/${id}`),

  updateStatus: (id: string, data: { status: string }) =>
    api.patch(`/jobs/${id}/status`, data),
};
