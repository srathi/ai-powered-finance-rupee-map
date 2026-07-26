"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency } from "@/lib/format";
import { calculateTermInsuranceNeed } from "@/lib/financial/insurance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function TermInsurancePage() {
  const [annualIncome, setAnnualIncome] = useState(1000000);
  const [yearsUntilRetirement, setYearsUntilRetirement] = useState(25);
  const [outstandingLoans, setOutstandingLoans] = useState(2000000);
  const [childrenEducationYears, setChildrenEducationYears] = useState(10);
  const [monthlyExpenses, setMonthlyExpenses] = useState(40000);
  const [inflation, setInflation] = useState(6);
  const [returnRate, setReturnRate] = useState(8);

  const totalNeed = useMemo(
    () => calculateTermInsuranceNeed(annualIncome, yearsUntilRetirement, outstandingLoans, childrenEducationYears, monthlyExpenses, inflation, returnRate),
    [annualIncome, yearsUntilRetirement, outstandingLoans, childrenEducationYears, monthlyExpenses, inflation, returnRate]
  );

  const breakdown = useMemo(() => {
    const incomeReplacement = (() => {
      let sum = 0;
      for (let y = 1; y <= yearsUntilRetirement; y++) {
        sum += annualIncome * Math.pow(1 + inflation / 100, y) / Math.pow(1 + returnRate / 100, y);
      }
      return sum;
    })();
    const educationCost = (() => {
      let sum = 0;
      for (let y = 1; y <= childrenEducationYears; y++) {
        sum += 200000 * Math.pow(1 + inflation / 100, y) / Math.pow(1 + returnRate / 100, y);
      }
      return sum;
    })();
    return [
      { name: "Income Replacement", value: Math.round(incomeReplacement) },
      { name: "Education Fund", value: Math.round(educationCost) },
      { name: "Emergency Fund", value: Math.round(monthlyExpenses * 60) },
      { name: "Outstanding Loans", value: Math.round(outstandingLoans) },
    ];
  }, [annualIncome, yearsUntilRetirement, outstandingLoans, childrenEducationYears, monthlyExpenses, inflation, returnRate]);

  return (
    <CalculatorLayout
      title="Term Insurance Need Calculator"
      description="Calculate the ideal term insurance coverage for your family."
      info="Term insurance should cover your income replacement needs, children's education, outstanding loans, and emergency expenses. This calculator uses present value of future income to determine the right coverage."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Annual Income" value={annualIncome} onChange={setAnnualIncome} min={100000} max={100000000} step={100000} prefix="₹" />
            <SliderField label="Years Until Retirement" value={yearsUntilRetirement} onChange={setYearsUntilRetirement} min={1} max={40} step={1} suffix=" yr" />
            <InputField label="Outstanding Loans" value={outstandingLoans} onChange={setOutstandingLoans} min={0} max={100000000} step={100000} prefix="₹" />
            <SliderField label="Children Education Years" value={childrenEducationYears} onChange={setChildrenEducationYears} min={0} max={20} step={1} suffix=" yr" />
            <InputField label="Monthly Expenses" value={monthlyExpenses} onChange={setMonthlyExpenses} min={10000} max={1000000} step={5000} prefix="₹" />
            <SliderField label="Inflation" value={inflation} onChange={setInflation} min={0} max={15} step={0.5} suffix="%" />
            <SliderField label="Expected Return" value={returnRate} onChange={setReturnRate} min={1} max={15} step={0.5} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Recommended Sum Assured" value={formatCurrency(totalNeed, true)} variant="success" />
            <SummaryCard label="Coverage per Lakh" value={formatCurrency(totalNeed / 100000 * 100)} sublabel="Approximate annual premium context" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Need Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : `${(v / 1e5).toFixed(0)}L`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
