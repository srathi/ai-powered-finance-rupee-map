import type {
  StochasticInputs,
  StochasticResult,
  SimulationPath,
  PercentileData,
  SimulationStatistics,
} from "@/types/calculator";
import { historicalReturns } from "@/data/historical-returns";

/**
 * Seeded PRNG for reproducible simulations (Mulberry32).
 */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Randomly samples an element from an array using a seeded PRNG.
 */
function randomSample<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Runs Monte Carlo simulations using historical return data.
 * Returns the required corpus found through bisection search.
 *
 * The algorithm:
 * 1. For a given expenditureCoverRatio (corpus = ratio * annualExpenditure)
 * 2. Run N simulations, each randomly sampling historical months
 * 3. Check how many simulations survive the full retirement period
 * 4. Use binary search on the ratio to find the one that gives ~5% failure rate
 *
 * Note: The stochastic calculator does NOT use tax rate - it's for illustration only.
 */
export function calculateStochasticCorpus(
  inputs: StochasticInputs
): StochasticResult {
  const {
    annualExpenditure,
    equityAllocation,
    retirementPeriodMonths,
    numSimulations,
  } = inputs;

  // Stochastic calculator does not apply tax (per reference site)
  const taxMultiplier = 1;

  // Binary search on expenditure cover ratio
  // Reference site uses ratio up to ~35x annual expenditure
  let low = 0.5;
  let high = 50;
  let bestRatio = 1;
  let bestFailureRate = 100;
  let bestResult: {
    sims: SimulationPath[];
    stats: SimulationStatistics;
  } | null = null;

  for (let iter = 0; iter < 60; iter++) {
    const mid = (low + high) / 2;
    const corpus = mid * annualExpenditure;

    const { simulations, statistics } = runSimulations(
      corpus,
      annualExpenditure,
      equityAllocation,
      retirementPeriodMonths,
      numSimulations,
      taxMultiplier
    );

    // Track the best result (lowest failure rate)
    if (statistics.failureRate < bestFailureRate) {
      bestFailureRate = statistics.failureRate;
      bestRatio = mid;
      bestResult = { sims: simulations, stats: statistics };
    }

    if (statistics.failureRate <= 5) {
      // Found adequate corpus, search lower
      high = mid;
    } else {
      // Need more corpus, search higher
      low = mid;
    }
  }

  // Final run with best ratio
  const finalCorpus = bestRatio * annualExpenditure;
  const { simulations, statistics } = runSimulations(
    finalCorpus,
    annualExpenditure,
    equityAllocation,
    retirementPeriodMonths,
    numSimulations,
    taxMultiplier
  );

  const percentileData = calculatePercentiles(
    simulations,
    retirementPeriodMonths
  );

  // Calculate withdrawal rates for each simulation
  const withdrawalRates = simulations.map(
    (sim) => (annualExpenditure / (bestRatio * annualExpenditure)) * 100
  );

  return {
    requiredCorpus: Math.round(finalCorpus),
    expenditureCoverRatio: bestRatio,
    failureRate: statistics.failureRate,
    successRate: statistics.successRate,
    simulations: simulations.slice(0, 100), // Return first 100 paths for charting
    percentileData,
    withdrawalRates,
    statistics,
  };
}

/**
 * Runs Monte Carlo simulations and returns corpus paths.
 */
