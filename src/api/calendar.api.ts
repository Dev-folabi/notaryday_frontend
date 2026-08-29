import api from "@/lib/api";

export const calendarApi = {
  getFeedToken: () => api.get("/calendar/feed-token"),

  googleAuth: () => api.get("/calendar/auth/google"),

  disconnect: () => api.delete("/calendar/disconnect"),
};
