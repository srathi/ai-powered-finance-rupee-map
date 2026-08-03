import { NextRequest, NextResponse } from "next/server";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

// Simple in-memory cache (30s TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30_000;

const SUPPORTED_RANGES = ["1d", "1mo", "3mo", "6mo", "1y", "5y", "max"] as const;
type Range = (typeof SUPPORTED_RANGES)[number];

// Yahoo interval per range (intraday for 1d, coarser for long ranges)
const RANGE_INTERVAL: Record<Range, string> = {
  "1d": "15m",
  "1mo": "1d",
  "3mo": "1d",
  "6mo": "1d",
  "1y": "1d",
  "5y": "1wk",
  max: "1mo",
};

interface YahooMeta {
  currency: string;
  symbol: string;
  exchangeName: string;
  fullExchangeName: string;
  regularMarketPrice: number;
  previousClose: number;
  chartPreviousClose: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  longName: string;
  shortName: string;
  regularMarketTime: number;
  hasPrePostMarketData: boolean;
}

interface YahooQuote {
  open: (number | null)[];
  high: (number | null)[];
  low: (number | null)[];
  close: (number | null)[];
  volume: (number | null)[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawSymbol = searchParams.get("symbol");
  const rawRange = searchParams.get("range") ?? "1d";

  if (!rawSymbol) {
    return NextResponse.json(
      { error: "Missing 'symbol' query parameter" },
      { status: 400 }
    );
  }

  if (
    !SUPPORTED_RANGES.includes(rawRange as Range)
  ) {
    return NextResponse.json(
      { error: `Invalid 'range' parameter. Supported: ${SUPPORTED_RANGES.join(", ")}` },
      { status: 400 }
    );
  }

  const range = rawRange as Range;

  // Normalize: if no suffix, default to NSE (.NS)
  let symbol = rawSymbol.trim().toUpperCase();
  if (!symbol.endsWith(".NS") && !symbol.endsWith(".BO")) {
    symbol = `${symbol}.NS`;
  }

  // Check cache
  const cacheKey = `${symbol}:${range}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = `${YAHOO_BASE}/${symbol}?interval=${RANGE_INTERVAL[range]}&range=${range}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo Finance returned ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json(
        { error: `No data found for symbol: ${symbol}` },
        { status: 404 }
      );
    }

    const meta: YahooMeta = result.meta;
    const quote: YahooQuote = result.indicators?.quote?.[0];

    const lastPrice = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose;
    const change = prevClose ? lastPrice - prevClose : 0;
    const percentChange = prevClose ? (change / prevClose) * 100 : 0;

    // Build historical series from timestamps + quote arrays
    const timestamps: number[] = Array.isArray(result.timestamp)
      ? result.timestamp
      : [];
    const history = timestamps
      .map((t, i) => ({
        time: t * 1000,
        open: quote?.open?.[i] ?? null,
        high: quote?.high?.[i] ?? null,
        low: quote?.low?.[i] ?? null,
        close: quote?.close?.[i] ?? null,
        volume: quote?.volume?.[i] ?? 0,
      }))
      .filter((p) => p.close != null);

    const data = {
      symbol: meta.symbol,
      companyName: meta.longName || meta.shortName,
      exchange: meta.fullExchangeName || meta.exchangeName,
      currency: meta.currency,
      lastPrice,
      previousClose: prevClose,
      change: Math.round(change * 100) / 100,
      percentChange: Math.round(percentChange * 100) / 100,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      yearHigh: meta.fiftyTwoWeekHigh,
      yearLow: meta.fiftyTwoWeekLow,
      volume: meta.regularMarketVolume,
      open: quote?.open?.[0] ?? lastPrice,
      marketTime: meta.regularMarketTime,
      isMarketOpen: meta.hasPrePostMarketData === false && meta.regularMarketTime > 0,
      range,
      history,
    };

    // Cache the response
    cache.set(cacheKey, { data, ts: Date.now() });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Stock price fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
