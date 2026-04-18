import api from "@/lib/api";

export const notificationsApi = {
  list: () => api.get("/notifications"),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};
