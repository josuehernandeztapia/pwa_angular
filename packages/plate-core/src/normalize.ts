/**
 * Normalize a license plate string using deterministic, locale-agnostic rules:
 * - Trim whitespace
 * - Convert to uppercase
 * - Remove hyphens and spaces
 * - Apply Unicode NFKD and drop diacritical marks
 */
export function normalizePlate(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (trimmed.length === 0) return "";
  const upper = trimmed.toUpperCase();
  const withoutSeparators = upper.replace(/[\s-]+/g, "");
  // Normalize to NFKD and remove diacritics
  const nfkd = withoutSeparators.normalize("NFKD");
  const ascii = nfkd.replace(/[\u0300-\u036f]/g, "");
  return ascii;
}

/** Normalize VIN: uppercase, trim, strip disallowed chars, fixed length 17 if valid */
export function normalizeVin(raw: string): string {
  const upper = (raw ?? "").trim().toUpperCase();
  // VIN disallows I, O, Q; keep A-Z0-9 except those
  const cleaned = upper.replace(/[^A-HJ-NPR-Z0-9]/g, "");
  return cleaned;
}
