"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency } from "@/lib/format";
import { calculateLifeInsuranceNeed } from "@/lib/financial/insurance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b"];

export default function LifeInsuranceNeedPage() {
  const [annualIncome, setAnnualIncome] = useState(1000000);
  const [workingYearsLeft, setWorkingYearsLeft] = useState(25);
  const [outstandingDebt, setOutstandingDebt] = useState(2000000);
  const [childEducationFund, setChildEducationFund] = useState(2500000);
  const [emergencyFund, setEmergencyFund] = useState(500000);
  const [existingCoverage, setExistingCoverage] = useState(2000000);
  const [inflation, setInflation] = useState(6);
  const [discountRate, setDiscountRate] = useState(8);

  const result = useMemo(
    () => calculateLifeInsuranceNeed(annualIncome, workingYearsLeft, outstandingDebt, childEducationFund, emergencyFund, existingCoverage, inflation, discountRate),
    [annualIncome, workingYearsLeft, outstandingDebt, childEducationFund, emergencyFund, existingCoverage, inflation, discountRate]
  );

  const pieData = [
    { name: "Income Replacement", value: Math.round(result.incomeReplacement) },
    { name: "Debt Coverage", value: Math.round(result.debtCoverage) },
    { name: "Child Education", value: Math.round(result.childEducation) },
    { name: "Emergency Fund", value: Math.round(result.emergencyFund) },
  ];

  return (
    <CalculatorLayout
      title="Life Insurance Need Calculator"
      description="Calculate how much life insurance coverage you actually need."
      info="This calculator uses the Human Life Value (HLV) approach to estimate your total insurance need based on income replacement, debt coverage, child education, and emergency fund requirements."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Annual Income" value={annualIncome} onChange={setAnnualIncome} min={100000} max={100000000} step={100000} prefix="₹" />
            <SliderField label="Working Years Left" value={workingYearsLeft} onChange={setWorkingYearsLeft} min={1} max={40} step={1} suffix=" yr" />
            <InputField label="Outstanding Debt" value={outstandingDebt} onChange={setOutstandingDebt} min={0} max={100000000} step={100000} prefix="₹" />
            <InputField label="Child Education Fund" value={childEducationFund} onChange={setChildEducationFund} min={0} max={50000000} step={100000} prefix="₹" />
            <InputField label="Emergency Fund" value={emergencyFund} onChange={setEmergencyFund} min={0} max={20000000} step={100000} prefix="₹" />
            <InputField label="Existing Coverage" value={existingCoverage} onChange={setExistingCoverage} min={0} max={100000000} step={100000} prefix="₹" />
            <SliderField label="Inflation" value={inflation} onChange={setInflation} min={0} max={15} step={0.5} suffix="%" />
            <SliderField label="Discount Rate" value={discountRate} onChange={setDiscountRate} min={1} max={15} step={0.5} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Human Life Value" value={formatCurrency(result.humanLifeValue, true)} />
            <SummaryCard label="Total Insurance Need" value={formatCurrency(result.totalNeed, true)} variant={result.coverageGap > 0 ? "warning" : "success"} />
            <SummaryCard label="Existing Coverage" value={formatCurrency(result.existingCoverage, true)} />
            <SummaryCard label="Coverage Gap" value={formatCurrency(result.coverageGap, true)} variant={result.coverageGap > 0 ? "danger" : "success"} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Need Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