function runSimulations(
  initialCorpus: number,
  annualExpenditure: number,
  equityAllocation: number,
  months: number,
  numSimulations: number,
  taxMultiplier: number
): { simulations: SimulationPath[]; statistics: SimulationStatistics } {
  const simulations: SimulationPath[] = [];
  const dataPoints = historicalReturns;
  const equityPct = equityAllocation / 100;
  const debtPct = 1 - equityPct;

  for (let sim = 0; sim < numSimulations; sim++) {
    // Each simulation gets its own seed for independent random sampling
    const rand = mulberry32(sim * 1000 + 42);

    let corpus = initialCorpus;
    const path: number[] = [corpus];
    const baseMonthlyExpense = annualExpenditure / 12;
    let failed = false;
    let cumulativeInflation = 1;

    for (let m = 0; m < months; m++) {
      // Random sampling with replacement - each month independently picks
      // a random historical month (same month can be picked multiple times)
      const data = randomSample(dataPoints, rand);

      // Compounding inflation: each month's inflation compounds on previous
      cumulativeInflation *= (1 + data.inflation / 100 / 12);
      const monthlyExpense = baseMonthlyExpense * cumulativeInflation;

      // Withdraw at start of month (reduces corpus before returns)
      corpus = corpus - monthlyExpense;

      if (corpus <= 0) {
        failed = true;
        path.push(0);
        for (let fill = m + 1; fill <= months; fill++) {
          path.push(0);
        }
        break;
      }

      // Apply returns on remaining corpus (after withdrawal)
      const equityGain = corpus * equityPct * (data.equityReturn / 100 / 12);
      const debtGain = corpus * debtPct * (data.debtReturn / 100 / 12);
      const totalGain = equityGain + debtGain;
      const afterTaxGain = totalGain * taxMultiplier;

      corpus = corpus + afterTaxGain;
      path.push(Math.max(0, corpus));

      if (corpus <= 0) {
        failed = true;
        // Fill remaining months with 0
        for (let fill = m + 1; fill <= months; fill++) {
          path.push(0);
        }
        break;
      }
    }

    simulations.push({
      id: sim,
      corpusPath: path,
      finalCorpus: corpus,
      success: !failed && corpus > 0,
    });
  }

  const successful = simulations.filter((s) => s.success).length;
  const failed = simulations.length - successful;

  const finalCorpora = simulations.map((s) => s.finalCorpus);
  const meanCorpus = finalCorpora.reduce((a, b) => a + b, 0) / finalCorpora.length;
  const medianCorpus = [...finalCorpora].sort((a, b) => a - b)[
    Math.floor(finalCorpora.length / 2)
  ];
  const variance =
    finalCorpora.reduce((sum, v) => sum + Math.pow(v - meanCorpus, 2), 0) /
    finalCorpora.length;

  return {
    simulations,
    statistics: {
      totalSimulations: simulations.length,
      successfulOutcomes: successful,
      failedOutcomes: failed,
      successRate: (successful / simulations.length) * 100,
      failureRate: (failed / simulations.length) * 100,
      meanCorpus: Math.round(meanCorpus),
      medianCorpus: Math.round(medianCorpus),
      stdDevCorpus: Math.round(Math.sqrt(variance)),
    },
  };
}

/**
 * Calculates percentile data across all simulations for each month.
 */
function calculatePercentiles(
  simulations: SimulationPath[],
  months: number
): PercentileData[] {
  const percentiles: PercentileData[] = [];
  const pValues = [5, 25, 50, 75, 95];

  for (let m = 0; m <= months; m++) {
    const valuesAtMonth = simulations
      .map((s) => s.corpusPath[m] ?? 0)
      .sort((a, b) => a - b);

    const percentile: PercentileData = { month: m, p5: 0, p25: 0, p50: 0, p75: 0, p95: 0 };

    for (const p of pValues) {
      const idx = Math.ceil((p / 100) * valuesAtMonth.length) - 1;
      const key = `p${p}` as keyof PercentileData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (percentile as unknown as Record<string, number>)[key] = Math.round(
        valuesAtMonth[Math.max(0, idx)]
      );
    }

    percentiles.push(percentile);
  }

  return percentiles;
}

/**
 * Tests whether a given corpus is adequate using Monte Carlo simulation.
 */
export function testAdequacy(
  annualExpenditure: number,
  retirementCorpus: number,
  equityAllocation: number,
  retirementPeriodMonths: number,
  numSimulations: number,
  taxRate: number = 0
): {
  failureRate: number;
  successRate: number;
  simulations: SimulationPath[];
  statistics: SimulationStatistics;
  isAdequate: boolean;
} {
  const taxMultiplier = 1 - taxRate / 100;

  const { simulations, statistics } = runSimulations(
    retirementCorpus,
    annualExpenditure,
    equityAllocation,
    retirementPeriodMonths,
    numSimulations,
    taxMultiplier
  );

  return {
    failureRate: statistics.failureRate,
    successRate: statistics.successRate,
    simulations: simulations.slice(0, 100),
    statistics,
    isAdequate: statistics.failureRate <= 5,
  };
}

/**
 * Computes the Safe Withdrawal Rate using the formula from Saraogi (2025).
 *
 * SWR = a + b * equityAlloc + c * equityAlloc^2 + d * retirementPeriod
 *        + e * equityAlloc * retirementPeriod + f * retirementPeriod^2
 *
 * This is an approximation fitted to simulation results with R² = 0.996.
 * Source: "From Simulations to Simplicity: A Formula for Safe Withdrawal Rates"
 * Saraogi, Ravi (December 11, 2025). SSRN: https://ssrn.com/abstract=5905203
 */
export function computeSWRFormula(
  equityAllocationPct: number,
  retirementPeriodYears: number
): number {
  // Coefficients fitted from Monte Carlo simulation results
  const a = 3.7719;
  const b = 0.0506;
  const c = -0.000416;
  const d = -0.0452;
  const e = 0.000509;
  const f = 0.000134;

  const eq = equityAllocationPct;
  const yr = retirementPeriodYears;

  const swr =
    a +
    b * eq +
    c * eq * eq +
    d * yr +
    e * eq * yr +
    f * yr * yr;

  // Clamp between reasonable bounds
  return Math.max(1, Math.min(8, swr));
}
