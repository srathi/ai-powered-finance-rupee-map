export interface FDResult {
  maturityAmount: number;
  totalInterest: number;
  effectiveYield: number;
  quarterlySchedule: { quarter: number; openingBalance: number; interest: number; closingBalance: number }[];
}

export function calculateFD(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundingFrequency: number = 4
): FDResult {
  const r = annualRatePercent / 100;
  const n = compoundingFrequency;
  const t = years;
  const maturityAmount = principal * Math.pow(1 + r / n, n * t);
  const totalInterest = maturityAmount - principal;
  const effectiveYield = (Math.pow(1 + r / n, n) - 1) * 100;

  const schedule: FDResult["quarterlySchedule"] = [];
  let balance = principal;
  const quarters = n * t;

  for (let q = 1; q <= quarters; q++) {
    const interest = balance * (r / n);
    balance += interest;
    schedule.push({
      quarter: q,
      openingBalance: balance - interest,
      interest,
      closingBalance: balance,
    });
  }

  return { maturityAmount, totalInterest, effectiveYield, quarterlySchedule: schedule };
}

export interface RDResult {
  maturityAmount: number;
  totalDeposited: number;
  totalInterest: number;
  monthlySchedule: { month: number; deposit: number; interest: number; balance: number }[];
}

export function calculateRD(
  monthlyDeposit: number,
  annualRatePercent: number,
  years: number
): RDResult {
  const r = annualRatePercent / 100 / 12;
  const months = years * 12;
  const schedule: RDResult["monthlySchedule"] = [];
  let totalBalance = 0;
  let totalDeposited = 0;
  let totalInterest = 0;

  for (let m = 1; m <= months; m++) {
    const remainingMonths = months - m + 1;
    const interest = (totalBalance + monthlyDeposit) * r;
    totalBalance += monthlyDeposit + interest;
    totalDeposited += monthlyDeposit;
    totalInterest += interest;

    schedule.push({
      month: m,
      deposit: monthlyDeposit,
      interest,
      balance: totalBalance,
    });
  }

  return {
    maturityAmount: totalBalance,
    totalDeposited,
    totalInterest,
    monthlySchedule: schedule,
  };
}

export interface PPFResult {
  maturityAmount: number;
  totalDeposited: number;
  totalInterest: number;
  yearlySchedule: { year: number; openingBalance: number; deposit: number; interest: number; closingBalance: number }[];
}

export function calculatePPF(
  annualDeposit: number,
  years: number = 15,
  annualRatePercent: number = 7.1
): PPFResult {
  const r = annualRatePercent / 100;
  const schedule: PPFResult["yearlySchedule"] = [];
  let balance = 0;
  let totalDeposited = 0;
  let totalInterest = 0;

  for (let y = 1; y <= years; y++) {
    const opening = balance + annualDeposit;
    const interest = opening * r;
    balance = opening + interest;
    totalDeposited += annualDeposit;
    totalInterest += interest;

    schedule.push({
      year: y,
      openingBalance: balance - interest - annualDeposit,
      deposit: annualDeposit,
      interest,
      closingBalance: balance,
    });
  }

  return { maturityAmount: balance, totalDeposited, totalInterest, yearlySchedule: schedule };
}

export interface EPFResult {
  totalBalance: number;
  employeeContribution: number;
  employerContribution: number;
  totalInterest: number;
  yearlySchedule: { year: number; employee: number; employer: number; interest: number; balance: number }[];
}

export function calculateEPF(
  monthlyBasic: number,
  epfRatePercent: number = 12,
  years: number,
  annualRatePercent: number = 8.25
): EPFResult {
  const monthlyEmployee = monthlyBasic * (epfRatePercent / 100);
  const monthlyEmployer = monthlyBasic * (epfRatePercent / 100);
  const r = annualRatePercent / 100;
  let balance = 0;
  let totalEmp = 0;
  let totalEr = 0;
  let totalInt = 0;

  const yearlySchedule: EPFResult["yearlySchedule"] = [];

  for (let y = 1; y <= years; y++) {
    let yearEmp = 0;
    let yearEr = 0;
    let yearInt = 0;

    for (let m = 0; m < 12; m++) {
      const interest = balance * (r / 12);
      balance += monthlyEmployee + monthlyEmployer + interest;
      yearEmp += monthlyEmployee;
      yearEr += monthlyEmployer;
      yearInt += interest;
    }

    totalEmp += yearEmp;
    totalEr += yearEr;
    totalInt += yearInt;

    yearlySchedule.push({
      year: y,
      employee: yearEmp,
      employer: yearEr,
      interest: yearInt,
      balance,
    });
  }

  return {
    totalBalance: balance,
    employeeContribution: totalEmp,
    employerContribution: totalEr,
    totalInterest: totalInt,
    yearlySchedule,
  };
}

