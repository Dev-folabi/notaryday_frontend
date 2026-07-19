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
  verdict: "TAKE_IT" | "RISKY" | "DECLINE";
  reason: string;
  drive_distance_miles: number;
  drive_time_mins: number;
  mileage_cost: number;
  net_earnings: number;
  effective_hourly: number;
  total_job_mins: number;
  can_make_it: boolean;
  scanback_conflict: boolean;
  scanback_conflict_detail?: string;
  gap_before?: number | null;
  gap_after?: number | null;
  prev_job?: {
    type: string;
    time: string;
    duration: number;
  } | null;
  next_job?: {
    type: string;
    time: string;
  } | null;
}
