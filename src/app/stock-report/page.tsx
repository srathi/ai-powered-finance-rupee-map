"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { resolveStock } from "@/lib/stock-detection";
import { saveAs } from "file-saver";
import {
  Search,
  Building2,
  X,
  RefreshCw,
  AlertCircle,
  FileText,
  Download,
  Users,
  Check,
} from "lucide-react";

// Gate the "Work in progress" popup to production deployments only. Locally
// (development) the persona pipeline runs directly so the feature can be
// developed and tested. NODE_ENV is the only env signal reliably inlined into
// client bundles by Next.js.
const IS_DEPLOYMENT = process.env.NODE_ENV === "production";

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

interface PersonaReport {
  persona: string;
  data?: string;
  error?: string;
}

const PERSONAS = [
  {
    id: "joel-greenblatt",
    name: "Joel Greenblatt",
    blurb: "Magic Formula — earnings yield & ROIC, cheap-and-good.",
  },
  {
    id: "warren-buffett",
    name: "Warren Buffett",
    blurb: "Quality moats, durable ROE, low debt, owner earnings.",
  },
  {
    id: "peter-lynch",
    name: "Peter Lynch",
    blurb: "Fatal-flaw screen — understand the business you own.",
  },
  {
    id: "benjamin-graham",
    name: "Benjamin Graham",
    blurb: "Defensive Margin of Safety — NCAV, coverage, stability.",
  },
  {
    id: "charlie-munger",
    name: "Charlie Munger",
    blurb: "Mental-model quality — moats, incentive discipline, rationality.",
  },
  {
    id: "mohnish-pabrai",
    name: "Mohnish Pabrai",
    blurb: "Clone high-conviction bets with deep Margin of Safety.",
  },
  {
    id: "howard-marks",
    name: "Howard Marks",
    blurb: "Cycle-aware risk — second-level thinking, where we stand.",
  },
  {
    id: "ashwath-damodaran",
    name: "Aswath Damodaran",
    blurb: "Narrative + numbers — intrinsic value & growth assumptions.",
  },
  {
    id: "raamdeo-agarwal",
    name: "Raamdeo Agrawal",
    blurb: "Quality & compounding — QGLP, growth at reasonable price.",
  },
  {
    id: "robert-kiyosaki",
    name: "Robert Kiyosaki",
    blurb: "Cash-flow & asset mindset — worker vs owner quadrant.",
  },
];

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeString });
}

function slug(symbol: string): string {
  return symbol.replace(/[.\s]/g, "_");
}

