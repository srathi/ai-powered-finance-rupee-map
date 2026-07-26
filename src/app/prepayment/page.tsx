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
import { prepaymentImpact } from "@/lib/financial/loan";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function PrepaymentPage() {
  const [principal, setPrincipal] = useState(3000000);
  const [annualRate, setAnnualRate] = useState(9);
  const [tenureYears, setTenureYears] = useState(20);
  const [prepaymentAmount, setPrepaymentAmount] = useState(200000);
  const [prepayAtMonth, setPrepayAtMonth] = useState(24);
  const [reduceTenure, setReduceTenure] = useState(true);

  const tenureMonths = tenureYears * 12;

  const result = useMemo(() => {
    return prepaymentImpact(
      { principal, annualRatePercent: annualRate, tenureMonths },
      prepaymentAmount,
      prepayAtMonth,
      reduceTenure
    );
  }, [principal, annualRate, tenureMonths, prepaymentAmount, prepayAtMonth, reduceTenure]);

  const comparisonChart = [
    {
      name: "Total Interest",
      Original: Math.round(result.originalCost.totalInterest),
      "After Prepayment": Math.round(result.newCost.totalInterest),
    },
    {
      name: "Total Payment",
      Original: Math.round(result.originalCost.totalPayment),
      "After Prepayment": Math.round(result.newCost.totalPayment),
    },
  ];

  const balanceComparison = useMemo(() => {
    const maxLen = Math.max(result.originalSchedule.length, result.newSchedule.length);
    const data: { month: number; original: number; new: number }[] = [];
    for (let i = 0; i < maxLen; i += 3) {
      data.push({
        month: i + 1,
        original: Math.round(result.originalSchedule[i]?.balance ?? 0),
        new: Math.round(result.newSchedule[i]?.balance ?? 0),
      });
    }
    return data;
  }, [result]);

  const yearlyOriginal = useMemo(() => {
    const data: { year: number; principal: number; interest: number; balance: number }[] = [];
    let yp = 0, yi = 0, lb = principal;
    for (const row of result.originalSchedule) {
      yp += row.principal;
      yi += row.interest;
      lb = row.balance;
      if (row.month % 12 === 0) {
        data.push({ year: row.month / 12, principal: Math.round(yp), interest: Math.round(yi), balance: Math.round(lb) });
        yp = 0;
        yi = 0;
      }
    }
    return data;
  }, [result, principal]);

  const yearlyNew = useMemo(() => {
    const data: { year: number; principal: number; interest: number; balance: number }[] = [];
    let yp = 0, yi = 0, lb = principal;
    for (const row of result.newSchedule) {
      yp += row.principal;
      yi += row.interest;
      lb = row.balance;
      if (row.month % 12 === 0) {
        data.push({ year: row.month / 12, principal: Math.round(yp), interest: Math.round(yi), balance: Math.round(lb) });
        yp = 0;
        yi = 0;
      }
    }
    return data;
  }, [result, principal]);

  const yearlyTable = useMemo(() => {
    const maxLen = Math.max(yearlyOriginal.length, yearlyNew.length);
    const data: { year: number; origPrincipal: number; origInterest: number; origBalance: number; newPrincipal: number; newInterest: number; newBalance: number }[] = [];
    for (let i = 0; i < maxLen; i++) {
      data.push({
        year: i + 1,
        origPrincipal: yearlyOriginal[i]?.principal ?? 0,
        origInterest: yearlyOriginal[i]?.interest ?? 0,
        origBalance: yearlyOriginal[i]?.balance ?? 0,
        newPrincipal: yearlyNew[i]?.principal ?? 0,
        newInterest: yearlyNew[i]?.interest ?? 0,
        newBalance: yearlyNew[i]?.balance ?? 0,
      });
    }
    return data;
  }, [yearlyOriginal, yearlyNew]);

  return (
    <CalculatorLayout
      title="Loan Prepayment Calculator"
      description="See how prepaying your loan can save you thousands in interest and reduce your tenure."
      info="Making a lump-sum prepayment reduces your outstanding principal, which means less interest accrues going forward. You can choose to either reduce your EMI (keeping same tenure) or reduce your tenure (keeping same EMI). Reducing tenure typically saves more interest."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Loan & Prepayment Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Loan Amount" value={principal} onChange={setPrincipal} min={100000} max={100000000} step={50000} prefix="₹" />
            <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={1} max={20} step={0.1} suffix="%" />
            <SliderField label="Loan Tenure" value={tenureYears} onChange={setTenureYears} min={1} max={30} step={1} suffix=" yr" />
            <InputField label="Prepayment Amount" value={prepaymentAmount} onChange={setPrepaymentAmount} min={10000} max={principal} step={10000} prefix="₹" />
            <InputField label="Prepay at Month" value={prepayAtMonth} onChange={setPrepayAtMonth} min={1} max={tenureMonths - 1} step={1} format="months" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Reduce Tenure (keep EMI same)?</label>
                <button
                  onClick={() => setReduceTenure(!reduceTenure)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${reduceTenure ? "bg-primary" : "bg-secondary"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${reduceTenure ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {reduceTenure ? "Tenure will be reduced, EMI stays the same" : "EMI will be reduced, tenure stays the same"}
              </p>
            </div>
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate Savings</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Interest Saved" value={formatCurrency(Math.round(result.savings.interestSaved), true)} variant="success" sublabel="You save this much!" />
            <SummaryCard label="Tenure Reduction" value={monthsToYearsMonths(result.savings.tenureReduction)} variant={result.savings.tenureReduction > 0 ? "success" : "default"} sublabel={`${result.savings.tenureReduction} months`} />
            <SummaryCard label="Original Total Interest" value={formatCurrency(result.originalCost.totalInterest, true)} variant="warning" />
            <SummaryCard label="New Total Interest" value={formatCurrency(result.newCost.totalInterest, true)} variant="success" />
            <SummaryCard label="Original Tenure" value={monthsToYearsMonths(result.originalCost.tenureMonths)} />
            <SummaryCard label="New Tenure" value={monthsToYearsMonths(result.newCost.tenureMonths)} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Cost Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChart}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="Original" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="After Prepayment" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Balance Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceComparison}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "bottom", offset: -5, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="original" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="Original" />
                    <Area type="monotone" dataKey="new" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="After Prepayment" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "origInterest", label: "Orig Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "newInterest", label: "New Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "origBalance", label: "Orig Balance", format: (v) => formatCurrency(v), sortable: true },
              { key: "newBalance", label: "New Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={yearlyTable}
            title="Amortization Comparison (Year-wise)"
            onExportCSV={() => exportToCSV(yearlyTable.map(r => ({
              Year: r.year,
              "Orig Interest": r.origInterest,
              "New Interest": r.newInterest,
              "Orig Balance": r.origBalance,
              "New Balance": r.newBalance,
            })), "prepayment-comparison")}
            onExportExcel={() => exportToExcel(yearlyTable.map(r => ({
              Year: r.year,
              "Orig Interest": r.origInterest,
              "New Interest": r.newInterest,
              "Orig Balance": r.origBalance,
              "New Balance": r.newBalance,
            })), "prepayment-comparison")}
          />
        </div>
      }
    />
  );
}
