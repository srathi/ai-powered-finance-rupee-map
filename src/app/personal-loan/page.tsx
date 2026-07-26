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

export default function PersonalLoanPage() {
  const [principal, setPrincipal] = useState(300000);
  const [annualRate, setAnnualRate] = useState(12);
  const [tenureYears, setTenureYears] = useState(3);

  const tenureMonths = tenureYears * 12;

  const result = useMemo(() => {
    const emiAmount = calcEmi(principal, annualRate, tenureMonths);
    const cost = totalLoanCost({ principal, annualRatePercent: annualRate, tenureMonths });
    const schedule = amortizationSchedule({ principal, annualRatePercent: annualRate, tenureMonths });
    return { emiAmount, ...cost, schedule };
  }, [principal, annualRate, tenureMonths]);

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

  const comparisonData = useMemo(() => {
    const homeRate = 8.5;
    const homeEmi = calcEmi(principal, homeRate, tenureMonths);
    const homeCost = totalLoanCost({ principal, annualRatePercent: homeRate, tenureMonths });
    return {
      homeRate,
      homeEmi,
      homeTotalInterest: homeCost.totalInterest,
      homeTotalPayment: homeCost.totalPayment,
      personalTotalInterest: result.totalInterest,
      personalTotalPayment: result.totalPayment,
      extraInterest: result.totalInterest - homeCost.totalInterest,
    };
  }, [principal, tenureMonths, result]);

  return (
    <CalculatorLayout
      title="Personal Loan Calculator"
      description="Calculate EMI, total interest, and amortization for your personal loan. Understand the high interest impact."
      info="Personal loans carry the highest interest rates among consumer loans (10-16% p.a.) because they are unsecured. A ₹3 lakh personal loan at 12% for 3 years costs you significantly more than the same amount at home loan rates. Always consider alternatives before taking a personal loan."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Loan Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Loan Amount" value={principal} onChange={setPrincipal} min={10000} max={5000000} step={10000} prefix="₹" />
            <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={8} max={20} step={0.1} suffix="%" tooltip="Personal loans typically carry higher interest rates due to being unsecured" />
            <SliderField label="Loan Tenure" value={tenureYears} onChange={setTenureYears} min={1} max={5} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Monthly EMI" value={formatCurrency(Math.round(result.emiAmount))} variant="success" />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="warning" />
            <SummaryCard label="Total Payment" value={formatCurrency(result.totalPayment, true)} />
            <SummaryCard label="Interest % of Principal" value={formatPercent(result.interestPercentage, 1)} />
          </SummaryGrid>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader><CardTitle className="text-lg text-amber-600 dark:text-amber-400">High Interest Impact</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">At {annualRate}% (Personal Loan)</p>
                  <p className="font-semibold">{formatCurrency(result.totalInterest, true)} interest</p>
                </div>
                <div>
                  <p className="text-muted-foreground">At {comparisonData.homeRate}% (Home Loan Rate)</p>
                  <p className="font-semibold">{formatCurrency(comparisonData.homeTotalInterest, true)} interest</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-amber-500/20">
                  <p className="text-muted-foreground">Extra interest paid due to higher rate:</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(comparisonData.extraInterest)}</p>
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
            onExportCSV={() => exportToCSV(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "personal-loan-results")}
            onExportExcel={() => exportToExcel(yearlyData.map(r => ({ Year: r.year, Principal: r.principal, Interest: r.interest, Balance: r.balance })), "personal-loan-results")}
          />
        </div>
      }
    />
  );
}
