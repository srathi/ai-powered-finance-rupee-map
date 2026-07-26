"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { emi as calcEmi } from "@/lib/financial/loan";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function LoanAffordabilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [incomeGrowth, setIncomeGrowth] = useState(5);

  const tenureMonths = tenureYears * 12;

  const result = useMemo(() => {
    const surplus = monthlyIncome - monthlyExpenses;
    const affordableEmi = surplus * 0.5; // 50% of surplus as safe EMI
    const r = annualRate / 100 / 12;
    const maxLoan =
      r === 0
        ? affordableEmi * tenureMonths
        : (affordableEmi * (Math.pow(1 + r, tenureMonths) - 1)) /
          (r * Math.pow(1 + r, tenureMonths));
    const emiToIncomeRatio = monthlyIncome > 0 ? (affordableEmi / monthlyIncome) * 100 : 0;
    const surplusAfterEmi = surplus - affordableEmi;
    return { surplus, affordableEmi, maxLoan, emiToIncomeRatio, surplusAfterEmi };
  }, [monthlyIncome, monthlyExpenses, annualRate, tenureMonths]);

  const growthData = useMemo(() => {
    const data: { year: number; income: number; emi: number; affordableLoan: number }[] = [];
    for (let y = 0; y <= tenureYears; y++) {
      const grownIncome = monthlyIncome * Math.pow(1 + incomeGrowth / 100, y);
      const grownSurplus = grownIncome - monthlyExpenses;
      const emi = grownSurplus * 0.5;
      const r = annualRate / 100 / 12;
      const remaining = tenureMonths - y * 12;
      const loan =
        remaining > 0 && emi > 0
          ? r === 0
            ? emi * remaining
            : (emi * (Math.pow(1 + r, remaining) - 1)) / (r * Math.pow(1 + r, remaining))
          : 0;
      data.push({
        year: y,
        income: Math.round(grownIncome),
        emi: Math.round(emi),
        affordableLoan: Math.round(loan),
      });
    }
    return data;
  }, [monthlyIncome, monthlyExpenses, annualRate, tenureMonths, tenureYears, incomeGrowth]);

  return (
    <CalculatorLayout
      title="Loan Affordability Calculator"
      description="Determine the maximum loan you can safely afford based on your income, expenses, and expected growth."
      info="This calculator considers your surplus income (income minus expenses) and recommends an affordable EMI as 50% of your surplus. It also shows how your affordability improves with expected income growth over time."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Income & Expenses</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Monthly Income" value={monthlyIncome} onChange={setMonthlyIncome} min={10000} max={10000000} step={5000} prefix="₹" />
            <InputField label="Monthly Expenses" value={monthlyExpenses} onChange={setMonthlyExpenses} min={0} max={10000000} step={5000} prefix="₹" />
            <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={1} max={20} step={0.1} suffix="%" />
            <SliderField label="Loan Tenure" value={tenureYears} onChange={setTenureYears} min={1} max={30} step={1} suffix=" yr" />
            <SliderField label="Annual Income Growth" value={incomeGrowth} onChange={setIncomeGrowth} min={0} max={20} step={0.5} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Affordable EMI" value={formatCurrency(Math.round(result.affordableEmi))} variant="success" />
            <SummaryCard label="Max Loan Amount" value={formatCurrency(Math.round(result.maxLoan), true)} variant="default" />
            <SummaryCard label="Monthly Surplus" value={formatCurrency(Math.round(result.surplus))} sublabel="Income - Expenses" />
            <SummaryCard label="EMI to Income Ratio" value={formatPercent(result.emiToIncomeRatio, 1)} variant={result.emiToIncomeRatio > 50 ? "danger" : "success"} />
            <SummaryCard label="Surplus After EMI" value={formatCurrency(Math.round(result.surplusAfterEmi))} variant={result.surplusAfterEmi > 0 ? "success" : "danger"} />
            <SummaryCard label="Income Growth Impact" value={`${formatCurrency(Math.round(growthData[tenureYears]?.affordableLoan || 0), true)}`} sublabel={`Loan capacity after ${tenureYears}y growth`} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Affordability Over Time (with Income Growth)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "bottom", offset: -5, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Monthly Income" />
                    <Bar dataKey="emi" fill="hsl(var(--chart-5))" name="Affordable EMI" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Loan Capacity Growth</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="affordableLoan" stroke="hsl(var(--chart-2))" name="Max Affordable Loan" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
