"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField } from "@/components/input-controls";
import { calculateIncomeTax } from "@/lib/financial/tax";
import { formatCurrency, formatPercent } from "@/lib/format";
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

const INVESTMENT_OPTIONS = [
  { name: "PPF", key: "ppf", maxLimit: 150000, description: "Public Provident Fund" },
  { name: "ELSS", key: "elss", maxLimit: 150000, description: "Equity Linked Saving Scheme" },
  { name: "Life Insurance", key: "lifeInsurance", maxLimit: 150000, description: "Premium paid" },
  { name: "EPF", key: "epf", maxLimit: 150000, description: "Employee Provident Fund" },
  { name: "Home Loan Principal", key: "homeLoan", maxLimit: 150000, description: "Principal repayment" },
  { name: "NPS", key: "nps", maxLimit: 50000, description: "National Pension System (additional 80CCD(1B))" },
  { name: "Others", key: "others", maxLimit: 150000, description: "Tuition fees, Sukanya Samriddhi, etc." },
];

const SLAB_RATES = [
  { label: "5% Slab", rate: 5 },
  { label: "20% Slab", rate: 20 },
  { label: "30% Slab", rate: 30 },
];

export default function Section80CPage() {
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [ppf, setPpf] = useState(50000);
  const [elss, setElss] = useState(50000);
  const [lifeInsurance, setLifeInsurance] = useState(20000);
  const [epf, setEpf] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [nps, setNps] = useState(0);
  const [others, setOthers] = useState(0);

  const investments = useMemo(
    () => ({ ppf, elss, lifeInsurance, epf, homeLoan, nps, others }),
    [ppf, elss, lifeInsurance, epf, homeLoan, nps, others]
  );

  const totalInvested = useMemo(
    () => Object.values(investments).reduce((sum, val) => sum + val, 0),
    [investments]
  );

  const maxLimit = 150000;
  const remainingLimit = Math.max(0, maxLimit - totalInvested);
  const excessInvestment = Math.max(0, totalInvested - maxLimit);

  const taxResult = useMemo(() => calculateIncomeTax(grossIncome, 0, "old"), [grossIncome]);

  const taxSavings = useMemo(() => {
    const effectiveSlab = taxResult.effectiveRate;
    return SLAB_RATES.map((slab) => ({
      ...slab,
      saving: Math.min(totalInvested, maxLimit) * (slab.rate / 100),
    }));
  }, [totalInvested, taxResult.effectiveRate]);

  const chartData = INVESTMENT_OPTIONS.map((opt) => ({
    name: opt.name,
    invested: investments[opt.key as keyof typeof investments],
    limit: opt.maxLimit,
  }));

  const setters: Record<string, (v: number) => void> = {
    ppf: setPpf,
    elss: setElss,
    lifeInsurance: setLifeInsurance,
    epf: setEpf,
    homeLoan: setHomeLoan,
    nps: setNps,
    others: setOthers,
  };

  return (
    <CalculatorLayout
      title="Section 80C Tax Saving Planner"
      description="Plan your tax-saving investments under Section 80C and 80CCD(1B) to maximize savings."
      info="Section 80C allows deduction up to ₹1,50,000 from taxable income through investments in PPF, ELSS, EPF, life insurance, home loan principal, etc. Additional ₹50,000 deduction is available under Section 80CCD(1B) for NPS contributions."
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Income & Investments</CardTitle>
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
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Investment Details
              </p>
              {INVESTMENT_OPTIONS.map((opt) => (
                <div key={opt.key} className="mb-3">
                  <InputField
                    label={opt.name}
                    value={investments[opt.key as keyof typeof investments]}
                    onChange={setters[opt.key]}
                    min={0}
                    max={opt.maxLimit}
                    step={1000}
                    prefix="₹"
                    tooltip={`${opt.description} (Max: ₹${(opt.maxLimit / 100000).toFixed(1)}L)`}
                  />
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Button onClick={() => {}} className="w-full">
                Calculate Tax Savings
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard
              label="Total 80C Invested"
              value={formatCurrency(totalInvested, true)}
            />
            <SummaryCard
              label="Max Deduction (80C)"
              value={formatCurrency(maxLimit, true)}
            />
            <SummaryCard
              label="Remaining Limit"
              value={formatCurrency(remainingLimit, true)}
              variant={remainingLimit > 0 ? "warning" : "success"}
              sublabel={remainingLimit > 0 ? "Can still invest" : "Limit fully utilized"}
            />
            {excessInvestment > 0 && (
              <SummaryCard
                label="Excess Investment"
                value={formatCurrency(excessInvestment, true)}
                variant="danger"
                sublabel="Beyond 80C limit - not tax deductible"
              />
            )}
            <SummaryCard
              label="Tax Saved (20% slab)"
              value={formatCurrency(Math.min(totalInvested, maxLimit) * 0.2, true)}
              variant="success"
              sublabel="At 20% income tax rate"
            />
            <SummaryCard
              label="Tax Saved (30% slab)"
              value={formatCurrency(Math.min(totalInvested, maxLimit) * 0.3, true)}
              variant="success"
              sublabel="At 30% income tax rate"
            />
          </SummaryGrid>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tax Saved at Different Slabs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxSavings.map((slab) => (
                  <div key={slab.rate} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="font-medium text-sm">{slab.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {slab.rate}% of {formatCurrency(Math.min(totalInvested, maxLimit))}
                      </p>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(slab.saving)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investment Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend />
                    <Bar
                      dataKey="invested"
                      fill="hsl(var(--chart-1))"
                      name="Your Investment"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="limit"
                      fill="hsl(var(--chart-3))"
                      name="Max Limit"
                      radius={[0, 4, 4, 0]}
                      opacity={0.3}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {INVESTMENT_OPTIONS.filter(
                  (opt) => investments[opt.key as keyof typeof investments] > 0
                ).map((opt) => {
                  const amount = investments[opt.key as keyof typeof investments];
                  const percent = (amount / totalInvested) * 100;
                  return (
                    <div key={opt.key} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{opt.name}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(amount)}</p>
                        <p className="text-xs text-muted-foreground">{formatPercent(percent, 1)}</p>
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
