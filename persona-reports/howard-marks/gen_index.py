#!/usr/bin/env python3
"""Automated Howard Marks-style equity-screen report generator for NSE indices.

Fetches live financials via yfinance, runs the Howard Marks fatal-flaw framework,
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
    NAME = "Howard Marks"

    info, fin, bs, cf = fetched
    short = info.get("shortName") or info.get("longName") or name or sym
    sector = info.get("sector") or industry or "Diversified"
    ind = info.get("industry") or industry or ""
    summary = info.get("longBusinessSummary") or ""

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
    roic = pct(info.get("returnOnCapitalEmployed"))
    hi = num(info.get("fiftyTwoWeekHigh"))
    lo = num(info.get("fiftyTwoWeekLow"))

    up = (ind + " " + sector).upper()
    is_financial = any(k in up for k in ("FINANCIAL", "BANK", "NBFC", "FINANCE",
                                         "INSURANCE", "MORTGAGE", "HOUSING", "HOLDING"))
    net_cash = (cash_latest is not None and total_debt is not None and cash_latest > total_debt)

    flaws = []

    cyc_flag = False
    cyc_watch = False
    if price is not None and hi is not None and lo is not None and hi > lo:
        off_high = (hi - price) / hi * 100.0
        if off_high > 45:
            flaws.append(("Cycle position", "WATCH", f"Price is ~{off_high:.0f}% below its 52-week high - Mr. Market is fearful; opportunity or a value trap?"))
        else:
            flaws.append(("Cycle position", "PASS", f"Price is within ~{off_high:.0f}% of its 52-week high; the tape is not signalling deep distress."))
    else:
        flaws.append(("Cycle position", "WATCH", "Recent price trend could not be confirmed; know where we stand in the cycle."))

    if price is not None and hi is not None and lo is not None and hi > lo:
        near_high = (hi - price) / hi * 100.0 < 5
    else:
        near_high = False
    if near_high and (pe is not None and pe > 40):
        flaws.append(("Market euphoria", "FLAG", f"Trading near its 52-week high on a rich P/E {pe:.0f} - a classic sign of peak optimism; be skeptical."))
    elif near_high:
        flaws.append(("Market euphoria", "WATCH", "Trading near its highs; second-level thinking says the obvious bull case is already in the price."))
    else:
        flaws.append(("Market euphoria", "PASS", "Not trading at a point of obvious euphoria; room to apply contrarian, cycle-aware judgment."))

    if is_financial:
        if de_pct is not None and de_pct > 300:
            flaws.append(("Leverage & risk", "WATCH", f"Leverage is high (~{de_pct:.0f}%), normal for a financial; judge via capital/asset quality, not D/E."))
        else:
            flaws.append(("Leverage & risk", "PASS", "Leverage is part of the normal financial model; assess solvency via capital and asset quality."))
    elif de_pct is None:
        flaws.append(("Leverage & risk", "WATCH", "Debt-to-equity could not be confirmed; verify the balance sheet before committing capital."))
    elif de_pct > 120:
        flaws.append(("Leverage & risk", "FLAG", f"Debt-to-equity is high at ~{de_pct:.0f}% - excessive leverage amplifies downside when the cycle turns."))
    elif de_pct > 60:
        flaws.append(("Leverage & risk", "WATCH", f"Debt-to-equity is elevated at ~{de_pct:.0f}%; acceptable but leverage that must be watched through the cycle."))
    else:
        flaws.append(("Leverage & risk", "PASS", f"Debt-to-equity is conservative at ~{de_pct:.0f}%; the balance sheet can weather a downturn."))

    val_parts = []
    val_flag = False
    val_watch = False
    if pe is not None and pe > 45:
        val_flag = True
        val_parts.append(f"trailing P/E {pe:.0f} is very rich")
    elif pe is not None and pe > 30:
        val_watch = True
        val_parts.append(f"trailing P/E {pe:.0f} is on the higher side")
    if peg is not None and peg > 3:
        val_flag = True
        val_parts.append(f"PEG {peg:.1f} is stretched")
    elif peg is not None and peg > 2:
        val_watch = True
        val_parts.append(f"PEG {peg:.1f} is above 2")
    if val_flag:
        flaws.append(("Margin of safety", "FLAG", "Valuation leaves no margin of safety - " + "; ".join(val_parts) + ". Price assumes the recent past repeats."))
    elif val_watch:
        flaws.append(("Margin of safety", "WATCH", "Valuation is full-ish - " + "; ".join(val_parts) + ". Wait for a better price."))
    else:
        pe_s = f"trailing P/E {pe:.0f}" if pe is not None else "P/E n/a"
        flaws.append(("Margin of safety", "PASS", f"Valuation is reasonable ({pe_s}); the price offers some margin of safety."))

    earn_parts = []
    if eps_g is not None:
        earn_parts.append(f"EPS {eps_g:.1f}%")
    if ni_g is not None:
        earn_parts.append(f"net profit {ni_g:.1f}%")
    earn_str = ", ".join(earn_parts) if earn_parts else "unavailable"
    if eps_g is None and ni_g is None:
        flaws.append(("Second-level view", "WATCH", "Earnings trend could not be verified; the consensus narrative is unconfirmed."))
    elif (eps_g is not None and eps_g < -15) or (ni_g is not None and ni_g < -20):
        flaws.append(("Second-level view", "FLAG", f"Earnings are contracting ({earn_str}) - the bullish consensus may be wrong."))
    elif (eps_g is not None and eps_g < 0) or (ni_g is not None and ni_g < 0):
        flaws.append(("Second-level view", "WATCH", f"Recent earnings growth is flat-to-negative ({earn_str}); is the market pricing in a recovery that may not come?"))
    else:
        flaws.append(("Second-level view", "PASS", f"Earnings are growing (latest {earn_str}); the bull and bear cases can both be articulated."))

    if is_financial:
        flaws.append(("Owner earnings", "PASS", "Cash-flow conversion is not a meaningful test for a financial; judge via loan/book growth and asset quality."))
    elif fcf_latest is not None and ni_latest is not None and ni_latest != 0:
        conv = fcf_latest / ni_latest
        if conv < 0.2:
            flaws.append(("Owner earnings", "FLAG", f"Free cash flow ({fmt_cr(fcf_latest)}) is well below net profit ({fmt_cr(ni_latest)}); reported earnings may not be real cash."))
        elif conv < 0.6:
            flaws.append(("Owner earnings", "WATCH", f"Free cash flow ({fmt_cr(fcf_latest)}) converts at ~{conv*100:.0f}% of net profit ({fmt_cr(ni_latest)}); watch working-capital / capex drag."))
        else:
            flaws.append(("Owner earnings", "PASS", f"Free cash flow ({fmt_cr(fcf_latest)}) backs net profit ({fmt_cr(ni_latest)}) at ~{conv*100:.0f}%; earnings are real cash."))
    else:
        flaws.append(("Owner earnings", "WATCH", "Free-cash-flow conversion could not be verified from the statements."))

    has_flag = any(st == "FLAG" for _, st, _ in flaws)
    has_watch = any(st == "WATCH" for _, st, _ in flaws)
    if has_flag:
        decision = "AVOID"
    elif has_watch:
        decision = "WATCH"
    else:
        decision = "BUY CANDIDATE"

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
        drv.append("a low-debt balance sheet")
    if net_cash:
        drv.append("a net-cash balance sheet")
    if not drv:
        drv = ["fundamentals that need confirmation from primary filings"]
    driver = "The investment case rests on " + ", ".join(drv) + "."

    pe_s = f"{pe:.0f}" if pe is not None else "n/a"
    roe_s = ('%.0f%%' % roe) if roe is not None else "n/a"
    tagline = (f"A {sector.lower()} business screened as {decision} "
               f"(return on equity {roe_s}, P/E {pe_s}) - " +
               (f"a candidate worth pursuing under the {NAME} discipline."
                if decision == "BUY CANDIDATE"
                else "worth monitoring as the thesis or the price clears."
                if decision == "WATCH"
                else "a fatal-flaw check fails; better avoided for now."))

    if pe is not None and pe < 20 and (peg is None or peg < 1.5):
        val_state, val_conv = "Attractive", "High"
    elif pe is not None and pe < 30:
        val_state, val_conv = "Full-ish", "Medium"
    else:
        val_state, val_conv = "Rich / unproven", "Low"

    if is_financial:
        lev_state, lev_conv = "Normal for model", "Medium"
    elif de_pct is not None and de_pct < 30:
        lev_state, lev_conv = "Conservative", "High"
    elif de_pct is not None and de_pct < 60:
        lev_state, lev_conv = "Moderate", "Medium"
    else:
        lev_state, lev_conv = "Leveraged", "Low"

    if (roe is not None and roe > 15) or (roic is not None and roic > 12):
        ret_state, ret_conv = "High & durable", "High"
    elif (roe is not None and roe > 10) or (roic is not None and roic > 0):
        ret_state, ret_conv = "Moderate", "Medium"
    else:
        ret_state, ret_conv = "Weak / unclear", "Low"

    if (eps_g is not None and eps_g > 0) or (ni_g is not None and ni_g > 0):
        earn_state, earn_conv = "Growing", "High"
    elif eps_g is None and ni_g is None:
        earn_state, earn_conv = "Unconfirmed", "Medium"
    else:
        earn_state, earn_conv = "Flat / declining", "Low"

    if is_financial:
        cf_state, cf_conv = "n/a (financial)", "n/a"
    elif fcf_latest is not None and ni_latest is not None and ni_latest != 0:
        c = fcf_latest / ni_latest
        if c > 0.6:
            cf_state, cf_conv = "Strong conversion", "High"
        elif c > 0.2:
            cf_state, cf_conv = "Moderate conversion", "Medium"
        else:
            cf_state, cf_conv = "Weak conversion", "Low"
    else:
        cf_state, cf_conv = "Unconfirmed", "Medium"

    diagnostics = [
        ("Valuation & margin of safety", val_state, val_conv,
         (f"Trailing P/E {pe:.0f}, PEG {peg:.1f}." if (pe is not None and peg is not None)
          else f"Trailing P/E {pe:.0f}." if pe is not None else "Valuation data unavailable.")),
        ("Balance sheet & leverage", lev_state, lev_conv,
         ("Net cash on the balance sheet." if net_cash
          else f"Debt-to-equity ~{de_pct:.0f}%." if (de_pct is not None and not is_financial)
          else "Leverage is normal for the business model." if is_financial
          else "Leverage unconfirmed.")),
        ("Returns on capital", ret_state, ret_conv,
         (f"ROE ~{roe:.0f}%, ROIC ~{roic:.0f}%." if (roe is not None and roic is not None)
          else f"ROE ~{roe:.0f}%." if roe is not None
          else "Return data unavailable.")),
        ("Earnings power", earn_state, earn_conv,
         (f"Latest EPS growth {eps_g:+.1f}%." if eps_g is not None
          else "Earnings data unavailable.")),
        ("Owner-earnings quality", cf_state, cf_conv,
         ("Free cash flow backs the net profit." if cf_conv == "High"
          else "Free-cash-flow conversion is weak or unconfirmed.")),
    ]

    if decision == "BUY CANDIDATE":
        category = (f"Under the {NAME} discipline this screens as a buy candidate: the fatal-flaw tests "
                    "pass and the price leaves a margin of safety. A candidate for deeper, owner-oriented due diligence.")
    elif decision == "WATCH":
        category = (f"Under the {NAME} discipline this is a WATCH: fundamentals are acceptable but one or more "
                    "checks warrant monitoring before committing capital.")
    else:
        category = (f"Under the {NAME} discipline this is an AVOID: a fatal-flaw check fails, so price or quality "
                    "is not there.")

    bonus = []
    if de_pct is not None and de_pct < 30:
        bonus.append(f"Low debt (D/E ~{de_pct:.0f}%).")
    if roe is not None and roe > 15:
        bonus.append(f"Healthy return on equity (~{roe:.0f}%).")
    if roic is not None and roic > 12:
        bonus.append(f"Healthy return on capital (~{roic:.0f}%).")
    if margin is not None and margin > 12:
        bonus.append(f"Healthy net margin (~{margin:.0f}%).")
    if dy is not None and dy >= 1:
        bonus.append(f"Pays a dividend (yield ~{dy:.1f}%).")
    if net_cash:
        bonus.append("Net-cash balance sheet.")
    if not bonus:
        bonus.append("No standout bonus point surfaced; verify directly from filings.")

    decision_reason = (f"Screened as {decision}. " +
                       ("A fatal-flaw check fails (see flagged items), so it is set aside."
                        if decision == "AVOID" else
                        "Fundamentals are acceptable but one or more checks warrant monitoring before committing capital."
                        if decision == "WATCH" else
                        "Shows acceptable quality, valuation and balance-sheet strength; a candidate for deeper due diligence."))

    revisit = ("Revisit if the flagged weakness (earnings, debt, cash flow, returns or valuation) clearly reverses."
               if decision != "BUY CANDIDATE" else
               "Revisit after a deeper read of the annual report, competitive moat and capital-allocation track record.")

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
