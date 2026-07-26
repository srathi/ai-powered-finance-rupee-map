"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { emi as calcEmi, totalLoanCost } from "@/lib/financial/loan";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function LoanComparisonPage() {
  const [loanA, setLoanA] = useState({ principal: 3000000, rate: 8.5, tenure: 20 });
  const [loanB, setLoanB] = useState({ principal: 3000000, rate: 9.0, tenure: 15 });

  const resultA = useMemo(() => totalLoanCost({ principal: loanA.principal, annualRatePercent: loanA.rate, tenureMonths: loanA.tenure * 12 }), [loanA]);
  const resultB = useMemo(() => totalLoanCost({ principal: loanB.principal, annualRatePercent: loanB.rate, tenureMonths: loanB.tenure * 12 }), [loanB]);

  const interestSaved = Math.abs(resultA.totalInterest - resultB.totalInterest);
  const totalSaved = Math.abs(resultA.totalPayment - resultB.totalPayment);
  const betterLoan = resultA.totalInterest < resultB.totalInterest ? "A" : resultB.totalInterest < resultA.totalInterest ? "B" : null;
  const emiDiff = Math.abs(resultA.monthlyEmi - resultB.monthlyEmi);

  const chartData = [
    { name: "Monthly EMI", "Loan A": Math.round(resultA.monthlyEmi), "Loan B": Math.round(resultB.monthlyEmi) },
    { name: "Total Interest", "Loan A": Math.round(resultA.totalInterest), "Loan B": Math.round(resultB.totalInterest) },
    { name: "Total Payment", "Loan A": Math.round(resultA.totalPayment), "Loan B": Math.round(resultB.totalPayment) },
  ];

  return (
    <CalculatorLayout
      title="Loan Comparison Calculator"
      description="Compare two loan options side by side to find the best deal for your needs."
      info="Enter details for both loans and instantly see which option saves you more money. The comparison considers EMI amount, total interest paid, and total cost of each loan."
      inputs={
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg text-primary">Loan A</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <InputField label="Loan Amount" value={loanA.principal} onChange={(v) => setLoanA({ ...loanA, principal: v })} min={100000} max={100000000} step={50000} prefix="₹" />
              <SliderField label="Interest Rate" value={loanA.rate} onChange={(v) => setLoanA({ ...loanA, rate: v })} min={1} max={20} step={0.1} suffix="%" />
              <SliderField label="Tenure" value={loanA.tenure} onChange={(v) => setLoanA({ ...loanA, tenure: v })} min={1} max={30} step={1} suffix=" yr" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg text-primary">Loan B</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <InputField label="Loan Amount" value={loanB.principal} onChange={(v) => setLoanB({ ...loanB, principal: v })} min={100000} max={100000000} step={50000} prefix="₹" />
              <SliderField label="Interest Rate" value={loanB.rate} onChange={(v) => setLoanB({ ...loanB, rate: v })} min={1} max={20} step={0.1} suffix="%" />
              <SliderField label="Tenure" value={loanB.tenure} onChange={(v) => setLoanB({ ...loanB, tenure: v })} min={1} max={30} step={1} suffix=" yr" />
            </CardContent>
          </Card>
          <div className="pt-2"><Button onClick={() => {}} className="w-full">Compare</Button></div>
        </div>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Better Option" value={betterLoan ? `Loan ${betterLoan}` : "Equal"} variant={betterLoan ? "success" : "default"} sublabel={betterLoan ? `Saves ${formatCurrency(interestSaved, true)} in interest` : "Both loans cost the same"} />
            <SummaryCard label="Loan A - Monthly EMI" value={formatCurrency(Math.round(resultA.monthlyEmi))} variant={betterLoan === "A" ? "success" : "default"} />
            <SummaryCard label="Loan B - Monthly EMI" value={formatCurrency(Math.round(resultB.monthlyEmi))} variant={betterLoan === "B" ? "success" : "default"} />
            <SummaryCard label="Loan A - Total Interest" value={formatCurrency(resultA.totalInterest, true)} variant={betterLoan === "A" ? "success" : "warning"} />
            <SummaryCard label="Loan B - Total Interest" value={formatCurrency(resultB.totalInterest, true)} variant={betterLoan === "B" ? "success" : "warning"} />
            <SummaryCard label="EMI Difference" value={formatCurrency(Math.round(emiDiff))} sublabel="per month" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Side by Side Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="Loan A" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Loan B" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Detailed Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Loan A</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Loan B</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="py-2">Loan Amount</td>
                      <td className="text-right">{formatCurrency(loanA.principal, true)}</td>
                      <td className="text-right">{formatCurrency(loanB.principal, true)}</td>
                      <td className="text-right">{formatCurrency(Math.abs(loanA.principal - loanB.principal), true)}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2">Interest Rate</td>
                      <td className="text-right">{formatPercent(loanA.rate, 1)}</td>
                      <td className="text-right">{formatPercent(loanB.rate, 1)}</td>
                      <td className="text-right">{formatPercent(Math.abs(loanA.rate - loanB.rate), 1)}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2">Tenure</td>
                      <td className="text-right">{loanA.tenure} years</td>
                      <td className="text-right">{loanB.tenure} years</td>
                      <td className="text-right">{Math.abs(loanA.tenure - loanB.tenure)} years</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 font-medium">Monthly EMI</td>
                      <td className="text-right font-medium">{formatCurrency(Math.round(resultA.monthlyEmi))}</td>
                      <td className="text-right font-medium">{formatCurrency(Math.round(resultB.monthlyEmi))}</td>
                      <td className={`text-right font-medium ${resultA.monthlyEmi < resultB.monthlyEmi ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatCurrency(Math.round(emiDiff))} {resultA.monthlyEmi < resultB.monthlyEmi ? "less" : "more"}
                      </td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 font-medium">Total Interest</td>
                      <td className="text-right font-medium">{formatCurrency(resultA.totalInterest, true)}</td>
                      <td className="text-right font-medium">{formatCurrency(resultB.totalInterest, true)}</td>
                      <td className={`text-right font-medium ${resultA.totalInterest < resultB.totalInterest ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatCurrency(interestSaved, true)} {resultA.totalInterest < resultB.totalInterest ? "less" : "more"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Total Payment</td>
                      <td className="text-right font-medium">{formatCurrency(resultA.totalPayment, true)}</td>
                      <td className="text-right font-medium">{formatCurrency(resultB.totalPayment, true)}</td>
                      <td className={`text-right font-medium ${resultA.totalPayment < resultB.totalPayment ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatCurrency(totalSaved, true)} {resultA.totalPayment < resultB.totalPayment ? "less" : "more"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
