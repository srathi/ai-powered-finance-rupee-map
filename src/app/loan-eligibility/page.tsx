"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { loanEligibility, emi as calcEmi } from "@/lib/financial/loan";

export default function LoanEligibilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [existingEmis, setExistingEmis] = useState(0);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [foir, setFoir] = useState(50);

  const tenureMonths = tenureYears * 12;

  const result = useMemo(() => {
    const maxLoan = loanEligibility(monthlyIncome, existingEmis, annualRate, tenureMonths, foir);
    const maxEmiCapacity = (monthlyIncome * foir) / 100;
    const availableEmi = maxEmiCapacity - existingEmis;
    const maxEmi = availableEmi > 0 ? availableEmi : 0;
    const foirUsed = monthlyIncome > 0 ? (existingEmis / monthlyIncome) * 100 : 0;
    return { maxLoan, maxEmiCapacity, availableEmi: maxEmi, foirUsed };
  }, [monthlyIncome, existingEmis, annualRate, tenureMonths, foir]);

  return (
    <CalculatorLayout
      title="Loan Eligibility Calculator"
      description="Find out the maximum loan amount you are eligible for based on your income and existing obligations."
      info="Lenders use FOIR (Fixed Obligation to Income Ratio) to determine eligibility. Typically, your total EMIs (existing + new) should not exceed 50% of your monthly income. This calculator uses that rule to find your maximum eligible loan."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Income & Obligations</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Monthly Income" value={monthlyIncome} onChange={setMonthlyIncome} min={10000} max={10000000} step={5000} prefix="₹" />
            <InputField label="Existing EMIs" value={existingEmis} onChange={setExistingEmis} min={0} max={10000000} step={1000} prefix="₹" />
            <SliderField label="Interest Rate" value={annualRate} onChange={setAnnualRate} min={1} max={20} step={0.1} suffix="%" />
            <SliderField label="Loan Tenure" value={tenureYears} onChange={setTenureYears} min={1} max={30} step={1} suffix=" yr" />
            <SliderField label="FOIR Limit" value={foir} onChange={setFoir} min={30} max={70} step={1} suffix="%" tooltip="Fixed Obligation to Income Ratio - max % of income allowed for EMIs" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Max Eligible Loan" value={formatCurrency(Math.round(result.maxLoan), true)} variant="success" />
            <SummaryCard label="Max EMI Capacity" value={formatCurrency(Math.round(result.maxEmiCapacity))} variant="default" />
            <SummaryCard label="Available EMI Capacity" value={formatCurrency(Math.round(result.availableEmi))} variant={result.availableEmi > 0 ? "success" : "danger"} />
            <SummaryCard label="FOIR Used" value={formatPercent(result.foirUsed, 1)} variant={result.foirUsed > foir ? "danger" : "default"} />
            <SummaryCard label="Existing EMI Load" value={formatCurrency(existingEmis)} sublabel={`${formatPercent(foir - result.foirUsed, 1)} headroom left`} />
            <SummaryCard label="Loan Tenure" value={`${tenureYears} years`} sublabel={`${tenureMonths} months`} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Eligibility Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Monthly Income</span>
                  <span className="font-medium">{formatCurrency(monthlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Max EMI allowed ({foir}% of income)</span>
                  <span className="font-medium">{formatCurrency(Math.round(result.maxEmiCapacity))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Less: Existing EMIs</span>
                  <span className="font-medium text-destructive">- {formatCurrency(existingEmis)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Available EMI for new loan</span>
                  <span className="font-medium text-primary">{formatCurrency(Math.round(result.availableEmi))}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Max Loan Amount @ {annualRate}% for {tenureYears} years</span>
                  <span className="font-bold text-lg text-emerald-600">{formatCurrency(Math.round(result.maxLoan), true)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
