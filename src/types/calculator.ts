export interface DeterministicInputs {
  annualExpenditure: number;
  equityAllocation: number;
  retirementPeriodMonths: number;
  expectedEquityReturn: number;
  expectedDebtReturn: number;
  expectedInflation: number;
  taxRate?: number;
}

export interface DeterministicResult {
  requiredCorpus: number;
  monthlyData: CorpusEvolution[];
  totalWithdrawn: number;
  totalReturnsEarned: number;
}

export interface CorpusEvolution {
  month: number;
  year: number;
  age?: number;
  corpus: number;
  withdrawal: number;
  returnsEarned: number;
  equityPortion: number;
  debtPortion: number;
  inflationAdjustedWithdrawal: number;
}

export interface StochasticInputs {
  annualExpenditure: number;
  equityAllocation: number;
  retirementPeriodMonths: number;
  numSimulations: number;
  taxRate?: number;
}

export interface StochasticResult {
  requiredCorpus: number;
  expenditureCoverRatio: number;
  failureRate: number;
  successRate: number;
  simulations: SimulationPath[];
  percentileData: PercentileData[];
  withdrawalRates: number[];
  statistics: SimulationStatistics;
}

export interface SimulationPath {
  id: number;
  corpusPath: number[];
  finalCorpus: number;
  success: boolean;
}

export interface PercentileData {
  month: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export interface SimulationStatistics {
  totalSimulations: number;
  successfulOutcomes: number;
  failedOutcomes: number;
  successRate: number;
  failureRate: number;
  meanCorpus: number;
  medianCorpus: number;
  stdDevCorpus: number;
}

export interface TestAdequacyInputs {
  annualExpenditure: number;
  retirementCorpus: number;
  equityAllocation: number;
  retirementPeriodMonths: number;
  numSimulations: number;
  taxRate?: number;
}

export interface TestAdequacyResult {
  failureRate: number;
  successRate: number;
  simulations: SimulationPath[];
  statistics: SimulationStatistics;
  isAdequate: boolean;
}

export interface WhatIfInputs {
  startPeriod: string;
  annualExpenditure: number;
  retirementCorpus: number;
  equityAllocation: number;
  retirementPeriodYears: number;
  numSimulations?: number;
}

export interface WhatIfResult {
  survived: boolean;
  breakEvenWithdrawalRate: number;
  corpusTrajectory: number[];
  percentileData: PercentileData[];
  statistics: SimulationStatistics;
}

export interface WithdrawalRateInputs {
  equityAllocation: number;
  retirementPeriodYears: number;
}

export interface WithdrawalRateResult {
  safeWithdrawalRate: number;
  robustnessCheck: {
    passRate: number;
    simulations: SimulationPath[];
  };
}

export interface HistoryInputs {
  annualExpenditure: number;
  retirementCorpus: number;
  equityAllocation: number;
  retirementPeriodYears: number;
}

export interface HistoryResult {
  results: HistoryPeriodResult[];
  totalPeriods: number;
}

export interface HistoryPeriodResult {
  startYear: number;
  endYear: number;
  survived: boolean;
  breakEvenWithdrawalRate: number;
  corpusTrajectory: number[];
  finalCorpus: number;
}

export interface MonthlyTableData {
  month: number;
  year: number;
  annualExpenses: number;
  monthlyExpenses: number;
  corpus: number;
  returnsEarned: number;
  withdrawal: number;
  remainingCorpus: number;
  inflationAdjustedValue: number;
}

export interface ChartDataPoint {
  name: string;
  corpus: number;
  withdrawal: number;
  returns: number;
  expenses: number;
  [key: string]: string | number;
}
