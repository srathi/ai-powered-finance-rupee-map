"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency } from "@/lib/format";
import { futureValue } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FutureValuePage() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);

  const fv = useMemo(() => futureValue(principal, rate, years, 1), [principal, rate, years]);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({ name: `Yr ${y}`, value: Math.round(futureValue(principal, rate, y, 1)) });
    }
    return data;
  }, [principal, rate, years]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const v = futureValue(principal, rate, y, 1);
      data.push({ year: y, value: Math.round(v), gain: Math.round(v - principal) });
    }
    return data;
  }, [principal, rate, years]);

  return (
    <CalculatorLayout
      title="Future Value Calculator"
      description="Calculate what your investment will be worth in the future."
      info="Future Value = PV × (1 + r)^t, where PV is present value, r is annual rate, and t is time in years. This uses annual compounding."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Present Value" value={principal} onChange={setPrincipal} min={100} max={100000000} step={1000} prefix="₹" />
            <SliderField label="Annual Rate" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Time Period" value={years} onChange={setYears} min={1} max={50} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Present Value" value={formatCurrency(principal, true)} />
            <SummaryCard label="Future Value" value={formatCurrency(Math.round(fv), true)} variant="success" />
            <SummaryCard label="Total Gain" value={formatCurrency(Math.round(fv - principal), true)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Growth</CardTitle></CardHeader>
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
          <ResultsTable columns={[{ key: "year", label: "Year" }, { key: "value", label: "Future Value", format: (v) => formatCurrency(v), sortable: true }, { key: "gain", label: "Gain", format: (v) => formatCurrency(v), sortable: true }]} data={tableData} title="Year-wise Breakdown" />
        </div>
      }
    />
  );
}
