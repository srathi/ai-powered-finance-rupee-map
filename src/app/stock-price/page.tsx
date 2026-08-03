"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { StockCard, type StockData } from "@/components/stock-card";
import { StockChart } from "@/components/stock-chart";
import {
  Search,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  X,
  Building2,
} from "lucide-react";

interface SearchResult {
  symbol: string;
  fullSymbol: string;
  companyName: string;
  exchange: string;
  exchangeCode: string;
  sector: string;
  industry: string;
  isIndian: boolean;
}

const POPULAR_STOCKS = [
  { symbol: "RELIANCE", label: "Reliance" },
  { symbol: "TCS", label: "TCS" },
  { symbol: "HDFCBANK", label: "HDFC Bank" },
  { symbol: "INFY", label: "Infosys" },
  { symbol: "ICICIBANK", label: "ICICI Bank" },
  { symbol: "SBIN", label: "SBI" },
  { symbol: "ITC", label: "ITC" },
  { symbol: "BHARTIARTL", label: "Bharti Airtel" },
  { symbol: "LT", label: "L&T" },
  { symbol: "TATAMOTORS", label: "Tata Motors" },
];

export default function StockPricePage() {
  const [query, setQuery] = useState("");
  const [exchange, setExchange] = useState<"NSE" | "BSE">("NSE");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStock = useCallback(
    async (symbol: string) => {
      if (!symbol.trim()) return;
      setLoading(true);
      setError(null);
      setStockData(null);
      setShowDropdown(false);

      const suffix = exchange === "BSE" ? ".BO" : ".NS";
      const rawSymbol = symbol.trim().toUpperCase();
      const fullSymbol =
        rawSymbol.endsWith(".NS") || rawSymbol.endsWith(".BO")
          ? rawSymbol
          : `${rawSymbol}${suffix}`;

      try {
        const res = await fetch(
          `/api/stock-price?symbol=${encodeURIComponent(fullSymbol)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch stock data");
          return;
        }

        setStockData(data);
        setQuery(data.companyName || symbol.toUpperCase());
      } catch {
        setError("Network error — please try again");
      } finally {
        setLoading(false);
      }
    },
    [exchange]
  );

  // Search for suggestions
  const searchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/stock-search?q=${encodeURIComponent(q)}`
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

  // Debounced search on input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setStockData(null);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchSuggestions(value);
    }, 300);
  };

  // Select a suggestion
  const selectSuggestion = (result: SearchResult) => {
    setQuery(result.companyName);
    setShowDropdown(false);
    setSuggestions([]);
    fetchStock(result.fullSymbol);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        fetchStock(query);
      }
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
        } else {
          fetchStock(query);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <CalculatorLayout
      title="Live Stock Prices"
      description="Look up real-time NSE and BSE stock prices powered by Yahoo Finance."
      info="Start typing a company name or stock symbol — suggestions appear as you type. Click a result to fetch live prices and a historical price chart instantly."
      inputs={
        <Card>
          <div className="p-6 space-y-4">
            {/* Autocomplete Search */}
            <div className="relative">
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
                placeholder="Search company or symbol..."
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-data text-sm"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setShowDropdown(false);
                    setStockData(null);
                    setError(null);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-primary/30 bg-surface-container-high/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-50 max-h-80 overflow-y-auto"
                >
                  {suggestions.map((result, i) => (
                    <button
                      key={result.fullSymbol}
                      onClick={() => selectSuggestion(result)}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                        i === highlightedIndex
                          ? "bg-primary/15"
                          : "hover:bg-surface-container-high"
                      } ${i > 0 ? "border-t border-outline-variant/30" : ""}`}
                    >
                      <Building2 className="h-4 w-4 mt-0.5 text-on-surface-variant shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-on-surface truncate">
                            {result.companyName}
                          </span>
                          {result.sector && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary shrink-0">
                              {result.sector}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-data text-primary font-semibold">
                            {result.fullSymbol}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            · {result.exchange}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Searching indicator */}
              {searching && showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-primary/30 bg-surface-container-high/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-50 p-4 text-center">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto text-primary" />
                </div>
              )}
            </div>

            {/* Exchange Toggle */}
            <div className="flex gap-2">
              {(["NSE", "BSE"] as const).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setExchange(ex)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    exchange === ex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => fetchStock(query)}
                className="flex-1 gap-2"
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Fetching..." : "Get Price"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setQuery("");
                  setStockData(null);
                  setError(null);
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Popular Stocks */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                Quick Access
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_STOCKS.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => {
                      setQuery(s.label);
                      fetchStock(s.symbol);
                    }}
                    className="px-2.5 py-1 rounded-md bg-muted/40 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      }
      results={
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {stockData && (
            <>
              <StockCard data={stockData} />
              <StockChart
                symbol={stockData.symbol}
                companyName={stockData.companyName}
              />
            </>
          )}

          {!stockData && !error && !loading && (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium mb-1">Search for a stock</p>
                <p className="text-sm">
                  Start typing a company name or symbol to see live NSE/BSE
                  prices.
                </p>
              </div>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> Stock data is sourced from Yahoo
              Finance and may be delayed by several minutes. This is for
              informational purposes only and should not be considered financial
              advice. Always verify prices with your broker or the exchange
              before making investment decisions.
            </p>
          </div>
        </div>
      }
    />
  );
}
