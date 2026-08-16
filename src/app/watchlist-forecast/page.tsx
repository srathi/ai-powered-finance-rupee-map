"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SliderField } from "@/components/input-controls";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ScanLine, ExternalLink } from "lucide-react";

interface ScanRow {
  symbol: string;
  last_close?: number;
  median_close?: number;
  change_pct?: number;
  upside_prob?: number;
  band_lo?: number;
  band_hi?: number;
  error?: string | null;
}

const EXAMPLE = "RELIANCE, TCS, INFY, HDFCBANK, BHARTIARTL, ICICIBANK, SBIN, ITC";

export default function WatchlistForecastPage() {
  const [tickers, setTickers] = useState(EXAMPLE);
  const [exchange, setExchange] = useState<"nse" | "bse">("nse");
  const [predLen, setPredLen] = useState(30);
  const [paths, setPaths] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ScanRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(
    () =>
      tickers
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .slice(0, 20),
    [tickers]
  );

  const chartData = useMemo(
    () =>
      (rows ?? [])
        .filter((r) => r.error == null && typeof r.change_pct === "number")
        .map((r) => ({
          symbol: r.symbol,
          change_pct: Number(r.change_pct!.toFixed(2)),
        })),
    [rows]
  );

  // Green for projected gains, red for losses; intensity scales with magnitude.
  const barFill = (v: number) => {
    const mag = Math.min(Math.abs(v), 30) / 30; // 0..1 over a 30% swing
    const alpha = (0.35 + 0.65 * mag).toFixed(2); // 0.35..1.0
    return v >= 0
      ? `hsla(160, 84%, 45%, ${alpha})`
      : `hsla(0, 84%, 60%, ${alpha})`;
  };

  async function runScan(e?: React.FormEvent) {
    e?.preventDefault();
    if (parsed.length === 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stock-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: parsed, exchange, predLen, paths }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setRows(json.results as ScanRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CalculatorLayout
      title="Watchlist Scanner"
      description="Rank a basket of NSE/BSE stocks by their AI-projected return using the Kronos model."
      info="Each ticker gets a Monte Carlo forecast; the list is ranked by the model's median projected return over your chosen horizon. Probabilistic and research-grade — not investment advice. Max 20 tickers per scan."
      isCalculating={loading}
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" /> Scanner Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={runScan} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="label-caps text-on-surface-variant uppercase">
                  Watchlist (tickers or company names)
                </label>
                <textarea
                  value={tickers}
                  onChange={(e) => setTickers(e.target.value)}
                  rows={4}
                  placeholder="RELIANCE, TCS, Infosys, Bharti Airtel"
                  className="w-full input-well rounded-lg py-3 px-4 font-data text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                />
                <p className="text-[10px] text-on-surface-variant">
                  {parsed.length}/20 tickers · separate by commas or spaces
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-caps text-on-surface-variant uppercase">
                  Exchange
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["nse", "bse"] as const).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setExchange(ex)}
                      className={`rounded-lg py-2.5 font-data text-sm uppercase tracking-wide transition-all ${
                        exchange === ex
                          ? "bg-primary/15 border border-primary/40 text-primary"
                          : "bg-surface-container-high border border-transparent text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <SliderField
                label="Forecast Horizon"
                value={predLen}
                onChange={setPredLen}
                min={5}
                max={180}
                step={5}
                suffix=" days"
              />
              <SliderField
                label="Paths / Ticker"
                value={paths}
                onChange={setPaths}
                min={1}
                max={100}
                step={1}
                suffix=" paths"
              />

              <Button type="submit" className="w-full" disabled={loading || parsed.length === 0}>
                {loading ? "Scanning…" : "Scan Watchlist"}
              </Button>
            </form>
          </CardContent>
        </Card>
      }
      results={
        <div className="space-y-6">
          {error && (
            <div className="glass-effect rounded-xl border border-danger/30 p-4 text-sm text-danger">
              {error}
            </div>
          )}

          {rows && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ranked by Projected Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-on-surface-variant label-caps uppercase text-[10px] border-b border-border/40">
                          <th className="py-2 pr-3">#</th>
                          <th className="py-2 pr-3">Symbol</th>
                          <th className="py-2 pr-3 text-right">Last</th>
                          <th className="py-2 pr-3 text-right">Predicted</th>
                          <th className="py-2 pr-3 text-right">Change</th>
                          <th className="py-2 pr-3 text-right">Upside</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) =>
                          r.error ? (
                            <tr key={r.symbol} className="border-b border-border/20">
                              <td className="py-2 pr-3 text-on-surface-variant">{i + 1}</td>
                              <td className="py-2 pr-3 font-data text-on-surface">{r.symbol}</td>
                              <td colSpan={4} className="py-2 pr-3 text-danger text-xs">
                                {r.error || "Not found / unavailable"}
                              </td>
                            </tr>
                          ) : (
                            <tr key={r.symbol} className="border-b border-border/20">
                              <td className="py-2 pr-3 text-on-surface-variant">{i + 1}</td>
                              <td className="py-2 pr-3">
                                <a
                                  href={`/stock-price?symbol=${encodeURIComponent(r.symbol)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-data text-primary hover:underline flex items-center gap-1"
                                >
                                  {r.symbol} <ExternalLink className="h-3 w-3" />
                                </a>
                              </td>
                              <td className="py-2 pr-3 text-right font-data text-on-surface-variant">
                                {formatCurrency(r.last_close ?? 0)}
                              </td>
                              <td className="py-2 pr-3 text-right font-data text-on-surface">
                                {formatCurrency(r.median_close ?? 0)}
                              </td>
                              <td
                                className={`py-2 pr-3 text-right font-data ${
                                  (r.change_pct ?? 0) >= 0 ? "text-success" : "text-danger"
                                }`}
                              >
                                {formatPercent(r.change_pct ?? 0)}
                              </td>
                              <td className="py-2 pr-3 text-right font-data text-on-surface-variant">
                                {Math.round((r.upside_prob ?? 0) * 100)}%
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {chartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Projected Return Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="w-full"
                      style={{ height: Math.max(220, chartData.length * 38) }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="opacity-20" horizontal={false} />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <YAxis
                            type="category"
                            dataKey="symbol"
                            tick={{ fontSize: 11 }}
                            width={84}
                          />
                          <Tooltip
                            cursor={{ fill: "rgba(255,255,255,0.06)" }}
                            content={({ active, payload }: any) => {
                              if (!active || !payload || !payload.length) return null;
                              const val = Number(payload[0].value);
                              const color =
                                val >= 0 ? "var(--color-success)" : "var(--color-danger)";
                              return (
                                <div
                                  style={{
                                    background:
                                      "color-mix(in srgb, var(--color-surface-container-high) 72%, transparent)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: 12,
                                    padding: "8px 12px",
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#fff",
                                      opacity: 0.75,
                                    }}
                                  >
                                    Projected change
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color,
                                    }}
                                  >
                                    {`${val >= 0 ? "+" : ""}${val}%`}
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar dataKey="change_pct" radius={[0, 4, 4, 0]}>
                            {chartData.map((d) => (
                              <Cell key={d.symbol} fill={barFill(d.change_pct)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-3 text-xs text-on-surface-variant">
                      Bars show each stock&apos;s median projected return over {predLen} trading
                      days. Green = projected gain, red = projected loss.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="glass-effect rounded-xl p-4 border border-warning/20">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  ⚠️ Research-grade probabilistic forecasts, not investment advice.
                  Rankings reflect a single model&apos;s median paths and can be wrong;
                  verify with your own research before any decision.
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-2">
                  Powered by <span className="font-medium text-on-surface">Kronos</span>,
                  an open-source financial foundation model pre-trained on 12B+ candles
                  across 45 global exchanges (AAAI 2026), fine-tuned by RupeeMap for
                  NSE/BSE price projection.
                </p>
              </div>
            </>
          )}

          {!rows && !error && !loading && (
            <div className="glass-effect rounded-xl p-10 text-center text-on-surface-variant">
              Enter a watchlist and scan to rank stocks by their AI-projected return.
            </div>
          )}
        </div>
      }
    />
  );
}
