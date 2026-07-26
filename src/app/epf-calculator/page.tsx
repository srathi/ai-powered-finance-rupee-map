"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { InputField, SliderField } from "@/components/input-controls";
import { ResultsTable } from "@/components/results-table";
import { formatCurrency } from "@/lib/format";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { calculateEPF } from "@/lib/financial/savings";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function EPFCalculatorPage() {
  const [monthlyBasic, setMonthlyBasic] = useState(30000);
  const [contributionRate, setContributionRate] = useState(12);
  const [epfRate, setEpfRate] = useState(8.25);
  const [years, setYears] = useState(30);

  const result = useMemo(() => calculateEPF(monthlyBasic, contributionRate, years, epfRate), [monthlyBasic, contributionRate, years, epfRate]);

  const chartData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      name: `Yr ${s.year}`,
      employee: Math.round(s.employee),
      employer: Math.round(s.employer),
      interest: Math.round(s.interest),
      value: Math.round(s.balance),
    }));
  }, [result]);

  const tableData = useMemo(() => {
    return result.yearlySchedule.map((s) => ({
      year: s.year,
      employee: Math.round(s.employee),
      employer: Math.round(s.employer),
      interest: Math.round(s.interest),
      balance: Math.round(s.balance),
    }));
  }, [result]);

  return (
    <CalculatorLayout
      title="EPF Calculator"
      description="Calculate your Employees Provident Fund balance at retirement."
      info="EPF earns interest on the combined employee and employer contributions. Both contribute 12% of basic salary. Current EPF rate is 8.25% per annum."
      inputs={
        <Card>
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InputField label="Monthly Basic Salary" value={monthlyBasic} onChange={setMonthlyBasic} min={5000} max={500000} step={1000} prefix="₹" />
            <SliderField label="Contribution Rate (Employee + Employer)" value={contributionRate} onChange={setContributionRate} min={1} max={15} step={0.5} suffix="%" tooltip="Both employee and employer contribute at this rate" />
            <SliderField label="EPF Interest Rate" value={epfRate} onChange={setEpfRate} min={5} max={12} step={0.25} suffix="%" />
            <SliderField label="Service Period" value={years} onChange={setYears} min={5} max={40} step={1} suffix=" yr" />
            <div className="pt-2"><Button onClick={() => {}} className="w-full">Calculate</Button></div>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          <SummaryGrid>
            <SummaryCard label="Total Balance" value={formatCurrency(result.totalBalance, true)} variant="success" />
            <SummaryCard label="Employee Contribution" value={formatCurrency(result.employeeContribution, true)} />
            <SummaryCard label="Employer Contribution" value={formatCurrency(result.employerContribution, true)} />
            <SummaryCard label="Total Interest" value={formatCurrency(result.totalInterest, true)} variant="success" />
          </SummaryGrid>
          <Card>
            <CardHeader><CardTitle className="text-lg">Growth Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v.toLocaleString("en-IN")} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Area type="monotone" dataKey="employee" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Employee" />
                    <Area type="monotone" dataKey="employer" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} name="Employer" />
                    <Area type="monotone" dataKey="interest" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Interest" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <ResultsTable
            columns={[
              { key: "year", label: "Year" },
              { key: "employee", label: "Employee", format: (v) => formatCurrency(v), sortable: true },
              { key: "employer", label: "Employer", format: (v) => formatCurrency(v), sortable: true },
              { key: "interest", label: "Interest", format: (v) => formatCurrency(v), sortable: true },
              { key: "balance", label: "Balance", format: (v) => formatCurrency(v), sortable: true },
            ]}
            data={tableData}
            title="Year-wise Breakdown"
            onExportCSV={() => exportToCSV(tableData.map(r => ({ Year: r.year, Employee: r.employee, Employer: r.employer, Interest: r.interest, Balance: r.balance })), "epf-results")}
            onExportExcel={() => exportToExcel(tableData.map(r => ({ Year: r.year, Employee: r.employee, Employer: r.employer, Interest: r.interest, Balance: r.balance })), "epf-results")}
          />
        </div>
      }
    />
  );
}
