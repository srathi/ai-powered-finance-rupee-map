"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateHealthInsurance } from "@/lib/financial/insurance";

export default function HealthInsurancePage() {
  const [age, setAge] = useState(35);
  const [sumInsured, setSumInsured] = useState(1000000);
  const [preExisting, setPreExisting] = useState(false);

  const result = useMemo(() => calculateHealthInsurance(age, sumInsured, preExisting), [age, sumInsured, preExisting]);

  const comparisonData = useMemo(() => {
    return [25, 30, 35, 40, 45, 50, 55, 60, 65].map((a) => {
      const noDisease = calculateHealthInsurance(a, sumInsured, false);
      const withDisease = calculateHealthInsurance(a, sumInsured, true);
      return { age: a, premium: Math.round(noDisease.premium), premiumWithDisease: Math.round(withDisease.premium) };
    });
  }, [sumInsured]);

  return (
    <CalculatorLayout
      title="Health Insurance Calculator"
      description="Estimate health insurance premiums based on age and coverage."
      info="Health insurance premiums vary by age, sum insured, and pre-existing conditions. This provides an indicative estimate. Actual premiums vary by insurer and plan."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <SliderField label="Age" value={age} onChange={setAge} min={18} max={70} step={1} suffix=" yr" />
            <InputField label="Sum Insured" value={sumInsured} onChange={setSumInsured} min={100000} max={50000000} step={100000} prefix="₹" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Pre-existing Diseases</label>
              <div className="flex gap-2">
                <Button variant={!preExisting ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setPreExisting(false)}>No</Button>
                <Button variant={preExisting ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setPreExisting(true)}>Yes</Button>
              </div>
            </div>
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Estimated Annual Premium" value={formatCurrency(Math.round(result.premium))} variant="success" />
            <SummaryCard label="Coverage Amount" value={formatCurrency(result.coverage)} />
            <SummaryCard label="Co-pay" value={formatPercent(result.coPay * 100, 0)} sublabel={result.coPay > 0 ? "Applicable due to pre-existing conditions" : "No co-pay"} />
          </SummaryGrid>
          <ResultsTable
            columns={[
              { key: "age", label: "Age", sortable: true },
              { key: "premium", label: "Premium (No Disease)", format: (v) => formatCurrency(v), sortable: true },
              { key: "premiumWithDisease", label: "Premium (With Disease)", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={comparisonData}
            title="Premium Comparison by Age"
          />
        </div>
      }
    />
  );
}
