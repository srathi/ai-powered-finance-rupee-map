"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle2, Target } from "lucide-react";

interface PortfolioAnalysis {
  totalInvested: number;
  totalCurrent: number;
  totalReturns: number;
  returnsPercentage: number;
  assetAllocation: {
    equity: number;
    debt: number;
    gold: number;
    realEstate: number;
    other: number;
  };
  aiRecommendations: string[];
  projectedValue10Years: number;
  riskScore: "low" | "medium" | "high";
}

interface PortfolioAnalysisProps {
  analysis: PortfolioAnalysis;
  onReset: () => void;
}

const ALLOCATION_COLORS: Record<string, string> = {
  equity: "#4edea3",
  debt: "#89ceff",
  gold: "#ffb95f",
  realEstate: "#a78bfa",
  other: "#94a3b8",
};

const RISK_CONFIG = {
  low: { label: "Low Risk", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  medium: { label: "Medium Risk", color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
  high: { label: "High Risk", color: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle },
};

export function PortfolioAnalysisResult({ analysis, onReset }: PortfolioAnalysisProps) {
  const allocation = analysis.assetAllocation;
  const pieData = Object.entries(allocation)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace("realEstate", "Real Estate"),
      value,
      color: ALLOCATION_COLORS[key] || "#94a3b8",
    }));

  const risk = RISK_CONFIG[analysis.riskScore];
  const RiskIcon = risk.icon;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-effect rounded-xl p-4 border border-outline-variant/20">
          <div className="text-[10px] text-muted-foreground mb-1">Total Invested</div>
          <div className="font-data text-sm font-bold text-on-surface">
            ₹{analysis.totalInvested.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="glass-effect rounded-xl p-4 border border-outline-variant/20">
          <div className="text-[10px] text-muted-foreground mb-1">Current Value</div>
          <div className="font-data text-sm font-bold text-on-surface">
            ₹{analysis.totalCurrent.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="glass-effect rounded-xl p-4 border border-outline-variant/20">
          <div className="text-[10px] text-muted-foreground mb-1">Returns</div>
          <div
            className={`font-data text-sm font-bold ${
              analysis.totalReturns >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {analysis.totalReturns >= 0 ? "+" : ""}₹
            {analysis.totalReturns.toLocaleString("en-IN")} ({analysis.returnsPercentage}%)
          </div>
        </div>
        <div className="glass-effect rounded-xl p-4 border border-outline-variant/20">
          <div className="text-[10px] text-muted-foreground mb-1">Risk Level</div>
          <div className={`flex items-center gap-1.5 ${risk.color}`}>
            <RiskIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{risk.label}</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation + Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="glass-effect rounded-xl p-5 border border-outline-variant/20">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Asset Allocation</h3>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2 shadow-xl">
                            <p className="text-xs font-medium text-on-surface">
                              {payload[0].name}: {payload[0].value}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {Object.entries(allocation).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ALLOCATION_COLORS[key] }}
                    />
                    <span className="text-xs text-on-surface-variant capitalize">
                      {key === "realEstate" ? "Real Estate" : key}
                    </span>
                  </div>
                  <span className="font-data text-xs font-medium text-on-surface">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projection */}
        <div className="glass-effect rounded-xl p-5 border border-outline-variant/20">
          <h3 className="text-sm font-semibold text-on-surface mb-4">10-Year Projection</h3>
          <div className="text-center py-4">
            <div className="text-xs text-muted-foreground mb-2">Estimated Portfolio Value</div>
            <div className="font-data text-3xl font-bold text-primary">
              ₹{(analysis.projectedValue10Years / 100000).toFixed(1)}L
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From ₹{(analysis.totalCurrent / 100000).toFixed(1)}L today
            </div>
            <div className="mt-4 p-3 rounded-lg bg-surface-container/50">
              <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span>
                  Growth:{" "}
                  <span className="font-medium text-primary">
                    {analysis.totalCurrent > 0
                      ? (
                          ((analysis.projectedValue10Years - analysis.totalCurrent) /
                            analysis.totalCurrent) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </span>{" "}
                  over 10 years
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-effect rounded-xl p-5 border border-outline-variant/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-on-surface">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {analysis.aiRecommendations.map((rec, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg bg-surface-container/50 border border-outline-variant/10"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-on-surface-variant leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full px-6 py-3 rounded-xl border border-outline-variant/30 font-semibold text-sm text-on-surface hover:bg-surface-hover transition-colors"
      >
        Analyze Another Portfolio
      </button>
    </div>
  );
}
