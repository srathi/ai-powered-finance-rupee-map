"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

export interface ForecastPoint {
  t: string;
  hist: number | null;
  median: number | null;
  band: [number, number] | null;
}

interface ForecastChartProps {
  data: ForecastPoint[];
  lastClose?: number;
  height?: number;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-effect rounded-lg border border-border/40 p-3 text-xs shadow-lg">
      <p className="mb-1 font-data text-on-surface">{label}</p>
      {payload.map((p: any) => {
        if (p.dataKey === "band") {
          const [lo, hi] = p.value as [number, number];
          return (
            <p key="band" className="font-data text-on-surface-variant">
              90% band: ₹{lo.toFixed(2)} – ₹{hi.toFixed(2)}
            </p>
          );
        }
        if (p.value == null) return null;
        const name = p.dataKey === "hist" ? "Historical" : "Forecast";
        return (
          <p key={p.dataKey} className="font-data" style={{ color: p.color }}>
            {name}: ₹{Number(p.value).toFixed(2)}
          </p>
        );
      })}
    </div>
  );
}

export function ForecastChart({ data, lastClose, height = 420 }: ForecastChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11 }}
            minTickGap={48}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            domain={["auto", "auto"]}
            width={64}
            tickFormatter={(v) => `₹${Number(v).toFixed(0)}`}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {lastClose != null && (
            <ReferenceLine
              y={lastClose}
              stroke="hsl(var(--outline))"
              strokeDasharray="4 4"
              label={{ value: "Last close", fontSize: 10, position: "insideTopLeft" }}
            />
          )}
          <Area
            dataKey="band"
            stroke="none"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.15}
            name="90% band"
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="hist"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            name="Historical"
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="median"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
            name="Forecast (median)"
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
