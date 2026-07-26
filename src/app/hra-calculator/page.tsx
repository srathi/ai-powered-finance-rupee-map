"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField } from "@/components/input-controls";
import { calculateHRA } from "@/lib/financial/tax";
import { formatCurrency } from "@/lib/format";

export default function HRACalculatorPage() {
  const [basicSalary, setBasicSalary] = useState(50000);
  const [da, setDa] = useState(5000);
  const [hraReceived, setHraReceived] = useState(25000);
  const [rentPaid, setRentPaid] = useState(15000);
  const [isMetro, setIsMetro] = useState(false);

  const result = useMemo(
    () =>
      calculateHRA({
        basicSalary,
        da,
        hraReceived,
        rentPaid,
        isMetro,
      }),
    [basicSalary, da, hraReceived, rentPaid, isMetro]
  );

  const conditions = [
    {
      label: "Actual HRA Received",
      value: result.calculationBasis.actualHRA,
      description: "HRA received from employer",
    },
    {
      label: `Rent Paid - 10% of (Basic + DA)`,
      value: result.calculationBasis.rentMinusTenPct,
      description: `₹${rentPaid.toLocaleString("en-IN")} - 10% × ₹${(basicSalary + da).toLocaleString("en-IN")}`,
    },
    {
      label: `${isMetro ? 50 : 40}% of (Basic + DA)`,
      value: isMetro
        ? result.calculationBasis.fiftyPercentOfBasic
        : result.calculationBasis.fortyPercentOfBasic,
      description: `${isMetro ? "50%" : "40%"} for ${isMetro ? "Metro" : "Non-Metro"} cities`,
    },
  ];

  return (
    <CalculatorLayout
      title="HRA Exemption Calculator"
      description="Calculate House Rent Allowance (HRA) exemption under Section 10(13A)."
      info="HRA exemption is the minimum of three conditions: (1) Actual HRA received, (2) Rent paid minus 10% of Basic + DA, (3) 50% of Basic + DA (metro) or 40% (non-metro). The remaining HRA is taxable."
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Salary Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputField
              label="Basic Salary (Monthly)"
              value={basicSalary}
              onChange={setBasicSalary}
              min={0}
              max={10000000}
              step={1000}
              prefix="₹"
            />
            <InputField
              label="Dearness Allowance (Monthly)"
              value={da}
              onChange={setDa}
              min={0}
              max={10000000}
              step={1000}
              prefix="₹"
              tooltip="DA forming part of retirement benefits"
            />
            <InputField
              label="HRA Received (Monthly)"
              value={hraReceived}
              onChange={setHraReceived}
              min={0}
              max={10000000}
              step={1000}
              prefix="₹"
            />
            <InputField
              label="Rent Paid (Monthly)"
              value={rentPaid}
              onChange={setRentPaid}
              min={0}
              max={10000000}
              step={1000}
              prefix="₹"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">City Type</p>
              <div className="flex gap-2">
                <Button
                  variant={!isMetro ? "default" : "outline"}
                  onClick={() => setIsMetro(false)}
                  className="flex-1"
                >
                  Non-Metro
                </Button>
                <Button
                  variant={isMetro ? "default" : "outline"}
                  onClick={() => setIsMetro(true)}
                  className="flex-1"
                >
                  Metro (Delhi, Mumbai, Kolkata, Chennai)
                </Button>
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={() => {}} className="w-full">
                Calculate HRA
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard
              label="HRA Exemption"
              value={formatCurrency(result.exemption, true)}
              variant="success"
            />
            <SummaryCard
              label="Taxable HRA"
              value={formatCurrency(result.taxableHRA, true)}
              variant={result.taxableHRA > 0 ? "warning" : "success"}
            />
            <SummaryCard
              label="HRA Received"
              value={formatCurrency(result.hraReceived, true)}
            />
          </SummaryGrid>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exemption Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                HRA exemption is the <strong>minimum</strong> of the following three conditions:
              </p>
              <div className="space-y-3">
                {conditions.map((cond, i) => {
                  const isMinimum = Math.abs(cond.value - result.exemption) < 0.01;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        isMinimum
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border/50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {i + 1}. {cond.label}
                            {isMinimum && (
                              <span className="ml-2 text-xs text-emerald-600 font-semibold">
                                (Minimum - Exemption Basis)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {cond.description}
                          </p>
                        </div>
                        <span className="font-semibold text-sm">
                          {formatCurrency(cond.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
