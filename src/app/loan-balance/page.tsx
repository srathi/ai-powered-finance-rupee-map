"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency, formatPercent, monthsToYearsMonths } from "@/lib/format";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { emi as calcEmi, amortizationSchedule } from "@/lib/financial/loan";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function LoanBalancePage() {
  const [principal, setPrincipal] = useState(3000000);
  const [annualRate, setAnnualRate] = useState(9);
  const [tenureYears, setTenureYears] = useState(10);
  const [manualEmi, setManualEmi] = useState(0);
  const [useManualEmi, setUseManualEmi] = useState(false);
  const [monthsPaid, setMonthsPaid] = useState(36);

  const tenureMonths = tenureYears * 12;
  const autoEmi = calcEmi(principal, annualRate, tenureMonths);
  const effectiveEmi = useManualEmi && manualEmi > 0 ? manualEmi : autoEmi;

  const result = useMemo(() => {
    const r = annualRate / 100 / 12;
    let balance = principal;
    let totalPaid = 0;
    let totalInterest = 0;
    let totalPrincipalPaid = 0;

    const schedule = amortizationSchedule({ principal, annualRatePercent: annualRate, tenureMonths });
    const paidSchedule = schedule.slice(0, Math.min(monthsPaid, tenureMonths));
    const lastPaidRow = paidSchedule[paidSchedule.length - 1];

    if (useManualEmi && manualEmi > 0) {
      balance = principal;
      for (let m = 1; m <= monthsPaid && m <= tenureMonths; m++) {
        const interest = balance * r;
        const principalPart = manualEmi - interest;
        balance -= principalPart;
        totalInterest += interest;
        totalPrincipalPaid += principalPart;
        totalPaid += manualEmi;
      }
      balance = Math.max(0, balance);
    } else {
      balance = lastPaidRow?.balance ?? principal;
      totalPaid = paidSchedule.reduce((s, row) => s + row.emi, 0);
      totalInterest = lastPaidRow?.totalInterest ?? 0;
      totalPrincipalPaid = lastPaidRow?.totalPrincipal ?? 0;
    }

    const remainingTenure = Math.ceil(
      balance > 0 && r > 0
        ? Math.log(effectiveEmi / (effectiveEmi - balance * r)) / Math.log(1 + r)
        : 0
    );

    const chartData = paidSchedule.map((row) => ({
      month: row.month,
      principal: Math.round(useManualEmi && manualEmi > 0 ? 0 : row.principal),
      interest: Math.round(useManualEmi && manualEmi > 0 ? 0 : row.interest),
      balance: Math.round(useManualEmi && manualEmi > 0 ? 0 : row.balance),
    }));

    // Compute chart data for manual EMI case
    if (useManualEmi && manualEmi > 0) {
      let b = principal;
      chartData.length = 0;
      for (let m = 1; m <= Math.min(monthsPaid, tenureMonths); m++) {
        const interest = b * r;
        const principalPart = manualEmi - interest;
        b -= principalPart;
        chartData.push({
          month: m,
          principal: Math.round(principalPart),
          interest: Math.round(interest),
          balance: Math.round(Math.max(0, b)),
        });
      }
    }

    return {
      currentBalance: Math.round(balance),
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      totalPrincipalPaid: Math.round(totalPrincipalPaid),
      remainingTenure,
      monthlyEmi: Math.round(effectiveEmi),
      chartData,
      paidSchedule,
    };
  }, [principal, annualRate, tenureMonths, monthsPaid, useManualEmi, manualEmi, effectiveEmi]);

  const yearlyData = useMemo(() => {
    const data: { year: number; principal: number; interest: number; balance: number }[] = [];
    let yearPrincipal = 0;
    let yearInterest = 0;
    let lastBalance = principal;

    for (const row of result.chartData) {
      yearPrincipal += row.principal;
      yearInterest += row.interest;
      lastBalance = row.balance;

      if (row.month % 12 === 0) {
        data.push({
          year: row.month / 12,
          principal: Math.round(yearPrincipal),
          interest: Math.round(yearInterest),
          balance: Math.round(lastBalance),
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }
    return data;
  }, [result.chartData, principal]);

  return (
    <CalculatorLayout
      title="Loan Balance Calculator"
      description="Check your outstanding loan balance, principal paid, and interest paid after any number of months."
      info="Enter the months you have already paid to see your current outstanding balance. You can either use the auto-calculated EMI or enter a custom EMI amount to see how a different EMI affects your balance."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Loan Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Loan Amount" value={principal} onChange={setPrincipal} min={10000} max={100000000} step={50000} prefix="₹" />
            <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={1} max={20} step={0.1} suffix="%" />
            <SliderField label="Loan Tenure" value={tenureYears} onChange={setTenureYears} min={1} max={30} step={1} suffix=" yr" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Use Custom EMI?</label>
                <button
                  onClick={() => setUseManualEmi(!useManualEmi)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useManualEmi ? "bg-primary" : "bg-secondary"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${useManualEmi ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {useManualEmi && (
                <InputField label="Custom EMI" value={manualEmi} onChange={setManualEmi} min={1000} max={10000000} step={1000} prefix="₹" />
              )}
              {!useManualEmi && (
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  Auto EMI: {formatCurrency(Math.round(autoEmi))}
                </div>
              )}
            </div>
            <InputField label="Months Paid" value={monthsPaid} onChange={setMonthsPaid} min={1} max={tenureMonths} step={1} format="months" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Current Balance" value={formatCurrency(result.currentBalance, true)} variant="danger" />
            <SummaryCard label="Total Amount Paid" value={formatCurrency(result.totalPaid, true)} variant="default" />
            <SummaryCard label="Principal Paid" value={formatCurrency(result.totalPrincipalPaid, true)} variant="success" />
            <SummaryCard label="Interest Paid" value={formatCurrency(result.totalInterest, true)} variant="warning" />
            <SummaryCard label="Remaining Tenure" value={monthsToYearsMonths(result.remainingTenure)} sublabel={`${result.remainingTenure} months`} />
            <SummaryCard label="Monthly EMI" value={formatCurrency(result.monthlyEmi)} sublabel={useManualEmi ? "Custom" : "Auto-calculated"} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Balance Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "bottom", offset: -5, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="balance" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Outstanding Balance" />
                    <Area type="monotone" dataKey="interest" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="Interest" />
                    <Area type="monotone" dataKey="principal" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Principal" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "principal", label: "Principal", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "balance", label: "Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={yearlyData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "loan-balance")}
            onExportExcel={() => exportToExcel(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "loan-balance")}
          />
        </div>
      }
    />
  );
}
