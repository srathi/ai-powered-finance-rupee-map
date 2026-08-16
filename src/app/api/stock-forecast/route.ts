import { NextRequest, NextResponse } from "next/server";

// Give long autoregressive forecasts (e.g. 180 trading days) headroom.
export const maxDuration = 300;

const SERVICE_URL = (
  process.env.KRONOS_SERVICE_URL || "http://localhost:7860"
).replace(/\/$/, "");

// In-memory cache (1h TTL, serve-stale up to 6h on upstream failure).
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;
const STALE_TTL = 6 * 60 * 60 * 1000;

const EXCHANGES = ["nse", "bse"] as const;
const INTERVALS = ["1d", "1h", "15m", "5m"] as const;

interface ForecastBody {
  ticker?: string;
  exchange?: string;
  predLen?: number;
  paths?: number;
  interval?: string;
  model?: string;
}

export async function POST(request: NextRequest) {
  let body: ForecastBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ticker = (body.ticker || "").trim();
  if (!ticker) {
    return NextResponse.json({ error: "Missing 'ticker'" }, { status: 400 });
  }

  const exchange = EXCHANGES.includes(body.exchange as never)
    ? (body.exchange as string)
    : "nse";
  const interval = INTERVALS.includes(body.interval as never)
    ? (body.interval as string)
    : "1d";
  const predLen = Math.max(5, Math.min(180, Math.round(Number(body.predLen) || 30)));
  const paths = Math.max(1, Math.min(100, Math.round(Number(body.paths) || 20)));
  const model = body.model;

  const cacheKey = `${ticker.toLowerCase()}|${exchange}|${interval}|${predLen}|${paths}|${model || ""}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const payload = { ticker, exchange, pred_len: predLen, paths, interval, model };

  try {
    const res = await fetch(`${SERVICE_URL}/api/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(180_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      if (cached && Date.now() - cached.ts < STALE_TTL) {
        return NextResponse.json(cached.data);
      }
      const message =
        res.status === 404 && detail
          ? detail.slice(0, 300)
          : `Forecast service returned ${res.status}`;
      return NextResponse.json(
        { error: message, detail: detail.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await res.json();
    cache.set(cacheKey, { data, ts: Date.now() });
    return NextResponse.json(data);
  } catch (err) {
    if (cached && Date.now() - cached.ts < STALE_TTL) {
      return NextResponse.json(cached.data);
    }
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "Forecast timed out (model may be warming up). Please try again."
        : "Forecast service is unreachable. Check KRONOS_SERVICE_URL.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
