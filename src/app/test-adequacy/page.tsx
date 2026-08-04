"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency, monthsToYearsMonths } from "@/lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw, Play } from "lucide-react";
import { testAdequacy } from "@/lib/calculations/stochastic";
import type { TestAdequacyInputs, TestAdequacyResult } from "@/types/calculator";

export default function TestAdequacyPage() {
  const [inputs, setInputs] = useState<TestAdequacyInputs>({
    annualExpenditure: 1200000,
    retirementCorpus: 22800000,
    equityAllocation: 50,
    retirementPeriodMonths: 360,
    numSimulations: 1000,
    taxRate: 0,
  });

  const [result, setResult] = useState<TestAdequacyResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      const res = testAdequacy(
        inputs.annualExpenditure,
        inputs.retirementCorpus,
        inputs.equityAllocation,
        inputs.retirementPeriodMonths,
        inputs.numSimulations,
        inputs.taxRate || 0
      );
      setResult(res);
      setIsCalculating(false);
    }, 50);
  }, [inputs]);

  const simulationPaths = useMemo(() => {
    if (!result) return [];
    return result.simulations.slice(0, 30).map((sim, idx) => ({
      id: idx,
      data: sim.corpusPath
        .filter((_, i) => i % 12 === 0 || i === 0)
        .map((val, i) => ({ name: `Yr ${i}`, value: val })),
      success: sim.success,
    }));
  }, [result]);

  // One shared table (Yr 0..N × one column per simulated path) so Recharts
  // renders every line on the same axis with sequential ticks.
  const simulationChartData = useMemo(() => {
    if (!simulationPaths.length) return [];
    const years = Math.max(...simulationPaths.map((p) => p.data.length));
    const rows: Record<string, string | number | null>[] = [];
    for (let y = 0; y < years; y++) {
      const name = `Yr ${y}`;
      const row: Record<string, string | number | null> = { name };
      simulationPaths.forEach((path, idx) => {
        row[`p${idx}`] = path.data[y]?.value ?? null;
      });
      rows.push(row);
    }
    return rows;
  }, [simulationPaths]);

  const handleReset = () => {
    setInputs({
      annualExpenditure: 1200000,
      retirementCorpus: 22800000,
      equityAllocation: 50,
      retirementPeriodMonths: 360,
      numSimulations: 1000,
      taxRate: 0,
    });
    setResult(null);
  };

  const handleExample = () => {
    setInputs({
      annualExpenditure: 1200000,
      retirementCorpus: 22800000,
      equityAllocation: 50,
      retirementPeriodMonths: 360,
      numSimulations: 3000,
      taxRate: 12.5,
    });
  };

  return (
    <CalculatorLayout
      title="Test Adequacy"
      description="Check whether your existing retirement corpus is sufficient using Monte Carlo simulations."
      info="This simulation runs multiple scenarios based on historical market returns and inflation data. The results show how your retirement corpus might evolve over time under different market conditions. Adequacy is determined based on a failure rate of 5% or less."
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
              tooltip="The corpus amount you want to test for adequacy."
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
              value={inputs.retirementPeriodMonths}
              onChange={(v) =>
                setInputs((p) => ({ ...p, retirementPeriodMonths: v }))
              }
              min={12}
              max={600}
              step={12}
              suffix="mo"
            />

            <InputField
              label="Number of Simulations"
              value={inputs.numSimulations}
              onChange={(v) =>
                setInputs((p) => ({ ...p, numSimulations: v }))
              }
              min={100}
              max={10000}
              step={100}
            />

            <InputField
              label="Tax Rate"
              value={inputs.taxRate || 0}
              onChange={(v) => setInputs((p) => ({ ...p, taxRate: v }))}
              min={0}
              max={50}
              step={0.5}
              suffix="%"
            />

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCalculate}
                className="flex-1 gap-2"
                disabled={isCalculating}
              >
                <Play className="h-4 w-4" />
                Test Adequacy
              </Button>
              <Button variant="outline" onClick={handleExample} size="sm">
                Example
              </Button>
              <Button variant="ghost" onClick={handleReset} size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        result ? (
          <div className="space-y-6">
            {/* Simulation Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Simulation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{result.statistics.totalSimulations}</p>
                    <p className="text-sm text-muted-foreground">Total Simulations</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.statistics.successfulOutcomes}</p>
                    <p className="text-sm text-muted-foreground">Successful Outcomes</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-rose-500/10">
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{result.statistics.failedOutcomes}</p>
                    <p className="text-sm text-muted-foreground">Failed Outcomes</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.statistics.successRate.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-rose-500/10">
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{result.statistics.failureRate.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">Failure Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adequacy Result */}
            <div
              className={`rounded-xl border p-6 text-center ${
                result.isAdequate
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/20 bg-rose-500/5"
              }`}
            >
              <p className="text-3xl font-bold mb-2">
                {result.isAdequate ? "✅ Corpus is Adequate" : "⚠️ Corpus is Inadequate"}
              </p>
              <p className="text-muted-foreground">
                Failure rate: {result.statistics.failureRate.toFixed(2)}%
                {result.isAdequate
                  ? " — within acceptable range (≤5%)"
                  : " — exceeds the 5% threshold"}
              </p>
            </div>

            {/* Input Summary */}
            <SummaryGrid>
              <SummaryCard
                label="Input Corpus"
                value={formatCurrency(inputs.retirementCorpus, true)}
              />
              <SummaryCard
                label="Expenditure Cover"
                value={`${(inputs.retirementCorpus / inputs.annualExpenditure).toFixed(2)}x`}
                sublabel="Corpus ÷ Annual Expenditure"
              />
              <SummaryCard
                label="Safe Withdrawal Rate"
                value={`${((inputs.annualExpenditure / inputs.retirementCorpus) * 100).toFixed(2)}%`}
                sublabel="Annual withdrawal / Corpus"
              />
            </SummaryGrid>

            {/* Simulation Paths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Simulation Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={[0, "auto"]}
                        tickFormatter={(v) =>
                          v >= 1e7
                            ? `${(v / 1e7).toFixed(1)}Cr`
                            : v >= 1e5
                            ? `${(v / 1e5).toFixed(1)}L`
                            : v.toLocaleString("en-IN")
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      {simulationPaths.map((path) => (
                        <Line
                          key={path.id}
                          type="monotone"
                          dataKey={`p${path.id}`}
                          stroke={path.success ? "#10b981" : "#ef4444"}
                          strokeWidth={0.8}
                          dot={false}
                          opacity={0.35}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-emerald-500" />
                    <span className="text-muted-foreground">Successful</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-rose-500" />
                    <span className="text-muted-foreground">Failed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-1">No results yet</p>
              <p className="text-sm">
                Enter your corpus and click Test Adequacy to see results.
              </p>
            </div>
          </Card>
        )
      }
    />
  );
}
