import type { SigningType } from "./user";

export type JobStatus =
  | "PENDING"
  | "PENDING_REVIEW"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "SCANNING"
  | "COMPLETE"
  | "CANCELLED"
  | "DECLINED";

export type JobSource =
  | "MANUAL"
  | "EMAIL_IMPORT"
  | "SCREENSHOT"
  | "BOOKING_PAGE"
  | "CSV";

export interface Job {
  id: string;
  user_id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  appointment_time: string;
  signing_duration_mins: number;
  scanback_duration_mins: number;
  signing_ends_at: string | null;
  scanback_ends_at: string | null;
  signing_type: SigningType;
  status: JobStatus;
  source: JobSource;
  fee: string;
  platform_fee: string;
  mileage_miles: string | null;
  mileage_cost: string | null;
  net_earnings: string | null;
  effective_hourly: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  platform_name: string | null;
  signer_count: number;
  booking_id: string | null;
  confirmed_at: string | null;
  started_at: string | null;
  scanning_started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  route_sequence: number | null;
  drive_from_prev_mins: number | null;
  drive_from_prev_miles: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobListItem extends Job {
  // Derived display fields
  net_earnings_num: number;
  effective_hourly_num: number;
  mileage_cost_num: number;
}

export interface CreateJobInput {
  address: string;
  lat?: number;
  lng?: number;
  appointment_time: string;
  signing_type: SigningType;
  signing_duration_mins?: number;
  scanback_duration_mins?: number;
  fee: number;
  platform_fee?: number;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  platform_name?: string;
  signer_count?: number;
  notes?: string;
}
