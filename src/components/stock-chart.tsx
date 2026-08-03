"use client";

import { useEffect, useRef, useState } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RefreshCw, AlertCircle } from "lucide-react";
import type { StockHistoryPoint } from "@/components/stock-card";

const RANGES = [
  { key: "1d", label: "1D" },
  { key: "1mo", label: "1M" },
  { key: "3mo", label: "3M" },
  { key: "6mo", label: "6M" },
  { key: "1y", label: "1Y" },
  { key: "5y", label: "5Y" },
  { key: "max", label: "Max" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCompact(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

function formatAxisPrice(v: number): string {
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}

function formatDate(ts: number, range: RangeKey): string {
  const d = new Date(ts);
  if (range === "1d") {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  if (range === "1y") {
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }
  if (range === "5y" || range === "max") {
    return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

interface StockChartProps {
  symbol: string;
  companyName: string;
}

export function StockChart({ symbol, companyName }: StockChartProps) {
  const [range, setRange] = useState<RangeKey>("1d");
  const [history, setHistory] = useState<StockHistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, StockHistoryPoint[]>());

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${symbol}:${range}`;
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      setHistory(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setHistory(null);

    fetch(`/api/stock-price?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load price history");
        }
        const points: StockHistoryPoint[] = data.history || [];
        cacheRef.current.set(cacheKey, points);
        if (!cancelled) setHistory(points);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load price history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  const isUp =
    !!history &&
    history.length > 1 &&
    history[history.length - 1].close >= history[0].close;
  const color = isUp ? "#10b981" : "#f43f5e";

  return (
    <Card className="glass-effect">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-on-surface">
              Price History
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {companyName} · {symbol}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  range === r.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-[320px]">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && history && history.length > 0 && (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={history}
                margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30"
                />
                <XAxis
                  dataKey="time"
                  type="number"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => formatDate(v, range)}
                  interval="preserveStartEnd"
                  minTickGap={48}
                />
                <YAxis
                  yAxisId="price"
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatAxisPrice}
                  width={56}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  hide
                  domain={[0, (dataMax: number) => dataMax * 4]}
                />
                <Tooltip
                  labelFormatter={(v) => formatDate(v as number, range)}
                  formatter={(value, name) => {
                    if (name === "volume") {
                      return [formatCompact(Number(value)), "Volume"];
                    }
                    return [formatPrice(Number(value)), "Close"];
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--surface-container-high))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="close"
                  stroke={color}
                  strokeWidth={2}
                  fill={color}
                  fillOpacity={0.15}
                  dot={false}
                  name="close"
                  activeDot={{ r: 3 }}
                />
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill={color}
                  fillOpacity={0.25}
                  barSize={3}
                  name="volume"
                  radius={[2, 2, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && !error && history && history.length === 0 && (
          <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground">
            No historical data available for this range.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
