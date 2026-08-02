import { NextRequest, NextResponse } from "next/server";

const navCache = new Map<string, { data: unknown; timestamp: number }>();
const NAV_CACHE_TTL = 5 * 60 * 1000;

function parseNavHistory(
  data: { date: string; nav: string }[]
): { date: string; nav: number }[] {
  return data
    .map((entry) => ({
      date: entry.date,
      nav: parseFloat(entry.nav),
    }))
    .filter((entry) => !isNaN(entry.nav))
    .sort((a, b) => {
      const [dA, mA, yA] = a.date.split("-").map(Number);
      const [dB, mB, yB] = b.date.split("-").map(Number);
      return yA - yB || mA - mB || dA - dB;
    });
}

function calculateCAGR(startNav: number, endNav: number, years: number): number | null {
  if (startNav <= 0 || endNav <= 0 || years <= 0) return null;
  return (Math.pow(endNav / startNav, 1 / years) - 1) * 100;
}

function getYearsFromDateRange(
  history: { date: string; nav: number }[],
  years: number
): { start: { nav: number; date: string }; end: { nav: number; date: string } } | null {
  if (history.length < 2) return null;

  const end = history[history.length - 1];
  const targetDate = new Date(end.date.split("-").reverse().join("-"));
  targetDate.setFullYear(targetDate.getFullYear() - years);
  const targetStr = targetDate.toISOString().split("T")[0];

  let closest = history[0];
  for (const entry of history) {
    if (entry.date <= targetStr) {
      closest = entry;
    } else {
      break;
    }
  }

  return { start: closest, end };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing scheme code" },
      { status: 400 }
    );
  }

  const cacheKey = `nav-${code}`;
  const cached = navCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NAV_CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Fund not found" },
        { status: 404 }
      );
    }

    const rawData = await res.json();

    if (rawData.status !== "SUCCESS" || !rawData.data) {
      return NextResponse.json(
        { error: "Invalid fund data" },
        { status: 404 }
      );
    }

    const navHistory = parseNavHistory(rawData.data);
    if (navHistory.length === 0) {
      return NextResponse.json(
        { error: "No valid NAV data" },
        { status: 404 }
      );
    }

    const currentNav = navHistory[navHistory.length - 1].nav;
    const navDate = navHistory[navHistory.length - 1].date;

    const range1Y = getYearsFromDateRange(navHistory, 1);
    const range3Y = getYearsFromDateRange(navHistory, 3);
    const range5Y = getYearsFromDateRange(navHistory, 5);
    const rangeAll = navHistory.length > 1
      ? { start: navHistory[0], end: navHistory[navHistory.length - 1] }
      : null;

    const totalYears =
      rangeAll
        ? (new Date(rangeAll.end.date.split("-").reverse().join("-")).getTime() -
            new Date(rangeAll.start.date.split("-").reverse().join("-")).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
        : 0;

    const response = {
      schemeCode: rawData.meta.scheme_code,
      schemeName: rawData.meta.scheme_name,
      fundHouse: rawData.meta.fund_house,
      schemeType: rawData.meta.scheme_type,
      schemeCategory: rawData.meta.scheme_category,
      isinGrowth: rawData.meta.isin_growth,
      currentNav,
      navDate,
      navHistory,
      returns: {
        "1Y": range1Y ? calculateCAGR(range1Y.start.nav, range1Y.end.nav, 1) : null,
        "3Y": range3Y ? calculateCAGR(range3Y.start.nav, range3Y.end.nav, 3) : null,
        "5Y": range5Y ? calculateCAGR(range5Y.start.nav, range5Y.end.nav, 5) : null,
        allTime: rangeAll ? calculateCAGR(rangeAll.start.nav, rangeAll.end.nav, totalYears) : null,
      },
    };

    navCache.set(cacheKey, { data: response, timestamp: Date.now() });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Mutual fund data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
