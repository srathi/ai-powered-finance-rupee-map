"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { FundCompareCard } from "@/components/fund-compare-card";
import type { FundCompareFund } from "@/types/mutual-fund";
import {
  Search,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  X,
  Plus,
  ArrowUpDown,
} from "lucide-react";
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

interface SearchSuggestion {
  schemeCode: number;
  schemeName: string;
}

const MAX_FUNDS = 3;

const FUND_COLORS = ["#89ceff", "#4edea3", "#ffb95f"];

function normalizeNavHistory(
  histories: { date: string; nav: number }[][]
): { date: string; funds: (number | null)[] }[] {
  if (histories.length === 0) return [];

  const allDates = new Set<string>();
  for (const h of histories) {
    for (const entry of h) {
      allDates.add(entry.date);
    }
  }

  const sortedDates = Array.from(allDates).sort((a, b) => {
    const [dA, mA, yA] = a.split("-").map(Number);
    const [dB, mB, yB] = b.split("-").map(Number);
    return yA - yB || mA - mB || dA - dB;
  });

  const indexedHistories = histories.map((h) => {
    const map = new Map<string, number>();
    for (const entry of h) {
      map.set(entry.date, entry.nav);
    }
    return map;
  });

  return sortedDates.map((date) => ({
    date,
    funds: indexedHistories.map((map) => map.get(date) ?? null),
  }));
}

function normalizeToBase100(
  chartData: { date: string; funds: (number | null)[] }[]
): { date: string; funds: (number | null)[] }[] {
  if (chartData.length === 0) return [];

  const firstFunds = chartData[0]?.funds;
  if (!firstFunds || !Array.isArray(firstFunds)) return [];

  const numFunds = firstFunds.length;
  const firstValidIndices: number[] = new Array(numFunds).fill(-1);

  for (let fi = 0; fi < numFunds; fi++) {
    for (let di = 0; di < chartData.length; di++) {
      const row = chartData[di];
      const funds = row?.funds;
      if (Array.isArray(funds) && funds[fi] != null) {
        firstValidIndices[fi] = di;
        break;
      }
    }
  }
  return chartData.map((row) => {
    const fundsArr: (number | null)[] = Array.isArray(row.funds) ? row.funds : [];
    return {
      date: row.date,
      funds: fundsArr.map((nav, fi) => {
        if (nav === null || nav === undefined) return null;
        const baseIdx = firstValidIndices[fi];
        if (baseIdx === -1 || baseIdx >= chartData.length) return null;
        const baseRow = chartData[baseIdx];
        const baseFunds: (number | null)[] = Array.isArray(baseRow?.funds) ? baseRow.funds : [];
        const baseNav = baseFunds[fi];
        if (baseNav === null || baseNav === undefined || baseNav === 0) return null;
        return (nav / baseNav) * 100;
      }),
    };
  });
}

