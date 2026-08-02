import type { SigningType } from "./user";

export type ImportType = "EMAIL" | "SCREENSHOT";

export type ImportStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETE"
  | "FAILED"
  | "DUPLICATE"
  | "CONFIRMED"
  | "DECLINED";

export interface JobImport {
  id: string;
  user_id: string;
  import_type: ImportType;
  resend_message_id: string | null;
  resend_email_id: string | null;
  from_address: string | null;
  recipient_address: string | null;
  subject: string | null;
  raw_text: string | null;
  raw_html: string | null;
  file_key: string | null;
  file_mimetype: string | null;

  parsed_address: string | null;
  parsed_appointment_time: string | null;
  parsed_signing_type: SigningType | null;
  parsed_fee: string | null;
  parsed_platform_fee: string | null;
  parsed_client_name: string | null;
  parsed_platform_name: string | null;
  parsed_notes: string | null;

  status: ImportStatus;
  error_message: string | null;
  ai_model_used: string | null;
  ai_tokens_used: number | null;

  received_at: string;
  processed_at: string | null;
  created_at: string;
}

export interface ImportConfirmOverrides {
  address?: string;
  appointment_time?: string;
  signing_type?: SigningType;
  signing_duration_mins?: number;
  scanback_duration_mins?: number;
  fee?: number;
  platform_fee?: number;
  client_name?: string;
  platform_name?: string;
}
