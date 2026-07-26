"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField } from "@/components/input-controls";
import { compareRegimes } from "@/lib/financial/tax";
import { formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function OldVsNewRegimePage() {
  const [grossIncome, setGrossIncome] = useState(1500000);
  const [deductions, setDeductions] = useState(200000);

  const result = useMemo(
    () => compareRegimes(grossIncome, deductions),
    [grossIncome, deductions]
  );

  const chartData = [
    {
      name: "Old Regime",
      tax: Math.round(result.old.totalTax),
      fill: "hsl(0, 84%, 60%)",
    },
    {
      name: "New Regime",
      tax: Math.round(result.new.totalTax),
      fill: "hsl(217, 91%, 60%)",
    },
  ];

  return (
    <CalculatorLayout
      title="Old vs New Tax Regime"
      description="Compare your tax liability under both regimes and find out which one saves you more."
      info="The New Regime (default from FY 2023-24) offers lower tax rates but requires you to give up most deductions. The Old Regime allows deductions like 80C, 80D, HRA, etc. but has higher slab rates. This calculator shows which regime is better for your income level."
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
              label="Total Deductions (80C, 80D, HRA, etc.)"
              value={deductions}
              onChange={setDeductions}
              min={0}
              max={10000000}
              step={10000}
              prefix="₹"
              tooltip="Applicable only under Old Regime"
            />
            <div className="pt-2">
              <Button onClick={() => {}} className="w-full">
                Compare Regimes
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard
              label="Old Regime Tax"
              value={formatCurrency(result.old.totalTax, true)}
              variant="warning"
            />
            <SummaryCard
              label="New Regime Tax"
              value={formatCurrency(result.new.totalTax, true)}
              variant="success"
            />
            <SummaryCard
              label="Savings"
              value={formatCurrency(result.savings, true)}
              variant={result.betterRegime === "New Regime" ? "success" : "default"}
              sublabel={`Better: ${result.betterRegime}`}
            />
          </SummaryGrid>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tax Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) =>
                        v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Bar dataKey="tax" name="Tax Amount" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <rect key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Old Regime Slabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Slab</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Rate</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.old.slabs.map((slab, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2">{slab.slab}</td>
                          <td className="text-right py-2">{slab.rate}%</td>
                          <td className="text-right py-2 font-medium">
                            {formatCurrency(slab.tax)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-2">Total</td>
                        <td></td>
                        <td className="text-right py-2">
                          {formatCurrency(result.old.totalTax)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Regime Slabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Slab</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Rate</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.new.slabs.map((slab, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2">{slab.slab}</td>
                          <td className="text-right py-2">{slab.rate}%</td>
                          <td className="text-right py-2 font-medium">
                            {formatCurrency(slab.tax)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-2">Total</td>
                        <td></td>
                        <td className="text-right py-2">
                          {formatCurrency(result.new.totalTax)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    />
  );
}
