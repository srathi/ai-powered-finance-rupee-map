"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StockHistoryPoint {
  time: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  companyName: string;
  exchange: string;
  currency: string;
  lastPrice: number;
  previousClose: number;
  change: number;
  percentChange: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  volume: number;
  open: number;
  marketTime: number;
  range?: string;
  history?: StockHistoryPoint[];
}

function formatNumber(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  return n.toLocaleString("en-IN");
}

function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low;
  const pct = range > 0 ? ((current - low) / range) * 100 : 50;
  return (
    <div className="relative w-full h-1.5 rounded-full bg-muted/50">
      <div
        className="absolute h-full rounded-full bg-primary/60"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary-foreground -top-0.5"
        style={{ left: `calc(${Math.min(100, Math.max(0, pct))}% - 5px)` }}
      />
    </div>
  );
}

interface StockCardProps {
  data: StockData;
}

export function StockCard({ data }: StockCardProps) {
  const isUp = data.change > 0;
  const isDown = data.change < 0;

  return (
    <Card className="glass-effect">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-on-surface">
              {data.companyName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.symbol} &middot; {data.exchange}
            </p>
          </div>
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              isUp && "bg-emerald-500/10 text-emerald-500",
              isDown && "bg-rose-500/10 text-rose-500",
              !isUp && !isDown && "bg-muted text-muted-foreground"
            )}
          >
            {isUp ? "LIVE" : isDown ? "LIVE" : "—"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Price */}
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold font-data text-on-surface tracking-tight">
            {formatPrice(data.lastPrice)}
          </span>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium pb-1",
              isUp && "text-emerald-500",
              isDown && "text-rose-500",
              !isUp && !isDown && "text-muted-foreground"
            )}
          >
            {isUp ? (
              <TrendingUp className="h-4 w-4" />
            ) : isDown ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            <span>
              {isUp ? "+" : ""}
              {formatPrice(data.change)} ({isUp ? "+" : ""}
              {data.percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Day Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Day Low {formatPrice(data.dayLow)}</span>
            <span>Day High {formatPrice(data.dayHigh)}</span>
          </div>
          <RangeBar low={data.dayLow} high={data.dayHigh} current={data.lastPrice} />
        </div>

        {/* 52-Week Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>52W Low {formatPrice(data.yearLow)}</span>
            <span>52W High {formatPrice(data.yearHigh)}</span>
          </div>
          <RangeBar low={data.yearLow} high={data.yearHigh} current={data.lastPrice} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Open</p>
            <p className="text-sm font-medium font-data">{formatPrice(data.open)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Prev Close</p>
            <p className="text-sm font-medium font-data">{formatPrice(data.previousClose)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Volume</p>
            <p className="text-sm font-medium font-data">{formatNumber(data.volume)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Currency</p>
            <p className="text-sm font-medium font-data">{data.currency}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
