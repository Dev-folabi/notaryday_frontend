import api from "@/lib/api";

export const plannerApi = {
  getToday: (date?: string) => api.get("/planner/today", { params: { date } }),

  optimise: (data: { date: string }) => api.post("/planner/optimise", data),

  getGaps: (date?: string) => api.get("/planner/gaps", { params: { date } }),
};
