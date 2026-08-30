import api from "@/lib/api";

export const calendarApi = {
  getFeedToken: () => api.get("/calendar/feed-token"),

  getGoogleAuthUrl: () => api.get("/calendar/auth/google/url"),

  disconnect: () => api.delete("/calendar/disconnect"),
};
