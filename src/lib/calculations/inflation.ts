/**
 * Inflation adjustment utilities.
 * All formulas use exact mathematical computation.
 */

/**
 * Adjusts a nominal value for inflation over a given number of months.
 * @param value - The nominal value to adjust
 * @param annualInflationRate - Annual inflation rate as percentage (e.g., 5 for 5%)
 * @param months - Number of months to compound
 * @returns The inflation-adjusted value
 */
export function adjustForInflation(
  value: number,
  annualInflationRate: number,
  months: number
): number {
  const monthlyRate = annualInflationRate / 100 / 12;
  return value * Math.pow(1 + monthlyRate, months);
}

/**
 * Calculates the real (inflation-adjusted) return rate.
 * @param nominalReturn - Nominal annual return as percentage
 * @param inflationRate - Annual inflation rate as percentage
 * @returns Real annual return as percentage
 */
export function calculateRealReturn(
  nominalReturn: number,
  inflationRate: number
): number {
  const nominal = nominalReturn / 100;
  const inflation = inflationRate / 100;
  return ((1 + nominal) / (1 + inflation) - 1) * 100;
}

/**
 * Calculates the purchasing power of a future value in today's terms.
 * @param futureValue - The future value
 * @param annualInflationRate - Annual inflation rate as percentage
 * @param years - Number of years
 * @returns The present value (purchasing power)
 */
export function purchasingPower(
  futureValue: number,
  annualInflationRate: number,
  years: number
): number {
  return futureValue / Math.pow(1 + annualInflationRate / 100, years);
}

/**
 * Calculates future monthly expense adjusted for inflation from first year.
 * @param baseAnnualExpense - First year annual expense
 * @param annualInflationRate - Annual inflation rate as percentage
 * @param month - The month number (0-indexed)
 * @returns The inflation-adjusted annual expense for that month's year
 */
export function inflationAdjustedExpense(
  baseAnnualExpense: number,
  annualInflationRate: number,
  month: number
): number {
  const years = month / 12;
  return baseAnnualExpense * Math.pow(1 + annualInflationRate / 100, years);
}
