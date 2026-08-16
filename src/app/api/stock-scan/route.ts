import { NextRequest, NextResponse } from "next/server";

// Watchlist scans run many sequential forecasts; allow a generous budget.
export const maxDuration = 300;

const SERVICE_URL = (
  process.env.KRONOS_SERVICE_URL || "http://localhost:7860"
).replace(/\/$/, "");

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

const EXCHANGES = ["nse", "bse"] as const;
const INTERVALS = ["1d", "1h", "15m", "5m"] as const;

interface ScanBody {
  tickers?: string[];
  exchange?: string;
  predLen?: number;
  paths?: number;
  interval?: string;
}

export async function POST(request: NextRequest) {
  let body: ScanBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = Array.isArray(body.tickers) ? body.tickers : [];
  const tickers = raw
    .map((t) => String(t).trim())
    .filter((t) => t.length > 0)
    .slice(0, 20);
  if (tickers.length === 0) {
    return NextResponse.json({ error: "Provide at least one ticker." }, { status: 400 });
  }

  const exchange = EXCHANGES.includes(body.exchange as never)
    ? (body.exchange as string)
    : "nse";
  const interval = INTERVALS.includes(body.interval as never)
    ? (body.interval as string)
    : "1d";
  const predLen = Math.max(5, Math.min(180, Math.round(Number(body.predLen) || 30)));
  const paths = Math.max(1, Math.min(100, Math.round(Number(body.paths) || 10)));

  const cacheKey = `${tickers.join(",").toLowerCase()}|${exchange}|${interval}|${predLen}|${paths}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const payload = { tickers, exchange, pred_len: predLen, paths, interval };

  try {
    const res = await fetch(`${SERVICE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(300_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Scan service returned ${res.status}`, detail: detail.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await res.json();
    cache.set(cacheKey, { data, ts: Date.now() });
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "Scan timed out (model may be warming up). Please try again."
        : "Forecast service is unreachable. Check KRONOS_SERVICE_URL.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
