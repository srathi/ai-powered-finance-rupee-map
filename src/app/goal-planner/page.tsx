"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency } from "@/lib/format";
import { futureValue, futureValueOfAnnuity, inflationAdjustedValue } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function GoalPlannerPage() {
  const [targetAmount, setTargetAmount] = useState(5000000);
  const [currentSavings, setCurrentSavings] = useState(1000000);
  const [yearsToGoal, setYearsToGoal] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);

  const result = useMemo(() => {
    const months = yearsToGoal * 12;
    const adjustedTarget = inflationAdjustedValue(targetAmount, inflation, yearsToGoal);
    const fvCurrentSavings = futureValue(currentSavings, expectedReturn, yearsToGoal);
    const gap = Math.max(0, adjustedTarget - fvCurrentSavings);
    const r = expectedReturn / 100 / 12;
    const monthlySipNeeded = r > 0 && gap > 0 ? (gap * r) / (Math.pow(1 + r, months) - 1) : gap > 0 ? gap / months : 0;
    const totalSipInvestment = monthlySipNeeded * months;

    const chartData = [];
    let sipCorpus = 0;
    for (let y = 0; y <= yearsToGoal; y++) {
      const savingsVal = futureValue(currentSavings, expectedReturn, y);
      if (y > 0) {
        sipCorpus = sipCorpus * (1 + expectedReturn / 100) + monthlySipNeeded * 12;
      }
      chartData.push({
        name: `Yr ${y}`,
        savings: Math.round(savingsVal),
        sip: Math.round(sipCorpus),
        target: Math.round(inflationAdjustedValue(targetAmount, inflation, y)),
      });
    }

    return { adjustedTarget, fvCurrentSavings, gap, monthlySipNeeded, totalSipInvestment, chartData };
  }, [targetAmount, currentSavings, yearsToGoal, expectedReturn, inflation]);

  return (
    <CalculatorLayout
      title="Goal Planner"
      description="Plan your financial goals and calculate the monthly investment needed."
      info="Enter your target amount, current savings, and expected returns. The calculator adjusts for inflation and shows how much you need to invest monthly to reach your goal."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Target Amount" value={targetAmount} onChange={setTargetAmount} min={100000} max={1000000000} step={100000} prefix="₹" />
            <InputField label="Current Savings" value={currentSavings} onChange={setCurrentSavings} min={0} max={1000000000} step={10000} prefix="₹" />
            <SliderField label="Years to Goal" value={yearsToGoal} onChange={setYearsToGoal} min={1} max={30} step={1} suffix=" yr" />
            <SliderField label="Expected Return" value={expectedReturn} onChange={setExpectedReturn} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Inflation" value={inflation} onChange={setInflation} min={0} max={15} step={0.5} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Inflation-Adjusted Target" value={formatCurrency(result.adjustedTarget, true)} />
            <SummaryCard label="Monthly SIP Needed" value={formatCurrency(Math.round(result.monthlySipNeeded))} variant={result.monthlySipNeeded > 0 ? "warning" : "success"} />
            <SummaryCard label="Current Savings Value" value={formatCurrency(result.fvCurrentSavings, true)} />
            <SummaryCard label="Gap to Fill" value={formatCurrency(result.gap, true)} variant={result.gap > 0 ? "warning" : "success"} />
            <SummaryCard label="Total SIP Investment" value={formatCurrency(result.totalSipInvestment, true)} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Corpus Growth</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="savings" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Current Savings" />
                    <Area type="monotone" dataKey="sip" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="SIP Corpus" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
