"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { exportToCSV, exportToExcel } from "@/lib/export";
import {
  getAvailableStartYears,
  getHistoricalStartingFrom,
} from "@/data/historical-returns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { RotateCcw, Play } from "lucide-react";

interface HistoryPeriodResult {
  startYear: number;
  endYear: number;
  survived: boolean;
  breakEvenWithdrawalRate: number;
  finalCorpus: number;
}

export default function HistoryPage() {
  const [inputs, setInputs] = useState({
    annualExpenditure: 1200000,
    retirementCorpus: 22800000,
    equityAllocation: 50,
    retirementPeriodYears: 30,
  });

  const [results, setResults] = useState<HistoryPeriodResult[]>([]);
  const [selectedPeriod, setSelectedPeriod] =
    useState<HistoryPeriodResult | null>(null);
  const [trajectory, setTrajectory] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const availableYears = getAvailableStartYears();

  const runHistory = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      const allResults: HistoryPeriodResult[] = [];
      const months = inputs.retirementPeriodYears * 12;
      const equityPct = inputs.equityAllocation / 100;
      const debtPct = 1 - equityPct;
      const baseMonthlyExpense = inputs.annualExpenditure / 12;

      for (const startYear of availableYears) {
        const histData = getHistoricalStartingFrom(startYear, 1);
        if (histData.length < months) continue;

        // Simulate corpus
        let corpus = inputs.retirementCorpus;
        const path: number[] = [corpus];
        let cumulativeInflation = 1;

        for (let m = 0; m < months; m++) {
          const data = histData[m];
          if (!data) break;
          cumulativeInflation *= (1 + data.inflation / 100 / 12);
          const expense = baseMonthlyExpense * cumulativeInflation;
          corpus = corpus - expense;
          if (corpus <= 0) { corpus = 0; path.push(0); break; }
          const eg = corpus * equityPct * (data.equityReturn / 100 / 12);
          const dg = corpus * debtPct * (data.debtReturn / 100 / 12);
          corpus = corpus + eg + dg;
          if (corpus < 0) corpus = 0;
          path.push(corpus);
        }

        // Break-even rate
        let low = 0;
        let high = inputs.retirementCorpus;
        for (let i = 0; i < 80; i++) {
          const mid = (low + high) / 2;
          let c = inputs.retirementCorpus;
          const be = mid / 12;
          let cumInf = 1;
          for (let m = 0; m < months; m++) {
            const data = histData[m];
            if (!data) break;
            cumInf *= (1 + data.inflation / 100 / 12);
            const exp = be * cumInf;
            c = c - exp;
            if (c <= 0) break;
            const eg = c * equityPct * (data.equityReturn / 100 / 12);
            const dg = c * debtPct * (data.debtReturn / 100 / 12);
            c = c + eg + dg;
          }
          if (c <= 0) high = mid;
          else low = mid;
        }

        allResults.push({
          startYear,
          endYear: startYear + inputs.retirementPeriodYears,
          survived: corpus > 0,
          breakEvenWithdrawalRate: (low / inputs.retirementCorpus) * 100,
          finalCorpus: corpus,
        });
      }

      setResults(allResults);
      setIsCalculating(false);
    }, 50);
  }, [inputs, availableYears]);

  const selectPeriod = useCallback(
    (period: HistoryPeriodResult) => {
      setSelectedPeriod(period);
      const histData = getHistoricalStartingFrom(period.startYear, 1);
      const months = inputs.retirementPeriodYears * 12;
      const equityPct = inputs.equityAllocation / 100;
      const debtPct = 1 - equityPct;
      const baseMonthlyExpense = inputs.annualExpenditure / 12;

      let corpus = inputs.retirementCorpus;
      const path: number[] = [corpus];

      for (let m = 0; m < months; m++) {
        const data = histData[m];
        if (!data) break;
        const inflFactor = Math.pow(1 + data.inflation / 100 / 12, m);
        const expense = baseMonthlyExpense * inflFactor;
        const eg = corpus * equityPct * (data.equityReturn / 100 / 12);
        const dg = corpus * debtPct * (data.debtReturn / 100 / 12);
        corpus = corpus + eg + dg - expense;
        if (corpus < 0) corpus = 0;
        path.push(corpus);
      }

      setTrajectory(path);
    },
    [inputs]
  );

  const chartData = trajectory
    .filter(
      (_, i) => i % 12 === 0 || i === trajectory.length - 1
    )
    .map((val, i) => ({
      name: `Yr ${i}`,
      corpus: val,
    }));

  const survivedCount = results.filter((r) => r.survived).length;

  return (
    <CalculatorLayout
      title="History Back-test"
      description="Back-test your retirement scenario against every available starting year using historical Indian market data."
      info="This page back-tests your retirement scenario against every available starting year using historical Indian market data (Sensex for equity returns, 1–3yr FD rates for debt returns, and CPI inflation). Data spans 1979–2025. Click any card in the results to see the full corpus trajectory."
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
                onClick={runHistory}
                className="flex-1 gap-2"
                disabled={isCalculating}
              >
                <Play className="h-4 w-4" />
                Run History
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setResults([]);
                  setSelectedPeriod(null);
                  setTrajectory([]);
                }}
                size="icon"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          {results.length > 0 && (
            <>
              {/* Summary */}
              <SummaryGrid>
                <SummaryCard
                  label="Total Periods"
                  value={String(results.length)}
                  sublabel={`${availableYears[0]}–${availableYears[availableYears.length - 1]}`}
                />
                <SummaryCard
                  label="Survived"
                  value={String(survivedCount)}
                  sublabel={`${((survivedCount / results.length) * 100).toFixed(0)}% of periods`}
                  variant="success"
                />
                <SummaryCard
                  label="Failed"
                  value={String(results.length - survivedCount)}
                  sublabel={`${(((results.length - survivedCount) / results.length) * 100).toFixed(0)}% of periods`}
                  variant="danger"
                />
              </SummaryGrid>

              {/* Selected Period Chart */}
              {selectedPeriod && trajectory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Corpus Trajectory: {selectedPeriod.startYear}–
                      {selectedPeriod.endYear}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="opacity-30"
                          />
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
                            formatter={(value) =>
                              formatCurrency(Number(value))
                            }
                          />
                          <ReferenceLine
                            y={0}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                          />
                          <Line
                            type="monotone"
                            dataKey="corpus"
                            stroke={
                              selectedPeriod.survived
                                ? "hsl(var(--chart-1))"
                                : "hsl(var(--chart-5))"
                            }
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    All Periods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {results.map((r) => (
                      <button
                        key={r.startYear}
                        onClick={() => selectPeriod(r)}
                        className={`rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                          selectedPeriod?.startYear === r.startYear
                            ? "border-primary bg-primary/5"
                            : r.survived
                            ? "border-emerald-500/20 hover:border-emerald-500/40"
                            : "border-rose-500/20 hover:border-rose-500/40"
                        }`}
                      >
                        <p className="text-sm font-semibold">
                          {r.startYear}–{r.endYear}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            r.survived ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {r.survived ? "✓ Survived" : "✗ Failed"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          BE: {formatPercent(r.breakEvenWithdrawalRate, 1)}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <ResultsTable
                columns={[
                  { key: "startYear", label: "Start", sortable: true },
                  { key: "endYear", label: "End", sortable: true },
                  {
                    key: "survived",
                    label: "Status",
                    format: (v) => (v ? "✅ Survived" : "❌ Failed"),
                  },
                  {
                    key: "breakEvenWithdrawalRate",
                    label: "BE Rate",
                    format: (v) => formatPercent(v, 2),
                    sortable: true,
                  },
                  {
                    key: "finalCorpus",
                    label: "Final Corpus",
                    format: (v) => formatCurrency(v),
                    sortable: true,
                  },
                ]}
                data={results as unknown as Record<string, unknown>[]}
                title="Detailed Results"
                onExportCSV={() =>
                  exportToCSV(
                    results.map((r) => ({
                      "Start Year": r.startYear,
                      "End Year": r.endYear,
                      Survived: r.survived ? "Yes" : "No",
                      "Break-even Rate": r.breakEvenWithdrawalRate.toFixed(2),
                      "Final Corpus": r.finalCorpus,
                    })),
                    "history-backtest"
                  )
                }
                onExportExcel={() =>
                  exportToExcel(
                    results.map((r) => ({
                      "Start Year": r.startYear,
                      "End Year": r.endYear,
                      Survived: r.survived ? "Yes" : "No",
                      "Break-even Rate": r.breakEvenWithdrawalRate.toFixed(2),
                      "Final Corpus": r.finalCorpus,
                    })),
                    "history-backtest"
                  )
                }
              />
            </>
          )}

          {results.length === 0 && (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium mb-1">No results yet</p>
                <p className="text-sm">
                  Enter your inputs and click Run History to see results.
                </p>
              </div>
            </Card>
          )}
        </div>
      }
    />
  );
}
