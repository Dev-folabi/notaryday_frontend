import { Job } from "./job";
import { User } from "./user";

export enum BookingStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
  CANCELLED_BY_CLIENT = "CANCELLED_BY_CLIENT",
}

export interface Booking {
  id: string;
  notary_id: string;
  notary?: User;
  client_name: string;
  client_email: string;
  client_phone?: string;
  address: string;
  lat?: number;
  lng?: number;
  service_type: string;
  requested_time: string;
  document_type?: string;
  notes?: string;
  base_fee: number;
  travel_fee_estimate?: number;
  status: BookingStatus;
  declined_reason?: string;
  alternative_times?: string[];
  job?: Job;
  submitted_at: string;
  reviewed_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}
