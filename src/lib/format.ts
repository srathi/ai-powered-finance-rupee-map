/**
 * Formats a number as Indian Rupee currency.
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1e7) {
      return `₹${(value / 1e7).toFixed(2)} Cr`;
    }
    if (Math.abs(value) >= 1e5) {
      return `₹${(value / 1e5).toFixed(2)} L`;
    }
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a number as a percentage.
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a large number in Indian notation (lakhs/crores).
 */
export function formatIndianNumber(value: number): string {
  if (Math.abs(value) >= 1e7) {
    return `${(value / 1e7).toFixed(2)} Crore`;
  }
  if (Math.abs(value) >= 1e5) {
    return `${(value / 1e5).toFixed(2)} Lakh`;
  }
  return value.toLocaleString("en-IN");
}

/**
 * Formats months to years and months string.
 */
export function monthsToYearsMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years}y ${remainingMonths}m`;
}

/**
 * Validates that a value is within bounds.
 */
export function validateRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