export default function FundComparePage() {
  const [query, setQuery] = useState("");
  const [selectedFunds, setSelectedFunds] = useState<FundCompareFund[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingFund, setAddingFund] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMaxFunds = selectedFunds.length >= MAX_FUNDS;

  const fetchFundData = useCallback(
    async (schemeCode: number, schemeName: string) => {
      if (isMaxFunds) {
        setError(`Maximum ${MAX_FUNDS} funds allowed. Remove one first.`);
        return;
      }

      const alreadyAdded = selectedFunds.some(
        (f) => f.schemeCode === schemeCode
      );
      if (alreadyAdded) {
        setError("This fund is already in your comparison.");
        return;
      }

      setAddingFund(true);
      setError(null);
      setShowDropdown(false);
      setSuggestions([]);

      try {
        const res = await fetch(
          `/api/mutual-fund-data?code=${schemeCode}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch fund data");
          return;
        }

        const newFund: FundCompareFund = {
          id: `${schemeCode}-${Date.now()}`,
          schemeCode: data.schemeCode,
          schemeName: data.schemeName,
          fundHouse: data.fundHouse,
          schemeCategory: data.schemeCategory,
          currentNav: data.currentNav,
          navDate: data.navDate,
          returns: data.returns,
          navHistory: data.navHistory,
        };

        setSelectedFunds((prev) => [...prev, newFund]);
        setQuery("");
      } catch {
        setError("Network error — please try again");
      } finally {
        setAddingFund(false);
      }
    },
    [isMaxFunds, selectedFunds]
  );

  const searchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/mutual-fund-search?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      setSuggestions(data.results || []);
      setShowDropdown((data.results || []).length > 0);
      setHighlightedIndex(-1);
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchSuggestions(value);
    }, 300);
  };

  const selectSuggestion = (result: SearchSuggestion) => {
    setQuery(result.schemeName);
    setShowDropdown(false);
    setSuggestions([]);
    fetchFundData(result.schemeCode, result.schemeName);
  };

  const removeFund = (id: string) => {
    setSelectedFunds((prev) => prev.filter((f) => f.id !== id));
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          selectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const chartData = useMemo(() => {
    if (selectedFunds.length === 0) return [];

    const histories = selectedFunds.map((f) => f.navHistory);
    const normalized = normalizeNavHistory(histories);
    const base100 = normalizeToBase100(normalized);

    const sliced = base100.length > 120 ? base100.slice(-120) : base100;

    return sliced.map((row) => {
      const flat: Record<string, string | number | null> = { date: row.date };
      row.funds.forEach((val, i) => {
        flat[`fund_${i}`] = val;
      });
      return flat;
    });
  }, [selectedFunds]);

  const overlapInfo = useMemo(() => {
    if (selectedFunds.length < 2) return null;

    const houses = selectedFunds.map((f) => f.fundHouse);
    const categories = selectedFunds.map((f) => f.schemeCategory);
    const uniqueHouses = new Set(houses);
    const uniqueCategories = new Set(categories);

    const sameAmc = uniqueHouses.size === 1;
    const sameCategory = uniqueCategories.size === 1;

    const issues: string[] = [];
    const positives: string[] = [];

    if (sameAmc) {
      issues.push(
        `All ${selectedFunds.length} funds are from the same AMC (${houses[0]}). AMC-level failures (regulatory, management) would impact all funds equally.`
      );
    } else {
      positives.push(
        `Diversified across ${uniqueHouses.size} AMCs: ${Array.from(uniqueHouses).join(", ")}.`
      );
    }

    if (sameCategory) {
      issues.push(
        `All funds are in the same category (${categories[0]}). They likely hold similar stocks/bonds, offering limited diversification.`
      );
    } else {
      positives.push(
        `Spans ${uniqueCategories.size} categories: ${Array.from(uniqueCategories).join(", ")}. Different asset classes reduce correlated risk.`
      );
    }

    const expenseRatios = selectedFunds.map((f) => {
      const hist = f.navHistory;
      if (hist.length < 2) return null;
      const recent = hist.slice(-252);
      if (recent.length < 2) return null;
      return null;
    });

    if (selectedFunds.length === 3) {
      positives.push("Maximum diversification reached (3/3 funds).");
    }

    return {
      sameAmc,
      sameCategory,
      issues,
      positives,
      score: sameAmc && sameCategory ? 1 : sameAmc || sameCategory ? 2 : 3,
    };
  }, [selectedFunds]);

  return (
    <CalculatorLayout
      title="Mutual Fund Comparison"
      description="Compare up to 3 Indian mutual funds side by side — returns, NAV history, and overlap analysis."
      info="Search for a mutual fund by name, select up to 3 funds, and see a detailed comparison of their performance. Data is sourced from MFAPI (AMFI-registered)."
      inputs={
        <Card>
          <div className="p-6 space-y-4">
            {/* Fund Count Badge */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Selected Funds
              </p>
              <span className="text-xs font-data text-muted-foreground">
                {selectedFunds.length}/{MAX_FUNDS}
              </span>
            </div>

            {/* Selected Funds List */}
            {selectedFunds.length > 0 && (
              <div className="space-y-2">
                {selectedFunds.map((fund, i) => (
                  <div
                    key={fund.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: FUND_COLORS[i] }}
                    />
                    <span className="text-xs text-on-surface truncate flex-1">
                      {fund.schemeName}
                    </span>
                    <button
                      onClick={() => removeFund(fund.id)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedFunds.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No funds selected. Search below to add funds.
              </div>
            )}

            {/* Autocomplete Search */}
            <div className="relative" id="mf-search-wrapper">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder={
                  isMaxFunds
                    ? "Remove a fund to add another"
                    : "Search mutual fund name..."
                }
                disabled={isMaxFunds}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-data text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setShowDropdown(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdown via Portal */}
            {showDropdown && suggestions.length > 0 && typeof window !== "undefined" && createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: "fixed",
                  top: inputRef.current
                    ? inputRef.current.getBoundingClientRect().bottom + 4
                    : 0,
                  left: inputRef.current
                    ? inputRef.current.getBoundingClientRect().left
                    : 0,
                  width: inputRef.current
                    ? inputRef.current.getBoundingClientRect().width
                    : 300,
                  zIndex: 9999,
                }}
                className="rounded-lg border border-primary/30 bg-surface-container-high/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] max-h-[400px] overflow-y-auto"
              >
                {suggestions.map((result, i) => (
                  <button
                    key={result.schemeCode}
                    onClick={() => selectSuggestion(result)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                      i === highlightedIndex
                        ? "bg-primary/15"
                        : "hover:bg-surface-container-high"
                    } ${i > 0 ? "border-t border-outline-variant/30" : ""}`}
                  >
                    <Plus className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-on-surface leading-snug block">
                        {result.schemeName}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        #{result.schemeCode}
                      </span>
                    </div>
                  </button>
                ))}
              </div>,
              document.body
            )}

            {/* Searching indicator */}
            {searching && showDropdown && typeof window !== "undefined" && createPortal(
              <div
                style={{
                  position: "fixed",
                  top: inputRef.current
                    ? inputRef.current.getBoundingClientRect().bottom + 4
                    : 0,
                  left: inputRef.current
                    ? inputRef.current.getBoundingClientRect().left
                    : 0,
                  width: inputRef.current
                    ? inputRef.current.getBoundingClientRect().width
                    : 300,
                  zIndex: 9999,
                }}
                className="rounded-lg border border-primary/30 bg-surface-container-high/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-4 text-center"
              >
                <RefreshCw className="h-4 w-4 animate-spin mx-auto text-primary" />
              </div>,
              document.body
            )}

            {/* Clear All */}
            {selectedFunds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={() => {
                  setSelectedFunds([]);
                  setError(null);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Clear All
              </Button>
            )}

            {/* Loading indicator */}
            {addingFund && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Fetching fund data...
              </div>
            )}
          </div>
        </Card>
      }
      results={
        <div className="space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Fund Cards */}
          {selectedFunds.length > 0 && (
            <div
              className={`grid gap-4 ${
                selectedFunds.length === 1
                  ? "grid-cols-1"
                  : selectedFunds.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-3"
              }`}
            >
              {selectedFunds.map((fund, i) => (
                <FundCompareCard
                  key={fund.id}
                  fund={fund}
                  onRemove={removeFund}
                  colorIndex={i}
                />
              ))}
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && selectedFunds.length >= 2 && (
            <Card className="glass-effect">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-on-surface">
                    NAV Growth Comparison (Base 100)
                  </h3>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                        tickFormatter={(val) => {
                          const parts = val.split("-");
                          return `${parts[1]}/${parts[2]?.slice(2)}`;
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(val) => val.toFixed(0)}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          Number(value).toFixed(2),
                          String(name),
                        ]}
                        labelFormatter={(label) => {
                          const str = String(label);
                          const parts = str.split("-");
                          return `${parts[0]}-${parts[1]}-${parts[2]}`;
                        }}
                      />
                      <Legend />
                      {selectedFunds.map((fund, i) => (
                        <Line
                          key={fund.id}
                          type="monotone"
                          dataKey={`fund_${i}`}
                          name={fund.schemeName.length > 30 ? fund.schemeName.slice(0, 30) + "..." : fund.schemeName}
                          stroke={FUND_COLORS[i]}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}

          {/* Overlap Analysis */}
          {overlapInfo && (
            <Card className="glass-effect">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-on-surface">
                    Diversification Analysis
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Score:</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`w-2 h-2 rounded-full ${
                            s <= overlapInfo.score
                              ? "bg-emerald-500"
                              : "bg-muted/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {overlapInfo.issues.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {overlapInfo.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {issue}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {overlapInfo.positives.length > 0 && (
                  <div className="space-y-2">
                    {overlapInfo.positives.map((pos, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {pos}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <strong>Note:</strong> This analysis checks AMC and category
                    overlap. Actual stock/bond overlap requires holdings data
                    from AMFI factsheets, which is not available via public APIs.
                    For detailed overlap analysis, use tools like Kuvera or
                    MFCentral.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {selectedFunds.length === 0 && !error && (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium mb-1">
                  Search for mutual funds
                </p>
                <p className="text-sm">
                  Type a fund name to search and compare up to 3 Indian mutual
                  funds.
                </p>
              </div>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> Mutual fund data is sourced from
              MFAPI.in (AMFI-registered). NAV data is updated 6x daily.
              Returns shown are point-to-point CAGR calculations from historical
              NAV. This is for informational purposes only and should not be
              considered investment advice. Past performance does not guarantee
              future results.
            </p>
          </div>
        </div>
      }
    />
  );
}
