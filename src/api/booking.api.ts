import api from "@/lib/api";

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
  approve: (id: string) => api.post(`/bookings/${id}/approve`),
  decline: (
    id: string,
    data: { reason?: string; alternative_times?: string[] },
  ) => api.patch(`/bookings/${id}/decline`, data),
};

export const calendarApi = {
  getFeedToken: () => api.get("/calendar/feed-token"),
};

export const emailImportApi = {
  list: () => api.get("/email-import"),
  get: (id: string) => api.get(`/email-import/${id}`),
  confirm: (id: string, overrides?: Record<string, unknown>) =>
    api.post(`/email-import/${id}/confirm`, overrides ?? {}),
};

export const screenshotApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/screenshot-import/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
