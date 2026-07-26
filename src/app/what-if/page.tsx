"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { historicalReturns } from "@/data/historical-returns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RotateCcw, Play } from "lucide-react";

interface SimulationPath {
  corpusPath: number[];
  finalCorpus: number;
  success: boolean;
}

interface PercentileData {
  month: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

interface WhatIfResult {
  survived: boolean;
  breakEvenWithdrawalRate: number;
  percentileData: PercentileData[];
  statistics: {
    totalSimulations: number;
    successfulOutcomes: number;
    failedOutcomes: number;
    successRate: number;
    failureRate: number;
  };
}

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


function runSimulations(
  initialCorpus: number,
  annualExpenditure: number,
  equityAllocation: number,
  months: number,
  numSimulations: number
): { simulations: SimulationPath[]; statistics: WhatIfResult["statistics"] } {
  const simulations: SimulationPath[] = [];
  const dataPoints = historicalReturns;
  const equityPct = equityAllocation / 100;
  const debtPct = 1 - equityPct;

  for (let sim = 0; sim < numSimulations; sim++) {
    const rand = mulberry32(sim * 1000 + 42);

    let corpus = initialCorpus;
    const path: number[] = [corpus];
    const baseMonthlyExpense = annualExpenditure / 12;
    let failed = false;
    let cumulativeInflation = 1;

    for (let m = 0; m < months; m++) {
      const dataIdx = Math.floor(rand() * dataPoints.length);
      const data = dataPoints[dataIdx];

      cumulativeInflation *= (1 + data.inflation / 100 / 12);
      const monthlyExpense = baseMonthlyExpense * cumulativeInflation;

      corpus = corpus - monthlyExpense;

      if (corpus <= 0) {
        failed = true;
        path.push(0);
        for (let fill = m + 1; fill <= months; fill++) {
          path.push(0);
        }
        break;
      }

      const equityGain = corpus * equityPct * (data.equityReturn / 100 / 12);
      const debtGain = corpus * debtPct * (data.debtReturn / 100 / 12);
      const totalGain = equityGain + debtGain;

      corpus = corpus + totalGain;
      path.push(Math.max(0, corpus));
    }

    simulations.push({
      corpusPath: path,
      finalCorpus: corpus,
      success: !failed && corpus > 0,
    });
  }

  const successful = simulations.filter((s) => s.success).length;
  const failed = simulations.length - successful;

  return {
    simulations,
    statistics: {
      totalSimulations: simulations.length,
      successfulOutcomes: successful,
      failedOutcomes: failed,
      successRate: (successful / simulations.length) * 100,
      failureRate: (failed / simulations.length) * 100,
    },
  };
}

function calculatePercentiles(
  simulations: SimulationPath[],
  months: number
): PercentileData[] {
  const percentiles: PercentileData[] = [];
  const pValues = [10, 25, 50, 75, 90];

  for (let m = 0; m <= months; m++) {
    const valuesAtMonth = simulations
      .map((s) => s.corpusPath[m] ?? 0)
      .sort((a, b) => a - b);

    const percentile: PercentileData = { month: m, p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 };

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

export default function WhatIfPage() {
  const [inputs, setInputs] = useState({
    annualExpenditure: 1200000,
    retirementCorpus: 22800000,
    equityAllocation: 50,
    retirementPeriodYears: 30,
  });

  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const runWhatIf = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      const months = inputs.retirementPeriodYears * 12;
      const numSimulations = 10000;

      const { simulations, statistics } = runSimulations(
        inputs.retirementCorpus,
        inputs.annualExpenditure,
        inputs.equityAllocation,
        months,
        numSimulations
      );

      const percentileData = calculatePercentiles(simulations, months);

      // Calculate break-even withdrawal rate (max sustainable annual expenditure)
      let low = 0;
      let high = inputs.retirementCorpus * 2; // Allow up to 2x corpus as annual expenditure
      for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2;
        const { simulations: testSims } = runSimulations(
          inputs.retirementCorpus,
          mid,
          inputs.equityAllocation,
          months,
          200
        );
        const survivalRate =
          testSims.filter((s) => s.success).length / testSims.length;
        if (survivalRate >= 0.95) low = mid;
        else high = mid;
      }

      const breakEvenAnnual = low;
      const breakEvenRate = (breakEvenAnnual / inputs.retirementCorpus) * 100;

      setResult({
        survived: statistics.failureRate <= 5,
        breakEvenWithdrawalRate: (low / inputs.retirementCorpus) * 100,
        percentileData,
        statistics,
      });
      setIsCalculating(false);
    }, 50);
  }, [inputs]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.percentileData
      .filter((_, i) => i % 12 === 0 || i === result.percentileData.length - 1)
      .map((p) => ({
        name: `Yr ${Math.floor(p.month / 12)}`,
        p10: p.p10,
        p25: p.p25,
        p50: p.p50,
        p75: p.p75,
        p90: p.p90,
      }));
  }, [result]);

  return (
    <CalculatorLayout
      title="What-if Analysis"
      description="Run 10,000 Monte Carlo simulations to stress-test your retirement plan with percentile bands."
      info="This calculator runs 10,000 Monte Carlo simulations using historical Indian market data (Sensex for equity, 1–3yr FD rates for debt, and CPI inflation). The chart shows percentile bands (P10, P25, P50, P75, P90) representing the range of possible outcomes. The break-even withdrawal rate is the maximum annual withdrawal (as % of corpus) that maintains a 95%+ survival rate."
      isCalculating={isCalculating}
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputField
              label="Annual Expenditure"
              value={inputs.annualExpenditure}
              onChange={(v) =>
                setInputs((p) => ({ ...p, annualExpenditure: v }))
              }
              min={10000}
              max={100000000}
              step={10000}
              prefix="₹"
            />

            <InputField
              label="Retirement Corpus"
              value={inputs.retirementCorpus}
              onChange={(v) =>
                setInputs((p) => ({ ...p, retirementCorpus: v }))
              }
              min={100000}
              max={1000000000}
              step={100000}
              prefix="₹"
            />

            <SliderField
              label="Equity Allocation"
              value={inputs.equityAllocation}
              onChange={(v) =>
                setInputs((p) => ({ ...p, equityAllocation: v }))
              }
              min={0}
              max={100}
              step={1}
            />

            <InputField
              label="Retirement Period"
              value={inputs.retirementPeriodYears}
              onChange={(v) =>
                setInputs((p) => ({ ...p, retirementPeriodYears: v }))
              }
              min={5}
              max={50}
              step={1}
              suffix="yr"
            />

            <div className="flex gap-2 pt-2">
              <Button
                onClick={runWhatIf}
                className="flex-1 gap-2"
                disabled={isCalculating}
              >
                <Play className="h-4 w-4" />
                Run What-if (10k Sims)
              </Button>
              <Button
                variant="ghost"
                onClick={() => setResult(null)}
                size="icon"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        result ? (
          <div className="space-y-6">
            {/* Result Banner */}
            <div
              className={`rounded-xl border p-6 text-center ${
                result.survived
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/20 bg-rose-500/5"
              }`}
            >
              <p className="text-3xl font-bold mb-2">
                {result.survived ? "✅ Plan is Adequate" : "❌ Plan May Fail"}
              </p>
              <p className="text-muted-foreground">
                Failure rate: {formatPercent(result.statistics.failureRate, 1)} — 
                {result.survived
                  ? " Your corpus has a 95%+ chance of lasting the full retirement period."
                  : " Your corpus may not last the full retirement period."}
              </p>
            </div>

            <SummaryGrid>
              <SummaryCard
                label="Status"
                value={result.survived ? "Adequate" : "Inadequate"}
                variant={result.survived ? "success" : "danger"}
              />
              <SummaryCard
                label="Failure Rate"
                value={formatPercent(result.statistics.failureRate, 1)}
                sublabel={`${result.statistics.failedOutcomes} of ${result.statistics.totalSimulations} simulations`}
                variant={result.statistics.failureRate <= 5 ? "success" : "danger"}
              />
              <SummaryCard
                label="Success Rate"
                value={formatPercent(result.statistics.successRate, 1)}
                sublabel={`${result.statistics.successfulOutcomes} of ${result.statistics.totalSimulations} simulations`}
              />
              <SummaryCard
                label="Break-even Withdrawal Rate"
                value={formatPercent(result.breakEvenWithdrawalRate, 2)}
                sublabel="Maximum sustainable withdrawal rate"
              />
              <SummaryCard
                label="Input Corpus"
                value={formatCurrency(inputs.retirementCorpus, true)}
              />
            </SummaryGrid>

            {/* Percentile Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Corpus Trajectory Percentiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) =>
                          v >= 1e7
                            ? `${(v / 1e7).toFixed(1)}Cr`
                            : v >= 1e5
                            ? `${(v / 1e5).toFixed(1)}L`
                            : v.toLocaleString("en-IN")
                        }
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          String(name),
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="p90"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.1}
                        name="P90 (Optimistic)"
                      />
                      <Area
                        type="monotone"
                        dataKey="p75"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.15}
                        name="P75"
                      />
                      <Area
                        type="monotone"
                        dataKey="p50"
                        stroke="hsl(var(--chart-3))"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.2}
                        name="P50 (Median)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="p25"
                        stroke="hsl(var(--chart-4))"
                        fill="hsl(var(--chart-4))"
                        fillOpacity={0.15}
                        name="P25"
                      />
                      <Area
                        type="monotone"
                        dataKey="p10"
                        stroke="hsl(var(--chart-5))"
                        fill="hsl(var(--chart-5))"
                        fillOpacity={0.1}
                        name="P10 (Pessimistic)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Explanation */}
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Understanding Percentile Bands</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>P90 (Optimistic):</strong> 90% of simulations ended below this line — only 10% did better.</li>
                    <li><strong>P75:</strong> 75% of simulations ended below this line.</li>
                    <li><strong>P50 (Median):</strong> The middle outcome — half of simulations did better, half did worse.</li>
                    <li><strong>P25:</strong> 25% of simulations ended below this line.</li>
                    <li><strong>P10 (Pessimistic):</strong> Only 10% of simulations ended below this line — 90% did better.</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    If the P10 line stays above zero throughout your retirement period, your plan is very robust.
                    If the P50 line goes to zero, there&apos;s a 50% chance your corpus will be depleted before the end.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-1">No results yet</p>
              <p className="text-sm">
                Enter your parameters and click Run What-if to see 10,000 simulation results.
              </p>
            </div>
          </Card>
        )
      }
    />
  );
}
