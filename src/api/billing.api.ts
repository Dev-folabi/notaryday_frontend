import api from "@/lib/api";

export const billingApi = {
  subscribe: (data: { plan: "pro_monthly" | "pro_annual" }) =>
    api.post("/billing/subscribe", data),

  cancel: () => api.post("/billing/cancel"),

  getPortalUrl: () => api.get("/billing/portal"),
};
