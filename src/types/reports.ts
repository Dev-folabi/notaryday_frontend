export interface EarningsSummary {
  gross?: number;
  net?: number;
  mileageCost?: number;
  mileage?: number;
  platformFees?: number;
  platform?: number;
  effectiveHourly?: number;
  signings?: number;
}

export interface PeriodBar {
  period?: string;
  label?: string;
  net?: number;
  gross?: number;
  jobs?: number;
}

export interface TypeBreakdown {
  signing_type?: string;
  type?: string;
  count?: number;
  gross?: number;
  total?: number;
}

export interface EarningsReport {
  summary?: EarningsSummary;
  periods?: PeriodBar[];
  byType?: TypeBreakdown[];
  bySigningType?: TypeBreakdown[];
}

export interface MileageEntry {
  id?: string;
  date?: string;
  job?: string;
  address?: string;
  miles?: number;
  deduction?: number;
  cost?: number;
  method?: string;
}

export interface MileageReport {
  entries?: MileageEntry[];
  totalMiles?: number;
  totalDeduction?: number;
  irsRate?: number;
}

export interface TaxReport {
  income?: { gross?: number; net?: number };
  mileage?: { totalMiles?: number; totalDeduction?: number; irsRate?: number };
  expenses?: { total?: number; byCategory?: Record<string, number> };
}
