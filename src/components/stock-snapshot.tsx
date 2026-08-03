"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle, Newspaper, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockCard, type StockData } from "@/components/stock-card";
import { StockChart } from "@/components/stock-chart";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

interface StockSnapshotProps {
  symbol: string;
  companyName: string;
}

function timeAgo(iso: string): string {
  const published = new Date(iso).getTime();
  if (Number.isNaN(published)) return "";
  const diff = Math.max(0, Date.now() - published);
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function StockSnapshot({ symbol, companyName }: StockSnapshotProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/stock-price?symbol=${encodeURIComponent(symbol)}&range=1d`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load stock data");
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load stock data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  useEffect(() => {
    let cancelled = false;

    fetch(
      `/api/stock-news?symbol=${encodeURIComponent(symbol)}&name=${encodeURIComponent(companyName)}`
    )
      .then(async (res) => {
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) throw new Error("news_failed");
          setNews(json.items || []);
        }
      })
      .catch(() => {
        if (!cancelled) setNewsError(true);
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, companyName]);

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          Fetching stock data for {companyName}...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <StockCard data={data} />
          <StockChart symbol={symbol} companyName={companyName} />

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                <CardTitle className="text-base text-on-surface">
                  Latest News
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {newsLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                  Loading latest news...
                </div>
              )}

              {!newsLoading && (newsError || news.length === 0) && (
                <p className="text-xs text-muted-foreground">
                  {newsError
                    ? "Latest news is unavailable right now."
                    : "No recent news found."}
                </p>
              )}

              {!newsLoading &&
                news.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <p className="text-sm text-on-surface font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.source && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                          {item.source}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(item.publishedAt)}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary" />
                    </div>
                  </a>
                ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}