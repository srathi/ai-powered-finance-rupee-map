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

export default function EducationLoanPage() {
  const [principal, setPrincipal] = useState(1000000);
  const [annualRate, setAnnualRate] = useState(9);
  const [tenureYears, setTenureYears] = useState(10);
  const [moratoriumYears, setMoratoriumYears] = useState(1);

  const tenureMonths = tenureYears * 12;
  const moratoriumMonths = moratoriumYears * 12;
  const repaymentMonths = tenureMonths - moratoriumMonths;

  const result = useMemo(() => {
    if (repaymentMonths <= 0) return null;

    const fullEmiAmount = calcEmi(principal, annualRate, repaymentMonths);
    const r = annualRate / 100 / 12;
    const interestOnlyEmi = principal * r;

    let balance = principal;
    const schedule: { month: number; emi: number; principal: number; interest: number; balance: number; totalInterest: number; totalPrincipal: number; phase: string }[] = [];
    let totalInterest = 0;
    let totalPrincipal = 0;

    for (let m = 1; m <= moratoriumMonths; m++) {
      const interest = balance * r;
      const principalPart = 0;
      totalInterest += interest;
      schedule.push({
        month: m,
        emi: interest,
        principal: principalPart,
        interest,
        balance,
        totalInterest,
        totalPrincipal,
        phase: "moratorium",
      });
    }

    for (let m = 1; m <= repaymentMonths; m++) {
      const interest = balance * r;
      const principalPart = fullEmiAmount - interest;
      balance -= principalPart;
      totalInterest += interest;
      totalPrincipal += principalPart;
      schedule.push({
        month: moratoriumMonths + m,
        emi: fullEmiAmount,
        principal: principalPart,
        interest,
        balance: Math.max(0, balance),
        totalInterest,
        totalPrincipal,
        phase: "repayment",
      });
    }

    const totalPayment = (interestOnlyEmi * moratoriumMonths) + (fullEmiAmount * repaymentMonths);

    return {
      interestOnlyEmi,
      fullEmiAmount,
      schedule,
      totalPayment,
      totalInterest,
      interestPercentage: (totalInterest / principal) * 100,
    };
  }, [principal, annualRate, moratoriumMonths, repaymentMonths]);

  const noMoratoriumResult = useMemo(() => {
    const emiAmount = calcEmi(principal, annualRate, tenureMonths);
    const cost = totalLoanCost({ principal, annualRatePercent: annualRate, tenureMonths });
    return { emiAmount, ...cost };
  }, [principal, annualRate, tenureMonths]);

  const pieData = result ? [
    { name: "Principal", value: Math.round(principal) },
    { name: "Interest", value: Math.round(result.totalInterest) },
  ] : [];

  const COLORS = ["hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)"];

  const yearlyData = useMemo(() => {
    if (!result) return [];
    const data: { year: number; principal: number; interest: number; balance: number; phase: string }[] = [];
    let yearPrincipal = 0;
    let yearInterest = 0;
    let lastBalance = principal;
    let lastPhase = "moratorium";

    for (const row of result.schedule) {
      yearPrincipal += row.principal;
      yearInterest += row.interest;
      lastBalance = row.balance;
      lastPhase = row.phase;

      if (row.month % 12 === 0) {
        data.push({
          year: row.month / 12,
          principal: Math.round(yearPrincipal),
          interest: Math.round(yearInterest),
          balance: Math.round(lastBalance),
          phase: lastPhase,
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }
    return data;
  }, [result, principal]);

  if (!result) {
    return (
      <CalculatorLayout
        title="Education Loan Calculator"
        description="Calculate EMI with moratorium period for your education loan."
        info="Education loans offer a moratorium period (grace period) during your study duration where you only pay interest. After the moratorium, full EMI repayment begins on the entire principal amount."
        inputs={
          <Card>
            <CardHeader><CardTitle className="text-lg">Loan Details</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <InputField label="Loan Amount" value={principal} onChange={setPrincipal} min={100000} max={50000000} step={50000} prefix="₹" />
              <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={5} max={15} step={0.1} suffix="%" />
              <SliderField label="Total Tenure" value={tenureYears} onChange={setTenureYears} min={3} max={15} step={1} suffix=" yr" />
              <SliderField label="Moratorium Period" value={moratoriumYears} onChange={setMoratoriumYears} min={1} max={3} step={1} suffix=" yr" />
              <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
            </CardContent>
          </Card>
        }
        results={<div />}
      />
    );
  }

  return (
    <CalculatorLayout
      title="Education Loan Calculator"
      description="Calculate EMI with moratorium period for your education loan. During moratorium, only interest is paid."
      info="Education loans offer a moratorium period (grace period) during your study duration where you only pay interest. After the moratorium, full EMI repayment begins on the entire principal amount. The moratorium EMI is significantly lower but you're not reducing the principal."
      inputs={
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Loan Details</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <InputField label="Loan Amount" value={principal} onChange={setPrincipal} min={100000} max={50000000} step={50000} prefix="₹" />
              <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={5} max={15} step={0.1} suffix="%" />
              <SliderField label="Total Tenure" value={tenureYears} onChange={setTenureYears} min={3} max={15} step={1} suffix=" yr" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Moratorium Period</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <SliderField label="Study Period (Moratorium)" value={moratoriumYears} onChange={setMoratoriumYears} min={1} max={3} step={1} suffix=" yr" tooltip="During this period, only interest is paid. Principal repayment starts after this period." />
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 space-y-1">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Loan Phases</p>
                <p className="text-xs text-muted-foreground">Moratorium: {moratoriumYears} year{moratoriumYears > 1 ? 's' : ''} — Pay only interest ({formatCurrency(result.interestOnlyEmi)}/mo)</p>
                <p className="text-xs text-muted-foreground">Repayment: {tenureYears - moratoriumYears} year{tenureYears - moratoriumYears > 1 ? 's' : ''} — Full EMI ({formatCurrency(result.fullEmiAmount)}/mo)</p>
              </div>
            </CardContent>
          </Card>
          <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
        </>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Moratorium EMI (Interest Only)" value={formatCurrency(Math.round(result.interestOnlyEmi))} variant="warning" />
            <SummaryCard label="Full EMI (After Moratorium)" value={formatCurrency(Math.round(result.fullEmiAmount))} variant="success" />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="danger" />
            <SummaryCard label="Total Payment" value={formatCurrency(result.totalPayment, true)} />
            <SummaryCard label="Interest % of Principal" value={formatPercent(result.interestPercentage, 1)} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">EMI Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-muted-foreground text-xs">With {moratoriumYears}yr Moratorium</p>
                  <p className="font-semibold">Moratorium: {formatCurrency(result.interestOnlyEmi)}/mo</p>
                  <p className="font-semibold">Repayment: {formatCurrency(result.fullEmiAmount)}/mo</p>
                  <p className="text-xs text-muted-foreground mt-1">Total: {formatCurrency(result.totalPayment, true)}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-muted-foreground text-xs">Without Moratorium (Full {tenureYears}yr)</p>
                  <p className="font-semibold">EMI: {formatCurrency(noMoratoriumResult.emiAmount)}/mo</p>
                  <p className="text-xs text-muted-foreground mt-1">Total: {formatCurrency(noMoratoriumResult.totalPayment, true)}</p>
                  <p className="text-xs text-muted-foreground">Extra cost: {formatCurrency(result.totalPayment - noMoratoriumResult.totalPayment, true)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
            onExportCSV={() => exportToCSV(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "education-loan-results")}
            onExportExcel={() => exportToExcel(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "education-loan-results")}
          />
        </div>
      }
    />
  );
}
