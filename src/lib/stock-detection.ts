export interface ResolvedStock {
  symbol: string;
  companyName: string;
  lastPrice?: number;
  change?: number;
  percentChange?: number;
  previousClose?: number;
  currency?: string;
}

interface SearchResult {
  symbol: string;
  fullSymbol: string;
  companyName: string;
  exchange: string;
  isIndian: boolean;
}

const MAX_CANDIDATES = 4;

// Brand names Yahoo doesn't index under their ticker/legal name
const BRAND_ALIASES: Record<string, string> = {
  policybazaar: "POLICYBZR",
  "pb fintech": "POLICYBZR",
  paytm: "PAYTM",
  one97: "PAYTM",
  nykaa: "NYKAA",
  "fsn e-commerce": "NYKAA",
};

const STOP_WORDS = new Set([
  "about", "above", "after", "again", "against", "also", "among", "and",
  "am", "are", "bank", "believe", "best", "before", "between", "buy", "can",
  "care", "could", "do", "does", "doing", "don't", "even", "every", "expect",
  "feel", "from", "good", "grow", "growth", "have", "here", "how", "if",
  "india", "into", "invest", "investing", "investment", "is", "know", "long",
  "look", "mean", "more", "must", "my", "need", "nifty", "often", "only",
  "other", "over", "price", "profit", "returns", "sensex", "share", "shares",
  "should", "sip", "stock", "stocks", "such", "tell", "that", "their",
  "then", "there", "these", "they", "think", "this", "those", "through",
  "time", "under", "very", "want", "we", "were", "what", "what's", "when",
  "where", "which", "who", "why", "while", "will", "with", "would", "year",
  "years", "you", "your",
]);

const GENERIC_WORDS = new Set([
  "budget", "buy", "earn", "emergency", "fund", "gold", "health", "home",
  "house", "insurance", "loan", "market", "mutual", "plan", "rent", "retire",
  "retirement", "save", "sell", "tax", "term",
]);

