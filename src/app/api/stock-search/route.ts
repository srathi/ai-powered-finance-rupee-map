import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const YAHOO_SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

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

// Local NSE equity index (built from the NSE listed-companies list) powers
// reliable Indian-name autocomplete. Yahoo's global search buries Indian issues
// for short queries or name fragments (e.g. "parag" -> foreign "Paragon").
interface IndianEquity {
  symbol: string;
  name: string;
  exchange: string;
  exchangeCode: string;
  fullSymbol: string;
}
let _indexCache: IndianEquity[] | null = null;
function loadIndianIndex(): IndianEquity[] {
  if (_indexCache) return _indexCache;
  try {
    const p = path.join(process.cwd(), "src", "data", "indian-equities.json");
    _indexCache = JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    _indexCache = [];
  }
  return _indexCache ?? [];
}

function searchIndianIndex(q: string, limit = 12) {
  const idx = loadIndianIndex();
  const ql = q.toLowerCase();
  return idx
    .map((e) => {
      const sl = e.symbol.toLowerCase();
      const nl = e.name.toLowerCase();
      let s = 0;
      if (nl === ql || sl === ql) s = 100;
      else if (nl.startsWith(ql)) s = 80;
      else if (sl.startsWith(ql)) s = 70;
      else if (nl.includes(ql)) s = 50;
      else if (sl.includes(ql)) s = 40;
      return { e, s };
    })
    .filter((x) => x.s > 0)
    .sort(
      (a, b) =>
        b.s - a.s ||
        a.e.name.length - b.e.name.length ||
        a.e.symbol.length - b.e.symbol.length
    )
    .slice(0, limit)
    .map((x) => ({
      symbol: x.e.symbol,
      fullSymbol: x.e.fullSymbol,
      companyName: x.e.name,
      exchange: x.e.exchange,
      exchangeCode: x.e.exchangeCode,
      sector: "",
      industry: "",
      isIndian: true,
    }));
}

// Yahoo fallback (Indian-only) used when the local index yields no matches.
async function yahooIndianResults(query: string) {
  try {
    const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return [];
    const json = await res.json();
    const quotes: YahooQuote[] = json?.quotes ?? [];
    return quotes
      .filter(
        (q) =>
          q.quoteType === "EQUITY" &&
          (q.exchange === "NSI" || q.exchange === "BSE")
      )
      .map((q) => ({
        symbol: q.symbol.replace(/\.(NS|BO)$/, ""),
        fullSymbol: q.symbol,
        companyName: q.longname || q.shortname,
        exchange: q.exchDisp || q.exchange,
        exchangeCode: q.exchange,
        sector: q.sectorDisp || q.sector || "",
        industry: q.industryDisp || q.industry || "",
        isIndian: true,
      }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  // Opt-in restriction: when set, only NSE/BSE (Indian) equities are returned,
  // resolved from the local index for reliable name/ticker matching.
  const indianOnly = searchParams.get("indianOnly") === "1";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Indian-only path: serve from the local NSE index (offline, deterministic).
  if (indianOnly) {
    const key = `in:${query.toLowerCase()}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }
    let results = searchIndianIndex(query);
    if (results.length === 0) {
      results = await yahooIndianResults(query);
    }
    const data = { results, query };
    cache.set(key, { data, ts: Date.now() });
    return NextResponse.json(data);
  }

  // Full-universe path (e.g. Live Stock Prices): Yahoo global search.
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

    // Filter to equities only
    const results = quotes
      .filter((q) => q.quoteType === "EQUITY")
      .map((q) => ({
        symbol: q.symbol.replace(/\.(NS|BO)$/, ""),
        fullSymbol: q.symbol,
        companyName: q.longname || q.shortname,
        exchange: q.exchDisp || q.exchange,
        exchangeCode: q.exchange,
        sector: q.sectorDisp || q.sector || "",
        industry: q.industryDisp || q.industry || "",
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
