import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts a string to a number
 * @param value - The string value to convert
 * @param fallback - Optional fallback value if conversion fails (default: 0)
 * @returns The converted number or fallback value
 */
export function stringToNumber(value: string, fallback: number = 0): number {
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Safely converts a string to an integer
 * @param value - The string value to convert
 * @param fallback - Optional fallback value if conversion fails (default: 0)
 * @returns The converted integer or fallback value
 */
export function stringToInt(value: string, fallback: number = 0): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Strictly converts a string to a number, throws error if invalid
 * @param value - The string value to convert
 * @param fieldName - Optional field name for error message
 * @returns The converted number
 * @throws Error if the string cannot be converted to a valid number
 */
export function parseStrictNumber(
  value: string,
  fieldName: string = "value"
): number {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} cannot be empty`);
  }

  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Invalid ${fieldName}: "${value}" is not a valid number`);
  }

  return parsed;
}

/**
 * Extracts the whole number part from IDs that may contain decimal suffixes
 * Example: "123.45" -> "123"
 */
export function extractWholeNumberFromId(id: string): string {
  return id.split(".")[0]
}

/**
 * Extract the ISO control code from a combined value like "Framework:CODE"
 * Example: "ISO27001:A.5.1" -> "A.5.1"
 */
export function extractIsoControlCode(input: string): string {
  if (!input) return ""
  const s = input.trim()
  const i = s.indexOf(":")
  return i >= 0 ? s.slice(i + 1).trim() : s
}
