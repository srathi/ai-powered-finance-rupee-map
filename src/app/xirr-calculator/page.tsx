"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateXirr } from "@/lib/financial/math";
import { Plus, Trash2 } from "lucide-react";

interface Cashflow {
  date: string;
  amount: number;
}

const defaultCashflows: Cashflow[] = [
  { date: "2020-01-01", amount: -100000 },
  { date: "2021-01-01", amount: 30000 },
  { date: "2022-01-01", amount: 30000 },
  { date: "2023-01-01", amount: 30000 },
  { date: "2024-01-01", amount: 30000 },
  { date: "2025-01-01", amount: 30000 },
];

export default function XIRRPage() {
  const [cashflows, setCashflows] = useState<Cashflow[]>(defaultCashflows);

  const result = useMemo(() => {
    const xirrVal = calculateXirr(
      cashflows.map((cf) => ({ date: new Date(cf.date), amount: cf.amount }))
    );
    const totalInvested = cashflows
      .filter((cf) => cf.amount < 0)
      .reduce((sum, cf) => sum + Math.abs(cf.amount), 0);
    const totalReceived = cashflows
      .filter((cf) => cf.amount > 0)
      .reduce((sum, cf) => sum + cf.amount, 0);
    return { xirrVal, totalInvested, totalReceived, netGain: totalReceived - totalInvested };
  }, [cashflows]);

  const addCashflow = () => {
    setCashflows((prev) => [
      ...prev,
      { date: new Date().toISOString().split("T")[0], amount: 10000 },
    ]);
  };

  const removeCashflow = (index: number) => {
    setCashflows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCashflow = (index: number, field: keyof Cashflow, value: string | number) => {
    setCashflows((prev) =>
      prev.map((cf, i) => (i === index ? { ...cf, [field]: value } : cf))
    );
  };

  return (
    <CalculatorLayout
      title="XIRR Calculator"
      description="Calculate the annualized return for irregular cashflows."
      info="XIRR (Extended Internal Rate of Return) calculates the annualized return when cashflows occur at irregular intervals. It accounts for both the timing and amount of each cashflow."
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cashflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Enter negative values for investments (outflows) and positive for returns (inflows).
            </div>
            {cashflows.map((cf, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  {idx === 0 && <Label className="text-xs mb-1 block">Date</Label>}
                  <Input
                    type="date"
                    value={cf.date}
                    onChange={(e) => updateCashflow(idx, "date", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  {idx === 0 && <Label className="text-xs mb-1 block">Amount (₹)</Label>}
                  <Input
                    type="number"
                    value={cf.amount}
                    onChange={(e) => updateCashflow(idx, "amount", parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => removeCashflow(idx)}
                  disabled={cashflows.length <= 2}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCashflow} className="w-full gap-1">
              <Plus className="h-4 w-4" /> Add Cashflow
            </Button>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="XIRR" value={formatPercent(result.xirrVal, 2)} variant={result.xirrVal > 0 ? "success" : "danger"} />
            <SummaryCard label="Total Invested" value={formatCurrency(result.totalInvested, true)} />
            <SummaryCard label="Total Received" value={formatCurrency(result.totalReceived, true)} variant="success" />
            <SummaryCard label="Net Gain" value={formatCurrency(result.netGain, true)} variant={result.netGain > 0 ? "success" : "danger"} />
          </SummaryGrid>
        </div>
      }
    />
  );
}
