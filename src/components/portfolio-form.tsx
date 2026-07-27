"use client";

import { useState } from "react";
import { Plus, Trash2, Sparkles, X } from "lucide-react";
import {
  Investment,
  InvestmentType,
  AssetCategory,
  RiskProfile,
  InvestmentGoal,
  investmentTypes,
  investmentTemplates,
  riskProfiles,
  investmentGoals,
} from "@/types/portfolio";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function getCategoryForType(type: string): AssetCategory {
  const found = investmentTypes.find((t) => t.value === type);
  return found?.category || "other";
}

interface PortfolioFormProps {
  onSubmit: (data: {
    investments: Investment[];
    age: number;
    riskProfile: RiskProfile;
    goal: InvestmentGoal;
  }) => void;
  isLoading: boolean;
}

export function PortfolioForm({ onSubmit, isLoading }: PortfolioFormProps) {
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: generateId(),
      type: "mutual_fund",
      name: "",
      investedAmount: 0,
      currentValue: 0,
      category: "equity",
    },
  ]);
  const [age, setAge] = useState(30);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("moderate");
  const [goal, setGoal] = useState<InvestmentGoal>("retirement");
  const [showTemplates, setShowTemplates] = useState<string | null>(null);

  const addInvestment = () => {
    setInvestments([
      ...investments,
      {
        id: generateId(),
        type: "mutual_fund",
        name: "",
        investedAmount: 0,
        currentValue: 0,
        category: "equity",
      },
    ]);
  };

  const removeInvestment = (id: string) => {
    if (investments.length > 1) {
      setInvestments(investments.filter((inv) => inv.id !== id));
    }
  };

  const updateInvestment = (
    id: string,
    field: keyof Investment,
    value: string | number
  ) => {
    setInvestments(
      investments.map((inv) => {
        if (inv.id !== id) return inv;
        const updated = { ...inv, [field]: value };
        if (field === "type") {
          updated.category = getCategoryForType(value as string);
        }
        return updated;
      })
    );
  };

  const selectTemplate = (id: string, template: (typeof investmentTemplates)[0]) => {
    setInvestments(
      investments.map((inv) =>
        inv.id === id
          ? { ...inv, type: template.type, name: template.name, category: template.category }
          : inv
      )
    );
    setShowTemplates(null);
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturns = totalCurrent - totalInvested;
  const returnsPct = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : "0";

  const canSubmit =
    investments.length > 0 &&
    investments.every((inv) => inv.name && inv.investedAmount > 0) &&
    age > 0;

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="glass-effect rounded-xl p-5 border border-outline-variant/20">
        <h3 className="text-sm font-semibold text-on-surface mb-4">Your Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              min={10}
              max={100}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Risk Profile</label>
            <select
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value as RiskProfile)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:border-primary/50"
            >
              {riskProfiles.map((rp) => (
                <option key={rp.value} value={rp.value}>
                  {rp.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as InvestmentGoal)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:border-primary/50"
            >
              {investmentGoals.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Investments Section */}
      <div className="glass-effect rounded-xl p-5 border border-outline-variant/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-on-surface">Your Investments</h3>
          <button
            onClick={addInvestment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        <div className="space-y-3">
          {investments.map((inv, index) => (
            <div
              key={inv.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_1fr_auto] gap-3 items-end p-3 rounded-lg bg-surface-container/50 border border-outline-variant/10"
            >
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Type</label>
                <select
                  value={inv.type}
                  onChange={(e) => updateInvestment(inv.id, "type", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary/50"
                >
                  {investmentTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-[10px] text-muted-foreground mb-1">Name</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={inv.name}
                    onChange={(e) => updateInvestment(inv.id, "name", e.target.value)}
                    placeholder="e.g., HDFC Flexi Cap Fund"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={() => setShowTemplates(showTemplates === inv.id ? null : inv.id)}
                    className="px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] hover:bg-primary/20 transition-colors"
                    title="Choose from templates"
                  >
                    Templates
                  </button>
                </div>
                {showTemplates === inv.id && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    <div className="p-1">
                      {investmentTemplates
                        .filter((t) => t.category === inv.category)
                        .map((template, i) => (
                          <button
                            key={i}
                            onClick={() => selectTemplate(inv.id, template)}
                            className="w-full text-left px-3 py-1.5 text-xs text-on-surface hover:bg-primary/10 rounded-md transition-colors"
                          >
                            {template.name}
                          </button>
                        ))}
                    </div>
                    <button
                      onClick={() => setShowTemplates(null)}
                      className="w-full px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-surface-hover border-t border-outline-variant/20"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">
                  Invested (₹)
                </label>
                <input
                  type="number"
                  value={inv.investedAmount || ""}
                  onChange={(e) =>
                    updateInvestment(inv.id, "investedAmount", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-data focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">
                  Current Value (₹)
                </label>
                <input
                  type="number"
                  value={inv.currentValue || ""}
                  onChange={(e) =>
                    updateInvestment(inv.id, "currentValue", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-data focus:outline-none focus:border-primary/50"
                />
              </div>

              <button
                onClick={() => removeInvestment(inv.id)}
                disabled={investments.length === 1}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-effect rounded-xl p-5 border border-outline-variant/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total Invested</div>
            <div className="font-data text-lg font-bold text-on-surface">
              ₹{totalInvested.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Current Value</div>
            <div className="font-data text-lg font-bold text-on-surface">
              ₹{totalCurrent.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Returns</div>
            <div
              className={`font-data text-lg font-bold ${
                totalReturns >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {totalReturns >= 0 ? "+" : ""}₹{totalReturns.toLocaleString("en-IN")} ({returnsPct}%)
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={() =>
          onSubmit({ investments, age, riskProfile, goal })
        }
        disabled={!canSubmit || isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl btn-primary-gradient font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Analyze Portfolio
          </>
        )}
      </button>
    </div>
  );
}
