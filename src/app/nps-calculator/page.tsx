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
import { calculateNPS } from "@/lib/financial/savings";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function NPSCalculatorPage() {
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [years, setYears] = useState(30);
  const [equityReturn, setEquityReturn] = useState(12);
  const [debtReturn, setDebtReturn] = useState(8);
  const [equityAllocation, setEquityAllocation] = useState(50);
  const [annuityPercent, setAnnuityPercent] = useState(40);
  const [annuityRate, setAnnuityRate] = useState(6);

  const result = useMemo(
    () => calculateNPS(monthlyContribution, years, equityReturn, debtReturn, equityAllocation, annuityPercent, annuityRate),
    [monthlyContribution, years, equityReturn, debtReturn, equityAllocation, annuityPercent, annuityRate]
  );

  const chartData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      name: `Yr ${s.year}`,
      contribution: Math.round(s.contribution),
      interest: Math.round(s.interest),
      value: Math.round(s.balance),
    }));
  }, [result]);

  const tableData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      year: s.year,
      contribution: Math.round(s.contribution),
      interest: Math.round(s.interest),
      balance: Math.round(s.balance),
    }));
  }, [result]);

  return (
    <CalculatorLayout
      title="NPS Calculator"
      description="Calculate your National Pension System corpus and pension at retirement."
      info="NPS offers equity and debt allocation. At retirement, up to 60% can be withdrawn as lumpsum, and minimum 40% must be used to buy an annuity for pension."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} min={1000} max={1000000} step={500} prefix="₹" />
            <SliderField label="Investment Period" value={years} onChange={setYears} min={5} max={40} step={1} suffix=" yr" />
            <SliderField label="Expected Equity Return" value={equityReturn} onChange={setEquityReturn} min={5} max={20} step={0.5} suffix="%" />
            <SliderField label="Expected Debt Return" value={debtReturn} onChange={setDebtReturn} min={4} max={12} step={0.5} suffix="%" />
            <SliderField label="Equity Allocation" value={equityAllocation} onChange={setEquityAllocation} min={0} max={100} step={5} suffix="%" />
            <SliderField label="Annuity Percentage" value={annuityPercent} onChange={setAnnuityPercent} min={40} max={100} step={5} suffix="%" tooltip="Minimum 40% must be used for annuity" />
            <SliderField label="Annuity Rate" value={annuityRate} onChange={setAnnuityRate} min={4} max={10} step={0.5} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Total Corpus" value={formatCurrency(result.totalCorpus, true)} variant="success" />
            <SummaryCard label="Annuity Amount" value={formatCurrency(result.annuityAmount, true)} />
            <SummaryCard label="Lumpsum Amount" value={formatCurrency(result.lumpsumAmount, true)} variant="success" />
            <SummaryCard label="Monthly Pension" value={formatCurrency(result.monthlyPension)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Corpus Growth Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="contribution" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Contribution" />
                    <Area type="monotone" dataKey="interest" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Returns" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "contribution", label: "Contribution", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Returns", format: (v) => formatCurrency(v), sortable: true },
              { key: "balance", label: "Corpus", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, Contribution: r.contribution, Returns: r.interest, Corpus: r.balance })), "nps-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, Contribution: r.contribution, Returns: r.interest, Corpus: r.balance })), "nps-results")}
          />
        </div>
      }
    />
  );
}
