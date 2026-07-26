export interface TaxResult {
  regime: "old" | "new";
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  taxAmount: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  slabs: { slab: string; rate: number; tax: number }[];
}

const NEW_REGIME_SLABS_2024_25 = [
  { from: 0, to: 300000, rate: 0 },
  { from: 300000, to: 700000, rate: 5 },
  { from: 700000, to: 1000000, rate: 10 },
  { from: 1000000, to: 1200000, rate: 15 },
  { from: 1200000, to: 1500000, rate: 20 },
  { from: 1500000, to: Infinity, rate: 30 },
];

const OLD_REGIME_SLABS_2024_25 = [
  { from: 0, to: 300000, rate: 0 },
  { from: 300000, to: 600000, rate: 5 },
  { from: 600000, to: 900000, rate: 10 },
  { from: 900000, to: 1200000, rate: 15 },
  { from: 1200000, to: 1500000, rate: 20 },
  { from: 1500000, to: Infinity, rate: 30 },
];

function calculateTaxFromSlabs(
  taxableIncome: number,
  slabs: { from: number; to: number; rate: number }[]
): { tax: number; breakdown: { slab: string; rate: number; tax: number }[] } {
  let tax = 0;
  const breakdown: { slab: string; rate: number; tax: number }[] = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.from) break;
    const applicable = Math.min(taxableIncome, slab.to) - slab.from;
    const slabTax = applicable * (slab.rate / 100);
    tax += slabTax;
    breakdown.push({
      slab: `₹${(slab.from / 100000).toFixed(1)}L - ₹${slab.to === Infinity ? "∞" : (slab.to / 100000).toFixed(1) + "L"}`,
      rate: slab.rate,
      tax: slabTax,
    });
  }

  return { tax, breakdown };
}

export function calculateIncomeTax(
  grossIncome: number,
  deductions: number = 0,
  regime: "old" | "new" = "new"
): TaxResult {
  const standardDeduction = regime === "new" ? 75000 : 50000;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - (regime === "old" ? deductions : 0));

  const slabs = regime === "new" ? NEW_REGIME_SLABS_2024_25 : OLD_REGIME_SLABS_2024_25;
  const { tax, breakdown } = calculateTaxFromSlabs(taxableIncome, slabs);

  // Section 87A Rebate (New Regime: income ≤ ₹7L → rebate up to ₹25,000)
  let rebate87A = 0;
  if (regime === "new" && taxableIncome <= 700000) {
    rebate87A = Math.min(tax, 25000);
  }
  const taxAfterRebate = Math.max(0, tax - rebate87A);

  // Surcharge (different rules for old vs new regime)
  let surcharge = 0;
  if (regime === "new") {
    // New Regime: 0% ≤₹50L, 10% ₹50L-1Cr, 15% >₹1Cr
    if (taxableIncome > 10000000) surcharge = taxAfterRebate * 0.15;
    else if (taxableIncome > 5000000) surcharge = taxAfterRebate * 0.10;
  } else {
    // Old Regime: 0% ≤₹50L, 10% ₹50L-1Cr, 15% ₹1Cr-2Cr, 25% ₹2Cr-5Cr, 37% >₹5Cr
    if (taxableIncome > 50000000) surcharge = taxAfterRebate * 0.37;
    else if (taxableIncome > 20000000) surcharge = taxAfterRebate * 0.25;
    else if (taxableIncome > 10000000) surcharge = taxAfterRebate * 0.15;
    else if (taxableIncome > 5000000) surcharge = taxAfterRebate * 0.10;
  }

  const cess = (taxAfterRebate + surcharge) * 0.04;
  const totalTax = taxAfterRebate + surcharge + cess;

  return {
    regime,
    grossIncome,
    deductions,
    taxableIncome,
    taxAmount: taxAfterRebate,
    cess,
    totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    slabs: breakdown,
  };
}

export function compareRegimes(
  grossIncome: number,
  deductions: number = 0
): { old: TaxResult; new: TaxResult; savings: number; betterRegime: string } {
  const old = calculateIncomeTax(grossIncome, deductions, "old");
  const newRegime = calculateIncomeTax(grossIncome, deductions, "new");
  const savings = old.totalTax - newRegime.totalTax;

  return {
    old,
    new: newRegime,
    savings: Math.abs(savings),
    betterRegime: savings > 0 ? "New Regime" : savings < 0 ? "Old Regime" : "Same",
  };
}

export interface HRAInputs {
  basicSalary: number;
  da: number;
  hraReceived: number;
  rentPaid: number;
  isMetro: boolean;
}

export interface HRAResult {
  exemption: number;
  taxableHRA: number;
  hraReceived: number;
  actualExemption: number;
  calculationBasis: {
    actualHRA: number;
    rentMinusTenPct: number;
    fiftyPercentOfBasic: number;
    fortyPercentOfBasic: number;
  };
}

export function calculateHRA(inputs: HRAInputs): HRAResult {
  const { basicSalary, da, hraReceived, rentPaid, isMetro } = inputs;
  const basicPlusDA = basicSalary + da;
  const rentMinusTenPct = rentPaid - basicPlusDA * 0.1;
  const percentOfBasic = isMetro ? 0.5 : 0.4;
  const percentBasis = basicPlusDA * percentOfBasic;

  const exemption = Math.min(hraReceived, rentMinusTenPct, percentBasis);

  return {
    exemption: Math.max(0, exemption),
    taxableHRA: Math.max(0, hraReceived - Math.max(0, exemption)),
    hraReceived,
    actualExemption: Math.max(0, exemption),
    calculationBasis: {
      actualHRA: hraReceived,
      rentMinusTenPct: Math.max(0, rentMinusTenPct),
      fiftyPercentOfBasic: basicPlusDA * 0.5,
      fortyPercentOfBasic: basicPlusDA * 0.4,
    },
  };
}

export function calculateGratuity(
  lastDrawnSalary: number,
  yearsOfService: number
): { gratuity: number; isExempt: boolean; taxableAmount: number } {
  const lastSalary = lastDrawnSalary; // Basic + DA
  const gratuity = (lastSalary * 15 * yearsOfService) / 26;
  const isExempt = gratuity <= 2000000;
  const taxableAmount = isExempt ? 0 : gratuity - 2000000;

  return { gratuity, isExempt, taxableAmount };
}

export function calculateLeaveEncashment(
  lastDrawnSalary: number,
  unusedLeaveDays: number
): { amount: number; isExempt: boolean; taxableAmount: number } {
  const amount = (lastDrawnSalary / 30) * unusedLeaveDays;
  const isExempt = amount <= 2500000;
  const taxableAmount = isExempt ? 0 : amount - 2500000;

  return { amount, isExempt, taxableAmount };
}
