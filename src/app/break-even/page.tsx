"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateBreakEven } from "@/lib/financial/gst";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function BreakEvenPage() {
  const [fixedCosts, setFixedCosts] = useState(500000);
  const [variableCost, setVariableCost] = useState(200);
  const [sellingPrice, setSellingPrice] = useState(500);

  const result = useMemo(() => calculateBreakEven(fixedCosts, variableCost, sellingPrice), [fixedCosts, variableCost, sellingPrice]);

  const chartData = useMemo(() => {
    const data = [];
    const maxUnits = result.breakEvenUnits * 2;
    for (let u = 0; u <= maxUnits; u += Math.max(1, Math.floor(maxUnits / 20))) {
      data.push({
        units: u,
        revenue: u * sellingPrice,
        costs: fixedCosts + u * variableCost,
      });
    }
    return data;
  }, [result.breakEvenUnits, sellingPrice, fixedCosts, variableCost]);

  return (
    <CalculatorLayout
      title="Break-even Calculator"
      description="Find the number of units you need to sell to cover all costs."
      info="Break-even point is where total revenue equals total costs (fixed + variable). Above this point, each unit sold generates profit."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Fixed Costs" value={fixedCosts} onChange={setFixedCosts} min={0} max={100000000} step={10000} prefix="₹" />
            <InputField label="Variable Cost per Unit" value={variableCost} onChange={setVariableCost} min={1} max={100000} step={10} prefix="₹" />
            <InputField label="Selling Price per Unit" value={sellingPrice} onChange={setSellingPrice} min={1} max={1000000} step={10} prefix="₹" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Break-even Units" value={result.breakEvenUnits.toLocaleString()} variant="success" />
            <SummaryCard label="Break-even Revenue" value={formatCurrency(result.breakEvenRevenue, true)} />
            <SummaryCard label="Contribution Margin" value={formatCurrency(result.contributionMargin)} sublabel="Per unit" />
            <SummaryCard label="Contribution Margin %" value={formatPercent(result.contributionMarginPercent, 1)} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Revenue vs Costs</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="units" tick={{ fontSize: 11 }} label={{ value: "Units", position: "bottom", offset: -5 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <ReferenceLine x={result.breakEvenUnits} stroke="#10b981" strokeDasharray="5 5" label={`Break-even: ${result.breakEvenUnits} units`} />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-1))" fillOpacity={0.7} name="Revenue" />
                    <Bar dataKey="costs" fill="hsl(var(--chart-5))" fillOpacity={0.7} name="Total Costs" />
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
