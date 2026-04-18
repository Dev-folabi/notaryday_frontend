export type PlanTier = "FREE" | "PRO" | "PRO_ANNUAL" | "TEAM";

export type NavApp = "GOOGLE_MAPS" | "APPLE_MAPS" | "WAZE";

export interface UserSettings {
  id: string;
  user_id: string;
  home_base_address: string | null;
  home_base_lat: number | null;
  home_base_lng: number | null;
  irs_rate_per_mile: number;
  vehicle_type: string | null;
  min_acceptable_net: number;
  booking_page_enabled: boolean;
  booking_page_bio: string | null;
  service_area_miles: number;
  booking_buffer_mins: number;
  booking_page_active_hours: Record<
    string,
    { start: string; end: string }
  > | null;
  booking_page_services: BookingPageService[] | null;
  payment_info: PaymentInfo | null;
  invoice_notes: string | null;
  invoice_due_days: number;
  reminders_enabled: boolean;
  reminder_lead_mins: number;
  client_eta_enabled: boolean;
  preferred_nav_app: NavApp;
  ics_feed_token: string;
}

export interface BookingPageService {
  name: string;
  duration_mins: number;
  scanback_mins: number;
  base_fee: number;
  description: string;
}

export interface PaymentInfo {
  zelle?: string;
  venmo?: string;
  paypal?: string;
  bank_name?: string;
  account_last4?: string;
  routing_last4?: string;
  other?: string;
}

export interface SigningTypeDefault {
  id: string;
  user_id: string;
  signing_type: SigningType;
  signing_duration_mins: number;
  scanback_duration_mins: number;
}

export type SigningType =
  | "GENERAL"
  | "LOAN_REFI"
  | "HYBRID"
  | "PURCHASE_CLOSING"
  | "FIELD_INSPECTION"
  | "APOSTILLE";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  plan: PlanTier;
  plan_expires_at: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  nna_certified: boolean;
  bio: string | null;
  credentials: string[];
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
  settings?: UserSettings;
  signing_defaults?: SigningTypeDefault[];
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  plan: PlanTier;
}
