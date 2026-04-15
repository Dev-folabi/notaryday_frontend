export interface CITTCheckRequest {
  address: string;
  appointment_time: string;
  signing_type: string;
  fee: number;
  platform_fee?: number;
  signing_duration_mins?: number;
  scanback_duration_mins?: number;
}

export interface CITTCheckResponse {
  feasibility: {
    can_make_it: boolean;
    minutes_to_spare: number;
  };
  profitability: {
    net_earnings: number;
    effective_hourly_rate: number;
    mileage_cost: number;
  };
  conflict: {
    has_conflict: boolean;
    conflict_detail?: string;
  };
  verdict: "TAKE_IT" | "RISKY" | "DECLINE";
}