export default function StockReportPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [resolved, setResolved] = useState<{
    symbol: string;
    companyName: string;
  } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWip, setShowWip] = useState(false);
  const [reports, setReports] = useState<PersonaReport[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/stock-search?q=${encodeURIComponent(q)}`);
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
    setResolved(null);
    setReports([]);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchSuggestions(value), 300);
  };

  const selectSuggestion = (result: SearchResult) => {
    setQuery(result.companyName);
    setResolved({
      symbol: result.fullSymbol,
      companyName: result.companyName,
    });
    setShowDropdown(false);
    setSuggestions([]);
    setError(null);
    setReports([]);
  };

  const handleResolve = async () => {
    if (!query.trim()) return;
    setResolving(true);
    setError(null);
    try {
      const resolvedStock = await resolveStock(query);
      if (!resolvedStock) {
        setError(
          "Couldn't resolve that to a stock. Pick a suggestion from the list, or try a clearer ticker like INFY or RELIANCE."
        );
        return;
      }
      setResolved({
        symbol: resolvedStock.symbol,
        companyName: resolvedStock.companyName,
      });
      setReports([]);
    } finally {
      setResolving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleResolve();
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
          handleResolve();
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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const togglePersona = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  };

  const handleGenerate = async () => {
    if (IS_DEPLOYMENT) {
      // On the live site, persona report generation is gated behind a
      // "Work in progress" popup until the feature is finished.
      setShowWip(true);
      return;
    }
    if (!resolved) {
      setError("Resolve a stock first.");
      return;
    }
    if (!selected) {
      setError("Select an investor persona.");
      return;
    }
    setGenerating(true);
    setError(null);
    setReports([]);
    try {
      const res = await fetch("/api/persona-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: resolved.symbol,
          companyName: resolved.companyName,
          personas: selected ? [selected] : [],
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to generate reports.");
        return;
      }
      const data = await res.json();
      const reps: PersonaReport[] = data.reports || [];
      const ok = reps.filter((r) => r.data);
      setReports(reps);
      if (ok.length === 0) {
        setError("No reports could be generated for this stock.");
        return;
      }
      const base = slug(resolved.symbol);
      for (const r of ok) {
        saveAs(
          dataURItoBlob(`data:application/pdf;base64,${r.data}`),
          `${r.persona}_${base}.pdf`
        );
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <CalculatorLayout
      title="Stock Persona Reports"
      description="Generate India-branded investor-style PDF reports for any NSE/BSE stock, written in the voice of famous investors."
      info="Search a company or ticker (same as the Live Stock Prices page) to resolve it, pick the investor persona you want, then download the report as a PDF."
      inputs={
        <Card>
          <div className="p-6 space-y-5">
            {/* Autocomplete Search (same UX as Live Stock Prices) */}
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
                className="w-full pl-10 pr-24 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-data text-sm"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResolved(null);
                    setSuggestions([]);
                    setShowDropdown(false);
                    setReports([]);
                    setError(null);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                type="button"
                onClick={handleResolve}
                disabled={resolving || !query.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs"
              >
                {resolving ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Find"
                )}
              </Button>

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

              {searching && showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-primary/30 bg-surface-container-high/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-50 p-4 text-center">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto text-primary" />
                </div>
              )}
            </div>

            {/* Resolved stock chip */}
            {resolved && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <Check className="h-4 w-4 shrink-0" />
                <span>
                  Resolved <strong>{resolved.companyName}</strong> ·{" "}
                  <span className="font-data">{resolved.symbol}</span>
                </span>
              </div>
            )}

            {/* Persona selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Select Investor Personas
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERSONAS.map((p) => {
                  const active = selected === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePersona(p.id)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        active
                          ? "border-primary/60 bg-primary/10"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          {active ? (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
                          )}
                          {p.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">
                        {p.blurb}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full gap-2"
              disabled={generating || !resolved || !selected}
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {generating
                ? "Generating report..."
                : !selected
                  ? "Select a persona to generate"
                  : "Generate & Download PDF"}
            </Button>
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

          {reports.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {reports.filter((r) => r.data).length} report(s) generated.
                  Download individually below.
                </p>
              </div>
              {reports.map((r) => (
                <Card key={r.persona}>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium capitalize truncate">
                          {r.persona.replace(/-/g, " ")}
                        </p>
                        {r.error ? (
                          <p className="text-xs text-rose-400 truncate">
                            {r.error}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Ready to download
                          </p>
                        )}
                      </div>
                    </div>
                    {r.data && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0"
                        onClick={() => {
                          if (IS_DEPLOYMENT) {
                            setShowWip(true);
                            return;
                          }
                          if (resolved) {
                            saveAs(
                              dataURItoBlob(`data:application/pdf;base64,${r.data}`),
                              `${r.persona}_${slug(resolved.symbol)}.pdf`
                            );
                          }
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!reports.length && !error && !generating && (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium mb-1">
                  No reports yet
                </p>
                <p className="text-sm">
                  Resolve a stock and pick your investor personas to generate
                  branded PDF reports.
                </p>
              </div>
            </Card>
          )}

          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> Reports are generated from public
              Yahoo Finance data and reflect a stylized investor viewpoint for
              educational purposes only — not financial advice. Verify all
              figures with primary filings before making decisions.
            </p>
          </div>
        </div>
      }
    />
      {showWip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowWip(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-500/15 p-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Work in progress
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Persona report generation is under development. We are finishing
                  the investor-specific analysis and PDF engine &mdash; please check
                  back soon.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWip(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setShowWip(false)}>Got it</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
