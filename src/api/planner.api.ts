import api from "@/lib/api";

export const plannerApi = {
  today: (date: string) => api.get("/planner/today", { params: { date } }),
  optimise: (date: string) => api.post("/planner/optimise", { date }),
  gaps: (date: string) => api.get("/planner/gaps", { params: { date } }),
};
