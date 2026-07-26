"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency } from "@/lib/format";
import { presentValue } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PresentValuePage() {
  const [futureValueAmt, setFutureValueAmt] = useState(1000000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);

  const pv = useMemo(() => presentValue(futureValueAmt, rate, years), [futureValueAmt, rate, years]);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({ name: `Yr ${y}`, value: Math.round(presentValue(futureValueAmt, rate, y)) });
    }
    return data;
  }, [futureValueAmt, rate, years]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const pvNow = presentValue(futureValueAmt, rate, y);
      data.push({ year: y, presentValue: Math.round(pvNow), discountFactor: (1 / Math.pow(1 + rate / 100, y)).toFixed(4) });
    }
    return data;
  }, [futureValueAmt, rate, years]);

  return (
    <CalculatorLayout
      title="Present Value Calculator"
      description="Calculate the present value of a future amount."
      info="Present Value = FV / (1 + r)^t, where FV is future value, r is annual rate, and t is time in years. This tells you how much a future amount is worth today."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Future Value" value={futureValueAmt} onChange={setFutureValueAmt} min={100} max={100000000} step={1000} prefix="₹" />
            <SliderField label="Annual Discount Rate" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Time Period" value={years} onChange={setYears} min={1} max={50} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Future Value" value={formatCurrency(futureValueAmt, true)} />
            <SummaryCard label="Present Value" value={formatCurrency(Math.round(pv), true)} variant="success" />
            <SummaryCard label="Discount" value={formatCurrency(Math.round(futureValueAmt - pv), true)} sublabel={`${((1 - pv / futureValueAmt) * 100).toFixed(1)}% reduction`} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Present Value Over Time</CardTitle></CardHeader>
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
          <ResultsTable columns={[{ key: "year", label: "Year" }, { key: "presentValue", label: "Present Value", format: (v) => formatCurrency(v), sortable: true }, { key: "discountFactor", label: "Discount Factor" }]} data={tableData} title="Year-wise Discounting" />
        </div>
      }
    />
  );
}
