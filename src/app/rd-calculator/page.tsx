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
import { calculateRD } from "@/lib/financial/savings";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function RDCalculatorPage() {
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [rate, setRate] = useState(7);
  const [tenure, setTenure] = useState(5);

  const result = useMemo(() => calculateRD(monthlyDeposit, rate, tenure), [monthlyDeposit, rate, tenure]);

  const chartData = useMemo(() => {
    const data: { name: string; deposited: number; value: number }[] = [];
    for (let y = 1; y <= tenure; y++) {
      const m = result.monthlySchedule.filter((s) => Math.ceil(s.month / 12) === y);
      const closing = m[m.length - 1]?.balance ?? 0;
      data.push({ name: `Yr ${y}`, deposited: monthlyDeposit * y * 12, value: Math.round(closing) });
    }
    return data;
  }, [result, tenure, monthlyDeposit]);

  const tableData = useMemo(() => {
    const yearly: Record<string, unknown>[] = [];
    for (let y = 1; y <= tenure; y++) {
      const m = result.monthlySchedule.filter((s) => Math.ceil(s.month / 12) === y);
      const closing = m[m.length - 1]?.balance ?? 0;
      const deposited = monthlyDeposit * y * 12;
      const interest = m.reduce((sum, s) => sum + s.interest, 0);
      yearly.push({ year: y, deposited: Math.round(deposited), interest: Math.round(interest), balance: Math.round(closing) });
    }
    return yearly;
  }, [result, tenure, monthlyDeposit]);

  return (
    <CalculatorLayout
      title="Recurring Deposit Calculator"
      description="Calculate maturity amount on your Recurring Deposit with monthly contributions."
      info="RD earns compound interest on monthly deposits. Each deposit earns interest for the remaining tenure. Formula accounts for each monthly deposit growing at the compounding rate."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Monthly Deposit" value={monthlyDeposit} onChange={setMonthlyDeposit} min={100} max={1000000} step={500} prefix="₹" />
            <SliderField label="Interest Rate" value={rate} onChange={setRate} min={1} max={15} step={0.1} suffix="%" />
            <SliderField label="Tenure" value={tenure} onChange={setTenure} min={1} max={10} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Maturity Amount" value={formatCurrency(result.maturityAmount, true)} variant="success" />
            <SummaryCard label="Total Deposited" value={formatCurrency(result.totalDeposited, true)} />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="success" />
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
                    <Area type="monotone" dataKey="deposited" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Deposited" />
                    <Area type="monotone" dataKey="value" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Maturity Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "deposited", label: "Total Deposited", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Interest Earned", format: (v) => formatCurrency(v), sortable: true },
              { key: "balance", label: "Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, "Total Deposited": r.deposited, "Interest Earned": r.interest, Balance: r.balance })), "rd-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, "Total Deposited": r.deposited, "Interest Earned": r.interest, Balance: r.balance })), "rd-results")}
          />
        </div>
      }
    />
  );
}
