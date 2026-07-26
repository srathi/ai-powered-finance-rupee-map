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
import { stepUpSipFutureValue } from "@/lib/financial/math";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function StepUpSIPPage() {
  const [monthlySip, setMonthlySip] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(10);

  const result = useMemo(() => {
    const fv = stepUpSipFutureValue(monthlySip, annualReturn, years, stepUp);
    let totalInvested = 0;
    let currentSip = monthlySip;
    for (let y = 0; y < years; y++) {
      totalInvested += currentSip * 12;
      currentSip *= 1 + stepUp / 100;
    }
    return { futureValue: fv, totalInvested, returns: fv - totalInvested };
  }, [monthlySip, annualReturn, years, stepUp]);

  const tableData = useMemo(() => {
    const data = [];
    let currentSip = monthlySip;
    let totalInvested = 0;
    for (let y = 1; y <= years; y++) {
      totalInvested += currentSip * 12;
      const fv = stepUpSipFutureValue(monthlySip, annualReturn, y, stepUp);
      data.push({ year: y, sip: Math.round(currentSip), invested: Math.round(totalInvested), returns: Math.round(fv - totalInvested), totalValue: Math.round(fv) });
      currentSip *= 1 + stepUp / 100;
    }
    return data;
  }, [monthlySip, annualReturn, years, stepUp]);

  return (
    <CalculatorLayout
      title="Step-Up SIP Calculator"
      description="Calculate returns on SIP with annual step-up in investment amount."
      info="Step-Up SIP increases your monthly investment by a fixed percentage each year, helping you build wealth faster. Even a 10% annual step-up can dramatically increase your corpus."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Monthly SIP Amount" value={monthlySip} onChange={setMonthlySip} min={500} max={1000000} step={500} prefix="₹" />
            <SliderField label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={30} step={0.5} suffix="%" />
            <SliderField label="Investment Period" value={years} onChange={setYears} min={1} max={40} step={1} suffix=" yr" />
            <SliderField label="Annual Step-up" value={stepUp} onChange={setStepUp} min={0} max={50} step={1} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Invested Amount" value={formatCurrency(result.totalInvested, true)} />
            <SummaryCard label="Estimated Returns" value={formatCurrency(result.returns, true)} variant="success" />
            <SummaryCard label="Total Value" value={formatCurrency(result.futureValue, true)} variant="success" />
          </SummaryGrid>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "sip", label: "Monthly SIP", format: (v) => formatCurrency(v), sortable: true },
              { key: "invested", label: "Total Invested", format: (v) => formatCurrency(v), sortable: true },
              { key: "returns", label: "Returns", format: (v) => formatCurrency(v), sortable: true },
              { key: "totalValue", label: "Total Value", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, "Monthly SIP": r.sip, "Total Invested": r.invested, Returns: r.returns, "Total Value": r.totalValue })), "step-up-sip")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, "Monthly SIP": r.sip, "Total Invested": r.invested, Returns: r.returns, "Total Value": r.totalValue })), "step-up-sip")}
          />
        </div>
      }
    />
  );
}
