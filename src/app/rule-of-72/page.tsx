"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { SliderField } from "@/components/input-controls";
import { formatPercent } from "@/lib/format";
import { ruleOf72 } from "@/lib/financial/math";

export default function RuleOf72Page() {
  const [rate, setRate] = useState(8);

  const yearsToDouble = useMemo(() => ruleOf72(rate), [rate]);

  return (
    <CalculatorLayout
      title="Rule of 72 Calculator"
      description="Quickly estimate how long it takes for your money to double."
      info="Rule of 72: Years to Double = 72 / Annual Return Rate. It's a quick mental math trick. At 8%, money doubles in 9 years. At 12%, in 6 years. Works best for rates between 6-12%."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <SliderField label="Annual Return Rate" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Years to Double</p>
            <p className="text-6xl font-bold text-primary">{yearsToDouble.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-3">At {rate}% annual return</p>
          </div>
          <SummaryGrid>
            <SummaryCard label="Rule of 72" value={`${yearsToDouble.toFixed(1)} years`} />
            <SummaryCard label="Rule of 69.3" value={`${(69.3 / rate).toFixed(1)} years`} sublabel="More accurate for lower rates" />
            <SummaryCard label="Doubling Multiple (10yr)" value={`${(Math.pow(2, 10 / yearsToDouble)).toFixed(2)}x`} sublabel="How much in 10 years" />
            <SummaryCard label="Doubling Multiple (20yr)" value={`${(Math.pow(2, 20 / yearsToDouble)).toFixed(2)}x`} sublabel="How much in 20 years" />
            <SummaryCard label="Doubling Multiple (30yr)" value={`${(Math.pow(2, 30 / yearsToDouble)).toFixed(2)}x`} sublabel="How much in 30 years" />
          </SummaryGrid>
        </div>
      }
    />
  );
}
