import api from "@/lib/api";

export const billingApi = {
  subscribe: (data: { variantId: string }) =>
    api.post("/billing/subscribe", data),

  cancel: () => api.post("/billing/cancel"),

  getPortalUrl: () => api.get("/billing/portal"),
};
