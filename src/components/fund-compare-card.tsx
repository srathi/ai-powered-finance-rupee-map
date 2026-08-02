"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { FundCompareFund } from "@/types/mutual-fund";

function formatNav(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatReturn(r: number | null): string {
  if (r === null) return "—";
  const sign = r >= 0 ? "+" : "";
  return `${sign}${r.toFixed(2)}%`;
}

function ReturnBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground text-xs">N/A</span>;
  }
  return (
    <span
      className={cn(
        "text-sm font-medium font-data",
        value > 0 && "text-emerald-500",
        value < 0 && "text-rose-500",
        value === 0 && "text-muted-foreground"
      )}
    >
      {formatReturn(value)}
    </span>
  );
}

interface FundCompareCardProps {
  fund: FundCompareFund;
  onRemove: (id: string) => void;
  colorIndex: number;
}

const CARD_COLORS = [
  "border-cyan-500/30",
  "border-emerald-500/30",
  "border-amber-500/30",
];

const BADGE_COLORS = [
  "bg-cyan-500/10 text-cyan-500",
  "bg-emerald-500/10 text-emerald-500",
  "bg-amber-500/10 text-amber-500",
];

export function FundCompareCard({ fund, onRemove, colorIndex }: FundCompareCardProps) {
  return (
    <Card className={cn("glass-effect relative", CARD_COLORS[colorIndex])}>
      <button
        onClick={() => onRemove(fund.id)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-on-surface transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <CardHeader className="pb-2">
        <div className="pr-8">
          <span
            className={cn(
              "inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mb-2",
              BADGE_COLORS[colorIndex]
            )}
          >
            Fund {colorIndex + 1}
          </span>
          <CardTitle className="text-base font-bold text-on-surface leading-tight">
            {fund.schemeName}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {fund.fundHouse} &middot; {fund.schemeCategory}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* NAV */}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Current NAV</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold font-data text-on-surface">
              {formatNav(fund.currentNav)}
            </span>
            <span className="text-xs text-muted-foreground pb-0.5">
              as of {fund.navDate}
            </span>
          </div>
        </div>

        {/* Returns */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Returns (CAGR)
          </p>
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">1Y</p>
              <ReturnBadge value={fund.returns["1Y"]} />
            </div>
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">3Y</p>
              <ReturnBadge value={fund.returns["3Y"]} />
            </div>
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">5Y</p>
              <ReturnBadge value={fund.returns["5Y"]} />
            </div>
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">All</p>
              <ReturnBadge value={fund.returns.allTime} />
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        {fund.returns["1Y"] !== null && (
          <div className="flex items-center gap-2 pt-1">
            {fund.returns["1Y"] > 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : fund.returns["1Y"] < 0 ? (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs",
                fund.returns["1Y"] > 0 && "text-emerald-500",
                fund.returns["1Y"] < 0 && "text-rose-500",
                fund.returns["1Y"] === 0 && "text-muted-foreground"
              )}
            >
              {fund.returns["1Y"] > 0
                ? "Outperforming"
                : fund.returns["1Y"] < 0
                  ? "Underperforming"
                  : "Flat"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
