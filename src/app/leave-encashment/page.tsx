"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField } from "@/components/input-controls";
import { calculateLeaveEncashment } from "@/lib/financial/tax";
import { formatCurrency } from "@/lib/format";

export default function LeaveEncashmentPage() {
  const [lastDrawnSalary, setLastDrawnSalary] = useState(60000);
  const [unusedLeaveDays, setUnusedLeaveDays] = useState(30);

  const result = useMemo(
    () => calculateLeaveEncashment(lastDrawnSalary, unusedLeaveDays),
    [lastDrawnSalary, unusedLeaveDays]
  );

  return (
    <CalculatorLayout
      title="Leave Encashment Calculator"
      description="Calculate tax on leave encashment at the time of retirement or resignation."
      info="Leave encashment is the amount received for unused leave days. Under Section 10(10AA), leave encashment up to ₹25,00,000 is exempt from tax for private sector employees at the time of retirement. The daily wage is calculated as (Last Drawn Salary / 30)."
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave Details</CardTitle>
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
            <InputField
              label="Unused Leave Days"
              value={unusedLeaveDays}
              onChange={setUnusedLeaveDays}
              min={0}
              max={365}
              step={1}
              suffix="days"
            />
            <div className="pt-2">
              <Button onClick={() => {}} className="w-full">
                Calculate Encashment
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard
              label="Encashment Amount"
              value={formatCurrency(result.amount, true)}
              variant="success"
            />
            <SummaryCard
              label="Tax Exempt (up to ₹25L)"
              value={result.isExempt ? "Fully Exempt" : "Partial Exemption"}
              variant={result.isExempt ? "success" : "warning"}
              sublabel={result.isExempt ? "No tax on encashment" : "Excess is taxable"}
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
                    (Last Drawn Salary / 30) × Unused Days
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Daily Wage</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(lastDrawnSalary / 30)}/day
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Unused Leave Days</span>
                  <span className="text-sm font-medium">{unusedLeaveDays} days</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Exemption Limit</span>
                  <span className="text-sm font-medium">₹25,00,000</span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span>Encashment Amount</span>
                  <span>{formatCurrency(result.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
