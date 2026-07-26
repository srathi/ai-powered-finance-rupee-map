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
import { calculateSukanya } from "@/lib/financial/savings";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function SukanyaCalculatorPage() {
  const [annualDeposit, setAnnualDeposit] = useState(150000);
  const [rate, setRate] = useState(8.2);
  const [depositYears, setDepositYears] = useState(15);
  const [maturityYears, setMaturityYears] = useState(21);

  const result = useMemo(
    () => calculateSukanya(annualDeposit, depositYears, rate, maturityYears),
    [annualDeposit, depositYears, rate, maturityYears]
  );

  const chartData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      name: `Yr ${s.year}`,
      deposited: s.deposit > 0 ? annualDeposit * s.year : annualDeposit * depositYears,
      value: Math.round(s.balance),
    }));
  }, [result, annualDeposit, depositYears]);

  const tableData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      year: s.year,
      deposit: Math.round(s.deposit),
      interest: Math.round(s.interest),
      balance: Math.round(s.balance),
    }));
  }, [result]);

  return (
    <CalculatorLayout
      title="Sukanya Samriddhi Calculator"
      description="Calculate maturity amount on Sukanya Samriddhi Yojana for your girl child."
      info="SSY offers one of the highest tax-free returns. Deposits can be made for 14 years, and the account matures after 21 years. Current rate is 8.2% per annum."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Annual Deposit" value={annualDeposit} onChange={setAnnualDeposit} min={250} max={150000} step={500} prefix="₹" tooltip="Minimum ₹250, Maximum ₹1,50,000 per year" />
            <SliderField label="Interest Rate" value={rate} onChange={setRate} min={5} max={12} step={0.1} suffix="%" />
            <SliderField label="Deposit Period" value={depositYears} onChange={setDepositYears} min={1} max={14} step={1} suffix=" yr" tooltip="Deposits for 14 years from account opening" />
            <SliderField label="Maturity Period" value={maturityYears} onChange={setMaturityYears} min={14} max={21} step={1} suffix=" yr" tooltip="Account matures after 21 years" />
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
                    <Area type="monotone" dataKey="value" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="SSY Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "deposit", label: "Deposit", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "balance", label: "Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, Deposit: r.deposit, Interest: r.interest, Balance: r.balance })), "ssy-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, Deposit: r.deposit, Interest: r.interest, Balance: r.balance })), "ssy-results")}
          />
        </div>
      }
    />
  );
}
