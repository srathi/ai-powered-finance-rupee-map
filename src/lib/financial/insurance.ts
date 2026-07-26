export interface LifeInsuranceNeedResult {
  humanLifeValue: number;
  incomeReplacement: number;
  debtCoverage: number;
  childEducation: number;
  emergencyFund: number;
  totalNeed: number;
  existingCoverage: number;
  coverageGap: number;
}

export function calculateLifeInsuranceNeed(
  annualIncome: number,
  workingYearsLeft: number,
  existingDebt: number,
  childEducationFund: number,
  emergencyFund: number,
  existingCoverage: number,
  inflationPercent: number = 6,
  discountRatePercent: number = 8
): LifeInsuranceNeedResult {
  // Income replacement: present value of future income
  const realRate = ((1 + discountRatePercent / 100) / (1 + inflationPercent / 100) - 1);
  let incomeReplacement = 0;
  for (let y = 1; y <= workingYearsLeft; y++) {
    incomeReplacement += annualIncome * Math.pow(1 + inflationPercent / 100, y) / Math.pow(1 + discountRatePercent / 100, y);
  }

  const totalNeed = incomeReplacement + existingDebt + childEducationFund + emergencyFund;
  const coverageGap = Math.max(0, totalNeed - existingCoverage);

  return {
    humanLifeValue: incomeReplacement,
    incomeReplacement,
    debtCoverage: existingDebt,
    childEducation: childEducationFund,
    emergencyFund,
    totalNeed,
    existingCoverage,
    coverageGap,
  };
}

export function calculateTermInsuranceNeed(
  annualIncome: number,
  yearsUntilRetirement: number,
  outstandingLoans: number,
  childrenEducationYears: number,
  monthlyExpenses: number,
  inflationPercent: number = 6,
  returnPercent: number = 8
): number {
  let totalNeed = 0;

  // Income replacement
  for (let y = 1; y <= yearsUntilRetirement; y++) {
    totalNeed += annualIncome * Math.pow(1 + inflationPercent / 100, y) / Math.pow(1 + returnPercent / 100, y);
  }

  // Children education
  const educationCostPerYear = 200000;
  for (let y = 1; y <= childrenEducationYears; y++) {
    totalNeed += educationCostPerYear * Math.pow(1 + inflationPercent / 100, y) / Math.pow(1 + returnPercent / 100, y);
  }

  // Emergency fund
  totalNeed += monthlyExpenses * 12 * 5;

  // Loans
  totalNeed += outstandingLoans;

  return totalNeed;
}

export interface ChildEducationResult {
  futureCost: number;
  monthlyInvestmentRequired: number;
  lumpsumRequired: number;
  totalInvestment: number;
  totalReturns: number;
  yearlySchedule: { year: number; age: number; costOfEducation: number; corpus: number; investment: number }[];
}

export function calculateChildEducation(
  currentAge: number,
  educationStartAge: number = 18,
  currentEducationCost: number,
  yearsOfEducation: number = 4,
  inflationPercent: number = 10,
  returnPercent: number = 12
): ChildEducationResult {
  const yearsToGoal = educationStartAge - currentAge;
  const futureCost = currentEducationCost * Math.pow(1 + inflationPercent / 100, yearsToGoal);
  const monthlyReturn = returnPercent / 100 / 12;
  const monthsToGoal = yearsToGoal * 12;

  // Monthly SIP to reach goal
  const monthlyInvestmentRequired = monthlyReturn > 0
    ? (futureCost * monthlyReturn) / (Math.pow(1 + monthlyReturn, monthsToGoal) - 1)
    : futureCost / monthsToGoal;

  const lumpsumRequired = futureCost / Math.pow(1 + returnPercent / 100, yearsToGoal);
  const totalInvestment = monthlyInvestmentRequired * monthsToGoal;

  const schedule: ChildEducationResult["yearlySchedule"] = [];
  let corpus = 0;
  let yearInvestment = 0;

  for (let y = 0; y <= yearsToGoal; y++) {
    yearInvestment = monthlyInvestmentRequired * 12;
    corpus = corpus * (1 + returnPercent / 100) + yearInvestment;
    const age = currentAge + y;
    const cost = currentEducationCost * Math.pow(1 + inflationPercent / 100, y);

    schedule.push({
      year: y,
      age,
      costOfEducation: cost,
      corpus: y === 0 ? 0 : corpus,
      investment: yearInvestment,
    });
  }

  return {
    futureCost,
    monthlyInvestmentRequired,
    lumpsumRequired,
    totalInvestment,
    totalReturns: futureCost - totalInvestment,
    yearlySchedule: schedule,
  };
}

export function calculateHealthInsurance(
  age: number,
  sumInsured: number,
  existingDiseases: boolean = false
): { premium: number; coverage: number; coPay: number } {
  // Simplified premium calculation based on age brackets
  let baseRate = 0;
  if (age <= 30) baseRate = 0.008;
  else if (age <= 40) baseRate = 0.012;
  else if (age <= 50) baseRate = 0.018;
  else if (age <= 60) baseRate = 0.03;
  else baseRate = 0.05;

  if (existingDiseases) baseRate *= 1.3;

  return {
    premium: sumInsured * baseRate,
    coverage: sumInsured,
    coPay: existingDiseases ? 0.1 : 0,
  };
}
