"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateDiscount } from "@/lib/financial/gst";

export default function DiscountCalculatorPage() {
  const [originalPrice, setOriginalPrice] = useState(5000);
  const [discount1, setDiscount1] = useState(20);
  const [discount2, setDiscount2] = useState(10);

  const result = useMemo(() => calculateDiscount(originalPrice, discount1, discount2), [originalPrice, discount1, discount2]);

  return (
    <CalculatorLayout
      title="Discount Calculator"
      description="Calculate final price after single or double discounts."
      info="When two discounts are applied sequentially (e.g., 20% + 10%), they are NOT simply added. The second discount is applied on the already-discounted price."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Original Price" value={originalPrice} onChange={setOriginalPrice} min={1} max={10000000} step={100} prefix="₹" />
            <SliderField label="First Discount" value={discount1} onChange={setDiscount1} min={0} max={90} step={1} suffix="%" />
            <SliderField label="Second Discount" value={discount2} onChange={setDiscount2} min={0} max={90} step={1} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Original Price" value={formatCurrency(originalPrice, true)} />
            <SummaryCard label="Final Price" value={formatCurrency(Math.round(result.discountedPrice), true)} variant="success" />
            <SummaryCard label="You Save" value={formatCurrency(Math.round(result.totalDiscount), true)} variant="success" />
            <SummaryCard label="Effective Discount" value={formatPercent(result.totalDiscountPercent, 2)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Original Price</span><span className="font-medium">{formatCurrency(originalPrice)}</span></div>
                <div className="flex justify-between text-sm text-rose-600"><span>First Discount ({discount1}%)</span><span>-{formatCurrency(originalPrice * discount1 / 100)}</span></div>
                <div className="flex justify-between text-sm"><span>Price After First Discount</span><span className="font-medium">{formatCurrency(originalPrice * (1 - discount1 / 100))}</span></div>
                <div className="flex justify-between text-sm text-rose-600"><span>Second Discount ({discount2}%)</span><span>-{formatCurrency(originalPrice * (1 - discount1 / 100) * discount2 / 100)}</span></div>
                <div className="border-t pt-3 flex justify-between font-semibold"><span>Final Price</span><span>{formatCurrency(Math.round(result.discountedPrice))}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
