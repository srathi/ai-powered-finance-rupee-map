"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { calculateGratuity } from "@/lib/financial/tax";
import { formatCurrency } from "@/lib/format";

export default function GratuityPage() {
  const [lastDrawnSalary, setLastDrawnSalary] = useState(60000);
  const [yearsOfService, setYearsOfService] = useState(10);

  const result = useMemo(
    () => calculateGratuity(lastDrawnSalary, yearsOfService),
    [lastDrawnSalary, yearsOfService]
  );

  return (
    <CalculatorLayout
      title="Gratuity Calculator"
      description="Calculate your gratuity amount and tax exemption under Section 10(10)."
      info="Gratuity = (Last Drawn Salary × 15 × Years of Service) / 26. Under Section 10(10), gratuity up to ₹20,00,000 is exempt from tax for private sector employees. The exemption is available once in a lifetime."
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputField
              label="Last Drawn Salary (Monthly - Basic + DA)"
              value={lastDrawnSalary}
              onChange={setLastDrawnSalary}
              min={0}
              max={10000000}
              step={1000}
              prefix="₹"
            />
            <SliderField
              label="Years of Service"
              value={yearsOfService}
              onChange={setYearsOfService}
              min={1}
              max={50}
              step={1}
              suffix=" yr"
            />
            <div className="pt-2">
              <Button onClick={() => {}} className="w-full">
                Calculate Gratuity
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard
              label="Gratuity Amount"
              value={formatCurrency(result.gratuity, true)}
              variant="success"
            />
            <SummaryCard
              label="Tax Exempt (up to ₹20L)"
              value={result.isExempt ? "Fully Exempt" : "Partial Exemption"}
              variant={result.isExempt ? "success" : "warning"}
              sublabel={result.isExempt ? "No tax on gratuity" : "Excess is taxable"}
            />
            <SummaryCard
              label="Taxable Amount"
              value={formatCurrency(result.taxableAmount, true)}
              variant={result.taxableAmount > 0 ? "danger" : "success"}
            />
          </SummaryGrid>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calculation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Formula</span>
                  <span className="text-sm font-medium">
                    (Salary × 15 × Years) / 26
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Last Drawn Salary</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(lastDrawnSalary)}/month
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Years of Service</span>
                  <span className="text-sm font-medium">{yearsOfService} years</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Exemption Limit</span>
                  <span className="text-sm font-medium">₹20,00,000</span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span>Gratuity Amount</span>
                  <span>{formatCurrency(result.gratuity)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
