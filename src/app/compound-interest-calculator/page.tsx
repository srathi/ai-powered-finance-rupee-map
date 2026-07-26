"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency } from "@/lib/format";
import { futureValue, compoundInterest } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function CompoundInterestPage() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);
  const [compounding, setCompounding] = useState(12);

  const result = useMemo(() => {
    const fv = futureValue(principal, rate, years, compounding);
    const ci = compoundInterest(principal, rate, years, compounding);
    return { futureValue: fv, compoundInterest: ci };
  }, [principal, rate, years, compounding]);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({ name: `Yr ${y}`, value: Math.round(futureValue(principal, rate, y, compounding)) });
    }
    return data;
  }, [principal, rate, years, compounding]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const fv = futureValue(principal, rate, y, compounding);
      const prevFv = futureValue(principal, rate, y - 1, compounding);
      data.push({ year: y, totalValue: Math.round(fv), interest: Math.round(fv - prevFv), cumulativeInterest: Math.round(fv - principal) });
    }
    return data;
  }, [principal, rate, years, compounding]);

  return (
    <CalculatorLayout
      title="Compound Interest Calculator"
      description="Calculate compound interest with different compounding frequencies."
      info="Compound Interest = P × (1 + r/n)^(nt), where P is principal, r is annual rate, n is compounding frequency, and t is time in years."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Principal Amount" value={principal} onChange={setPrincipal} min={100} max={100000000} step={1000} prefix="₹" />
            <SliderField label="Annual Interest Rate" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Time Period" value={years} onChange={setYears} min={1} max={50} step={1} suffix=" yr" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Compounding Frequency</label>
              <div className="flex gap-1">
                {[{ label: "Annual", val: 1 }, { label: "Half-yr", val: 2 }, { label: "Quarterly", val: 4 }, { label: "Monthly", val: 12 }].map((opt) => (
                  <Button key={opt.val} variant={compounding === opt.val ? "default" : "outline"} size="sm" className="flex-1 text-xs" onClick={() => setCompounding(opt.val)}>{opt.label}</Button>
                ))}
              </div>
            </div>
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Principal" value={formatCurrency(principal, true)} />
            <SummaryCard label="Compound Interest" value={formatCurrency(Math.round(result.compoundInterest), true)} variant="success" />
            <SummaryCard label="Total Amount" value={formatCurrency(Math.round(result.futureValue), true)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Growth Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "totalValue", label: "Total Value", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Year Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "cumulativeInterest", label: "Cumulative Interest", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
          />
        </div>
      }
    />
  );
}
