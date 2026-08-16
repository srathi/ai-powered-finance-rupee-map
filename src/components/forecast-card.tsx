"use client";

import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { ProbabilityGauge } from "@/components/probability-gauge";
import { ForecastChart, type ForecastPoint } from "@/components/forecast-chart";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { StockForecast } from "@/lib/forecast";

function Mini({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: "success" | "danger";
}) {
  const color =
    variant === "success"
      ? "text-success"
      : variant === "danger"
        ? "text-danger"
        : "text-on-surface";
  return (
    <div className="rounded-lg bg-surface-container-high/60 p-2">
      <p className="label-caps text-[9px] uppercase text-on-surface-variant mb-0.5">
        {label}
      </p>
      <p className={`font-data text-xs font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function ForecastCard({ data }: { data: StockForecast }) {
  const positive = data.change_pct >= 0;

  const chartData: ForecastPoint[] = [
    ...data.history.map((h) => ({
      t: h.t,
      hist: h.c,
      median: null,
      band: null,
    })),
    ...data.forecast.dates.map((d, i) => ({
      t: d,
      hist: null,
      median: data.forecast.median[i],
      band: [data.forecast.p10[i], data.forecast.p90[i]] as [number, number],
    })),
  ];

  return (
    <div className="glass-effect rounded-xl border border-primary/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-on-surface">
            AI Forecast · {data.symbol}
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-on-surface-variant">
          {data.exchange}
        </span>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Mini label="Last" value={formatCurrency(data.last_close)} />
          <Mini
            label="Predicted"
            value={formatCurrency(data.mc_stats.median_close)}
          />
          <Mini
            label="Change"
            value={`${positive ? "+" : ""}${formatPercent(data.change_pct)}`}
            variant={positive ? "success" : "danger"}
          />
        </div>

        <ForecastChart data={chartData} lastClose={data.last_close} height={220} />

        <div className="flex items-center gap-3">
          <ProbabilityGauge value={data.mc_stats.upside_prob} size={104} />
          <div className="text-[11px] text-on-surface-variant space-y-1">
            <p>
              Upside probability:{" "}
              <span className="font-data text-on-surface">
                {Math.round(data.mc_stats.upside_prob * 100)}%
              </span>
            </p>
            <p>
              90% band:{" "}
              <span className="font-data text-on-surface">
                ₹{data.mc_stats.band_lo.toFixed(0)}–
                {data.mc_stats.band_hi.toFixed(0)}
              </span>
            </p>
            <p className="flex items-center gap-1">
              {positive ? (
                <>
                  <TrendingUp className="h-3 w-3 text-success" /> Bullish bias
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-danger" /> Bearish bias
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-[9px] text-on-surface-variant leading-snug">
          ⚠️ {data.disclaimer}
        </p>
      </div>
    </div>
  );
}
