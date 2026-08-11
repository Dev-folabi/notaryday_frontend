export interface EarningsSummary {
  gross?: number;
  net?: number;
  mileageCost?: number;
  mileage?: number;
  platformFees?: number;
  platform?: number;
  effectiveHourly?: number;
  totalMiles?: number;
  totalHours?: number;
  jobCount?: number;
  signings?: number;
}

export interface PeriodBar {
  period?: string;
  label?: string;
  net?: number;
  gross?: number;
  jobs?: number;
  miles?: number;
}

export interface TypeBreakdown {
  signing_type?: string;
  type?: string;
  count?: number;
  gross?: number;
  total?: number;
  net?: number;
  miles?: number;
  avg?: number;
}

export interface EarningsReport {
  summary?: EarningsSummary;
  periods?: PeriodBar[];
  byType?: TypeBreakdown[];
  bySigningType?: TypeBreakdown[];
  yoy?: {
    gross?: number;
    net?: number;
    grossPct?: number | null;
    netPct?: number | null;
  };
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
  autoMiles?: number;
  manualMiles?: number;
  irsRate?: number;
}

export interface MileageDetail {
  totalMiles?: number;
  totalDeduction?: number;
  irsRate?: number;
  autoMiles?: number;
  manualMiles?: number;
  autoPct?: number;
  manualPct?: number;
}

export interface TaxReport {
  year?: number;
  from?: string;
  to?: string;
  income?: { gross?: number; net?: number; signings?: number };
  byType?: TypeBreakdown[];
  bySigningType?: TypeBreakdown[];
  mileage?: MileageDetail;
  expenses?: { total?: number; byCategory?: Record<string, number> };
  notarialActs?: number;
}
