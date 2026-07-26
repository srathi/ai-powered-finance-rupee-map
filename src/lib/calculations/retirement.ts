import type {
  DeterministicInputs,
  DeterministicResult,
  CorpusEvolution,
  MonthlyTableData,
} from "@/types/calculator";

/**
 * Calculates the required retirement corpus using the Deterministic Approach.
 *
 * This is the standard retirement corpus calculation that assumes:
 * - Constant equity return, debt return, and inflation each year
 * - Monthly compounding
 * - Withdrawals happen at the start of each month
 * - Portfolio earns blended return based on equity/debt allocation
 *
 * The algorithm works by:
 * 1. Starting with a candidate corpus
 * 2. Simulating month-by-month: earning returns, then withdrawing expenses
 * 3. Using binary search to find the exact corpus that depletes at exactly the retirement period end
 *
 * @param inputs - Deterministic calculator inputs
 * @returns Required corpus and month-by-month evolution data
 */
export function calculateDeterministicCorpus(
  inputs: DeterministicInputs
): DeterministicResult {
  const {
    annualExpenditure,
    equityAllocation,
    retirementPeriodMonths,
    expectedEquityReturn,
    expectedDebtReturn,
    expectedInflation,
    taxRate = 0,
  } = inputs;

  const monthlyInflation = expectedInflation / 100 / 12;
  const monthlyEquityReturn = expectedEquityReturn / 100 / 12;
  const monthlyDebtReturn = expectedDebtReturn / 100 / 12;
  const equityPct = equityAllocation / 100;
  const debtPct = 1 - equityPct;
  const taxMultiplier = 1 - taxRate / 100;

  // Binary search to find the required corpus
  let low = 0;
  let high = annualExpenditure * 100; // generous upper bound

  for (let iter = 0; iter < 200; iter++) {
    const mid = (low + high) / 2;
    const finalCorpus = simulateDeterministic(
      mid,
      annualExpenditure,
      retirementPeriodMonths,
      monthlyInflation,
      monthlyEquityReturn,
      monthlyDebtReturn,
      equityPct,
      debtPct,
      taxMultiplier
    );

    if (finalCorpus > 0) {
      // Corpus is too high (not depleted), try lower
      high = mid;
    } else {
      // Corpus is too low (depleted too early), try higher
      low = mid;
    }
  }

  const requiredCorpus = Math.round((low + high) / 2);

  // Generate the month-by-month data with the exact corpus
  const monthlyData = generateDeterministicEvolution(
    requiredCorpus,
    annualExpenditure,
    retirementPeriodMonths,
    monthlyInflation,
    monthlyEquityReturn,
    monthlyDebtReturn,
    equityPct,
    debtPct,
    taxMultiplier
  );

  let totalWithdrawn = 0;
  let totalReturnsEarned = 0;
  for (const row of monthlyData) {
    totalWithdrawn += row.withdrawal;
    totalReturnsEarned += row.returnsEarned;
  }

  return {
    requiredCorpus: Math.round(requiredCorpus),
    monthlyData,
    totalWithdrawn: Math.round(totalWithdrawn),
    totalReturnsEarned: Math.round(totalReturnsEarned),
  };
}

/**
 * Simulates the deterministic retirement and returns the final corpus.
 * Used for binary search.
 */
function simulateDeterministic(
  initialCorpus: number,
  annualExpenditure: number,
  months: number,
  monthlyInflation: number,
  monthlyEquityReturn: number,
  monthlyDebtReturn: number,
  equityPct: number,
  debtPct: number,
  taxMultiplier: number
): number {
  let corpus = initialCorpus;
  const baseMonthlyExpense = annualExpenditure / 12;

  for (let m = 0; m < months; m++) {
    // Calculate inflation-adjusted expense for this month
    const inflationFactor = Math.pow(1 + monthlyInflation, m);
    const monthlyExpense = baseMonthlyExpense * inflationFactor;

    // Calculate blended return for this month
    const equityGain = corpus * equityPct * monthlyEquityReturn;
    const debtGain = corpus * debtPct * monthlyDebtReturn;
    const totalGain = equityGain + debtGain;

    // Apply tax on gains
    const afterTaxGain = totalGain > 0 ? totalGain * taxMultiplier : totalGain;

    // Update corpus: add returns, subtract withdrawal
    corpus = corpus + afterTaxGain - monthlyExpense;
  }

  return corpus;
}

/**
 * Generates detailed month-by-month corpus evolution data.
 */
function generateDeterministicEvolution(
  initialCorpus: number,
  annualExpenditure: number,
  months: number,
  monthlyInflation: number,
  monthlyEquityReturn: number,
  monthlyDebtReturn: number,
  equityPct: number,
  debtPct: number,
  taxMultiplier: number
): CorpusEvolution[] {
  const data: CorpusEvolution[] = [];
  let corpus = initialCorpus;
  const baseMonthlyExpense = annualExpenditure / 12;

  for (let m = 0; m <= months; m++) {
    const year = Math.floor(m / 12);
    const inflationFactor = Math.pow(1 + monthlyInflation, m);
    const monthlyExpense = baseMonthlyExpense * inflationFactor;

    if (m === 0) {
      data.push({
        month: 0,
        year: 0,
        corpus: Math.round(corpus),
        withdrawal: 0,
        returnsEarned: 0,
        equityPortion: 0,
        debtPortion: 0,
        inflationAdjustedWithdrawal: Math.round(monthlyExpense),
      });
      continue;
    }

    // Calculate returns
    const equityGain = corpus * equityPct * monthlyEquityReturn;
    const debtGain = corpus * debtPct * monthlyDebtReturn;
    const totalGain = equityGain + debtGain;
    const afterTaxGain = totalGain > 0 ? totalGain * taxMultiplier : totalGain;

    const previousCorpus = corpus;
    corpus = corpus + afterTaxGain - monthlyExpense;

    data.push({
      month: m,
      year,
      corpus: Math.max(0, Math.round(corpus)),
      withdrawal: Math.round(monthlyExpense),
      returnsEarned: Math.round(afterTaxGain),
      equityPortion: Math.round(equityGain),
      debtPortion: Math.round(debtGain),
      inflationAdjustedWithdrawal: Math.round(monthlyExpense),
    });

    if (corpus <= 0) break;
  }

  return data;
}

/**
 * Converts monthly evolution data to a monthly table format.
 */
export function toMonthlyTable(data: CorpusEvolution[]): MonthlyTableData[] {
  return data.map((row, idx) => {
    const prevCorpus = idx > 0 ? data[idx - 1].corpus : row.corpus;
    return {
      month: row.month,
      year: row.year,
      annualExpenses: row.withdrawal * 12,
      monthlyExpenses: row.withdrawal,
      corpus: row.corpus,
      returnsEarned: row.returnsEarned,
      withdrawal: row.withdrawal,
      remainingCorpus: row.corpus,
      inflationAdjustedValue: row.inflationAdjustedWithdrawal,
    };
  });
}
