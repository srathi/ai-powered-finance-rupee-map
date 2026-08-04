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
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { RotateCcw, Play } from "lucide-react";
import { calculateStochasticCorpus } from "@/lib/calculations/stochastic";
import type { StochasticInputs, StochasticResult } from "@/types/calculator";

export default function StochasticPage() {
  const [inputs, setInputs] = useState<StochasticInputs>({
    annualExpenditure: 1200000,
    equityAllocation: 50,
    retirementPeriodMonths: 360,
    numSimulations: 1000,
    taxRate: 0,
  });

  const [result, setResult] = useState<StochasticResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const res = calculateStochasticCorpus(inputs);
      setResult(res);
      setIsCalculating(false);
    }, 50);
  }, [inputs]);

  const percentileChartData = useMemo(() => {
    if (!result) return [];
    return result.percentileData
      .filter((d) => d.month % 12 === 0 || d.month === 0)
      .map((d) => ({
        name: `Yr ${Math.floor(d.month / 12)}`,
        "95th": d.p95,
        "75th": d.p75,
        "Median": d.p50,
        "25th": d.p25,
        "5th": d.p5,
      }));
  }, [result]);

  const simulationPaths = useMemo(() => {
    if (!result) return [];
    return result.simulations.slice(0, 20).map((sim, idx) => ({
      id: idx,
      data: sim.corpusPath
        .filter((_, i) => i % 12 === 0 || i === 0)
        .map((val, i) => ({ name: `Yr ${i}`, value: val })),
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
      equityAllocation: 50,
      retirementPeriodMonths: 360,
      numSimulations: 1000,
    });
    setResult(null);
  };

  return (
    <CalculatorLayout
      title="Stochastic Calculator"
      description="Calculate the required retirement corpus using Monte Carlo simulations with historical Indian market data."
      info="The Stochastic Approach uses Monte Carlo simulation with historical Sensex equity returns, 1-3 year FD rates for debt, and CPI inflation data. It runs thousands of randomised scenarios to find the corpus that has a ~5% failure rate, accounting for Sequence of Return Risk."
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
              tooltip="Current annual expenditure, or estimated first-year retirement expenses."
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
              tooltip="Percentage of your portfolio allocated to equity."
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
              tooltip="How long your retirement corpus needs to last (in months)."
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
              tooltip="More simulations = more accurate results but slower computation."
            />

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCalculate}
                className="flex-1 gap-2"
                disabled={isCalculating}
              >
                <Play className="h-4 w-4" />
                Run Simulation
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

            {/* Required Corpus Result */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Required Retirement Corpus
              </p>
              <p className="text-4xl font-bold text-primary mb-3">
                {formatCurrency(result.requiredCorpus, true)}
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                For your annual expenditure of {formatCurrency(inputs.annualExpenditure, true)}, 
                you would need a retirement corpus of approximately{" "}
                <span className="font-semibold">{(result.requiredCorpus / 1e7).toFixed(2)} crores</span> to achieve 
                a 95% success rate.
              </p>
              <div className="flex justify-center gap-8 mt-4">
                <div>
                  <p className="text-lg font-bold">{result.expenditureCoverRatio.toFixed(2)}x</p>
                  <p className="text-sm text-muted-foreground">Expenditure Cover</p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {((inputs.annualExpenditure / result.requiredCorpus) * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Safe Withdrawal Rate</p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                There are three key strengths of the Stochastic Approach. The first is that it does 
                not provide a single outcome, but a range of possible outcomes, which enables you to 
                better understand the risk of running out of money in retirement. The second is that 
                it factors in the Sequence of Return Risk. The third is that it liberates us from 
                making predictions about how asset returns and inflation will fare in the future. 
                So you do not need to provide an input for future equity return, debt return or inflation.
              </p>
            </div>

            {/* Percentile Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Corpus Percentile Ranges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={percentileChartData}>
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
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="95th"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.1}
                        strokeWidth={1}
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="75th"
                        stroke="#4ade80"
                        fill="#4ade80"
                        fillOpacity={0.15}
                        strokeWidth={1}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Median"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="25th"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.15}
                        strokeWidth={1}
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="5th"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.1}
                        strokeWidth={1}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Simulation Paths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Sample Simulation Paths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                          stroke={`hsl(${path.id * 18}, 60%, 50%)`}
                          strokeWidth={0.5}
                          dot={false}
                          opacity={0.4}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Simulation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Simulations
                    </p>
                    <p className="text-xl font-bold">
                      {result.statistics.totalSimulations.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Successful Outcomes
                    </p>
                    <p className="text-xl font-bold text-emerald-600">
                      {result.statistics.successfulOutcomes.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Failed Outcomes
                    </p>
                    <p className="text-xl font-bold text-rose-600">
                      {result.statistics.failedOutcomes.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Std Dev</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(result.statistics.stdDevCorpus, true)}
                    </p>
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
                Enter your inputs and click Run Simulation to see results.
              </p>
            </div>
          </Card>
        )
      }
    />
  );
}
