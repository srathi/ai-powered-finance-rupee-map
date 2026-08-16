"use client";

interface ProbabilityGaugeProps {
  value: number; // 0..1
  size?: number;
}

export function ProbabilityGauge({ value, size = 180 }: ProbabilityGaugeProps) {
  const v = Math.max(0, Math.min(1, value));
  const pct = Math.round(v * 100);
  const positive = v >= 0.5;

  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // 270-degree arc, gap at the bottom.
  const arc = 0.75;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * arc;
  const offset = dash * (1 - v);

  const color = positive ? "var(--color-success)" : "var(--color-danger)";

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-surface-container-high)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(135 ${cx} ${cy})`}
        />
        {/* value */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="font-data"
          fontSize={size * 0.22}
          fontWeight={700}
          fill={color}
        >
          {pct}%
        </text>
        <text
          x={cx}
          y={cy + size * 0.13}
          textAnchor="middle"
          fontSize={size * 0.075}
          fill="var(--color-on-surface-variant)"
          className="uppercase tracking-wider"
        >
          Upside
        </text>
      </svg>
    </div>
  );
}