function normalize(word: string): string {
  return word
    .replace(/\b(\.NS|\.BO)\b/gi, "")
    .replace(/[.,;:!?()"]/g, "")
    .trim();
}

function extractCandidates(text: string): string[] {
  const tokens = text.split(/\s+/);
  const candidates: string[] = [];
  const seen = new Set<string>();
  const phrases: string[] = [];

  const push = (word: string, isPhrase = false) => {
    const w = normalize(word);
    if (w.length < 2 || w.length > 40) return;
    const key = w.toLowerCase();
    if (seen.has(key)) return;
    if (!isPhrase && (STOP_WORDS.has(key) || GENERIC_WORDS.has(key))) return;
    if (!isPhrase && phrases.some((p) => p.split(" ").includes(key))) return;
    seen.add(key);
    if (isPhrase) phrases.push(key);
    candidates.push(w);
  };

  const isCapitalized = (w: string) => /^[A-Z][a-zA-Z]{1,}$/.test(w);

  // Multi-word proper-noun phrases first: "HDFC Bank", "Tata Motors",
  // "Reliance Industries" (more specific than single words)
  for (let i = 0; i < tokens.length && candidates.length < MAX_CANDIDATES; i++) {
    const raw = normalize(tokens[i]);
    if (!isCapitalized(raw)) continue;
    const low = raw.toLowerCase();
    if (STOP_WORDS.has(low) || GENERIC_WORDS.has(low)) continue;
    const phrase: string[] = [raw];
    let j = i + 1;
    while (j < tokens.length && phrase.length < 3) {
      const t = normalize(tokens[j]);
      if (!isCapitalized(t)) break;
      phrase.push(t);
      j++;
    }
    if (phrase.length >= 2) {
      push(phrase.join(" "), true);
      i = j - 1;
    }
  }

  for (let i = 0; i < tokens.length && candidates.length < MAX_CANDIDATES; i++) {
    const raw = normalize(tokens[i]);

    // All-caps ticker (TCS, RELIANCE, HDFCBANK)
    if (/^[A-Z]{2,}$/.test(raw)) {
      push(raw);
      continue;
    }

    // Proper-noun company word (Reliance, Infosys, Adani)
    if (/^[A-Z][a-z]{2,}$/.test(raw)) {
      push(raw);
      continue;
    }

    // "TCS.NS" / "reliance.bo" style
    if (/^[A-Za-z]{2,}\.(NS|BO)$/i.test(raw)) {
      push(raw);
      continue;
    }
  }

  // Phrase fallback: "X share price" or "price of X" (handles lowercase mentions)
  for (let i = 0; i < tokens.length && candidates.length < MAX_CANDIDATES; i++) {
    const word = normalize(tokens[i]);
    if (word.length < 2 || !/^[A-Za-z]+$/.test(word)) continue;
    const prev = i > 0 ? tokens[i - 1].toLowerCase() : "";
    const next = i < tokens.length - 1 ? normalize(tokens[i + 1]).toLowerCase() : "";
    if (next === "share" || next === "shares" || next === "stock" || next === "stocks" || prev === "of") {
      push(word);
    }
  }

  return candidates;
}

function isExactTicker(candidate: string, result: SearchResult): boolean {
  const c = candidate.toLowerCase();
  const sym = result.symbol.toLowerCase();
  const fullSym = result.fullSymbol.toLowerCase();
  return sym === c || fullSym === c || fullSym === `${c}.ns` || fullSym === `${c}.bo`;
}

function isNameMatch(candidate: string, result: SearchResult): boolean {
  const c = candidate.toLowerCase();
  const sym = result.symbol.toLowerCase();
  const name = result.companyName.toLowerCase();

  // Company name starts with candidate (Reliance -> "Reliance Infrastructure Limited")
  if (name.startsWith(c) && c.length >= 3) {
    return true;
  }
  // Candidate is a prefix of ticker for very short names (HDFC -> HDFCBANK)
  if (c.length >= 3 && sym.startsWith(c) && sym.length - c.length <= 6) {
    return true;
  }
  return false;
}

async function probeQuote(symbol: string): Promise<ResolvedStock | null> {
  try {
    const probe = await fetch(
      `/api/stock-price?symbol=${encodeURIComponent(symbol)}&range=1d`
    );
    if (!probe.ok) return null;
    const data = (await probe.json()) as {
      symbol?: string;
      companyName?: string;
      error?: string;
      lastPrice?: number;
      change?: number;
      percentChange?: number;
      previousClose?: number;
      currency?: string;
    };
    if (!data.symbol || data.error) return null;
    return {
      symbol: data.symbol,
      companyName: data.companyName || symbol,
      lastPrice: data.lastPrice,
      change: data.change,
      percentChange: data.percentChange,
      previousClose: data.previousClose,
      currency: data.currency,
    };
  } catch {
    return null;
  }
}

export async function resolveStock(text: string): Promise<ResolvedStock | null> {
  const candidates = extractCandidates(text);
  if (candidates.length === 0) return null;

  for (const candidate of candidates) {
    // 0) Brand alias lookup (Yahoo doesn't index "Policybazaar" -> POLICYBZR)
    const alias = BRAND_ALIASES[candidate.toLowerCase()];
    if (alias) {
      const found = await probeQuote(alias);
      if (found) return found;
    }

    // 1) Direct ticker probe — exact symbols beat fuzzy name matching
    //    (e.g. "Reliance" -> RELIANCE.NS, not RELINFRA.NS)
    const probes = [candidate];
    // Multi-word phrases also try the concatenated ticker ("HDFC Bank" -> HDFCBANK)
    if (candidate.includes(" ")) {
      probes.push(candidate.replace(/\s+/g, ""));
    }
    for (const probeSymbol of probes) {
      const found = await probeQuote(probeSymbol);
      if (found) return found;
    }

    // 2) Fuzzy name search fallback (NSE/BSE equities only)
    try {
      const res = await fetch(`/api/stock-search?q=${encodeURIComponent(candidate)}`);
      if (!res.ok) continue;
      const data = (await res.json()) as { results?: SearchResult[] };
      const indian = (data.results ?? []).filter((r) => r.isIndian);
      const match =
        indian.find((r) => isExactTicker(candidate, r)) ??
        indian.find((r) => isNameMatch(candidate, r));
      if (match) {
        return {
          symbol: match.fullSymbol,
          companyName: match.companyName || match.symbol,
        };
      }
    } catch {
      // Ignore individual lookup failures
    }
  }

  return null;
}

export async function fetchStockNews(stock: ResolvedStock): Promise<string[]> {
  try {
    const res = await fetch(
      `/api/stock-news?symbol=${encodeURIComponent(stock.symbol)}&name=${encodeURIComponent(stock.companyName)}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: { title: string }[] };
    return (data.items ?? []).slice(0, 3).map((i) => i.title);
  } catch {
    return [];
  }
}