/**
 * Compound interest and growth utilities.
 */

/**
 * Calculates compound growth of a lump sum.
 * @param principal - Initial amount
 * @param annualRate - Annual rate as percentage
 * @param years - Number of years
 * @param compoundingFrequency - Times compounded per year (default 12 for monthly)
 * @returns Future value
 */
export function compoundGrowth(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: number = 12
): number {
  const rate = annualRate / 100;
  return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years);
}

/**
 * Calculates the future value of a series of monthly payments (SIP/FD).
 * @param monthlyPayment - Monthly payment amount
 * @param annualRate - Annual rate as percentage
 * @param months - Number of months
 * @returns Future value
 */
export function futureValueOfAnnuity(
  monthlyPayment: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) return monthlyPayment * months;
  const monthlyRate = annualRate / 100 / 12;
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

/**
 * Calculates the present value of a future lump sum.
 * @param futureValue - The future amount
 * @param annualRate - Discount rate as percentage
 * @param years - Number of years
 * @returns Present value
 */
export function presentValue(
  futureValue: number,
  annualRate: number,
  years: number
): number {
  if (annualRate === 0) return futureValue;
  return futureValue / Math.pow(1 + annualRate / 100, years);
}

/**
 * Calculates EMI (Equated Monthly Installment).
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate as percentage
 * @param months - Loan tenure in months
 * @returns Monthly EMI
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 100 / 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

/**
 * Calculates total interest paid over a loan tenure.
 */
export function totalInterestPaid(
  principal: number,
  annualRate: number,
  months: number
): number {
  const emi = calculateEMI(principal, annualRate, months);
  return emi * months - principal;
}
