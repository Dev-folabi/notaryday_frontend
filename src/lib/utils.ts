import { clsx, type ClassValue } from "clsx";

/**
 * Merge class names with clsx — drop-in for classnames
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a number as USD currency
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

/**
 * Format a date string to a readable date
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Format a date + time string
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format time only (e.g. "2:30 PM")
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format duration in minutes to "X hr Y min" or "Y min"
 */
export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/**
 * Format distance in miles
 */
export function formatMiles(miles: number | string): string {
  const num = typeof miles === "string" ? parseFloat(miles) : miles;
  if (isNaN(num)) return "0 mi";
  return `${num.toFixed(1)} mi`;
}

/**
 * Format ISO date string to YYYY-MM-DD for <input type="date">
 */
export function toDateInputValue(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Format ISO date string to HH:MM for <input type="time">
 */
export function toTimeInputValue(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toTimeString().slice(0, 5);
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function today(): string {
  return toDateInputValue(new Date());
}

/**
 * Get initials from a full name (max 2 chars)
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate address for display (remove extra whitespace)
 */
export function truncateAddress(address: string, maxLen = 40): string {
  const cleaned = address.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 1) + "…";
}

/**
 * Open navigation deep link
 */
export function openNavigation(
  address: string,
  app: "google" | "apple" | "waze"
): void {
  const encoded = encodeURIComponent(address);
  const urls: Record<string, string> = {
    google: `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`,
    apple: `maps://maps.apple.com/?daddr=${encoded}&dirflg=d`,
    waze: `https://waze.com/ul?q=${encoded}&navigate=yes`,
  };
  window.open(urls[app], "_blank", "noopener,noreferrer");
}

/**
 * Determine profitability color class based on net earnings
 */
export function profitabilityColor(
  netEarnings: number
): "text-teal-success" | "text-amber-warning" | "text-red-danger" {
  if (netEarnings >= 30) return "text-teal-success";
  if (netEarnings >= 10) return "text-amber-warning";
  return "text-red-danger";
}

/**
 * Sleep helper for debouncing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
