"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateProfitMargin } from "@/lib/financial/gst";

export default function ProfitMarginPage() {
  const [revenue, setRevenue] = useState(1000000);
  const [cogs, setCogs] = useState(600000);
  const [opEx, setOpEx] = useState(200000);

  const result = useMemo(() => calculateProfitMargin(revenue, cogs, opEx), [revenue, cogs, opEx]);

  return (
    <CalculatorLayout
      title="Profit Margin Calculator"
      description="Calculate gross and operating profit margins."
      info="Gross Margin = (Revenue - COGS) / Revenue. Operating Margin = Operating Profit / Revenue. Higher margins indicate better profitability."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Revenue" value={revenue} onChange={setRevenue} min={0} max={1000000000} step={100000} prefix="₹" />
            <InputField label="Cost of Goods Sold (COGS)" value={cogs} onChange={setCogs} min={0} max={1000000000} step={100000} prefix="₹" />
            <InputField label="Operating Expenses" value={opEx} onChange={setOpEx} min={0} max={1000000000} step={100000} prefix="₹" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Revenue" value={formatCurrency(revenue, true)} />
            <SummaryCard label="Gross Profit" value={formatCurrency(result.grossProfit, true)} variant={result.grossProfit > 0 ? "success" : "danger"} />
            <SummaryCard label="Gross Margin" value={formatPercent(result.grossMargin, 1)} variant={result.grossMargin > 30 ? "success" : "warning"} />
            <SummaryCard label="Operating Profit" value={formatCurrency(result.operatingProfit, true)} variant={result.operatingProfit > 0 ? "success" : "danger"} />
            <SummaryCard label="Operating Margin" value={formatPercent(result.operatingMargin, 1)} variant={result.operatingMargin > 15 ? "success" : "warning"} />
            <SummaryCard label="Net Profit" value={formatCurrency(result.netProfit, true)} variant={result.netProfit > 0 ? "success" : "danger"} />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">P&L Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Revenue</span><span className="font-medium">{formatCurrency(revenue)}</span></div>
                <div className="flex justify-between text-sm text-rose-600"><span>COGS</span><span>-{formatCurrency(cogs)}</span></div>
                <div className="border-t pt-2 flex justify-between text-sm"><span>Gross Profit</span><span className="font-medium">{formatCurrency(result.grossProfit)}</span></div>
                <div className="flex justify-between text-sm text-rose-600"><span>Operating Expenses</span><span>-{formatCurrency(opEx)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Operating Profit</span><span>{formatCurrency(result.operatingProfit)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
