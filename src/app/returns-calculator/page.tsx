"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { lumpsumFutureValue, futureValueOfAnnuity, cagr } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ReturnsCalculatorPage() {
  const [investmentType, setInvestmentType] = useState<"lumpsum" | "sip">("lumpsum");
  const [amount, setAmount] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    let futureVal: number;
    let invested: number;

    if (investmentType === "lumpsum") {
      futureVal = lumpsumFutureValue(amount, annualReturn, years);
      invested = amount;
    } else {
      const months = years * 12;
      futureVal = futureValueOfAnnuity(amount, annualReturn, months);
      invested = amount * months;
    }

    const totalGain = futureVal - invested;
    const absReturn = invested > 0 ? (totalGain / invested) * 100 : 0;
    const annualizedReturn = cagr(invested, futureVal, years);

    return { futureVal, invested, totalGain, absReturn, annualizedReturn };
  }, [investmentType, amount, annualReturn, years]);

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      let investedSoFar: number;
      let totalValue: number;

      if (investmentType === "lumpsum") {
        investedSoFar = amount;
        totalValue = lumpsumFutureValue(amount, annualReturn, y);
      } else {
        investedSoFar = amount * y * 12;
        totalValue = y > 0 ? futureValueOfAnnuity(amount, annualReturn, y * 12) : 0;
      }

      data.push({
        name: `Yr ${y}`,
        invested: Math.round(investedSoFar),
        value: Math.round(totalValue),
      });
    }
    return data;
  }, [investmentType, amount, annualReturn, years]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 1; y <= years; y++) {
      let investedSoFar: number;
      let totalValue: number;

      if (investmentType === "lumpsum") {
        investedSoFar = amount;
        totalValue = lumpsumFutureValue(amount, annualReturn, y);
      } else {
        investedSoFar = amount * y * 12;
        totalValue = futureValueOfAnnuity(amount, annualReturn, y * 12);
      }

      data.push({
        year: y,
        invested: Math.round(investedSoFar),
        returns: Math.round(totalValue - investedSoFar),
        totalValue: Math.round(totalValue),
      });
    }
    return data;
  }, [investmentType, amount, annualReturn, years]);

  return (
    <CalculatorLayout
      title="Returns Calculator"
      description="Calculate absolute and annualized returns for your investments."
      info="Compare how your investment grows over time. Switch between Lumpsum and SIP modes to see the difference in returns."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Investment Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={investmentType === "lumpsum" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setInvestmentType("lumpsum")}
                >
                  Lumpsum
                </Button>
                <Button
                  variant={investmentType === "sip" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setInvestmentType("sip")}
                >
                  SIP
                </Button>
              </div>
            </div>
            <InputField
              label={investmentType === "sip" ? "Monthly SIP Amount" : "Investment Amount"}
              value={amount}
              onChange={setAmount}
              min={100}
              max={100000000}
              step={100}
              prefix="₹"
            />
            <SliderField label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Investment Period" value={years} onChange={setYears} min={1} max={40} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Invested Amount" value={formatCurrency(result.invested, true)} />
            <SummaryCard label="Future Value" value={formatCurrency(result.futureVal, true)} variant="success" />
            <SummaryCard label="Absolute Return" value={formatPercent(result.absReturn, 2)} />
            <SummaryCard label="Annualized Return" value={formatPercent(result.annualizedReturn, 2)} variant="success" />
            <SummaryCard label="Total Gain" value={formatCurrency(result.totalGain, true)} variant={result.totalGain > 0 ? "success" : "danger"} />
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
                    <Area type="monotone" dataKey="invested" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Invested" />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Total Value" />
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
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, Invested: r.invested, Returns: r.returns, "Total Value": r.totalValue })), "returns-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, Invested: r.invested, Returns: r.returns, "Total Value": r.totalValue })), "returns-results")}
          />
        </div>
      }
    />
  );
}
