import type { SigningType } from "@/types/user";

export interface BookingServiceInput {
  signing_type: SigningType;
  name: string;
  duration_mins: number;
  scanback_mins: number;
  base_fee: number;
  description?: string;
}

interface ServiceMeta {
  name: string;
  duration_mins: number;
  scanback_mins: number;
  base_fee: number;
}

/**
 * Canonical per-signing-type defaults used by the booking page setup,
 * onboarding, and the public booking page. Keys mirror the SigningType enum.
 */
export const BOOKING_SERVICE_DEFAULTS: Record<SigningType, ServiceMeta> = {
  GENERAL: { name: "General Notary", duration_mins: 30, scanback_mins: 0, base_fee: 75 },
  LOAN_REFI: { name: "Loan Refi", duration_mins: 60, scanback_mins: 20, base_fee: 75 },
  HYBRID: { name: "Hybrid Signing", duration_mins: 75, scanback_mins: 18, base_fee: 75 },
  PURCHASE_CLOSING: { name: "Purchase Closing", duration_mins: 90, scanback_mins: 28, base_fee: 75 },
  FIELD_INSPECTION: { name: "Field Inspection", duration_mins: 45, scanback_mins: 0, base_fee: 75 },
  APOSTILLE: { name: "Apostille", duration_mins: 20, scanback_mins: 0, base_fee: 75 },
};

export const BOOKING_SERVICE_LIST: BookingServiceInput[] = (
  Object.keys(BOOKING_SERVICE_DEFAULTS) as SigningType[]
).map((signing_type) => ({
  signing_type,
  ...BOOKING_SERVICE_DEFAULTS[signing_type],
}));

const SERVICE_ALIASES: Record<string, SigningType> = {
  general: "GENERAL",
  "general notary": "GENERAL",
  "general notarisation": "GENERAL",
  "general notarization": "GENERAL",
  "loan refi": "LOAN_REFI",
  "loan refinance": "LOAN_REFI",
  hybrid: "HYBRID",
  "hybrid signing": "HYBRID",
  "purchase closing": "PURCHASE_CLOSING",
  "field inspection": "FIELD_INSPECTION",
  apostille: "APOSTILLE",
};

/** Resolve a display name (or raw enum) to a SigningType, if known. */
export function signingTypeFromName(name?: string | null): SigningType | undefined {
  if (!name) return undefined;
  const normalized = name
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized in SERVICE_ALIASES) return SERVICE_ALIASES[normalized];
  const asEnum = normalized.replace(/ /g, "_").toUpperCase();
  return asEnum in BOOKING_SERVICE_DEFAULTS ? (asEnum as SigningType) : undefined;
}

/** Build canonical service objects from the selected display names. */
export function buildBookingPageServices(names: string[]): BookingServiceInput[] {
  const seen = new Set<string>();
  const out: BookingServiceInput[] = [];
  for (const name of names) {
    const st = signingTypeFromName(name);
    if (!st || seen.has(st)) continue;
    seen.add(st);
    out.push({ signing_type: st, ...BOOKING_SERVICE_DEFAULTS[st] });
  }
  return out;
}

/** Normalize arbitrary backend service JSON into the canonical shape. */
export function normalizeBookingServices(raw: unknown): BookingServiceInput[] {
  if (!Array.isArray(raw)) return [];
  const out: BookingServiceInput[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const st = signingTypeFromName(item);
      if (st) out.push({ signing_type: st, ...BOOKING_SERVICE_DEFAULTS[st] });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const it = item as Record<string, unknown>;
    const st =
      (typeof it.signing_type === "string" ? (it.signing_type as SigningType) : undefined) ??
      (typeof it.name === "string" ? signingTypeFromName(it.name) : undefined);
    if (!st || !(st in BOOKING_SERVICE_DEFAULTS)) continue;
    const defaults = BOOKING_SERVICE_DEFAULTS[st];
    out.push({
      signing_type: st,
      name: (typeof it.name === "string" ? it.name : undefined) ?? defaults.name,
      duration_mins: toNumber(it.duration_mins, defaults.duration_mins),
      scanback_mins: toNumber(it.scanback_mins, defaults.scanback_mins),
      base_fee: toNumber(it.base_fee, defaults.base_fee),
      description: typeof it.description === "string" ? it.description : undefined,
    });
  }
  return out;
}

function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Convert a 12h display time ("8:00 AM") to 24h storage ("08:00"). */
export function to24h(time12: string): string {
  const m = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return time12.trim();
  let h = Number(m[1]);
  const min = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

/** Convert a 24h storage time ("08:00") to 12h display ("8:00 AM"). */
export function from24h(time24: string): string {
  const m = time24.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return time24.trim();
  let h = Number(m[1]);
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}
