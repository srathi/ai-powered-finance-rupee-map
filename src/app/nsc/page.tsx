"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency } from "@/lib/format";
import { calculateNSC } from "@/lib/financial/savings";

export default function NSCCalculatorPage() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7.7);
  const [tenure, setTenure] = useState(5);

  const result = useMemo(() => calculateNSC(principal, rate, tenure), [principal, rate, tenure]);

  return (
    <CalculatorLayout
      title="NSC Calculator"
      description="Calculate maturity amount on your National Savings Certificate investment."
      info="NSC is a government-backed savings scheme with fixed returns. Interest is compounded annually but paid at maturity. Current rate is 7.7% per annum for 5-year tenure."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Principal Amount" value={principal} onChange={setPrincipal} min={1000} max={10000000} step={1000} prefix="₹" />
            <SliderField label="Interest Rate" value={rate} onChange={setRate} min={5} max={12} step={0.1} suffix="%" />
            <SliderField label="Tenure" value={tenure} onChange={setTenure} min={1} max={10} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Maturity Amount" value={formatCurrency(result.maturityAmount, true)} variant="success" />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Investment Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Principal Invested</span>
                  <span className="font-semibold">{formatCurrency(principal)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Interest Rate</span>
                  <span className="font-semibold">{rate}% p.a.</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Tenure</span>
                  <span className="font-semibold">{tenure} years</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-sm font-medium">Maturity Amount</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(result.maturityAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-sm font-medium">Total Interest Earned</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(result.totalInterest)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
