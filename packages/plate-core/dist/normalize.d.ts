/**
 * Normalize a license plate string using deterministic, locale-agnostic rules:
 * - Trim whitespace
 * - Convert to uppercase
 * - Remove hyphens and spaces
 * - Apply Unicode NFKD and drop diacritical marks
 */
export declare function normalizePlate(raw: string): string;
/** Normalize VIN: uppercase, trim, strip disallowed chars, fixed length 17 if valid */
export declare function normalizeVin(raw: string): string;
