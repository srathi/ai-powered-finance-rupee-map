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
import { emi as calcEmi, amortizationSchedule, totalLoanCost } from "@/lib/financial/loan";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function HomeLoanPage() {
  const [principal, setPrincipal] = useState(5000000);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [prepaymentAmount, setPrepaymentAmount] = useState(0);

  const tenureMonths = tenureYears * 12;

  const result = useMemo(() => {
    const emiAmount = calcEmi(principal, annualRate, tenureMonths);
    const cost = totalLoanCost({ principal, annualRatePercent: annualRate, tenureMonths });
    const schedule = amortizationSchedule({ principal, annualRatePercent: annualRate, tenureMonths });
    return { emiAmount, ...cost, schedule };
  }, [principal, annualRate, tenureMonths]);

  const prepaymentResult = useMemo(() => {
    if (prepaymentAmount <= 0) return null;
    const r = annualRate / 100 / 12;
    let balance = principal;
    const emiAmount = calcEmi(principal, annualRate, tenureMonths);
    let monthsSaved = 0;
    let totalInterestSaved = 0;

    for (let m = 1; m <= tenureMonths; m++) {
      const interest = balance * r;
      const principalPart = emiAmount - interest;
      balance -= principalPart;
      if (m % 12 === 0) {
        balance -= prepaymentAmount;
        if (balance <= 0) {
          monthsSaved = tenureMonths - m;
          break;
        }
      }
    }

    if (monthsSaved > 0) {
      const newTenureMonths = tenureMonths - monthsSaved;
      const newCost = totalLoanCost({ principal, annualRatePercent: annualRate, tenureMonths: newTenureMonths });
      totalInterestSaved = result.totalInterest - newCost.totalInterest;
    }

    return { monthsSaved, totalInterestSaved, yearlyPrepayment: prepaymentAmount };
  }, [principal, annualRate, tenureMonths, prepaymentAmount, result.totalInterest]);

  const pieData = [
    { name: "Principal", value: Math.round(principal) },
    { name: "Interest", value: Math.round(result.totalInterest) },
  ];

  const COLORS = ["hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)"];

  const yearlyData = useMemo(() => {
    const data: { year: number; principal: number; interest: number; balance: number }[] = [];
    let yearPrincipal = 0;
    let yearInterest = 0;
    let lastBalance = principal;

    for (const row of result.schedule) {
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
  }, [result.schedule, principal]);

  return (
    <CalculatorLayout
      title="Home Loan Calculator"
      description="Calculate EMI, total interest, and amortization for your home loan with optional prepayment analysis."
      info="Home loans typically have longer tenures (15-30 years) which means you pay significantly more interest than the principal. Prepayment even small amounts annually can reduce tenure and save lakhs in interest."
      inputs={
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Loan Details</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <InputField label="Loan Amount" value={principal} onChange={setPrincipal} min={100000} max={100000000} step={50000} prefix="₹" />
              <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={5} max={15} step={0.1} suffix="%" />
              <SliderField label="Loan Tenure" value={tenureYears} onChange={setTenureYears} min={1} max={30} step={1} suffix=" yr" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Prepayment (Optional)</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <InputField label="Yearly Prepayment Amount" value={prepaymentAmount} onChange={setPrepaymentAmount} min={0} max={5000000} step={10000} prefix="₹" tooltip="Additional amount paid yearly towards principal reduction" />
              {prepaymentResult && prepaymentResult.monthsSaved > 0 && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 space-y-1">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Prepayment Impact</p>
                  <p className="text-xs text-muted-foreground">Tenure reduced by <strong>{Math.floor(prepaymentResult.monthsSaved / 12)} years {prepaymentResult.monthsSaved % 12} months</strong></p>
                  <p className="text-xs text-muted-foreground">Interest saved: <strong>{formatCurrency(prepaymentResult.totalInterestSaved)}</strong></p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
        </>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Monthly EMI" value={formatCurrency(Math.round(result.emiAmount))} variant="success" />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="warning" />
            <SummaryCard label="Total Payment" value={formatCurrency(result.totalPayment, true)} />
            <SummaryCard label="Interest % of Principal" value={formatPercent(result.interestPercentage, 1)} />
          </SummaryGrid>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Principal vs Interest</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Yearly Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="principal" stackId="1" fill="hsl(var(--chart-1))" name="Principal" />
                      <Bar dataKey="interest" stackId="1" fill="hsl(var(--chart-5))" name="Interest" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "principal", label: "Principal", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "balance", label: "Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={yearlyData}
            title="Year-wise Amortization"
            onExportCSV={() => exportToCSV(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "home-loan-results")}
            onExportExcel={() => exportToExcel(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "home-loan-results")}
          />
        </div>
      }
    />
  );
}
