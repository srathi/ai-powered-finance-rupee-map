"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency } from "@/lib/format";
import { simpleInterest } from "@/lib/financial/math";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function SimpleInterestPage() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    const si = simpleInterest(principal, rate, years);
    return { interest: si, total: principal + si };
  }, [principal, rate, years]);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const si = simpleInterest(principal, rate, y);
      data.push({ name: `Yr ${y}`, principal, interest: Math.round(si), total: Math.round(principal + si) });
    }
    return data;
  }, [principal, rate, years]);

  return (
    <CalculatorLayout
      title="Simple Interest Calculator"
      description="Calculate simple interest on your investment or loan."
      info="Simple Interest = P × r × t, where P is principal, r is annual rate (decimal), and t is time in years. Unlike compound interest, simple interest is calculated only on the original principal."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Principal Amount" value={principal} onChange={setPrincipal} min={100} max={100000000} step={1000} prefix="₹" />
            <SliderField label="Annual Interest Rate" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Time Period" value={years} onChange={setYears} min={1} max={30} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Principal" value={formatCurrency(principal, true)} />
            <SummaryCard label="Simple Interest" value={formatCurrency(Math.round(result.interest), true)} variant="success" />
            <SummaryCard label="Total Amount" value={formatCurrency(Math.round(result.total), true)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Year-wise Growth</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="principal" stackId="1" fill="hsl(var(--chart-2))" name="Principal" />
                    <Bar dataKey="interest" stackId="1" fill="hsl(var(--chart-1))" name="Interest" />
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
