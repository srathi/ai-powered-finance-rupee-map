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
import { calculateSwp } from "@/lib/financial/math";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function SWPPage() {
  const [corpus, setCorpus] = useState(1000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [months, setMonths] = useState(120);

  const result = useMemo(() => {
    return calculateSwp(corpus, monthlyWithdrawal, annualReturn, months);
  }, [corpus, monthlyWithdrawal, annualReturn, months]);

  const years = Math.ceil(months / 12);

  const chartData = useMemo(() => {
    return result.corpusPath.map((val, i) => ({
      name: i % 12 === 0 ? `Yr ${Math.floor(i / 12)}` : "",
      corpus: Math.round(val),
    }));
  }, [result.corpusPath]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const monthIndex = Math.min(y * 12, result.corpusPath.length - 1);
      data.push({
        year: y,
        corpusBalance: Math.round(result.corpusPath[monthIndex] ?? 0),
        withdrawn: Math.round(monthlyWithdrawal * Math.min(y * 12, result.monthsLasted)),
      });
    }
    return data;
  }, [result, years, monthlyWithdrawal]);

  return (
    <CalculatorLayout
      title="SWP Calculator"
      description="Plan your Systematic Withdrawal Plan and see how long your corpus lasts."
      info="A Systematic Withdrawal Plan allows you to withdraw a fixed amount monthly from your investment corpus while the remaining amount continues to earn returns."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Corpus Amount" value={corpus} onChange={setCorpus} min={100000} max={100000000} step={100000} prefix="₹" />
            <InputField label="Monthly Withdrawal" value={monthlyWithdrawal} onChange={setMonthlyWithdrawal} min={1000} max={1000000} step={1000} prefix="₹" />
            <SliderField label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={20} step={0.5} suffix="%" />
            <SliderField label="Duration" value={months} onChange={setMonths} min={6} max={360} step={6} suffix=" mo" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Monthly Withdrawal" value={formatCurrency(monthlyWithdrawal, true)} />
            <SummaryCard label="Total Withdrawn" value={formatCurrency(result.totalWithdrawn, true)} variant="success" />
            <SummaryCard label="Corpus Lasted" value={`${result.monthsLasted} months`} variant={result.monthsLasted >= months ? "success" : "warning"} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Corpus Depletion</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="corpus" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Corpus Balance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "corpusBalance", label: "Corpus Balance", format: (v) => formatCurrency(v), sortable: true },
              { key: "withdrawn", label: "Total Withdrawn", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, "Corpus Balance": r.corpusBalance, "Total Withdrawn": r.withdrawn })), "swp-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, "Corpus Balance": r.corpusBalance, "Total Withdrawn": r.withdrawn })), "swp-results")}
          />
        </div>
      }
    />
  );
}
