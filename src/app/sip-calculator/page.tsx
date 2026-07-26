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
import { futureValueOfAnnuity } from "@/lib/financial/math";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { RotateCcw } from "lucide-react";

export default function SIPPage() {
  const [monthlySip, setMonthlySip] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const months = years * 12;
    const futureValue = futureValueOfAnnuity(monthlySip, annualReturn, months);
    const totalInvested = monthlySip * months;
    const wealthGained = futureValue - totalInvested;
    return { futureValue, totalInvested, wealthGained, months };
  }, [monthlySip, annualReturn, years]);

  const chartData = useMemo(() => {
    const data = [];
    const months = years * 12;
    for (let m = 1; m <= months; m++) {
      if (m % 12 === 0 || m === 1) {
        const invested = monthlySip * m;
        const fv = futureValueOfAnnuity(monthlySip, annualReturn, m);
        data.push({
          name: `Yr ${Math.ceil(m / 12)}`,
          invested: Math.round(invested),
          returns: Math.round(fv - invested),
        });
      }
    }
    return data;
  }, [monthlySip, annualReturn, years]);

  const tableData = useMemo(() => {
    const data = [];
    const months = years * 12;
    for (let y = 1; y <= years; y++) {
      const m = y * 12;
      const invested = monthlySip * m;
      const fv = futureValueOfAnnuity(monthlySip, annualReturn, m);
      data.push({
        year: y,
        invested: Math.round(invested),
        returns: Math.round(fv - invested),
        totalValue: Math.round(fv),
      });
    }
    return data;
  }, [monthlySip, annualReturn, years]);

  return (
    <CalculatorLayout
      title="SIP Calculator"
      description="Calculate returns on Systematic Investment Plans with monthly contributions."
      info="A SIP allows you to invest a fixed amount regularly in mutual funds. This calculator uses the future value of annuity formula: FV = P × [((1+r)^n - 1) / r], where P is monthly investment, r is monthly rate, and n is number of months."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Monthly SIP Amount" value={monthlySip} onChange={setMonthlySip} min={500} max={1000000} step={500} prefix="₹" />
            <SliderField label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Investment Period" value={years} onChange={setYears} min={1} max={40} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Invested Amount" value={formatCurrency(result.totalInvested, true)} />
            <SummaryCard label="Estimated Returns" value={formatCurrency(result.wealthGained, true)} variant="success" />
            <SummaryCard label="Total Value" value={formatCurrency(result.futureValue, true)} variant="success" />
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
                    <Area type="monotone" dataKey="invested" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Invested" />
                    <Area type="monotone" dataKey="returns" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Returns" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "invested", label: "Invested", format: (v) => formatCurrency(v), sortable: true },
              { key: "returns", label: "Returns", format: (v) => formatCurrency(v), sortable: true },
              { key: "totalValue", label: "Total Value", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, Invested: r.invested, Returns: r.returns, "Total Value": r.totalValue })), "sip-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, Invested: r.invested, Returns: r.returns, "Total Value": r.totalValue })), "sip-results")}
          />
        </div>
      }
    />
  );
}
