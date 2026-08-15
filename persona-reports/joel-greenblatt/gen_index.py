#!/usr/bin/env python3
"""Automated Joel Greenblatt Magic Formula equity-screen report generator for NSE indices.

Fetches live financials via yfinance, ranks stocks by earnings yield and return on
capital, and renders the branded RupeeMap PDF (reusing gen_reports.Report).

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
    # Convert the statements to INR so EV and ROC line up with marketCap.
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

    # ---- Greenblatt Magic Formula dimensions ----
    ebit = None
    if fin is not None:
        ebit_series = col_series(fin, "Operating Income") or col_series(fin, "EBIT")
        if ebit_series:
            ebit = ebit_series[-1]
    ev = None
    if mcap is not None:
        ev = mcap + (total_debt if total_debt is not None else 0) - (cash_latest if cash_latest is not None else 0)
    eyield = (ebit / ev) if (ebit is not None and ev not in (None, 0) and ev > 0) else None

    ca = col_series(bs, "Current Assets")
    cl = col_series(bs, "Current Liabilities")
    ca_latest = ca[-1] if ca else None
    cl_latest = cl[-1] if cl else None
    nwc = (ca_latest - cl_latest) if (ca_latest is not None and cl_latest is not None) else None
    ppe = col_series(bs, "Net Property Plant Equipment") or col_series(bs, "Property Plant And Equipment Net") or col_series(bs, "Property Plant Equipment")
    ppe_latest = ppe[-1] if ppe else None
    denom = (nwc if nwc is not None else 0) + (ppe_latest if ppe_latest is not None else 0)
    roc = (ebit / denom) if (ebit is not None and denom not in (None, 0) and denom > 0) else None

    if is_financial or ebit is None or ev is None or ev <= 0:
        ey_label, ey_conv = "N/A for financial / unavailable", "Medium"
    elif eyield > 0.10:
        ey_label, ey_conv = f"High ({eyield*100:.1f}%)", "High"
    elif eyield > 0.06:
        ey_label, ey_conv = f"Moderate ({eyield*100:.1f}%)", "Medium"
    else:
        ey_label, ey_conv = f"Low ({eyield*100:.1f}%)", "Low"

    if is_financial or roc is None:
        roc_label, roc_conv = "N/A for financial / unavailable", "Medium"
    elif roc > 0.25:
        roc_label, roc_conv = f"High ({roc*100:.1f}%)", "High"
    elif roc > 0.15:
        roc_label, roc_conv = f"Moderate ({roc*100:.1f}%)", "Medium"
    else:
        roc_label, roc_conv = f"Low ({roc*100:.1f}%)", "Low"

    ey_high = ey_label.startswith("High")
    roc_high = roc_label.startswith("High")
    ey_low = ey_label.startswith("Low")
    roc_low = roc_label.startswith("Low")
    if ey_high and roc_high:
        rank_label, rank_conv = "Top tier (formula buy)", "High"
    elif ey_low and roc_low:
        rank_label, rank_conv = "Bottom tier", "Low"
    elif ey_high or roc_high:
        rank_label, rank_conv = "Above average", "Medium"
    else:
        rank_label, rank_conv = "Mixed / below average", "Medium"

    if de_pct is not None and de_pct < 30:
        bs_label, bs_conv = "Conservative", "High"
    elif de_pct is not None and de_pct < 60:
        bs_label, bs_conv = "Moderate", "Medium"
    else:
        bs_label, bs_conv = "Leveraged", "Low"

    rf = 0.07
    if eyield is not None:
        if eyield > rf + 0.05:
            val_label, val_conv = "Cheap vs bonds", "High"
        elif eyield > rf:
            val_label, val_conv = "In line with bonds", "Medium"
        else:
            val_label, val_conv = "Pricier than bonds", "Low"
    else:
        val_label, val_conv = "Unconfirmed", "Medium"

    if roc is not None and roc > 0.20:
        q_label, q_conv = "High quality", "High"
    elif roc is not None and roc > 0.10:
        q_label, q_conv = "Moderate", "Medium"
    elif roc is not None:
        q_label, q_conv = "Low quality", "Low"
    else:
        q_label, q_conv = "Unconfirmed", "Medium"

    flaws = []

    if eyield is None:
        flaws.append(("Earnings yield", "WATCH", "EBIT/EV could not be computed (EBIT or enterprise value missing)."))
    elif eyield > 0.10:
        flaws.append(("Earnings yield", "PASS", f"Earnings yield ~{eyield*100:.1f}% - the business is cheap on EBIT/EV."))
    elif eyield > 0.06:
        flaws.append(("Earnings yield", "WATCH", f"Earnings yield ~{eyield*100:.1f}% - only moderately cheap."))
    else:
        flaws.append(("Earnings yield", "FLAG", f"Earnings yield ~{eyield*100:.1f}% - too expensive for the formula."))

    if roc is None:
        flaws.append(("Return on capital", "WATCH", "ROC (EBIT / tangible capital) could not be computed."))
    elif roc > 0.25:
        flaws.append(("Return on capital", "PASS", f"Return on capital ~{roc*100:.1f}% - the business is highly efficient with its capital."))
    elif roc > 0.15:
        flaws.append(("Return on capital", "WATCH", f"Return on capital ~{roc*100:.1f}% - decent but not exceptional."))
    else:
        flaws.append(("Return on capital", "FLAG", f"Return on capital ~{roc*100:.1f}% - capital is not working hard enough."))

    if (ey_high and roc_high):
        flaws.append(("Magic Formula rank", "PASS", "Scores well on BOTH earnings yield and return on capital - a formula top-tier name."))
    elif (ey_low and roc_low):
        flaws.append(("Magic Formula rank", "FLAG", "Scores poorly on BOTH metrics - the formula would reject it."))
    else:
        flaws.append(("Magic Formula rank", "WATCH", "Strong on one metric but weak on the other; a mixed formula score."))

    if is_financial:
        flaws.append(("Balance sheet", "PASS", "Leverage is normal for a financial; the formula still ranks on EBIT/EV and ROC."))
    elif de_pct is None:
        flaws.append(("Balance sheet", "WATCH", "Debt-to-equity could not be confirmed."))
    elif de_pct > 120:
        flaws.append(("Balance sheet", "FLAG", f"Debt-to-equity ~{de_pct:.0f}% - heavy leverage that can impair the formula's edge."))
    elif de_pct > 60:
        flaws.append(("Balance sheet", "WATCH", f"Debt-to-equity ~{de_pct:.0f}%; acceptable but watch."))
    else:
        flaws.append(("Balance sheet", "PASS", f"Debt-to-equity ~{de_pct:.0f}%; a sturdy balance sheet."))

    if eyield is not None and eyield > rf:
        flaws.append(("Valuation vs bonds", "PASS", f"Earnings yield ~{eyield*100:.1f}% beats ~{rf*100:.0f}% risk-free."))
    elif eyield is not None:
        flaws.append(("Valuation vs bonds", "WATCH", f"Earnings yield ~{eyield*100:.1f}% is around or below the ~{rf*100:.0f}% risk-free rate."))
    else:
        flaws.append(("Valuation vs bonds", "WATCH", "Earnings yield unavailable for comparison."))

    has_flag = any(st == "FLAG" for _, st, _ in flaws)
    has_watch = any(st == "WATCH" for _, st, _ in flaws)
    if has_flag:
        decision = "AVOID"
    elif has_watch:
        decision = "WATCH"
    else:
        decision = "TOP RANK"

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
    if ey_high:
        drv.append(f"a high earnings yield (~{eyield*100:.1f}%)")
    if roc_high:
        drv.append(f"a high return on capital (~{roc*100:.1f}%)")
    if net_cash:
        drv.append("a net-cash balance sheet")
    if dy is not None and dy > 0:
        drv.append(f"a dividend yield ~{dy:.1f}%")
    if not drv:
        drv = ["fundamentals that need confirmation from primary filings"]
    driver = "The Magic Formula case rests on " + ", ".join(drv) + "."

    pe_s = f"{pe:.0f}" if pe is not None else "n/a"
    ey_s = f"{eyield*100:.1f}%" if eyield is not None else "n/a"
    roc_s = f"{roc*100:.1f}%" if roc is not None else "n/a"
    tagline = (f"A {sector.lower()} business screened as {decision} "
               f"(earnings yield {ey_s}, ROC {roc_s}) - " +
               ("a top-ranked Magic Formula name." if decision == "TOP RANK"
                else "watchlist - one formula metric is weak." if decision == "WATCH"
                else "fails the formula on both metrics; better avoided."))

    diagnostics = [
        ("Earnings yield (EBIT/EV)", ey_label, ey_conv,
         (f"EBIT/EV ~{eyield*100:.1f}%." if eyield is not None else "EBIT or enterprise value unavailable.")),
        ("Return on capital", roc_label, roc_conv,
         (f"EBIT / (net working capital + net fixed assets) ~{roc*100:.1f}%." if roc is not None else "ROC unavailable.")),
        ("Magic Formula rank", rank_label, rank_conv,
         "Cheap AND high-quality is what the formula buys; the two must line up."),
        ("Balance sheet", bs_label, bs_conv,
         ("Net cash on the balance sheet." if net_cash
          else f"Debt-to-equity ~{de_pct:.0f}%." if (de_pct is not None and not is_financial)
          else "Leverage is normal for the business model." if is_financial
          else "Leverage unconfirmed.")),
        ("Valuation vs risk-free", val_label, val_conv,
         (f"Earnings yield ~{eyield*100:.1f}% vs ~{rf*100:.0f}% risk-free." if eyield is not None else "Yield unavailable.")),
        ("Business quality", q_label, q_conv,
         (f"Net margin ~{margin:.0f}%, ROE ~{roe:.0f}%." if (margin is not None and roe is not None) else "Quality data unavailable.")),
    ]

    if ey_high and roc_high:
        category = "A Magic Formula top tier: genuinely cheap (high earnings yield) AND genuinely good (high return on capital). Historically, these are the names the formula buys."
    elif ey_high and not roc_high:
        category = "Cheap but not high-quality - the formula would want both, so a 'cheap for a reason' look is warranted."
    elif roc_high and not ey_high:
        category = "High-quality but not cheap - a wonderful business the formula would wait to buy at a better price."
    else:
        category = "Neither cheap nor high-return - the formula would pass, as should we."

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
                       ("The formula rejects it - weak on earnings yield and/or return on capital."
                        if decision == "AVOID" else
                        "One formula metric is strong but the other weak; monitor until both line up."
                        if decision == "WATCH" else
                        "Strong on BOTH earnings yield and return on capital - exactly what the Magic Formula buys."))

    revisit = ("Revisit if the weak metric (earnings yield or return on capital) clearly improves."
               if decision != "TOP RANK" else
               "Revisit after a year like the formula suggests, or on a sharp price move that lifts the earnings yield.")

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
