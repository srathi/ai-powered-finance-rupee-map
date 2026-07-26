"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency } from "@/lib/format";
import { purchasingPower } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PurchasingPowerPage() {
  const [amount, setAmount] = useState(1000000);
  const [inflationRate, setInflationRate] = useState(6);
  const [years, setYears] = useState(20);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({ name: `Yr ${y}`, value: Math.round(purchasingPower(amount, inflationRate, y)) });
    }
    return data;
  }, [amount, inflationRate, years]);

  return (
    <CalculatorLayout
      title="Purchasing Power Calculator"
      description="Calculate what your money will be worth in the future after inflation."
      info="Purchasing power tells you how much your future money will be worth in today's terms. With 6% inflation, ₹10L in 20 years has the buying power of only ₹3.1L today."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Amount" value={amount} onChange={setAmount} min={1} max={100000000} step={10000} prefix="₹" />
            <SliderField label="Inflation Rate" value={inflationRate} onChange={setInflationRate} min={0} max={20} step={0.5} suffix="%" />
            <SliderField label="Years" value={years} onChange={setYears} min={1} max={50} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Today's Value" value={formatCurrency(amount, true)} />
            <SummaryCard label="Purchasing Power in Future" value={formatCurrency(Math.round(purchasingPower(amount, inflationRate, years)), true)} variant="warning" />
            <SummaryCard label="Value Lost" value={formatCurrency(Math.round(amount - purchasingPower(amount, inflationRate, years)), true)} variant="danger" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Purchasing Power Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} />
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
