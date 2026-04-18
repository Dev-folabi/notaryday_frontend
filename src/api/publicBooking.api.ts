import api from "@/lib/api";

export const bookingPageApi = {
  getSlots: (username: string, date: string) =>
    api.get(`/book/${username}/slots`, { params: { date } }),

  requestBooking: (
    username: string,
    data: {
      client_name: string;
      client_email: string;
      client_phone?: string;
      address: string;
      service_type: string;
      requested_time: string;
      document_type?: string;
      notes?: string;
    },
  ) => api.post(`/book/${username}/request`, data),
};
