import { NextRequest, NextResponse } from "next/server";

const searchCache = new Map<string, { data: unknown; timestamp: number }>();
const SEARCH_CACHE_TTL = 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ query: query || "", results: [] });
  }

  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(
      `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { query, results: [], error: "Failed to search funds" },
        { status: 502 }
      );
    }

    const data = await res.json();

    const results = Array.isArray(data)
      ? data.slice(0, 10).map((item: { schemeCode: number; schemeName: string }) => ({
          schemeCode: item.schemeCode,
          schemeName: item.schemeName,
        }))
      : [];

    const response = { query, results };
    searchCache.set(cacheKey, { data: response, timestamp: Date.now() });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Mutual fund search error:", error);
    return NextResponse.json(
      { query, results: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}
