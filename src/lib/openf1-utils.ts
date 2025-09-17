import { coerceBoolean, coerceNumber, coerceString } from "./openf1";

export function getFirstDefined<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback;
}

export function pickNumber(entry: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const result = coerceNumber(entry[key]);
    if (result !== null) {
      return result;
    }
  }
  return null;
}

export function pickString(entry: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const result = coerceString(entry[key]);
    if (result) {
      return result;
    }
  }
  return null;
}

export function pickBoolean(entry: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const result = coerceBoolean(entry[key]);
    if (result !== null) {
      return result;
    }
  }
  return null;
}

export function toSecondsString(value: number | null): string | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }
  return value.toFixed(3);
}