export interface NPSResult {
  totalCorpus: number;
  totalContribution: number;
  totalInterest: number;
  annuityAmount: number;
  lumpsumAmount: number;
  monthlyPension: number;
  yearlySchedule: { year: number; contribution: number; interest: number; balance: number }[];
}

export function calculateNPS(
  monthlyContribution: number,
  years: number,
  equityReturnPercent: number = 12,
  debtReturnPercent: number = 8,
  equityAllocationPercent: number = 50,
  annuityPercent: number = 40,
  annuityRatePercent: number = 6
): NPSResult {
  const eq = equityAllocationPercent / 100;
  const debt = 1 - eq;
  const blendedReturn = (equityReturnPercent * eq + debtReturnPercent * debt) / 100;
  const schedule: NPSResult["yearlySchedule"] = [];
  let balance = 0;
  let totalContribution = 0;
  let totalInterest = 0;

  for (let y = 1; y <= years; y++) {
    let yearContrib = 0;
    let yearInt = 0;

    for (let m = 0; m < 12; m++) {
      const interest = balance * (blendedReturn / 12);
      balance += monthlyContribution + interest;
      yearContrib += monthlyContribution;
      yearInt += interest;
    }

    totalContribution += yearContrib;
    totalInterest += yearInt;

    schedule.push({ year: y, contribution: yearContrib, interest: yearInt, balance });
  }

  const annuityAmount = balance * (annuityPercent / 100);
  const lumpsumAmount = balance - annuityAmount;
  const monthlyPension = (annuityAmount * (annuityRatePercent / 100)) / 12;

  return {
    totalCorpus: balance,
    totalContribution,
    totalInterest,
    annuityAmount,
    lumpsumAmount,
    monthlyPension,
    yearlySchedule: schedule,
  };
}

export interface SukanyaResult {
  maturityAmount: number;
  totalDeposited: number;
  totalInterest: number;
  yearlySchedule: { year: number; deposit: number; interest: number; balance: number }[];
}

export function calculateSukanya(
  annualDeposit: number,
  years: number = 15,
  annualRatePercent: number = 8.2,
  maturityYears: number = 21
): SukanyaResult {
  const r = annualRatePercent / 100;
  const schedule: SukanyaResult["yearlySchedule"] = [];
  let balance = 0;
  let totalDeposited = 0;
  let totalInterest = 0;

  for (let y = 1; y <= maturityYears; y++) {
    let deposit = 0;
    if (y <= years) deposit = annualDeposit;

    const interest = (balance + deposit) * r;
    balance += deposit + interest;
    totalDeposited += deposit;
    totalInterest += interest;

    schedule.push({ year: y, deposit, interest, balance });
  }

  return { maturityAmount: balance, totalDeposited, totalInterest, yearlySchedule: schedule };
}

export function calculateSCSS(
  principal: number,
  annualRatePercent: number = 8.2,
  years: number = 5
): { maturityAmount: number; totalInterest: number; quarterlyInterest: number } {
  const r = annualRatePercent / 100 / 4;
  const quarters = years * 4;
  let balance = principal;

  for (let q = 0; q < quarters; q++) {
    balance += balance * r;
  }

  return {
    maturityAmount: balance,
    totalInterest: balance - principal,
    quarterlyInterest: principal * r,
  };
}

export function calculateNSC(
  principal: number,
  annualRatePercent: number = 7.7,
  years: number = 5
): { maturityAmount: number; totalInterest: number } {
  const r = annualRatePercent / 100;
  const maturityAmount = principal * Math.pow(1 + r, years);
  return { maturityAmount, totalInterest: maturityAmount - principal };
}
