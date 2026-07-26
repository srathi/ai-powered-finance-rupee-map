/**
 * Core mathematical utilities for financial calculations.
 * All formulas are exact and deterministic.
 */

export function monthlyRate(annualRatePercent: number): number {
  return annualRatePercent / 100 / 12;
}

export function annualRate(monthlyRateDecimal: number): number {
  return monthlyRateDecimal * 12 * 100;
}

export function futureValue(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundingPerYear: number = 12
): number {
  const r = annualRatePercent / 100;
  return principal * Math.pow(1 + r / compoundingPerYear, compoundingPerYear * years);
}

export function presentValue(
  futureValue: number,
  annualRatePercent: number,
  years: number,
  compoundingPerYear: number = 12
): number {
  const r = annualRatePercent / 100;
  return futureValue / Math.pow(1 + r / compoundingPerYear, compoundingPerYear * years);
}

export function compoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundingPerYear: number = 12
): number {
  const fv = futureValue(principal, annualRatePercent, years, compoundingPerYear);
  return fv - principal;
}

export function simpleInterest(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  return principal * (annualRatePercent / 100) * years;
}

export function ruleOf72(annualRatePercent: number): number {
  return 72 / annualRatePercent;
}

export function emi(
  principal: number,
  annualRatePercent: number,
  months: number
): number {
  if (annualRatePercent === 0) return principal / months;
  const r = annualRatePercent / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function futureValueOfAnnuity(
  periodicPayment: number,
  annualRatePercent: number,
  periods: number,
  isBeginning: boolean = false
): number {
  if (annualRatePercent === 0) return periodicPayment * periods;
  const r = annualRatePercent / 100 / 12;
  const fv = periodicPayment * ((Math.pow(1 + r, periods) - 1) / r);
  return isBeginning ? fv * (1 + r) : fv;
}

export function presentValueOfAnnuity(
  periodicPayment: number,
  annualRatePercent: number,
  periods: number,
  isBeginning: boolean = false
): number {
  if (annualRatePercent === 0) return periodicPayment * periods;
  const r = annualRatePercent / 100 / 12;
  const pv = periodicPayment * ((1 - Math.pow(1 + r, -periods)) / r);
  return isBeginning ? pv * (1 + r) : pv;
}

export function inflationAdjustedValue(
  currentValue: number,
  inflationRatePercent: number,
  years: number
): number {
  return currentValue * Math.pow(1 + inflationRatePercent / 100, years);
}

export function purchasingPower(
  futureValue: number,
  inflationRatePercent: number,
  years: number
): number {
  return futureValue / Math.pow(1 + inflationRatePercent / 100, years);
}

export function realReturn(
  nominalReturnPercent: number,
  inflationPercent: number
): number {
  return ((1 + nominalReturnPercent / 100) / (1 + inflationPercent / 100) - 1) * 100;
}

export function cagr(
  beginningValue: number,
  endingValue: number,
  years: number
): number {
  if (beginningValue <= 0 || endingValue <= 0 || years <= 0) return 0;
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
}

export function absoluteReturn(
  beginningValue: number,
  endingValue: number
): number {
  if (beginningValue <= 0) return 0;
  return ((endingValue - beginningValue) / beginningValue) * 100;
}

export function annualizedReturn(
  beginningValue: number,
  endingValue: number,
  years: number
): number {
  return cagr(beginningValue, endingValue, years);
}

export function lumpsumFutureValue(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  return futureValue(principal, annualRatePercent, years, 1);
}

export function stepUpSipFutureValue(
  monthlySip: number,
  annualRatePercent: number,
  years: number,
  annualStepUpPercent: number
): number {
  const r = annualRatePercent / 100 / 12;
  const months = years * 12;
  let totalFutureValue = 0;
  let currentSip = monthlySip;

  for (let year = 0; year < years; year++) {
    for (let month = 0; month < 12; month++) {
      const monthIndex = year * 12 + month;
      const remainingMonths = months - monthIndex;
      totalFutureValue += currentSip * Math.pow(1 + r, remainingMonths);
    }
    currentSip *= 1 + annualStepUpPercent / 100;
  }

  return totalFutureValue;
}

export function calculateXirr(
  cashflows: { date: Date; amount: number }[],
  guess: number = 0.1
): number {
  if (cashflows.length < 2) return 0;

  const sorted = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const t0 = sorted[0].date.getTime();

  const npv = (rate: number) => {
    return sorted.reduce((sum, cf) => {
      const years = (cf.date.getTime() - t0) / (365.25 * 24 * 60 * 60 * 1000);
      return sum + cf.amount / Math.pow(1 + rate, years);
    }, 0);
  };

  let rate = guess;
  for (let i = 0; i < 100; i++) {
    const npvVal = npv(rate);
    if (Math.abs(npvVal) < 0.01) break;

    let derivative = 0;
    const h = rate * 0.0001 || 0.00001;
    derivative = (npv(rate + h) - npv(rate - h)) / (2 * h);

    if (Math.abs(derivative) < 1e-10) break;
    rate -= npvVal / derivative;
  }

  return rate * 100;
}

export function calculateSwp(
  corpus: number,
  monthlyWithdrawal: number,
  annualRatePercent: number,
  months: number
): { corpusPath: number[]; totalWithdrawn: number; monthsLasted: number } {
  const r = annualRatePercent / 100 / 12;
  const path: number[] = [corpus];
  let remaining = corpus;
  let totalWithdrawn = 0;
  let monthsLasted = 0;

  for (let m = 0; m < months; m++) {
    const returns = remaining * r;
    remaining += returns;
    remaining -= monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
    monthsLasted = m + 1;

    if (remaining <= 0) {
      path.push(0);
      break;
    }
    path.push(remaining);
  }

  return { corpusPath: path, totalWithdrawn, monthsLasted };
}

export function stpCalculation(
  sourceAmount: number,
  targetMonthlyTransfer: number,
  sourceReturnPercent: number,
  targetReturnPercent: number,
  months: number
): {
  sourcePath: number[];
  targetPath: number[];
  totalTransferred: number;
} {
  const sr = sourceReturnPercent / 100 / 12;
  const tr = targetReturnPercent / 100 / 12;
  const sourcePath: number[] = [sourceAmount];
  const targetPath: number[] = [0];
  let source = sourceAmount;
  let target = 0;
  let totalTransferred = 0;

  for (let m = 0; m < months; m++) {
    const sReturns = source * sr;
    source += sReturns - targetMonthlyTransfer;
    totalTransferred += targetMonthlyTransfer;

    const tReturns = target * tr;
    target += tReturns + targetMonthlyTransfer;

    sourcePath.push(Math.max(0, source));
    targetPath.push(target);
  }

  return { sourcePath, targetPath, totalTransferred };
}
