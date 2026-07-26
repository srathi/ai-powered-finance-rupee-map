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
import { stpCalculation } from "@/lib/financial/math";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function STPPage() {
  const [sourceAmount, setSourceAmount] = useState(5000000);
  const [monthlyTransfer, setMonthlyTransfer] = useState(50000);
  const [sourceReturn, setSourceReturn] = useState(7);
  const [targetReturn, setTargetReturn] = useState(12);
  const [months, setMonths] = useState(60);

  const result = useMemo(() => {
    return stpCalculation(sourceAmount, monthlyTransfer, sourceReturn, targetReturn, months);
  }, [sourceAmount, monthlyTransfer, sourceReturn, targetReturn, months]);

  const years = Math.ceil(months / 12);

  const chartData = useMemo(() => {
    return result.sourcePath.map((val, i) => ({
      name: i % 12 === 0 ? `Yr ${Math.floor(i / 12)}` : "",
      source: Math.round(val),
      target: Math.round(result.targetPath[i]),
    }));
  }, [result.sourcePath, result.targetPath]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      const monthIndex = Math.min(y * 12, result.sourcePath.length - 1);
      data.push({
        year: y,
        sourceBalance: Math.round(result.sourcePath[monthIndex]),
        targetBalance: Math.round(result.targetPath[monthIndex]),
        transferred: Math.round(monthlyTransfer * Math.min(y * 12, months)),
      });
    }
    return data;
  }, [result, years, monthlyTransfer, months]);

  return (
    <CalculatorLayout
      title="STP Calculator"
      description="Plan your Systematic Transfer Plan between source and target funds."
      info="A Systematic Transfer Plan moves a fixed amount monthly from a source fund (e.g., liquid) to a target fund (e.g., equity), allowing your money to earn returns in both during the transfer period."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Source Fund Amount" value={sourceAmount} onChange={setSourceAmount} min={100000} max={100000000} step={100000} prefix="₹" />
            <InputField label="Monthly Transfer" value={monthlyTransfer} onChange={setMonthlyTransfer} min={1000} max={1000000} step={1000} prefix="₹" />
            <SliderField label="Source Fund Return" value={sourceReturn} onChange={setSourceReturn} min={1} max={15} step={0.5} suffix="%" />
            <SliderField label="Target Fund Return" value={targetReturn} onChange={setTargetReturn} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Duration" value={months} onChange={setMonths} min={6} max={120} step={6} suffix=" mo" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Total Transferred" value={formatCurrency(result.totalTransferred, true)} />
            <SummaryCard label="Source Fund Balance" value={formatCurrency(result.sourcePath[result.sourcePath.length - 1], true)} />
            <SummaryCard label="Target Fund Balance" value={formatCurrency(result.targetPath[result.targetPath.length - 1], true)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Fund Growth Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="source" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Source Fund" />
                    <Area type="monotone" dataKey="target" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Target Fund" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "sourceBalance", label: "Source Fund", format: (v) => formatCurrency(v), sortable: true },
              { key: "targetBalance", label: "Target Fund", format: (v) => formatCurrency(v), sortable: true },
              { key: "transferred", label: "Total Transferred", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, "Source Fund": r.sourceBalance, "Target Fund": r.targetBalance, "Total Transferred": r.transferred })), "stp-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, "Source Fund": r.sourceBalance, "Target Fund": r.targetBalance, "Total Transferred": r.transferred })), "stp-results")}
          />
        </div>
      }
    />
  );
}
