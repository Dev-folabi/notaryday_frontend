/**
 * Sanitize free-text user input before it reaches the backend.
 * Strips HTML tags, control characters, collapses whitespace and caps length.
 */
export function sanitizeText(value: string, maxLength = 500): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize an optional string; returns undefined for empty/whitespace-only input.
 */
export function sanitizeOptional(
  value: string | undefined | null,
  maxLength = 500,
): string | undefined {
  if (!value) return undefined;
  const cleaned = sanitizeText(value, maxLength);
  return cleaned === "" ? undefined : cleaned;
}
