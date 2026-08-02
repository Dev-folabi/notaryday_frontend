import api from "@/lib/api";
import type { ImportConfirmOverrides } from "@/types/import";

export const bookingApi = {
  getSlots: (username: string, date: string, serviceType?: string) =>
    api.get(`/book/${username}/slots`, {
      params: { date, service_type: serviceType },
    }),
  create: (username: string, data: Record<string, unknown>) =>
    api.post(`/book/${username}`, data),
  list: (status?: string) =>
    api.get("/bookings", { params: status ? { status } : undefined }),
  get: (id: string) => api.get(`/bookings/${id}`),
  analyze: (id: string) => api.get(`/bookings/${id}/analysis`),
  approve: (id: string) => api.post(`/bookings/${id}/approve`),
  decline: (
    id: string,
    data: { reason?: string; alternative_times?: string[] },
  ) => api.patch(`/bookings/${id}/decline`, data),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
};

export const jobImportApi = {
  list: () => api.get("/imports"),
  get: (id: string) => api.get(`/imports/${id}`),
  confirm: (id: string, overrides?: ImportConfirmOverrides) =>
    api.post(`/imports/${id}/confirm`, overrides ?? {}),
  decline: (id: string) => api.post(`/imports/${id}/decline`),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/imports/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
