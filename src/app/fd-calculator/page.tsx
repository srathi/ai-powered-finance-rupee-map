"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { calculateFD } from "@/lib/financial/savings";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function FDCalculatorPage() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(7);
  const [tenure, setTenure] = useState(5);
  const [compounding, setCompounding] = useState(4);

  const result = useMemo(() => calculateFD(principal, rate, tenure, compounding), [principal, rate, tenure, compounding]);

  const chartData = useMemo(() => {
    const data: { name: string; principal: number; value: number }[] = [];
    for (let y = 1; y <= tenure; y++) {
      const q = result.quarterlySchedule.filter((s) => Math.ceil(s.quarter / 4) === y);
      const closing = q[q.length - 1]?.closingBalance ?? principal;
      data.push({ name: `Yr ${y}`, principal, value: Math.round(closing) });
    }
    return data;
  }, [result, tenure, principal]);

  const tableData = useMemo(() => {
    const yearly: Record<string, unknown>[] = [];
    for (let y = 1; y <= tenure; y++) {
      const q = result.quarterlySchedule.filter((s) => Math.ceil(s.quarter / 4) === y);
      const closing = q[q.length - 1]?.closingBalance ?? principal;
      const opening = q[0]?.openingBalance ?? principal;
      const interest = q.reduce((sum, s) => sum + s.interest, 0);
      yearly.push({ year: y, opening: Math.round(opening), interest: Math.round(interest), closing: Math.round(closing) });
    }
    return yearly;
  }, [result, tenure, principal]);

  return (
    <CalculatorLayout
      title="Fixed Deposit Calculator"
      description="Calculate maturity amount and interest earned on your Fixed Deposit."
      info="FD interest is compounded quarterly by default. Formula: A = P(1 + r/n)^(nt), where P is principal, r is annual rate, n is compounding frequency, and t is time in years."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Principal Amount" value={principal} onChange={setPrincipal} min={1000} max={100000000} step={1000} prefix="₹" />
            <SliderField label="Interest Rate" value={rate} onChange={setRate} min={1} max={15} step={0.1} suffix="%" />
            <SliderField label="Tenure" value={tenure} onChange={setTenure} min={1} max={30} step={1} suffix=" yr" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Compounding Frequency</label>
              <select value={compounding} onChange={(e) => setCompounding(Number(e.target.value))} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                <option value={1}>Yearly</option>
                <option value={2}>Half-Yearly</option>
                <option value={4}>Quarterly</option>
                <option value={12}>Monthly</option>
              </select>
            </div>
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Maturity Amount" value={formatCurrency(result.maturityAmount, true)} variant="success" />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="success" />
            <SummaryCard label="Effective Yield" value={formatPercent(result.effectiveYield)} />
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
                    <Area type="monotone" dataKey="principal" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Principal" />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Maturity Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "opening", label: "Opening Balance", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "closing", label: "Closing Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, "Opening Balance": r.opening, Interest: r.interest, "Closing Balance": r.closing })), "fd-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, "Opening Balance": r.opening, Interest: r.interest, "Closing Balance": r.closing })), "fd-results")}
          />
        </div>
      }
    />
  );
}
