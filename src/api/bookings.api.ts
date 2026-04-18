import api from "@/lib/api";

export const bookingsApi = {
  list: (params?: { status?: string }) => api.get("/bookings", { params }),

  get: (id: string) => api.get(`/bookings/${id}`),

  approve: (id: string) => api.patch(`/bookings/${id}/approve`),

  decline: (id: string, data?: { reason?: string }) =>
    api.patch(`/bookings/${id}/decline`, data),
};
