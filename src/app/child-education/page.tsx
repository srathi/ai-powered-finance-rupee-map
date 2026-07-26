"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency } from "@/lib/format";
import { calculateChildEducation } from "@/lib/financial/insurance";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ChildEducationPage() {
  const [childAge, setChildAge] = useState(5);
  const [educationStartAge, setEducationStartAge] = useState(18);
  const [currentCost, setCurrentCost] = useState(200000);
  const [educationYears, setEducationYears] = useState(4);
  const [inflation, setInflation] = useState(10);
  const [returnRate, setReturnRate] = useState(12);

  const result = useMemo(
    () => calculateChildEducation(childAge, educationStartAge, currentCost, educationYears, inflation, returnRate),
    [childAge, educationStartAge, currentCost, educationYears, inflation, returnRate]
  );

  const chartData = result.yearlySchedule.map((r) => ({
    name: `Age ${r.age}`,
    corpus: r.corpus,
    cost: r.costOfEducation,
  }));

  return (
    <CalculatorLayout
      title="Child Education Planning Calculator"
      description="Plan your child's education and calculate the monthly investment needed."
      info="Education costs inflate rapidly (typically 10-12% annually). Start early with a SIP to build the required corpus. This calculator shows how much you need to invest monthly."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <SliderField label="Child Current Age" value={childAge} onChange={setChildAge} min={1} max={17} step={1} suffix=" yr" />
            <SliderField label="Education Start Age" value={educationStartAge} onChange={setEducationStartAge} min={childAge + 1} max={25} step={1} suffix=" yr" />
            <InputField label="Current Annual Cost" value={currentCost} onChange={setCurrentCost} min={50000} max={10000000} step={50000} prefix="₹" />
            <SliderField label="Years of Education" value={educationYears} onChange={setEducationYears} min={1} max={8} step={1} suffix=" yr" />
            <SliderField label="Education Inflation" value={inflation} onChange={setInflation} min={0} max={20} step={0.5} suffix="%" />
            <SliderField label="Expected Return" value={returnRate} onChange={setReturnRate} min={1} max={20} step={0.5} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Future Education Cost" value={formatCurrency(result.futureCost, true)} />
            <SummaryCard label="Monthly SIP Required" value={formatCurrency(Math.round(result.monthlyInvestmentRequired))} variant="warning" />
            <SummaryCard label="Lumpsum Required" value={formatCurrency(result.lumpsumRequired, true)} />
            <SummaryCard label="Total Investment" value={formatCurrency(result.totalInvestment, true)} />
            <SummaryCard label="Total Returns" value={formatCurrency(result.totalReturns, true)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Corpus Growth vs Education Cost</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="corpus" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Investment Corpus" />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="Education Cost" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "age", label: "Age" },
              { key: "costOfEducation", label: "Annual Cost", format: (v) => formatCurrency(v), sortable: true },
              { key: "corpus", label: "Corpus", format: (v) => formatCurrency(v), sortable: true },
              { key: "investment", label: "Annual Investment", format: (v) => formatCurrency(v) },
            ]}
            data={result.yearlySchedule}
            title="Year-wise Breakdown"
          />
        </div>
      }
    />
  );
}
