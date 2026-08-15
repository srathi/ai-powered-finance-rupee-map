#!/usr/bin/env python3
"""Automated Benjamin Graham-style equity-screen report generator for NSE indices.

Fetches live financials via yfinance, runs the Benjamin Graham fatal-flaw framework,
and renders the branded RupeeMap PDF (reusing gen_reports.Report).

Usage:
  python3 gen_index.py <symbols_csv> <out_dir> [--limit N] [--offset N]
  python3 gen_index.py --split <nifty500_csv>      # build midcap250/smallcap250 csvs from cached mcaps

Symbols CSV format (NSE export): Company Name,Industry,Symbol,Series,ISIN Code
"""
import os
import sys
import csv
import json
import time
import datetime
import traceback
import pickle

import yfinance as yf

HERE = os.path.dirname(os.path.abspath(__file__))
LISTS = os.path.join(HERE, "_lists")
CACHE = os.path.join(LISTS, "mcaps.json")
SHARED = os.getenv("PERSONA_CACHE", os.path.join(HERE, ".cache"))
sys.path.insert(0, HERE)
from gen_reports import Report, s  # reuse branded renderer + sanitizer

TODAY = datetime.date.today().isoformat()

# market-cap tier thresholds (INR)
LARGE_CAP = 1_000_000_000_000      # 1 lakh crore
MID_CAP = 200_000_000_000          # 20k crore

CYCLICAL_IND = ["FINANCIAL", "AUTO", "CAPITAL GOODS", "METAL", "ENERGY", "OIL",
                "CONSTRUCTION", "CEMENT", "REALTY", "TEXTILE", "POWER", "MINING",
                "CHEMICAL", "STEEL", "INFRASTRUCTURE", "LOGISTICS", "SHIPPING"]
DEFENSIVE_IND = ["IT", "PHARMA", "HEALTH", "FMCG", "CONSUMER", "TELECOM",
                 "UTILIT", "MEDIA", "RETAIL", "SERVICES"]


def log(msg):
    print(f"[{datetime.datetime.now():%H:%M:%S}] {msg}", flush=True)


# ---------------- helpers ----------------
def to_ticker(sym):
    sym = sym.strip()
    return sym if sym.upper().endswith(".NS") else sym + ".NS"


def num(v):
    """Coerce to float; None if not possible."""
    if v is None:
        return None
    try:
        if hasattr(v, "item"):
            v = v.item()
        if isinstance(v, str):
            vs = v.replace(",", "").replace("%", "").strip()
            if vs in ("", "-", "None"):
                return None
            return float(vs)
        return float(v)
    except Exception:
        return None


def pct(v):
    """Convert a fraction (0.12) to a percent number (12.0) if it looks fractional."""
    v = num(v)
    if v is None:
        return None
    if abs(v) > 0 and abs(v) < 1.5:   # likely a fraction
        return v * 100.0
    return v


def col_series(df, key):
    if df is None or key not in df.index:
        return []
    ser = df.loc[key]
    out = []
    dates = sorted(ser.index)
    for d in dates:
        out.append(num(ser[d]))
    return out


def fmt_cr(v):
    v = num(v)
    if v is None:
        return "n/a"
    return f"{v/1e7:,.0f} Cr"


def growth(a, b):
    a, b = num(a), num(b)
    if a is None or b is None or b == 0:
        return None
    return (a - b) / abs(b) * 100.0


# ---------------- data fetch ----------------
def fetch(sym, tries=3):
    tk = to_ticker(sym)
    last_err = None
    for attempt in range(tries):
        try:
            t = yf.Ticker(tk)
            info = t.info or {}
            fin = t.financials
            bs = t.balance_sheet
            cf = t.cashflow
            if not info:
                raise ValueError("empty info")
            return info, fin, bs, cf
        except Exception as e:
            last_err = e
            time.sleep(1.5 + attempt * 2)
    raise last_err


