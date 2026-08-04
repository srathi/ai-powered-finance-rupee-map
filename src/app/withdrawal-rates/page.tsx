"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { SliderField, InputField } from "@/components/input-controls";
import { formatPercent, formatCurrency } from "@/lib/format";
import { computeSWRFormula } from "@/lib/calculations/stochastic";
import { historicalReturns } from "@/data/historical-returns";
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

interface RobustnessResult {
  passRate: number;
  simulationPaths: { name: string; value: number }[][];
}

export default function WithdrawalRatesPage() {
  const [equityAllocation, setEquityAllocation] = useState(50);
  const [retirementPeriodYears, setRetirementPeriodYears] = useState(30);
  const [corpus, setCorpus] = useState(10000000);

  const swr = useMemo(
    () => computeSWRFormula(equityAllocation, retirementPeriodYears),
    [equityAllocation, retirementPeriodYears]
  );

  const annualWithdrawal = (swr / 100) * corpus;
  const monthlyWithdrawal = annualWithdrawal / 12;

  const [robustness, setRobustness] = useState<RobustnessResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRobustness = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      const monthlyWithdrawal = (swr / 100) * corpus / 12;
      const months = retirementPeriodYears * 12;
      const equityPct = equityAllocation / 100;
      const debtPct = 1 - equityPct;

      let successCount = 0;
      const totalSims = 200;
      const paths: { name: string; value: number }[][] = [];

      for (let sim = 0; sim < totalSims; sim++) {
        let seed = sim * 1000 + 42;
        const rand = () => {
          seed = (seed * 16807) % 2147483647;
          return seed / 2147483647;
        };

        const shuffled = [...historicalReturns];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        let c = corpus;
        const path: { name: string; value: number }[] = [
          { name: "Yr 0", value: c },
        ];
        let failed = false;
        let cumInf = 1;

        for (let m = 0; m < months; m++) {
          const data = shuffled[m % shuffled.length];
          cumInf *= (1 + data.inflation / 100 / 12);
          const expense = monthlyWithdrawal * cumInf;
          c = c - expense;
          if (c <= 0) {
            c = 0;
            failed = true;
            // Record the depletion year so the path visibly drops to zero
            // (also makes the green/red coloring accurate for the chart).
            path.push({ name: `Yr ${Math.floor(m / 12) + 1}`, value: 0 });
            break;
          }
          const eg = c * equityPct * (data.equityReturn / 100 / 12);
          const dg = c * debtPct * (data.debtReturn / 100 / 12);
          c = c + eg + dg;
          if (m % 12 === 0) {
            path.push({ name: `Yr ${Math.floor(m / 12) + 1}`, value: c });
          }
        }

        if (!failed && c > 0) successCount++;
        if (sim < 30) paths.push(path);
      }

      setRobustness({
        passRate: (successCount / totalSims) * 100,
        simulationPaths: paths,
      });
      setIsCalculating(false);
    }, 50);
  }, [swr, corpus, equityAllocation, retirementPeriodYears]);

  const swrChartData = useMemo(() => {
    const data = [];
    for (let eq = 0; eq <= 100; eq += 5) {
      data.push({
        name: `${eq}%`,
        "10yr": computeSWRFormula(eq, 10),
        "20yr": computeSWRFormula(eq, 20),
        "30yr": computeSWRFormula(eq, 30),
        "40yr": computeSWRFormula(eq, 40),
      });
    }
    return data;
  }, []);

  // One shared table (Yr 0..N × one column per simulated path) so Recharts
  // renders every line on the same axis. Depleted paths stop at the year
  // they hit zero (null for later years) instead of drawing a fake tail.
  const simulationChartData = useMemo(() => {
    if (!robustness) return [];
    const rows: Record<string, string | number | null>[] = [];
    const totalYears = retirementPeriodYears;
    for (let y = 0; y <= totalYears; y++) {
      const name = y === 0 ? "Start" : `Yr ${y}`;
      const row: Record<string, string | number | null> = { name };
      robustness.simulationPaths.forEach((path, idx) => {
        row[`p${idx}`] = path.find((pt) => pt.name === name)?.value ?? null;
      });
      rows.push(row);
    }
    return rows;
  }, [robustness, retirementPeriodYears]);

  return (
    <CalculatorLayout
      title="Withdrawal Rates"
      description="Find the Safe Withdrawal Rate (SWR) for your retirement portfolio."
      info="The Safe Withdrawal Rate (SWR) is the maximum percentage of your retirement corpus you can withdraw in the first year, with the withdrawal amount increased for inflation each subsequent year. This formula is derived from simulations across every combination of equity allocation (0–100%) and retirement horizon (10–100 years), fitted with R² = 0.996. Source: Saraogi, Ravi (December 2025), SSRN."
      isCalculating={isCalculating}
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputField
              label="Retirement Corpus"
              value={corpus}
              onChange={setCorpus}
              min={100000}
              max={1000000000}
              step={500000}
              prefix="₹"
            />

            <SliderField
              label="Equity Allocation"
              value={equityAllocation}
              onChange={setEquityAllocation}
              min={0}
              max={100}
              step={1}
            />

            <SliderField
              label="Retirement Period"
              value={retirementPeriodYears}
              onChange={(v) => setRetirementPeriodYears(v)}
              min={10}
              max={50}
              step={1}
              suffix=" yr"
            />

            <div className="pt-2">
              <Button
                onClick={handleRobustness}
                className="w-full gap-2"
                disabled={isCalculating}
              >
                <Play className="h-4 w-4" />
                Check Robustness
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Safe Withdrawal Rate
            </p>
            <p className="text-5xl font-bold text-primary">
              {formatPercent(swr, 2)}
            </p>
            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              Maximum annual withdrawal (as % of initial corpus) with 95%
              success probability over {retirementPeriodYears} years at{" "}
              {equityAllocation}% equity.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
              <SummaryCard
                label="Annual Withdrawal"
                value={formatCurrency(Math.round(annualWithdrawal))}
                variant="success"
              />
              <SummaryCard
                label="Monthly Withdrawal"
                value={formatCurrency(Math.round(monthlyWithdrawal))}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                SWR Across Equity Allocations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={swrChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `${v.toFixed(1)}%`}
                    />
                    <Tooltip
                      formatter={(value) => `${Number(value).toFixed(2)}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="10yr"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      dot={false}
                      name="10 years"
                    />
                    <Line
                      type="monotone"
                      dataKey="20yr"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      dot={false}
                      name="20 years"
                    />
                    <Line
                      type="monotone"
                      dataKey="30yr"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      name="30 years"
                    />
                    <Line
                      type="monotone"
                      dataKey="40yr"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      dot={false}
                      name="40 years"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {robustness && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Robustness Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <SummaryCard
                    label="Pass Rate"
                    value={formatPercent(robustness.passRate, 1)}
                    variant={
                      robustness.passRate >= 90 ? "success" : "warning"
                    }
                  />
                  <SummaryCard
                    label="Result"
                    value={
                      robustness.passRate >= 90 ? "Robust" : "Not Robust"
                    }
                    variant={
                      robustness.passRate >= 90 ? "success" : "warning"
                    }
                    sublabel={`Based on 200 simulations with ${formatCurrency(corpus)} corpus`}
                  />
                </div>
                <div className="flex items-center justify-center gap-5 mb-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 rounded bg-emerald-500" />
                    Corpus survived
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 rounded bg-rose-500" />
                    Corpus depleted
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 rounded border-t-2 border-dashed border-amber-500" />
                    Initial corpus
                  </span>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={simulationChartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
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
                      <ReferenceLine
                        y={corpus}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        strokeOpacity={0.6}
                      />
                      {robustness.simulationPaths.map((path, idx) => (
                        <Line
                          key={idx}
                          type="monotone"
                          dataKey={`p${idx}`}
                          connectNulls={false}
                          dot={false}
                          stroke={
                            path[path.length - 1].value > 0
                              ? "#10b981"
                              : "#ef4444"
                          }
                          strokeWidth={1}
                          opacity={0.5}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      }
    />
  );
}
