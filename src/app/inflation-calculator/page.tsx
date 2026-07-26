"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency } from "@/lib/format";
import { inflationAdjustedValue, purchasingPower } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function InflationCalculatorPage() {
  const [amount, setAmount] = useState(100000);
  const [inflationRate, setInflationRate] = useState(6);
  const [years, setYears] = useState(20);

  const result = useMemo(() => {
    const futureCost = inflationAdjustedValue(amount, inflationRate, years);
    const currentPurchasingPower = purchasingPower(amount, inflationRate, years);
    return { futureCost, currentPurchasingPower };
  }, [amount, inflationRate, years]);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({
        name: `Yr ${y}`,
        futureCost: Math.round(inflationAdjustedValue(amount, inflationRate, y)),
        purchasingPower: Math.round(purchasingPower(amount, inflationRate, y)),
      });
    }
    return data;
  }, [amount, inflationRate, years]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const fv = inflationAdjustedValue(amount, inflationRate, y);
      data.push({ year: y, futureCost: Math.round(fv), purchasingPower: Math.round(amount * 100 / (fv / amount)), loss: Math.round(fv - amount) });
    }
    return data;
  }, [amount, inflationRate, years]);

  return (
    <CalculatorLayout
      title="Inflation Calculator"
      description="See how inflation erodes the value of money over time."
      info="Inflation reduces purchasing power. If inflation is 6%, something costing ₹100 today will cost ₹179 in 10 years. This calculator shows future cost and current purchasing power."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Current Amount" value={amount} onChange={setAmount} min={1} max={100000000} step={1000} prefix="₹" />
            <SliderField label="Inflation Rate" value={inflationRate} onChange={setInflationRate} min={0} max={20} step={0.5} suffix="%" />
            <SliderField label="Time Period" value={years} onChange={setYears} min={1} max={50} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Future Cost" value={formatCurrency(Math.round(result.futureCost), true)} />
            <SummaryCard label="Purchasing Power Loss" value={formatCurrency(Math.round(result.futureCost - amount), true)} variant="danger" />
            <SummaryCard label="Today's Value of Future Amount" value={formatCurrency(amount, true)} sublabel={`₹${Math.round(result.futureCost).toLocaleString("en-IN")} in ${years} years = ₹${amount.toLocaleString("en-IN")} today`} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Inflation Impact</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="futureCost" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="Future Cost" />
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