def load_raw(sym, tries=3):
    """Fetch raw yfinance fundamentals once and cache to a shared pickle store.

    Returns (info, fin, bs, cf) exactly like fetch(), but reuses the shared
    cache across all persona report generators so each symbol is fetched only
    once regardless of how many personas render it.
    """
    sym_ns = sym.upper().replace(".NS", "")
    pk = os.path.join(SHARED, sym_ns + ".pkl")
    if os.path.exists(pk):
        try:
            with open(pk, "rb") as f:
                return pickle.load(f)
        except Exception:
            pass
    tk = to_ticker(sym)
    last_err = None
    for attempt in range(tries):
        try:
            t = yf.Ticker(tk)
            info = t.info or {}
            fin = t.financials
            bs = t.balance_sheet
            cf = t.cashflow
            if not info:
                raise ValueError("empty info")
            data = (info, fin, bs, cf)
            os.makedirs(SHARED, exist_ok=True)
            with open(pk, "wb") as f:
                pickle.dump(data, f)
            return data
        except Exception as e:
            last_err = e
            time.sleep(1.5 + attempt * 2)
    raise last_err


# ---------------- analysis ----------------
def analyze(sym, name, industry, fetched):
    info, fin, bs, cf = fetched
    short = info.get("shortName") or info.get("longName") or name or sym
    sector = info.get("sector") or industry or "Diversified"
    ind = info.get("industry") or industry or ""
    summary = info.get("longBusinessSummary") or ""

    # Currency normalization: yfinance returns marketCap/price in the listing
    # exchange currency (INR for NSE) but the income statement, balance sheet and
    # cash flow in the company's reporting currency (USD for many Indian ADRs).
    # Convert the statements to INR so enterprise value and ratios line up.
    cur = (info.get("financialCurrency") or info.get("currency") or "").upper() or "INR"
    fx = 1.0
    if cur != "INR":
        try:
            fx = float(yf.Ticker(f"{cur}INR=X").fast_info["last_price"])
        except Exception:
            fx = 83.0
        if not (0 < fx < 1e6):
            fx = 83.0
    if fx != 1.0:
        fin = None if fin is None else fin * fx
        bs = None if bs is None else bs * fx
        cf = None if cf is None else cf * fx

    rev = col_series(fin, "Total Revenue")
    ni = col_series(fin, "Net Income Common Stockholders")
    if not ni:
        ni = col_series(fin, "Net Income")
    eps = col_series(fin, "Diluted EPS")
    if not eps:
        eps = col_series(fin, "Basic EPS")

    rev_latest, rev_prior = (rev[-1] if rev else None), (rev[-2] if len(rev) > 1 else None)
    ni_latest, ni_prior = (ni[-1] if ni else None), (ni[-2] if len(ni) > 1 else None)
    eps_latest, eps_prior = (eps[-1] if eps else None), (eps[-2] if len(eps) > 1 else None)

    rev_g = growth(rev_latest, rev_prior)
    ni_g = growth(ni_latest, ni_prior)
    eps_g = growth(eps_latest, eps_prior)

    td = col_series(bs, "Total Debt")
    te = col_series(bs, "Total Equity Gross Minority Interest")
    if not te:
        te = col_series(bs, "Stockholders Equity")
    cash = col_series(bs, "Cash And Cash Equivalents")
    total_debt = td[-1] if td else num(info.get("totalDebt"))
    total_equity = te[-1] if te else num(info.get("totalStockholdersEquity"))
    cash_latest = cash[-1] if cash else None
    de_pct = (total_debt / total_equity * 100.0) if (total_debt is not None and total_equity not in (None, 0)) else pct(info.get("debtToEquity"))

    ocf = col_series(cf, "Operating Cash Flow")
    capex = col_series(cf, "Capital Expenditure")
    ocf_latest = ocf[-1] if ocf else None
    capex_latest = capex[-1] if capex else None
    fcf_latest = (ocf_latest + capex_latest) if (ocf_latest is not None and capex_latest is not None) else None

    mcap = num(info.get("marketCap"))
    price = num(info.get("regularMarketPrice") or info.get("currentPrice"))
    pe = num(info.get("trailingPE"))
    fpe = num(info.get("forwardPE"))
    peg = num(info.get("pegRatio"))
    dy = pct(info.get("dividendYield"))
    yr_ret = num(info.get("52WeekChange"))
    margin = pct(info.get("profitMargins"))
    roe = pct(info.get("returnOnEquity"))
    hi = num(info.get("fiftyTwoWeekHigh"))
    lo = num(info.get("fiftyTwoWeekLow"))

    up = (ind + " " + sector).upper()
    is_financial = any(k in up for k in ("FINANCIAL", "BANK", "NBFC", "FINANCE",
                                         "INSURANCE", "MORTGAGE", "HOUSING", "HOLDING"))
    net_cash = (cash_latest is not None and total_debt is not None and cash_latest > total_debt)

    # ---- Graham deep-value dimensions ----
    shares = num(info.get("sharesOutstanding"))
    bvps = num(info.get("bookValue"))
    if bvps is None and total_equity is not None and shares:
        bvps = total_equity / shares
    eps_ttm = eps[-1] if eps else num(info.get("trailingEPS"))
    ca = col_series(bs, "Current Assets")
    cl = col_series(bs, "Current Liabilities")
    tl = col_series(bs, "Total Liabilities")
    ca_latest = ca[-1] if ca else None
    cl_latest = cl[-1] if cl else None
    tl_latest = tl[-1] if tl else None

    graham_num = None
    if eps_ttm is not None and bvps is not None and eps_ttm > 0 and bvps > 0:
        graham_num = (22.5 * eps_ttm * bvps) ** 0.5
    mos_pct = (graham_num - price) / graham_num * 100.0 if (graham_num and graham_num > 0 and price) else None

    eps_recent = []
    if eps:
        eps_recent = eps[-7:] if len(eps) >= 7 else eps
    stable_years = sum(1 for v in eps_recent if v is not None and v > 0)
    stability_ok = len(eps_recent) > 0 and stable_years >= max(4, len(eps_recent) - 2)

    cr = (ca_latest / cl_latest) if (ca_latest is not None and cl_latest not in (None, 0)) else None

    ncar = (ca_latest - tl_latest) if (ca_latest is not None and tl_latest is not None) else None
    netnet = (ncar is not None and mcap is not None and ncar > mcap)

    pb = (price / bvps) if (price and bvps) else num(info.get("priceToBook"))
    pb = num(pb)
    pe_ok = pe is not None and pe > 0 and pe < 15
    pb_ok = pb is not None and pb > 0 and pb < 1.5
    value_combo = bool((pe_ok and pb_ok) or (graham_num is not None and price is not None and price < graham_num))
    ey = (1.0 / pe) if (pe is not None and pe > 0) else None

    if graham_num is not None and price is not None and price < graham_num:
        gn_label, gn_conv = "Below Graham number", "High"
    elif graham_num is not None:
        gn_label, gn_conv = "Above Graham number", "Low"
    else:
        gn_label, gn_conv = "Graham number unavailable", "Medium"

    if stability_ok:
        stab_label, stab_conv = "Stable (profitable most years)", "High"
    elif stable_years >= 3:
        stab_label, stab_conv = "Mixed", "Medium"
    else:
        stab_label, stab_conv = "Unstable", "Low"

    if cr is None:
        fr_label, fr_conv = "Unconfirmed", "Medium"
    elif is_financial:
        fr_label, fr_conv = "N/A for financial", "Medium"
    elif cr > 2:
        fr_label, fr_conv = "Strong (current ratio > 2)", "High"
    elif cr > 1.5:
        fr_label, fr_conv = "Adequate", "Medium"
    else:
        fr_label, fr_conv = "Weak", "Low"

    if netnet:
        nn_label, nn_conv = "Net-net (NCAV > mkt cap)", "High"
    elif ncar is not None and mcap is not None and ncar > 0.5 * mcap:
        nn_label, nn_conv = "Asset-rich (NCAV > 0.5x cap)", "Medium"
    elif ncar is None:
        nn_label, nn_conv = "Unconfirmed", "Medium"
    else:
        nn_label, nn_conv = "Not a net-net", "Low"

    if value_combo:
        val_label, val_conv = "Cheap by Graham rules", "High"
    elif pe is not None and pe < 25:
        val_label, val_conv = "Reasonable", "Medium"
    else:
        val_label, val_conv = "Expensive vs Graham rules", "Low"

    div_label = "Pays a dividend" if (dy is not None and dy > 0) else "No / low dividend"
    div_conv = "Medium" if (dy is not None and dy > 0) else "Low"

    flaws = []

    if stability_ok:
        flaws.append(("Earnings stability", "PASS", f"Profits positive in {stable_years} of {len(eps_recent)} recent years - the dependable record Graham demanded."))
    elif stable_years >= 3:
        flaws.append(("Earnings stability", "WATCH", f"Profits positive in only {stable_years} of {len(eps_recent)} recent years; the record is not dependable enough for a defensive investor."))
    else:
        flaws.append(("Earnings stability", "FLAG", f"Earnings are erratic or negative ({stable_years} of {len(eps_recent)} recent years positive); a speculative, not defensive, situation."))

    if is_financial:
        flaws.append(("Financial strength", "PASS", "Liquidity ratios are not the right lens for a financial; judge via capital adequacy and asset quality."))
    elif cr is None:
        flaws.append(("Financial strength", "WATCH", "Current ratio could not be confirmed; verify working-capital strength before buying."))
    elif cr > 2:
        flaws.append(("Financial strength", "PASS", f"Current ratio ~{cr:.1f} - ample liquidity, exactly what Graham wanted."))
    elif cr > 1.5:
        flaws.append(("Financial strength", "WATCH", f"Current ratio ~{cr:.1f} - acceptable but not the >2 Graham preferred."))
    else:
        flaws.append(("Financial strength", "FLAG", f"Current ratio ~{cr:.1f} is weak; the balance sheet lacks a defensive margin of safety."))

    if graham_num is not None and price is not None and price < graham_num:
        flaws.append(("Margin of safety", "PASS", f"Price ({fmt_cr(price)}) is below the Graham number ({fmt_cr(graham_num)}); margin of safety ~{mos_pct:.0f}%."))
    elif graham_num is not None:
        flaws.append(("Margin of safety", "WATCH", f"Price ({fmt_cr(price)}) is above the Graham number ({fmt_cr(graham_num)}); little or no margin of safety."))
    else:
        flaws.append(("Margin of safety", "WATCH", "Graham number could not be computed (EPS or book value missing); margin of safety unconfirmed."))

    if netnet:
        flaws.append(("Net-net screen", "PASS", f"Market cap ({fmt_cr(mcap)}) is below net current asset value ({fmt_cr(ncar)}) - the purest Graham bargain."))
    elif ncar is not None and mcap is not None and ncar > 0.5 * mcap:
        flaws.append(("Net-net screen", "WATCH", f"NCAV ({fmt_cr(ncar)}) is decent vs market cap ({fmt_cr(mcap)}) but not a true net-net."))
    elif ncar is None:
        flaws.append(("Net-net screen", "WATCH", "Net current asset value could not be confirmed."))
    else:
        flaws.append(("Net-net screen", "PASS", "Not a net-net, but that is normal; the other value tests decide."))

    if value_combo:
        flaws.append(("Defensive value rules", "PASS", f"P/E {pe:.0f} (<15) and P/B {pb:.1f} (<1.5)" if (pe and pb) else "Price is below the Graham number - cheap by the rules."))
    elif pe is not None and pe < 25:
        flaws.append(("Defensive value rules", "WATCH", f"P/E {pe:.0f} is under 25 but misses Graham's tighter P/E<15 & P/B<1.5 discipline."))
    else:
        flaws.append(("Defensive value rules", "FLAG", f"P/E {pe:.0f} / P/B {pb:.1f} is too rich for a defensive investor."))

    if dy is not None and dy > 0:
        flaws.append(("Dividend record", "PASS", f"Pays a dividend (yield ~{dy:.1f}%); a cash return Graham valued for income and discipline."))
    else:
        flaws.append(("Dividend record", "WATCH", "Pays little or no dividend; Graham preferred a visible cash return."))

    has_flag = any(st == "FLAG" for _, st, _ in flaws)
    has_watch = any(st == "WATCH" for _, st, _ in flaws)
    if has_flag:
        decision = "REJECT"
    elif has_watch:
        decision = "WATCH"
    else:
        decision = "DEFENSIVE BUY"

    if summary and len(summary) > 40:
        bus = summary.strip()
        if len(bus) > 520:
            bus = bus[:517].rstrip() + "..."
    else:
        bus = f"{short} operates in the {sector} sector (industry: {ind or 'n/a'})."

    drv = []
    if rev_g is not None:
        drv.append(f"revenue {rev_g:+.1f}% (Rs {fmt_cr(rev_latest)} TTM)")
    if ni_g is not None:
        drv.append(f"net profit {ni_g:+.1f}%")
    if margin is not None:
        drv.append(f"net margin ~{margin:.1f}%")
    if de_pct is not None and de_pct < 40:
        drv.append("a conservative, low-debt balance sheet")
    if net_cash:
        drv.append("a net-cash balance sheet")
    if not drv:
        drv = ["fundamentals that need confirmation from primary filings"]
    if value_combo:
        drv.append("a cheap valuation by Graham's rules")
    if netnet:
        drv.append("a price below net current asset value")
    if stability_ok:
        drv.append("a stable, multi-year profit record")
    if cr is not None and cr > 2:
        drv.append("a strong current ratio")
    if dy is not None and dy > 0:
        drv.append(f"a dividend yield ~{dy:.1f}%")
    if not drv:
        drv = ["fundamentals that need confirmation from primary filings"]
    driver = "The deep-value case rests on " + ", ".join(drv) + "."

    pe_s = f"{pe:.0f}" if pe is not None else "n/a"
    pb_s = f"{pb:.1f}" if pb is not None else "n/a"
    gn_s = f"{graham_num:.0f}" if graham_num is not None else "n/a"
    tagline = (f"A {sector.lower()} business screened as {decision} "
               f"(P/E {pe_s}, P/B {pb_s}, Graham number {gn_s}) - " +
               ("a disciplined defensive holding candidate." if decision == "DEFENSIVE BUY"
                else "worth monitoring as the price or balance sheet clears." if decision == "WATCH"
                else "fails Graham's defensive tests; better avoided."))

    diagnostics = [
        ("Graham number & margin of safety", gn_label, gn_conv,
         (f"Graham number ~Rs {fmt_cr(graham_num)}; price {fmt_cr(price)}, margin of safety ~{mos_pct:.0f}%."
          if graham_num is not None and price is not None else "Graham number could not be computed.")),
        ("Earnings stability", stab_label, stab_conv,
         f"Positive EPS in {stable_years} of {len(eps_recent)} recent years." if eps_recent else "EPS history unavailable."),
        ("Financial strength (liquidity)", fr_label, fr_conv,
         (f"Current ratio ~{cr:.1f}." if cr is not None else "Current ratio unconfirmed.")),
        ("Net-net (NCAV) screen", nn_label, nn_conv,
         (f"NCAV ~Rs {fmt_cr(ncar)} vs market cap ~Rs {fmt_cr(mcap)}." if (ncar is not None and mcap is not None) else "NCAV unconfirmed.")),
        ("Defensive value rules", val_label, val_conv,
         (f"P/E {pe:.0f} (<15) and P/B {pb:.1f} (<1.5)." if (pe and pb) else "Price vs book/earnings unconfirmed.")),
        ("Dividend record", div_label, div_conv,
         (f"Dividend yield ~{dy:.1f}%." if dy is not None else "No meaningful dividend.")),
    ]

    if netnet and stability_ok and value_combo:
        category = "A textbook Graham bargain: profitable through the years, cheap by his rules, and trading below net current asset value - the defensive investor's ideal."
    elif value_combo and stability_ok:
        category = "A sound defensive buy: cheap by Graham's P/E and P/B rules with a stable profit record. The margin of safety is real."
    elif value_combo:
        category = "Cheap, but the earnings record is shaky; demand a wider margin of safety or wait for stability."
    elif netnet:
        category = "A net-net speculator's opportunity - but verify the assets are real and the liabilities honest before committing."
    else:
        category = "Neither cheap enough nor stable enough for the defensive investor; better left alone."

    bonus = []
    if de_pct is not None and de_pct < 30:
        bonus.append(f"Low debt (D/E ~{de_pct:.0f}%).")
    if roe is not None and roe > 15:
        bonus.append(f"Healthy return on equity (~{roe:.0f}%).")
    if margin is not None and margin > 12:
        bonus.append(f"Healthy net margin (~{margin:.0f}%).")
    if dy is not None and dy >= 1:
        bonus.append(f"Pays a dividend (yield ~{dy:.1f}%).")
    if net_cash:
        bonus.append("Net-cash balance sheet.")
    if not bonus:
        bonus.append("No standout bonus point surfaced; verify directly from filings.")

    decision_reason = (f"Screened as {decision}. " +
                       ("A Graham test fails (see flagged items), so it is rejected for a defensive portfolio."
                        if decision == "REJECT" else
                        "Most defensive tests pass but one or more (stability, liquidity, margin of safety or valuation) warrant monitoring."
                        if decision == "WATCH" else
                        "Passes Graham's defensive discipline - cheap by his rules with a stable record and a margin of safety."))

    revisit = ("Revisit if the flagged weakness (stability, liquidity, valuation or net-net) clearly improves."
               if decision != "DEFENSIVE BUY" else
               "Revisit after confirming the balance sheet and earnings from the annual report, and watch the price for an even wider margin of safety.")

    sym_ns = sym.upper().replace(".NS", "")
    sources = [
        ("Yahoo Finance", f"https://in.finance.yahoo.com/quote/{to_ticker(sym)}/"),
        ("StockAnalysis", f"https://stockanalysis.com/quote/nse/{sym_ns}/"),
        ("Screener", f"https://www.screener.in/company/{sym_ns}/"),
    ]

    return {
        "company": short,
        "ticker": f"NSE: {sym_ns}",
        "sector": sector,
        "date": TODAY,
        "cmp": price,
        "high52": hi,
        "low52": lo,
        "pe": pe,
        "dy": dy,
        "mcap": mcap,
        "yr_return": yr_ret,
        "peg": peg,
        "decision": decision,
        "tagline": s(tagline),
        "business": s(bus),
        "driver": s(driver),
        "diagnostics": [(s(a), s(b), s(c), s(d)) for a, b, c, d in diagnostics],
        "flaws": [(s(a), st, s(t)) for a, st, t in flaws],
        "category": s(category),
        "bonus": [s(b) for b in bonus],
        "decision_reason": s(decision_reason),
        "revisit": s(revisit),
        "sources": [(s(a), s(b)) for a, b in sources],
    }


