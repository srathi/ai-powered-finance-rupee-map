import { NextRequest, NextResponse } from "next/server";

const YAHOO_SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search";

// Simple in-memory cache (10s TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 10_000;

interface YahooQuote {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  exchDisp: string;
  quoteType: string;
  sector: string;
  sectorDisp: string;
  industry: string;
  industryDisp: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  // Opt-in restriction: when set, only NSE/BSE (Indian) equities are returned.
  // Used by the Persona Reports page; other pages keep the full universe.
  const indianOnly = searchParams.get("indianOnly") === "1";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Check cache
  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const json = await res.json();
    const quotes: YahooQuote[] = json?.quotes ?? [];

    // Filter to equities only, optionally restrict to NSE/BSE
    const results = quotes
      .filter((q) => q.quoteType === "EQUITY")
      .filter((q) => !indianOnly || q.exchange === "NSI" || q.exchange === "BSE")
      .map((q) => ({
        symbol: q.symbol.replace(/\.(NS|BO)$/, ""),
        fullSymbol: q.symbol,
        companyName: q.longname || q.shortname,
        exchange: q.exchDisp || q.exchange,
        exchangeCode: q.exchange,
        sector: q.sectorDisp || q.sector || "",
        industry: q.industryDisp || q.industry || "",
        // Boost NSE/BSE results
        isIndian: q.exchange === "NSI" || q.exchange === "BSE",
      }))
      .sort((a, b) => {
        // NSE/BSE first, then by relevance
        if (a.isIndian !== b.isIndian) return a.isIndian ? -1 : 1;
        return 0;
      });

    const data = { results, query };

    // Cache
    cache.set(cacheKey, { data, ts: Date.now() });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Stock search error:", err);
    return NextResponse.json({ results: [], query });
  }
}
