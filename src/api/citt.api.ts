import api from "@/lib/api";

export const cittApi = {
  check: (data: {
    address: string;
    appointment_time: string;
    signing_type: string;
    fee: number;
    platform_fee?: number;
    signing_duration_mins?: number;
    scanback_duration_mins?: number;
  }) => api.post("/citt/check", data),
};