# ---------------- driver ----------------
def load_symbols(csv_path):
    out = []
    with open(csv_path, newline="", encoding="utf-8", errors="ignore") as f:
        r = csv.DictReader(f)
        for row in r:
            sym = (row.get("Symbol") or "").strip()
            if sym:
                out.append((sym, (row.get("Company Name") or "").strip(),
                            (row.get("Industry") or "").strip()))
    return out


def load_cache():
    if os.path.exists(CACHE):
        try:
            with open(CACHE) as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_cache(c):
    with open(CACHE, "w") as f:
        json.dump(c, f)


DATA_DIR = os.path.join(LISTS, "data")


def run(csv_path, out_dir, limit=None, offset=0, force=False):
    os.makedirs(out_dir, exist_ok=True)
    syms = load_symbols(csv_path)
    if offset:
        syms = syms[offset:]
    if limit:
        syms = syms[:limit]
    cache = load_cache()
    total = len(syms)
    done = 0
    for i, (sym, name, ind) in enumerate(syms):
        sym_ns = sym.upper().replace(".NS", "")
        out_path = os.path.join(out_dir, f"{sym_ns}.pdf")
        if (not force) and os.path.exists(out_path):
            log(f"[{i+1}/{total}] skip existing {sym_ns}")
            continue
        try:
            fetched = load_raw(sym)
            info = fetched[0]
            mcap = num(info.get("marketCap"))
            if mcap is not None:
                cache[sym_ns] = mcap
            data = analyze(sym, name, ind, fetched)
            try:
                os.makedirs(DATA_DIR, exist_ok=True)
                with open(os.path.join(DATA_DIR, f"{sym_ns}.json"), "w") as dj:
                    json.dump(data, dj)
            except Exception:
                pass
            Report(data).output(out_path)
            done += 1
            log(f"[{i+1}/{total}] OK {sym_ns} -> {data['decision']} ({out_path})")
        except Exception as e:
            log(f"[{i+1}/{total}] FAIL {sym_ns}: {e}")
            traceback.print_exc()
        time.sleep(0.6)
    save_cache(cache)
    log(f"DONE {out_dir}: {done} new reports.")


