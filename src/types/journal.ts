export interface JournalEntry {
  id: string;
  entry_date: string;
  act_type: string;
  signing_type: string | null;
  act_time: string | null;
  signer_name: string;
  signer_id_type: string | null;
  signer_id_number: string | null;
  document_type: string | null;
  address: string | null;
  fee_charged: number | string | null;
  notes: string | null;
  job_id: string | null;
}

export interface CreateJournalEntryInput {
  entry_date: string;
  act_type: string;
  signing_type?: string;
  act_time?: string;
  signer_name: string;
  signer_id_type?: string;
  signer_id_number?: string;
  document_type?: string;
  address?: string;
  fee_charged?: number;
  job_id?: string;
  notes?: string;
}
