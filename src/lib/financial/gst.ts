export interface GSTResult {
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  inclusiveAmount: number;
  exclusiveAmount: number;
  taxAmount: number;
}

export function calculateGST(
  amount: number,
  gstRatePercent: number,
  isInterstate: boolean = false
): GSTResult {
  const taxAmount = amount * (gstRatePercent / 100);

  if (isInterstate) {
    return {
      cgst: 0,
      sgst: 0,
      igst: taxAmount,
      totalGST: taxAmount,
      inclusiveAmount: amount + taxAmount,
      exclusiveAmount: amount,
      taxAmount,
    };
  }

  const halfTax = taxAmount / 2;
  return {
    cgst: halfTax,
    sgst: halfTax,
    igst: 0,
    totalGST: taxAmount,
    inclusiveAmount: amount + taxAmount,
    exclusiveAmount: amount,
    taxAmount,
  };
}

export function gstInclusiveToExclusive(
  inclusiveAmount: number,
  gstRatePercent: number
): { exclusiveAmount: number; gstAmount: number } {
  const exclusiveAmount = inclusiveAmount / (1 + gstRatePercent / 100);
  return { exclusiveAmount, gstAmount: inclusiveAmount - exclusiveAmount };
}

export function gstExclusiveToInclusive(
  exclusiveAmount: number,
  gstRatePercent: number
): { inclusiveAmount: number; gstAmount: number } {
  const gstAmount = exclusiveAmount * (gstRatePercent / 100);
  return { inclusiveAmount: exclusiveAmount + gstAmount, gstAmount };
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number,
  additionalDiscountPercent: number = 0
): {
  discountedPrice: number;
  totalDiscount: number;
  totalDiscountPercent: number;
  savings: number;
} {
  let price = originalPrice * (1 - discountPercent / 100);
  price = price * (1 - additionalDiscountPercent / 100);
  const totalDiscount = originalPrice - price;
  return {
    discountedPrice: price,
    totalDiscount,
    totalDiscountPercent: (totalDiscount / originalPrice) * 100,
    savings: totalDiscount,
  };
}

export function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number
): {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginPercent: number;
} {
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  return {
    breakEvenUnits,
    breakEvenRevenue: breakEvenUnits * sellingPricePerUnit,
    contributionMargin,
    contributionMarginPercent: (contributionMargin / sellingPricePerUnit) * 100,
  };
}

export function calculateProfitMargin(
  revenue: number,
  costOfGoodsSold: number,
  operatingExpenses: number = 0
): {
  grossProfit: number;
  grossMargin: number;
  operatingProfit: number;
  operatingMargin: number;
  netProfit: number;
} {
  const grossProfit = revenue - costOfGoodsSold;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const operatingProfit = grossProfit - operatingExpenses;
  const operatingMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;

  return {
    grossProfit,
    grossMargin,
    operatingProfit,
    operatingMargin,
    netProfit: operatingProfit,
  };
}
