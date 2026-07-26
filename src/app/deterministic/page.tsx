"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency, formatPercent, monthsToYearsMonths } from "@/lib/format";
import { exportToCSV, exportToExcel } from "@/lib/export";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RotateCcw, Download } from "lucide-react";
import { calculateDeterministicCorpus } from "@/lib/calculations/retirement";
import type { DeterministicInputs, CorpusEvolution } from "@/types/calculator";

export default function DeterministicPage() {
  const [inputs, setInputs] = useState<DeterministicInputs>({
    annualExpenditure: 1200000,
    equityAllocation: 50,
    retirementPeriodMonths: 360,
    expectedEquityReturn: 12,
    expectedDebtReturn: 7,
    expectedInflation: 5,
    taxRate: 0,
  });

  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    if (!calculated) return null;
    return calculateDeterministicCorpus(inputs);
  }, [inputs, calculated]);

  const chartData = useMemo(() => {
    if (!result) return [];
    // Sample every 12 months for yearly chart
    return result.monthlyData
      .filter((d) => d.month % 12 === 0 || d.month === result.monthlyData.length - 1)
      .map((d) => ({
        name: `Year ${d.year}`,
        corpus: d.corpus,
        withdrawal: d.withdrawal * 12,
        returns: d.returnsEarned,
      }));
  }, [result]);

  const tableData = useMemo(() => {
    if (!result) return [];
    // Annual summary
    const years: Record<number, CorpusEvolution> = {};
    for (const row of result.monthlyData) {
      if (!years[row.year] || row.month % 12 === 0) {
        years[row.year] = row;
      }
    }
    return Object.values(years).map((d) => ({
      year: d.year,
      corpus: d.corpus,
      withdrawal: d.withdrawal * 12,
      returns: d.returnsEarned,
      inflationAdjusted: d.inflationAdjustedWithdrawal * 12,
    }));
  }, [result]);

  const handleReset = () => {
    setInputs({
      annualExpenditure: 1200000,
      equityAllocation: 50,
      retirementPeriodMonths: 360,
      expectedEquityReturn: 12,
      expectedDebtReturn: 7,
      expectedInflation: 5,
      taxRate: 0,
    });
    setCalculated(false);
  };

  const handleExample = () => {
    setInputs({
      annualExpenditure: 1200000,
      equityAllocation: 50,
      retirementPeriodMonths: 360,
      expectedEquityReturn: 12,
      expectedDebtReturn: 7,
      expectedInflation: 5,
      taxRate: 12.5,
    });
    setCalculated(true);
  };

  return (
    <CalculatorLayout
      title="Deterministic Calculator"
      description="Calculate the required retirement corpus using fixed expected returns, debt returns, and inflation."
      info="The Deterministic Approach assumes that asset returns and inflation are predictable and constant each year. This is the typical (but mostly inaccurate) method used in most retirement calculators. The critical flaw is that it does not account for Sequence of Return Risk — the fact that the order of returns matters significantly in retirement."
      isCalculating={false}
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputField
              label="Annual Expenditure"
              value={inputs.annualExpenditure}
              onChange={(v) =>
                setInputs((p) => ({ ...p, annualExpenditure: v }))
              }
              min={10000}
              max={100000000}
              step={10000}
              prefix="₹"
              tooltip="Current annual expenditure, or estimated first-year retirement expenses."
            />

            <SliderField
              label="Equity Allocation"
              value={inputs.equityAllocation}
              onChange={(v) =>
                setInputs((p) => ({ ...p, equityAllocation: v }))
              }
              min={0}
              max={100}
              step={1}
              tooltip="Percentage of your portfolio allocated to equity."
            />

            <InputField
              label="Retirement Period"
              value={inputs.retirementPeriodMonths}
              onChange={(v) =>
                setInputs((p) => ({ ...p, retirementPeriodMonths: v }))
              }
              min={12}
              max={600}
              step={12}
              suffix="mo"
              tooltip="How long your retirement corpus needs to last (in months)."
            />

            <Separator />

            <InputField
              label="Expected Equity Return"
              value={inputs.expectedEquityReturn}
              onChange={(v) =>
                setInputs((p) => ({ ...p, expectedEquityReturn: v }))
              }
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              tooltip="Expected annual return from equity investments."
            />

            <InputField
              label="Expected Debt Return"
              value={inputs.expectedDebtReturn}
              onChange={(v) =>
                setInputs((p) => ({ ...p, expectedDebtReturn: v }))
              }
              min={1}
              max={20}
              step={0.5}
              suffix="%"
              tooltip="Expected annual return from debt investments."
            />

            <InputField
              label="Expected Inflation"
              value={inputs.expectedInflation}
              onChange={(v) =>
                setInputs((p) => ({ ...p, expectedInflation: v }))
              }
              min={0}
              max={20}
              step={0.5}
              suffix="%"
              tooltip="Expected annual inflation rate."
            />

            <InputField
              label="Tax Rate"
              value={inputs.taxRate || 0}
              onChange={(v) => setInputs((p) => ({ ...p, taxRate: v }))}
              min={0}
              max={50}
              step={0.5}
              suffix="%"
              tooltip="Tax rate on investment returns."
            />

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setCalculated(true)} className="flex-1">
                Calculate
              </Button>
              <Button variant="outline" onClick={handleExample} size="sm">
                Example
              </Button>
              <Button variant="ghost" onClick={handleReset} size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      }
      results={
        result ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <SummaryGrid>
              <SummaryCard
                label="Required Corpus"
                value={formatCurrency(result.requiredCorpus, true)}
                sublabel={formatCurrency(result.requiredCorpus)}
              />
              <SummaryCard
                label="Expenditure Cover"
                value={`${(result.requiredCorpus / inputs.annualExpenditure).toFixed(2)}x`}
                sublabel={`${inputs.annualExpenditure >= 1e7 ? (inputs.annualExpenditure / 1e7).toFixed(2) + ' Cr' : (inputs.annualExpenditure / 1e5).toFixed(2) + ' L'} annual expenditure`}
              />
              <SummaryCard
                label="Safe Withdrawal Rate"
                value={`${((inputs.annualExpenditure / result.requiredCorpus) * 100).toFixed(2)}%`}
                sublabel="Annual withdrawal / Corpus"
              />
              <SummaryCard
                label="Retirement Period"
                value={monthsToYearsMonths(inputs.retirementPeriodMonths)}
                sublabel={`${inputs.retirementPeriodMonths} months`}
              />
              <SummaryCard
                label="Monthly Withdrawal (Year 1)"
                value={formatCurrency(
                  result.monthlyData[1]?.withdrawal || inputs.annualExpenditure / 12
                )}
              />
              <SummaryCard
                label="Portfolio Blend"
                value={`${inputs.equityAllocation}% E / ${100 - inputs.equityAllocation}% D`}
                sublabel={`Equity: ${inputs.expectedEquityReturn}% | Debt: ${inputs.expectedDebtReturn}%`}
              />
            </SummaryGrid>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Corpus Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) =>
                          v >= 1e7
                            ? `${(v / 1e7).toFixed(1)}Cr`
                            : v >= 1e5
                            ? `${(v / 1e5).toFixed(1)}L`
                            : v.toLocaleString("en-IN")
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="corpus"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Corpus"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="withdrawal"
                        stroke="#f97316"
                        strokeWidth={2}
                        name="Annual Withdrawal"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ Do keep in mind that the critical flaw in this approach is
                that it assumes your retirement portfolio will earn the same
                equity and debt return each year, and will have to withstand the
                same inflation. It is highly recommended that you test the
                adequacy of the above computed retirement corpus using the Test
                Adequacy page.
              </p>
            </div>

            {/* Table */}
            <ResultsTable
              columns={[
                { key: "year", label: "Year" },
                {
                  key: "corpus",
                  label: "Corpus",
                  format: (v) => formatCurrency(v),
                  sortable: true,
                },
                {
                  key: "withdrawal",
                  label: "Annual Withdrawal",
                  format: (v) => formatCurrency(v),
                  sortable: true,
                },
                {
                  key: "returns",
                  label: "Returns Earned",
                  format: (v) => formatCurrency(v),
                  sortable: true,
                },
              ]}
              data={tableData}
              title="Year-wise Breakdown"
              onExportCSV={() =>
                exportToCSV(
                  tableData.map((r) => ({
                    Year: r.year,
                    Corpus: r.corpus,
                    "Annual Withdrawal": r.withdrawal,
                    "Returns Earned": r.returns,
                  })),
                  "deterministic-results"
                )
              }
              onExportExcel={() =>
                exportToExcel(
                  tableData.map((r) => ({
                    Year: r.year,
                    Corpus: r.corpus,
                    "Annual Withdrawal": r.withdrawal,
                    "Returns Earned": r.returns,
                  })),
                  "deterministic-results"
                )
              }
            />
          </div>
        ) : (
          <Card className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-1">No results yet</p>
              <p className="text-sm">
                Enter your inputs and click Calculate to see results.
              </p>
            </div>
          </Card>
        )
      }
    />
  );
}
