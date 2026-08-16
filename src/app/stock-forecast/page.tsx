"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/calculator-layout";
import { SummaryCard, SummaryGrid } from "@/components/summary-cards";
import { SliderField } from "@/components/input-controls";
import { ForecastChart, type ForecastPoint } from "@/components/forecast-chart";
import { ProbabilityGauge } from "@/components/probability-gauge";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TrendingUp, Sparkles, ExternalLink, X } from "lucide-react";

interface ForecastResponse {
  symbol: string;
  exchange: string;
  last_close: number;
  currency: string;
  history: { t: string; c: number }[];
  forecast: { dates: string[]; median: number[]; p10: number[]; p90: number[] };
  mc_stats: {
    n_paths: number;
    upside_prob: number;
    vol_amp: number;
    band_lo: number;
    band_hi: number;
    median_close: number;
  };
  change_pct: number;
  disclaimer: string;
}

const POPULAR = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "BHARTIARTL",
  "ICICIBANK", "SBIN", "ITC", "LT", "MARUTI",
];

export default function StockForecastPage() {
  const [ticker, setTicker] = useState("RELIANCE");
  const [exchange, setExchange] = useState<"nse" | "bse">("nse");
  const [predLen, setPredLen] = useState(30);
  const [paths, setPaths] = useState(20);
  const [model, setModel] = useState<"" | "mini" | "small" | "base">("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWip, setShowWip] = useState(false);

  const chartData = useMemo<ForecastPoint[]>(() => {
    if (!data) return [];
    const hist = data.history.map((h) => ({
      t: h.t,
      hist: h.c,
      median: null,
      band: null,
    }));
    const fc = data.forecast.dates.map((d, i) => ({
      t: d,
      hist: null,
      median: data.forecast.median[i],
      band: [data.forecast.p10[i], data.forecast.p90[i]] as [number, number],
    }));
    return [...hist, ...fc];
  }, [data]);

  async function generate(e?: React.FormEvent) {
    e?.preventDefault();
    // AI Stock Forecast is a work-in-progress: surface a status popup
    // instead of running the pipeline until the feature is finished.
    setShowWip(true);
  }

  const changePositive = (data?.change_pct ?? 0) >= 0;

  return (
    <>
      <CalculatorLayout
      title="AI Stock Forecast"
      description="Probabilistic NSE/BSE price forecast powered by the Kronos financial foundation model (Monte Carlo)."
      info="The model samples many possible future price paths and reports the median path plus a 90% confidence band and the probability that the price ends above today's close. Forecasts are research-grade and probabilistic — not investment advice."
      isCalculating={loading}
      inputs={
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Forecast Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={generate} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="label-caps text-on-surface-variant uppercase">
                  Company / Ticker
                </label>
                <input
                  list="popular-tickers"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="RELIANCE or Bharti Airtel"
                  className="w-full input-well rounded-lg py-3 px-4 font-data text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <datalist id="popular-tickers">
                  {POPULAR.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
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
                tooltip="Number of future trading days to forecast (5–180)."
              />

              <div className="flex flex-col gap-2">
                <label className="label-caps text-on-surface-variant uppercase">
                  Model (Kronos)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["", "mini", "small", "base"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModel(m)}
                      className={`rounded-lg py-2.5 font-data text-sm uppercase tracking-wide transition-all ${
                        model === m
                          ? "bg-primary/15 border border-primary/40 text-primary"
                          : "bg-surface-container-high border border-transparent text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {m === "" ? "Auto" : m}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Auto uses the service default (mini). Larger models are more
                  accurate but slower.
                </p>
              </div>

              <SliderField
                label="Monte Carlo Paths"
                value={paths}
                onChange={setPaths}
                min={1}
                max={100}
                step={1}
                suffix=" paths"
                tooltip="More paths = smoother probability estimate (recommended ≥ 10)."
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Forecasting…" : "Generate Forecast"}
              </Button>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Try <span className="font-data text-primary">RELIANCE</span>,{" "}
                <span className="font-data text-primary">TCS</span>, or a company
                name like <span className="font-data text-primary">Bharti Airtel</span>.
              </p>
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

          {data && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="label-caps text-on-surface-variant uppercase">
                    {data.exchange} · {data.symbol}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                    AI Price Forecast
                  </h2>
                </div>
                <a
                  href={`/stock-price?symbol=${encodeURIComponent(data.symbol)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  Full quote &amp; news <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <SummaryGrid>
                <SummaryCard
                  label="Last Close"
                  value={formatCurrency(data.last_close)}
                  sublabel={`${data.currency}`}
                />
                <SummaryCard
                  label="Predicted Close"
                  value={formatCurrency(data.mc_stats.median_close)}
                  variant="success"
                  sublabel={`Median of ${data.mc_stats.n_paths} paths`}
                />
                <SummaryCard
                  label="Expected Change"
                  value={`${changePositive ? "+" : ""}${formatPercent(data.change_pct)}`}
                  variant={changePositive ? "success" : "danger"}
                  sublabel={changePositive ? "Bullish bias" : "Bearish bias"}
                />
              </SummaryGrid>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forecast &amp; Confidence Band</CardTitle>
                </CardHeader>
                <CardContent>
                  <ForecastChart data={chartData} lastClose={data.last_close} />
                  <p className="mt-3 text-xs text-on-surface-variant">
                    Shaded region = 90% confidence band (10th–90th percentile of
                    sampled paths). Dashed line = median forecast.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <Card className="md:col-span-1">
                  <CardContent className="pt-6">
                    <ProbabilityGauge value={data.mc_stats.upside_prob} />
                    <p className="text-center text-xs text-on-surface-variant mt-2">
                      Probability close &gt; last close
                    </p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Path Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Stat
                        label="90% Band (low)"
                        value={formatCurrency(data.mc_stats.band_lo)}
                      />
                      <Stat
                        label="90% Band (high)"
                        value={formatCurrency(data.mc_stats.band_hi)}
                      />
                      <Stat
                        label="Volatility Amplify"
                        value={formatPercent(data.mc_stats.vol_amp * 100, 0)}
                        sub="share of paths more volatile than history"
                      />
                      <Stat
                        label="Sample Paths"
                        value={String(data.mc_stats.n_paths)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="glass-effect rounded-xl p-4 border border-warning/20">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  ⚠️ {data.disclaimer}
                </p>
              </div>
            </>
          )}

          {!data && !error && !loading && (
            <div className="glass-effect rounded-xl p-10 text-center text-on-surface-variant">
              Enter a company or ticker and generate a forecast to see the
              projection, confidence band, and upside probability.
            </div>
          )}
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
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Work in progress
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI Stock Forecast is under development. We are finalizing the
                  Kronos model integration and Monte Carlo engine &mdash; please
                  check back soon.
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

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="glass-effect rounded-lg p-4">
      <p className="label-caps text-on-surface-variant uppercase text-[10px] mb-1">
        {label}
      </p>
      <p className="font-data text-lg font-bold text-on-surface">{value}</p>
      {sub && <p className="text-[10px] text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}
