"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency } from "@/lib/format";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { lumpsumFutureValue } from "@/lib/financial/math";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { RotateCcw } from "lucide-react";

export default function LumpsumPage() {
  const [investment, setInvestment] = useState(500000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const fv = lumpsumFutureValue(investment, annualReturn, years);
    const returns = fv - investment;
    return { futureValue: fv, returns, invested: investment };
  }, [investment, annualReturn, years]);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      const fv = lumpsumFutureValue(investment, annualReturn, y);
      data.push({ name: `Yr ${y}`, invested: investment, value: Math.round(fv) });
    }
    return data;
  }, [investment, annualReturn, years]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const fv = lumpsumFutureValue(investment, annualReturn, y);
      const prevFv = lumpsumFutureValue(investment, annualReturn, y - 1);
      data.push({ year: y, invested: investment, returns: Math.round(fv - investment), totalValue: Math.round(fv), yearReturns: Math.round(fv - prevFv) });
    }
    return data;
  }, [investment, annualReturn, years]);

  return (
    <CalculatorLayout
      title="Lumpsum Calculator"
      description="Calculate returns on a one-time lump sum investment."
      info="A lumpsum investment is a one-time investment in mutual funds or other instruments. Formula: FV = P × (1 + r)^n, where P is principal, r is annual rate, and n is years."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Investment Amount" value={investment} onChange={setInvestment} min={1000} max={100000000} step={1000} prefix="₹" />
            <SliderField label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Investment Period" value={years} onChange={setYears} min={1} max={40} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Invested Amount" value={formatCurrency(result.invested, true)} />
            <SummaryCard label="Estimated Returns" value={formatCurrency(result.returns, true)} variant="success" />
            <SummaryCard label="Total Value" value={formatCurrency(result.futureValue, true)} variant="success" />
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
                    <Legend />
                    <Area type="monotone" dataKey="invested" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Invested" />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Total Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "totalValue", label: "Value", format: (v) => formatCurrency(v), sortable: true },
              { key: "yearReturns", label: "Year Returns", format: (v) => formatCurrency(v), sortable: true },
              { key: "returns", label: "Cumulative Returns", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, Value: r.totalValue, "Year Returns": r.yearReturns, "Cumulative Returns": r.returns })), "lumpsum-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, Value: r.totalValue, "Year Returns": r.yearReturns, "Cumulative Returns": r.returns })), "lumpsum-results")}
          />
        </div>
      }
    />
  );
}
