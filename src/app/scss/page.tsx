"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency } from "@/lib/format";
import { calculateSCSS } from "@/lib/financial/savings";

export default function SCSSCalculatorPage() {
  const [principal, setPrincipal] = useState(3000000);
  const [rate, setRate] = useState(8.2);
  const [tenure, setTenure] = useState(5);

  const result = useMemo(() => calculateSCSS(principal, rate, tenure), [principal, rate, tenure]);

  return (
    <CalculatorLayout
      title="Senior Citizen Savings Scheme Calculator"
      description="Calculate maturity and quarterly interest on SCSS for senior citizens."
      info="SCSS is available for citizens aged 60 and above. Maximum deposit is ₹30 lakh. Interest is paid quarterly. Current rate is 8.2% per annum."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Deposit Amount" value={principal} onChange={setPrincipal} min={1000} max={3000000} step={10000} prefix="₹" tooltip="Maximum ₹30,00,000" />
            <SliderField label="Interest Rate" value={rate} onChange={setRate} min={5} max={12} step={0.1} suffix="%" />
            <SliderField label="Tenure" value={tenure} onChange={setTenure} min={1} max={5} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Maturity Amount" value={formatCurrency(result.maturityAmount, true)} variant="success" />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="success" />
            <SummaryCard label="Quarterly Interest" value={formatCurrency(result.quarterlyInterest)} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Investment Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Principal Deposited</span>
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
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Quarterly Interest Payout</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(result.quarterlyInterest)}</span>
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
