import { NextRequest, NextResponse } from "next/server";

const GOOGLE_NEWS_URL =
  "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en";
const YAHOO_RSS_URL = "https://feeds.finance.yahoo.com/rss/2.0/headline";

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
};

// Simple in-memory cache (5 min TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60_000;

const MAX_ITEMS = 3;

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function parseRssItems(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRe.exec(xml)) !== null && items.length < MAX_ITEMS) {
    const block = match[1];

    const titleRaw = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
    const linkRaw = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "";
    const pubRaw = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";
    const sourceRaw = block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "";

    let title = decodeXml(titleRaw);
    const source = decodeXml(sourceRaw);
    const link = decodeXml(linkRaw);
    const publishedAt = decodeXml(pubRaw);

    if (!title || !link) continue;

    // Google News appends " - SourceName" to titles; strip it since the
    // source is displayed separately.
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3));
    }

    items.push({ title, link, source, publishedAt });
  }

  return items;
}

function buildGoogleQuery(symbol: string, name?: string): string {
  const cleanName = (name ?? "")
    .replace(/ limited| ltd| ltd\.| incorporated| inc\.?| corporation| corp\.?/gi, "")
    .trim();
  const term = cleanName && cleanName.length > 3 ? cleanName : symbol.replace(/\.(NS|BO)$/, "");
  return `"${term}" stock`;
}

async function fetchGoogleNews(symbol: string, name?: string): Promise<NewsItem[]> {
  const url = `${GOOGLE_NEWS_URL}&q=${encodeURIComponent(buildGoogleQuery(symbol, name))}`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8_000) });
  if (!res.ok) return [];
  return parseRssItems(await res.text());
}

async function fetchYahooNews(symbol: string): Promise<NewsItem[]> {
  const url = `${YAHOO_RSS_URL}?s=${encodeURIComponent(symbol)}&region=IN&lang=en-IN`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8_000) });
  if (!res.ok) return [];
  return parseRssItems(await res.text());
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawSymbol = searchParams.get("symbol");
  const name = searchParams.get("name") ?? undefined;

  if (!rawSymbol) {
    return NextResponse.json(
      { error: "Missing 'symbol' query parameter" },
      { status: 400 }
    );
  }

  let symbol = rawSymbol.trim().toUpperCase();
  if (!symbol.endsWith(".NS") && !symbol.endsWith(".BO")) {
    symbol = `${symbol}.NS`;
  }

  const cacheKey = `${symbol}:${name ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  let items = await fetchGoogleNews(symbol, name);
  if (items.length === 0) {
    items = await fetchYahooNews(symbol);
  }

  const data = { symbol, items };
  cache.set(cacheKey, { data, ts: Date.now() });

  return NextResponse.json(data);
}
