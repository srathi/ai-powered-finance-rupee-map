// Shared types + helpers for the Kronos AI stock forecast integration.

export interface StockForecast {
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

// Only invoked when a stock has already been resolved, so keyword matching here
// is safe from false positives on general finance questions.
const FORECAST_PATTERNS: RegExp[] = [
  /\bforecast\b/i,
  /\bpredict(ion|ed)?\b/i,
  /\bprice target\b/i,
  /\btarget price\b/i,
  /\bfuture price\b/i,
  /\boutlook\b/i,
  /where\s+(is|are)\s+.*\b(head(ing|ed)?|going)\b/i,
  /\b(upside|downside)\b/i,
  /\b(next|coming)\s+(week|month|quarter|year)\b/i,
  /\b(expected|projected)\s+(move|price|return|performance)\b/i,
  /\b(will|can|could|should)\s+.*\b(go up|go down|rise|fall|rally|crash|move|perform)\b/i,
];

export function isForecastIntent(text: string): boolean {
  return FORECAST_PATTERNS.some((re) => re.test(text));
}

export function exchangeFromSymbol(symbol: string): "nse" | "bse" {
  return symbol.toUpperCase().endsWith(".BO") ? "bse" : "nse";
}

export function buildForecastSummary(f: StockForecast): string {
  const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  return `A probabilistic forecast was generated for ${f.symbol} (${f.exchange.toUpperCase()}) over ${f.forecast.dates.length} trading days by the Kronos AI model:
- Last close: ₹${f.last_close.toFixed(2)}
- Median predicted close: ₹${f.mc_stats.median_close.toFixed(2)} (${pct(f.change_pct)})
- Upside probability (close above last): ${(f.mc_stats.upside_prob * 100).toFixed(0)}%
- 90% confidence band at horizon: ₹${f.mc_stats.band_lo.toFixed(2)} – ₹${f.mc_stats.band_hi.toFixed(2)}
- Monte Carlo paths: ${f.mc_stats.n_paths}

Guidelines:
- Treat this as a probabilistic, research-grade estimate, not investment advice.
- You may refer to the forecast card shown in the UI qualitatively (e.g. "the model's median projection suggests…").
- Do NOT state future prices as certain facts. Emphasize uncertainty and the confidence band.`;
}
