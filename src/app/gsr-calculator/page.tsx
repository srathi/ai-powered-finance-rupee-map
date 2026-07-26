"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateGST, gstInclusiveToExclusive, gstExclusiveToInclusive } from "@/lib/financial/gst";

export default function GSTCalculatorPage() {
  const [amount, setAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [isInterstate, setIsInterstate] = useState(false);
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const result = useMemo(() => {
    if (mode === "inclusive") {
      const { exclusiveAmount, gstAmount } = gstInclusiveToExclusive(amount, gstRate);
      return calculateGST(exclusiveAmount, gstRate, isInterstate);
    }
    return calculateGST(amount, gstRate, isInterstate);
  }, [amount, gstRate, isInterstate, mode]);

  return (
    <CalculatorLayout
      title="GST Calculator"
      description="Calculate GST (CGST, SGST, IGST) on any amount."
      info="GST (Goods and Services Tax) is calculated at the applicable rate. For intrastate transactions, GST is split equally into CGST and SGST. For interstate, IGST applies at the full rate."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Mode</label>
              <div className="flex gap-2">
                <Button variant={mode === "exclusive" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setMode("exclusive")}>Exclusive (Before Tax)</Button>
                <Button variant={mode === "inclusive" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setMode("inclusive")}>Inclusive (After Tax)</Button>
              </div>
            </div>
            <InputField label="Amount" value={amount} onChange={setAmount} min={1} max={100000000} step={100} prefix="₹" />
            <SliderField label="GST Rate" value={gstRate} onChange={setGstRate} min={0} max={28} step={1} suffix="%" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <div className="flex gap-2">
                <Button variant={!isInterstate ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setIsInterstate(false)}>Intra-state</Button>
                <Button variant={isInterstate ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setIsInterstate(true)}>Inter-state</Button>
              </div>
            </div>
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Original Amount" value={formatCurrency(mode === "inclusive" ? amount : result.exclusiveAmount, true)} />
            <SummaryCard label="Total GST" value={formatCurrency(result.totalGST, true)} variant="warning" />
            <SummaryCard label="Final Amount" value={formatCurrency(result.inclusiveAmount, true)} variant="success" />
            {!isInterstate ? (
              <>
                <SummaryCard label="CGST" value={formatCurrency(result.cgst, true)} sublabel={`${gstRate / 2}%`} />
                <SummaryCard label="SGST" value={formatCurrency(result.sgst, true)} sublabel={`${gstRate / 2}%`} />
              </>
            ) : (
              <SummaryCard label="IGST" value={formatCurrency(result.igst, true)} sublabel={`${gstRate}%`} />
            )}
          </SummaryGrid>
        </div>
      }
    />
  );
}