def build_splits(nifty_csv):
    cache = load_cache()
    syms = load_symbols(nifty_csv)
    rows = []
    for sym, name, ind in syms:
        sym_ns = sym.upper().replace(".NS", "")
        mc = cache.get(sym_ns)
        rows.append((sym, name, ind, mc))
    missing = [r for r in rows if r[3] is None]
    if missing:
        log(f"Fetching market caps for {len(missing)} missing symbols...")
        for sym, name, ind, _ in missing:
            try:
                mc = num(yf.Ticker(to_ticker(sym)).fast_info.get("market_cap"))
            except Exception:
                mc = None
            cache[sym.upper().replace(".NS", "")] = mc
            time.sleep(0.25)
        rows = [(a, b, c, cache.get(a.upper().replace(".NS", ""))) for (a, b, c, _) in rows]
        save_cache(cache)
    rows.sort(key=lambda r: (r[3] if r[3] is not None else -1), reverse=True)
    mid = rows[100:350]
    small = rows[250:500]
    for label, subset in (("midcap250", mid), ("smallcap250", small)):
        path = os.path.join(LISTS, f"{label}.csv")
        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["Company Name", "Industry", "Symbol", "Series", "ISIN Code"])
            for sym, name, ind, mc in subset:
                w.writerow([name, ind, sym, "EQ", ""])
        log(f"Wrote {path} ({len(subset)} rows)")
    log("Note: midcap250 (ranks 101-350) and smallcap250 (ranks 251-500) overlap on ranks 251-350.")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "--split":
        build_splits(args[1] if len(args) > 1 else os.path.join(LISTS, "nifty500.csv"))
    elif len(args) >= 2:
        out = args[1]
        limit = None
        offset = 0
        force = False
        j = 2
        while j < len(args):
            if args[j] == "--limit":
                limit = int(args[j + 1]); j += 2
            elif args[j] == "--offset":
                offset = int(args[j + 1]); j += 2
            elif args[j] == "--force":
                force = True; j += 1
            else:
                j += 1
        run(args[0], out, limit=limit, offset=offset, force=force)
    else:
        print(__doc__)
