"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { calculateIncomeTax } from "@/lib/financial/tax";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function IncomeTaxPage() {
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);
  const [regime, setRegime] = useState<"old" | "new">("new");

  const result = useMemo(
    () => calculateIncomeTax(grossIncome, deductions, regime),
    [grossIncome, deductions, regime]
  );

  return (
    <CalculatorLayout
      title="Income Tax Calculator (FY 2024-25)"
      description="Calculate your income tax liability under Old or New tax regime with detailed slab breakdown."
      info="Income tax is calculated based on progressive slabs. The New Regime offers lower rates but fewer deductions. Standard deduction of ₹75,000 (New) or ₹50,000 (Old) is applied automatically. 4% Health & Education Cess is added to the total tax."
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Income Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputField
              label="Gross Annual Income"
              value={grossIncome}
              onChange={setGrossIncome}
              min={0}
              max={100000000}
              step={50000}
              prefix="₹"
            />
            <InputField
              label="Total Deductions (80C, 80D, etc.)"
              value={deductions}
              onChange={setDeductions}
              min={0}
              max={10000000}
              step={10000}
              prefix="₹"
              tooltip="Only applicable under Old Regime. Includes 80C, 80D, HRA, etc."
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Tax Regime</p>
              <div className="flex gap-2">
                <Button
                  variant={regime === "old" ? "default" : "outline"}
                  onClick={() => setRegime("old")}
                  className="flex-1"
                >
                  Old Regime
                </Button>
                <Button
                  variant={regime === "new" ? "default" : "outline"}
                  onClick={() => setRegime("new")}
                  className="flex-1"
                >
                  New Regime
                </Button>
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={() => {}} className="w-full">
                Calculate Tax
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard
              label="Gross Income"
              value={formatCurrency(result.grossIncome, true)}
            />
            <SummaryCard
              label="Deductions"
              value={formatCurrency(result.deductions, true)}
              sublabel={regime === "new" ? "Not applicable in New Regime" : undefined}
            />
            <SummaryCard
              label="Taxable Income"
              value={formatCurrency(result.taxableIncome, true)}
            />
            <SummaryCard
              label="Tax Amount"
              value={formatCurrency(result.taxAmount, true)}
              variant="warning"
            />
            <SummaryCard
              label="Cess (4%)"
              value={formatCurrency(result.cess, true)}
            />
            <SummaryCard
              label="Total Tax"
              value={formatCurrency(result.totalTax, true)}
              variant="danger"
            />
            <SummaryCard
              label="Effective Tax Rate"
              value={formatPercent(result.effectiveRate, 2)}
              variant="danger"
            />
            <SummaryCard
              label="Take Home Income"
              value={formatCurrency(result.grossIncome - result.totalTax, true)}
              variant="success"
            />
          </SummaryGrid>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Tax Slab Breakdown ({regime === "new" ? "New" : "Old"} Regime)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">
                        Income Slab
                      </th>
                      <th className="text-right py-2 font-medium text-muted-foreground">
                        Tax Rate
                      </th>
                      <th className="text-right py-2 font-medium text-muted-foreground">
                        Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.slabs.map((slab, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{slab.slab}</td>
                        <td className="text-right py-2">{slab.rate}%</td>
                        <td className="text-right py-2 font-medium">
                          {formatCurrency(slab.tax)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="py-2">Total Tax</td>
                      <td></td>
                      <td className="text-right py-2">
                        {formatCurrency(result.taxAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
