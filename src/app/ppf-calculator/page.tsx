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
import { calculatePPF } from "@/lib/financial/savings";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function PPFCalculatorPage() {
  const [annualDeposit, setAnnualDeposit] = useState(150000);
  const [tenure, setTenure] = useState(15);
  const [rate, setRate] = useState(7.1);

  const result = useMemo(() => calculatePPF(annualDeposit, tenure, rate), [annualDeposit, tenure, rate]);

  const chartData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      name: `Yr ${s.year}`,
      deposited: annualDeposit * s.year,
      value: Math.round(s.closingBalance),
    }));
  }, [result, annualDeposit]);

  const tableData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      year: s.year,
      opening: Math.round(s.openingBalance),
      deposit: Math.round(s.deposit),
      interest: Math.round(s.interest),
      closing: Math.round(s.closingBalance),
    }));
  }, [result]);

  return (
    <CalculatorLayout
      title="PPF Calculator"
      description="Calculate maturity amount on your Public Provident Fund investment."
      info="PPF has a 15-year lock-in period with annual contributions. Interest is compounded yearly and is tax-free. Current rate is 7.1% per annum."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Annual Deposit" value={annualDeposit} onChange={setAnnualDeposit} min={500} max={150000} step={500} prefix="₹" tooltip="Maximum ₹1,50,000 per year" />
            <SliderField label="Tenure" value={tenure} onChange={setTenure} min={15} max={30} step={5} suffix=" yr" tooltip="Minimum 15 years, extendable in blocks of 5" />
            <SliderField label="Interest Rate" value={rate} onChange={setRate} min={5} max={10} step={0.1} suffix="%" />
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
                    <Area type="monotone" dataKey="value" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="PPF Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "opening", label: "Opening Balance", format: (v) => formatCurrency(v), sortable: true },
              { key: "deposit", label: "Deposit", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "closing", label: "Closing Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, "Opening Balance": r.opening, Deposit: r.deposit, Interest: r.interest, "Closing Balance": r.closing })), "ppf-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, "Opening Balance": r.opening, Deposit: r.deposit, Interest: r.interest, "Closing Balance": r.closing })), "ppf-results")}
          />
        </div>
      }
    />
  );
}
