import { emi } from "./math";
export { emi };

export interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterest: number;
  totalPrincipal: number;
}

export interface LoanInputs {
  principal: number;
  annualRatePercent: number;
  tenureMonths: number;
}

export function amortizationSchedule(inputs: LoanInputs): AmortizationRow[] {
  const { principal, annualRatePercent, tenureMonths } = inputs;
  const monthlyEmi = emi(principal, annualRatePercent, tenureMonths);
  const r = annualRatePercent / 100 / 12;
  const rows: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    const interest = balance * r;
    const principalPart = monthlyEmi - interest;
    balance -= principalPart;
    totalInterest += interest;
    totalPrincipal += principalPart;

    rows.push({
      month: m,
      emi: monthlyEmi,
      principal: principalPart,
      interest,
      balance: Math.max(0, balance),
      totalInterest,
      totalPrincipal,
    });
  }

  return rows;
}

export function totalLoanCost(inputs: LoanInputs): {
  totalPayment: number;
  totalInterest: number;
  interestPercentage: number;
  monthlyEmi: number;
} {
  const monthlyEmi = emi(inputs.principal, inputs.annualRatePercent, inputs.tenureMonths);
  const totalPayment = monthlyEmi * inputs.tenureMonths;
  const totalInterest = totalPayment - inputs.principal;
  return {
    totalPayment,
    totalInterest,
    interestPercentage: (totalInterest / inputs.principal) * 100,
    monthlyEmi,
  };
}

export function loanEligibility(
  monthlyIncome: number,
  existingEmis: number,
  annualRatePercent: number,
  tenureMonths: number,
  foirPercent: number = 50
): number {
  const maxEmi = (monthlyIncome * foirPercent) / 100 - existingEmis;
  if (maxEmi <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return maxEmi * tenureMonths;
  return (maxEmi * (Math.pow(1 + r, tenureMonths) - 1)) / (r * Math.pow(1 + r, tenureMonths));
}

export function prepaymentImpact(
  inputs: LoanInputs,
  prepaymentAmount: number,
  prepayAtMonth: number,
  reduceTenure: boolean = true
): {
  originalCost: { totalPayment: number; totalInterest: number; tenureMonths: number };
  newCost: { totalPayment: number; totalInterest: number; tenureMonths: number };
  savings: { interestSaved: number; tenureReduction: number };
  originalSchedule: AmortizationRow[];
  newSchedule: AmortizationRow[];
} {
  const originalSchedule = amortizationSchedule(inputs);
  const originalCostResult = totalLoanCost(inputs);
  const originalCost = { totalPayment: originalCostResult.totalPayment, totalInterest: originalCostResult.totalInterest, tenureMonths: inputs.tenureMonths };

  // Recalculate after prepayment
  const r = inputs.annualRatePercent / 100 / 12;
  let balance = inputs.principal;
  let currentEmi = emi(inputs.principal, inputs.annualRatePercent, inputs.tenureMonths);
  let newTenure = inputs.tenureMonths;

  // Simulate up to prepayment month
  for (let m = 1; m <= prepayAtMonth && m <= inputs.tenureMonths; m++) {
    const interest = balance * r;
    const principalPart = currentEmi - interest;
    balance -= principalPart;
    if (m === prepayAtMonth) {
      balance -= prepaymentAmount;
      balance = Math.max(0, balance);
    }
  }

  if (balance <= 0) {
    const newSchedule = originalSchedule.slice(0, prepayAtMonth);
    return {
      originalCost,
      newCost: { totalPayment: currentEmi * prepayAtMonth + prepaymentAmount, totalInterest: currentEmi * prepayAtMonth + prepaymentAmount - inputs.principal, tenureMonths: prepayAtMonth },
      savings: { interestSaved: originalCost.totalInterest - (currentEmi * prepayAtMonth + prepaymentAmount - inputs.principal), tenureReduction: inputs.tenureMonths - prepayAtMonth },
      originalSchedule,
      newSchedule,
    };
  }

  if (reduceTenure) {
    // Keep same EMI, reduce tenure
    const newMonths = Math.ceil(
      Math.log(currentEmi / (currentEmi - balance * r)) / Math.log(1 + r)
    );
    newTenure = prepayAtMonth + newMonths;
  } else {
    // Keep same tenure, reduce EMI
    const remainingMonths = inputs.tenureMonths - prepayAtMonth;
    const newEmi = (balance * r * Math.pow(1 + r, remainingMonths)) / (Math.pow(1 + r, remainingMonths) - 1);
    currentEmi = newEmi;
    newTenure = inputs.tenureMonths;
  }

  // Build new schedule
  const newSchedule: AmortizationRow[] = [];
  let newBalance = inputs.principal;
  let newTotalInterest = 0;
  let newTotalPrincipal = 0;

  for (let m = 1; m <= newTenure; m++) {
    let b: number, em: number;
    if (m <= prepayAtMonth) {
      b = newBalance;
      em = currentEmi;
      const interest = b * r;
      const principalPart = em - interest;
      newBalance -= principalPart;
      if (m === prepayAtMonth) {
        newBalance -= prepaymentAmount;
        newBalance = Math.max(0, newBalance);
      }
      newTotalInterest += interest;
      newTotalPrincipal += principalPart;
      newSchedule.push({ month: m, emi: em, principal: principalPart, interest, balance: Math.max(0, newBalance), totalInterest: newTotalInterest, totalPrincipal: newTotalPrincipal });
    } else {
      b = newBalance;
      const interest = b * r;
      const principalPart = currentEmi - interest;
      newBalance -= principalPart;
      newTotalInterest += interest;
      newTotalPrincipal += principalPart;
      newSchedule.push({ month: m, emi: currentEmi, principal: principalPart, interest, balance: Math.max(0, newBalance), totalInterest: newTotalInterest, totalPrincipal: newTotalPrincipal });
    }
  }

  const newTotalPayment = currentEmi * newTenure + prepaymentAmount;
  const newTotalInterestCost = newTotalPayment - inputs.principal;

  return {
    originalCost,
    newCost: { totalPayment: newTotalPayment, totalInterest: newTotalInterestCost, tenureMonths: newTenure },
    savings: {
      interestSaved: originalCost.totalInterest - newTotalInterestCost,
      tenureReduction: inputs.tenureMonths - newTenure,
    },
    originalSchedule,
    newSchedule,
  };
}
