"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cagr, absoluteReturn } from "@/lib/financial/math";

export default function CAGRPage() {
  const [beginningValue, setBeginningValue] = useState(100000);
  const [endingValue, setEndingValue] = useState(250000);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    const cagrValue = cagr(beginningValue, endingValue, years);
    const absReturn = absoluteReturn(beginningValue, endingValue);
    const totalGain = endingValue - beginningValue;
    const multiple = endingValue / beginningValue;
    return { cagrValue, absReturn, totalGain, multiple };
  }, [beginningValue, endingValue, years]);

  const tableData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      const value = beginningValue * Math.pow(1 + result.cagrValue / 100, y);
      data.push({ year: y, value: Math.round(value), gain: Math.round(value - beginningValue) });
    }
    return data;
  }, [beginningValue, result.cagrValue, years]);

  return (
    <CalculatorLayout
      title="CAGR Calculator"
      description="Calculate the Compound Annual Growth Rate of your investment."
      info="CAGR = (Ending Value / Beginning Value)^(1/n) - 1, where n is the number of years. It smoothens out the volatility and gives a single annual growth rate."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Beginning Value" value={beginningValue} onChange={setBeginningValue} min={100} max={1000000000} step={1000} prefix="₹" />
            <InputField label="Ending Value" value={endingValue} onChange={setEndingValue} min={100} max={1000000000} step={1000} prefix="₹" />
            <SliderField label="Investment Period" value={years} onChange={setYears} min={1} max={40} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="CAGR" value={formatPercent(result.cagrValue, 2)} variant="success" />
            <SummaryCard label="Absolute Return" value={formatPercent(result.absReturn, 2)} />
            <SummaryCard label="Total Gain" value={formatCurrency(result.totalGain, true)} variant="success" />
            <SummaryCard label="Investment Multiple" value={`${result.multiple.toFixed(2)}x`} />
            <SummaryCard label="Beginning Value" value={formatCurrency(beginningValue, true)} />
            <SummaryCard label="Ending Value" value={formatCurrency(endingValue, true)} variant="success" />
          </SummaryGrid>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "value", label: "Value", format: (v) => formatCurrency(v), sortable: true },
              { key: "gain", label: "Gain", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Growth"
          />
        </div>
      }
    />
  );
}
