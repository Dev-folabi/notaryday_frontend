import api from "@/lib/api";

export const reportsApi = {
  getEarnings: (params?: { from?: string; to?: string; groupBy?: string }) =>
    api.get("/reports/earnings", { params }),

  getMileage: (year: number) =>
    api.get("/reports/mileage", { params: { year } }),

  getJournal: (params?: { from?: string; to?: string }) =>
    api.get("/reports/journal", { params }),

  createJournalEntry: (data: {
    entry_date: string;
    act_type: string;
    signer_name: string;
    signer_id_type?: string;
    signer_id_number?: string;
    document_type?: string;
    address?: string;
    fee_charged?: number;
    notes?: string;
    job_id?: string;
  }) => api.post("/reports/journal", data),
};
