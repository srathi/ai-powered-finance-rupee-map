#!/usr/bin/env python3
"""Shared quantitative engine for every RupeeMap investor-persona report.

One module, reused by all 10 personas, so the math lives in a single place.
Every function is defensive: missing yfinance data returns ``None`` rather than
crashing the report. Persona ``gen_index.py`` files call ``compute_universal``
and the persona-specific helpers; ``gen_reports.py`` files render the results.

Conventions
-----------
* All ratios are expressed as plain numbers (e.g. 1.8 = 1.8x, 0.063 = 6.3%).
* CAGR / growth percentages are stored as percentages (e.g. 12.4 = 12.4%).
* ``col_series`` returns values in chronological order (oldest -> newest),
  matching the helper used inside every persona module.
"""

import math


# --------------------------------------------------------------------------
# low-level coercion helpers (self-contained; mirror each persona's `num`)
# --------------------------------------------------------------------------
def num(v):
    """Coerce to float; None if not possible / non-finite."""
    if v is None:
        return None
    try:
        if hasattr(v, "item"):
            v = v.item()
        if isinstance(v, str):
            vs = v.replace(",", "").replace("%", "").strip()
            if vs in ("", "-", "None", "NoneType"):
                return None
            return float(vs)
        f = float(v)
        if math.isnan(f) or math.isinf(f):
            return None
        return f
    except Exception:
        return None


def pct(v):
    """Treat a fractional value (0.12) as a percent (12.0)."""
    v = num(v)
    if v is None:
        return None
    if abs(v) > 0 and abs(v) < 1.5:
        return v * 100.0
    return v


def col_series(df, key):
    """Return a chronological list of float values for `key` in `df`."""
    if df is None or key not in df.index:
        return []
    ser = df.loc[key]
    out = []
    for d in sorted(ser.index):
        out.append(num(ser[d]))
    return out


# --------------------------------------------------------------------------
# scoring primitives (each returns 0..100)
# --------------------------------------------------------------------------
def _clamp(x, lo=0.0, hi=100.0):
    return max(lo, min(hi, x))


def _s_lin(v, lo, hi):
    """Map v in [lo,hi] -> [0,100]; below lo -> 0, above hi -> 100."""
    v = num(v)
    if v is None:
        return None
    if hi == lo:
        return 100.0 if v >= hi else 0.0
    return _clamp((v - lo) / (hi - lo) * 100.0)


def _s_inv(v, lo, hi):
    """Inverse mapping (higher v is worse)."""
    s = _s_lin(v, lo, hi)
    return None if s is None else (100.0 - s)


def _s_band(v, great, ok):
    """On/off style: >=great -> 100, >=ok -> 50, else 0."""
    v = num(v)
    if v is None:
        return None
    if v >= great:
        return 100.0
    if v >= ok:
        return 50.0
    return 0.0


# --------------------------------------------------------------------------
# series math
# --------------------------------------------------------------------------
def _cagr(vals):
    """Geometric annual growth across a chronological series (percent)."""
    vals = [v for v in vals if v is not None]
    if len(vals) < 2:
        return None
    oldest, newest = vals[0], vals[-1]
    if oldest <= 0 or newest <= 0:
        return None
    n = len(vals) - 1
    if n <= 0:
        return None
    try:
        return ((newest / oldest) ** (1.0 / n) - 1.0) * 100.0
    except Exception:
        return None


def _positive_fraction(vals):
    vals = [v for v in vals if v is not None]
    if not vals:
        return None
    return sum(1 for v in vals if v > 0) / len(vals) * 100.0


def _growth_consistency(vals):
    """Fraction of year-over-year increases (percent)."""
    vals = [v for v in vals if v is not None]
    if len(vals) < 2:
        return None
    up = sum(1 for i in range(1, len(vals)) if vals[i] >= vals[i - 1])
    return up / (len(vals) - 1) * 100.0


# --------------------------------------------------------------------------
# intrinsic-value helpers
# --------------------------------------------------------------------------
def dcf_value(fcf_latest, growth_pct=None, discount=0.09, terminal=0.03, years=10):
    """Conservative DCF-lite on free cash flow -> intrinsic firm value (Rs).

    Treats the result as an equity proxy (net debt ignored), which is fine for
    a first-pass screen. Returns None if inputs are unusable.
    """
    fcf = num(fcf_latest)
    if fcf is None or fcf <= 0:
        return None
    g = num(growth_pct)
    if g is None:
        g = 0.06
    g = max(-0.05, min(0.20, g / 100.0 if abs(g) > 1.5 else g))
    if g >= discount:
        g = discount - 0.01
    if terminal >= discount:
        terminal = discount - 0.02
    try:
        pv = 0.0
        cf = fcf
        for t in range(1, years + 1):
            cf = cf * (1.0 + g)
            pv += cf / ((1.0 + discount) ** t)
        term = cf * (1.0 + terminal) / (discount - terminal)
        pv += term / ((1.0 + discount) ** years)
        return pv
    except Exception:
        return None


def graham_number(eps_latest, growth_pct):
    """Classic Graham number = sqrt(22.5 * EPS * (8.5 + 2g)), g in percent."""
    eps = num(eps_latest)
    g = num(growth_pct)
    if eps is None or eps <= 0:
        return None
    if g is None:
        g = 0.0
    g = max(0.0, min(50.0, g if abs(g) > 1.5 else g * 100.0))
    try:
        return math.sqrt(22.5 * eps * (8.5 + 2.0 * g))
    except Exception:
        return None


def owner_earnings_value(fcf_latest, multiple=12.0):
    """Buffett owner-earnings proxy: FCF capitalised at a sensible multiple."""
    fcf = num(fcf_latest)
    if fcf is None or fcf <= 0:
        return None
    return fcf * multiple


def margin_of_safety(intrinsic, market_value):
    """% margin of safety = (IV - price) / IV. Positive = cheap."""
    iv = num(intrinsic)
    mv = num(market_value)
    if iv is None or iv <= 0 or mv is None:
        return None
    return (iv - mv) / iv * 100.0


def explain_intrinsic_value(u):
    """Short, plain-language explanation of the Intrinsic Value section.

    Reads the same values shown in the report and returns a single string
    explaining the Graham number, DCF value and owner-earnings value, plus how
    to interpret a positive vs negative margin of safety.
    """
    if not isinstance(u, dict):
        return ""

    parts = [
        "Margin of safety = (intrinsic value - price) / intrinsic value. "
        "Positive means the price is below our value estimate (a cushion if we "
        "are wrong); negative means the price is above it (no cushion)."
    ]

    gn = u.get("graham_number")
    mg = u.get("mos_graham")
    if gn is not None:
        gtxt = (
            f" The Graham number is {fmt_num(gn)} - Graham's conservative ceiling "
            "for a defensive investor (sqrt(22.5 x EPS x (8.5 + 2xgrowth)))."
        )
        if mg is not None:
            if mg >= 0:
                gtxt += (
                    f" Its margin of safety is {fmt_pct(mg)}: the price sits about "
                    f"{fmt_pct(mg, 0)} below that ceiling, leaving a cushion."
                )
            else:
                gtxt += (
                    f" Its margin of safety is {fmt_pct(mg)}: the price is about "
                    f"{fmt_pct(abs(mg), 0)} ABOVE the Graham number, so the stock "
                    "is priced above Graham's ceiling and offers no safety cushion."
                )
        parts.append(gtxt)

    iv = u.get("iv_dcf")
    mv = u.get("mos_dcf")
    if iv is not None:
        itxt = f" The DCF intrinsic value is {fmt_num(iv)} (Rs cr)."
        if mv is not None:
            itxt += (
                f" Margin of safety {fmt_pct(mv)} -> "
                f"{'cheap versus our DCF' if mv >= 0 else 'price above our DCF value'}."
            )
        parts.append(itxt)

    oe = u.get("iv_owner_earnings")
    mo = u.get("mos_owner_earnings")
    if oe is not None:
        otxt = (
            f" The owner-earnings value is {fmt_num(oe)} (Rs cr) - Buffett's "
            "FCF-capitalised proxy."
        )
        if mo is not None:
            otxt += f" Margin of safety {fmt_pct(mo)}."
        parts.append(otxt)

    return " ".join(parts)


def render_note(self, text):
    """Render a small grey explanatory note (used under valuation sections)."""
    if not text:
        return
    self.set_font("Arial", "", 8.5)
    self.set_text_color(90, 100, 105)
    self.set_x(18)
    self.multi_cell(174, 4.6, text)
    self.set_text_color(33, 37, 41)


# --------------------------------------------------------------------------
# persona-specific gap/quality checks
# --------------------------------------------------------------------------
def net_net_value(bs, shares):
    """Graham NCAV per share and a net-net flag.

    Returns (nav_ps, is_net_net, ncav_total). net-net if price < 2/3 of NCAV/share.
    `shares` is used only to scale; pass price*shares as needed via caller.
    """
    ca = col_series(bs, "Current Assets")
    tl = col_series(bs, "Total Liabilities Net Minority Interest") or col_series(bs, "Total Liabilities")
    ca_v = ca[-1] if ca else None
    tl_v = tl[-1] if tl else None
    if ca_v is None or tl_v is None:
        return None, False, None
    ncav = ca_v - tl_v
    return ncav, False, ncav  # nav_ps computed by caller who knows shares


def ev_ebit(mcap, total_debt, cash_latest, ebit_latest):
    """Greenblatt earnings yield = EBIT / EV (EV = mcap + debt - cash)."""
    ev = num(mcap) or 0.0
    ev += (num(total_debt) or 0.0) - (num(cash_latest) or 0.0)
    ebit = num(ebit_latest)
    if ev <= 0 or ebit is None:
        return None
    return ebit / ev


def quality_of_earnings(rev_g, eps_g):
    """Lynch: flag when EPS grows far faster than revenue (possible low quality)."""
    rg = num(rev_g)
    eg = num(eps_g)
    if rg is None or eg is None:
        return None
    return eg - rg


# --------------------------------------------------------------------------
# universal fatal-flaw checks (items 2 & 3 & 7)
# --------------------------------------------------------------------------
def universal_flaws(u, is_financial=False):
    """Return (label, status, text) tuples for the universal checks.

    status in {PASS, WATCH, FLAG}. Appended to each persona's `flaws` list.
    """
    out = []
    ic = u.get("interest_coverage")
    if ic is not None and not is_financial:
        if ic < 2:
            out.append(("Interest coverage", "FLAG",
                        f"EBIT covers interest only ~{ic:.1f}x - a downturn could strain debt service."))
        elif ic < 4:
            out.append(("Interest coverage", "WATCH",
                        f"Interest coverage is modest at ~{ic:.1f}x; acceptable but watch the cycle."))
        else:
            out.append(("Interest coverage", "PASS",
                        f"EBIT covers interest ~{ic:.1f}x - comfortably serviced through a downturn."))

    cr = u.get("current_ratio")
    if cr is not None and not is_financial:
        if cr < 1:
            out.append(("Liquidity", "FLAG",
                        f"Current ratio ~{cr:.2f} is below 1.0 - short-term obligations exceed liquid assets."))
        elif cr < 1.5:
            out.append(("Liquidity", "WATCH",
                        f"Current ratio ~{cr:.2f} is a little thin; monitor working-capital pressure."))
        else:
            out.append(("Liquidity", "PASS",
                        f"Current ratio ~{cr:.2f} - ample short-term liquidity."))

    fy = u.get("fcf_yield")
    if fy is not None:
        fyp = fy * 100.0
        if fy <= 0:
            out.append(("Free-cash-flow yield", "FLAG",
                        f"FCF yield is negative (~{fyp:.1f}%) - the business is consuming cash, not compounding it."))
        elif fyp < 3:
            out.append(("Free-cash-flow yield", "WATCH",
                        f"FCF yield ~{fyp:.1f}% is thin; cash returned to owners is modest."))
        else:
            out.append(("Free-cash-flow yield", "PASS",
                        f"FCF yield ~{fyp:.1f}% - the business throws off meaningful cash."))

    mos = u.get("mos_dcf")
    if mos is not None:
        if mos >= 20:
            out.append(("Margin of safety (DCF)", "PASS",
                        f"DCF intrinsic value sits ~{mos:.0f}% above the current price - a cushion exists."))
        elif mos >= -10:
            out.append(("Margin of safety (DCF)", "WATCH",
                        f"DCF intrinsic value is roughly in line with price (~{mos:.0f}%); little cushion."))
        else:
            out.append(("Margin of safety (DCF)", "FLAG",
                        f"DCF intrinsic value is ~{-mos:.0f}% below the current price - priced above intrinsic."))
    return out


# --------------------------------------------------------------------------
# formatting helpers for reports
# --------------------------------------------------------------------------
def fmt_pct(v, nd=1):
    if v is None:
        return "n/a"
    return f"{v:.{nd}f}%"


def fmt_x(v, nd=2):
    if v is None:
        return "n/a"
    return f"{v:.{nd}f}x"


def fmt_num(v, nd=1):
    if v is None:
        return "n/a"
    return f"{v:.{nd}f}"


def stars(n):
    n = int(round(n or 0))
    return "★" * max(0, min(5, n)) + "☆" * (5 - max(0, min(5, n)))


# --------------------------------------------------------------------------
# main entry point
# --------------------------------------------------------------------------
def compute_universal(info=None, fin=None, bs=None, cf=None, price=None,
                      fcf_latest=None, mcap=None, eps=None, ni=None,
                      pe=None, fpe=None, dy=None, eps_g=None, rev_g=None,
                      roe=None, de_pct=None, margin=None, hi=None, lo=None,
                      total_debt=None, cash_latest=None, is_financial=False):
    """Compute the universal metric set + composite score for every persona.

    Returns a dict. All keys are present; values are None when data is missing.
    """
    u = {}

    # ----- 1) multi-year growth / consistency -----------------------------
    rev_series = col_series(fin, "Total Revenue")
    ni_series = col_series(fin, "Net Income Common Stockholders") or col_series(fin, "Net Income")
    eps_series = list(eps) if isinstance(eps, (list, tuple)) else col_series(fin, "Diluted EPS") or col_series(fin, "Basic EPS")

    u["rev_cagr"] = _cagr(rev_series)
    u["ni_cagr"] = _cagr(ni_series)
    u["eps_cagr"] = _cagr(eps_series)
    u["eps_positive_pct"] = _positive_fraction(eps_series)
    u["eps_growth_consistency"] = _growth_consistency(eps_series)
    u["years_of_data"] = len([v for v in eps_series if v is not None])

    # ----- 2) interest coverage + liquidity -------------------------------
    ebit_series = (col_series(fin, "Operating Income")
                   or col_series(fin, "EBIT")
                   or col_series(fin, "Operating Income Common Stockholders"))
    interest_series = col_series(fin, "Interest Expense")
    if ebit_series and interest_series:
        ebit = ebit_series[-1]
        intr = interest_series[-1]
        if ebit is not None and intr is not None and intr != 0:
            u["interest_coverage"] = ebit / abs(intr)
        else:
            u["interest_coverage"] = None
    else:
        u["interest_coverage"] = None

    ca = col_series(bs, "Current Assets")
    cl = col_series(bs, "Current Liabilities")
    inv = col_series(bs, "Inventory")
    if ca and cl and cl[-1] not in (None, 0):
        u["current_ratio"] = ca[-1] / cl[-1]
        if inv:
            u["quick_ratio"] = (ca[-1] - (inv[-1] or 0)) / cl[-1]
        else:
            u["quick_ratio"] = None
    else:
        u["current_ratio"] = None
        u["quick_ratio"] = None

    # ----- 3) FCF yield + FCF growth consistency --------------------------
    if fcf_latest is not None and mcap not in (None, 0):
        u["fcf_yield"] = num(fcf_latest) / num(mcap)  # fraction
        ocf_series = col_series(cf, "Operating Cash Flow")
        capex_series = col_series(cf, "Capital Expenditure")
        fcf_series = []
        for i in range(min(len(ocf_series), len(capex_series))):
            if ocf_series[i] is not None and capex_series[i] is not None:
                fcf_series.append(ocf_series[i] + capex_series[i])
        u["fcf_cagr"] = _cagr(fcf_series)
    else:
        u["fcf_yield"] = None
        u["fcf_cagr"] = None

    # ----- 4) forward vs trailing P/E spread ------------------------------
    if pe is not None and fpe is not None and pe != 0:
        u["fwd_pe_spread"] = (pe - fpe) / pe * 100.0  # +ve = forward cheaper
    else:
        u["fwd_pe_spread"] = None

    # ----- 6/7) intrinsic value + margin of safety ------------------------
    g_for_iv = eps_g if eps_g is not None else rev_g
    iv_dcf = dcf_value(fcf_latest, growth_pct=g_for_iv)
    u["iv_dcf"] = iv_dcf
    u["mos_dcf"] = margin_of_safety(iv_dcf, mcap)

    gn = graham_number(eps_series[-1] if eps_series else None, eps_g)
    u["graham_number"] = gn
    u["mos_graham"] = margin_of_safety(gn, price)

    oe = owner_earnings_value(fcf_latest)
    u["iv_owner_earnings"] = oe
    u["mos_owner_earnings"] = margin_of_safety(oe, mcap)

    # ----- 5) composite score (0-100) with four sub-scores ---------------
    u["sub_quality"], u["sub_value"], u["sub_safety"], u["sub_growth"], u["composite"], u["stars"] = \
        _composite(u, pe=pe, fpe=fpe, dy=dy, eps_g=eps_g, rev_g=rev_g,
                   roe=roe, de_pct=de_pct, margin=margin, is_financial=is_financial)
    return u


def _composite(u, pe=None, fpe=None, dy=None, eps_g=None, rev_g=None,
               roe=None, de_pct=None, margin=None, is_financial=False):
    # Quality (0-25): durability of earnings power
    q_parts = []
    rs = _s_band(roe, 15, 10)
    if rs is not None:
        q_parts.append(rs)
    if u.get("eps_positive_pct") is not None:
        q_parts.append(_clamp(u["eps_positive_pct"]))  # 0-100 already
    mm = _s_band(margin, 15, 8)
    if mm is not None:
        q_parts.append(mm)
    quality = (sum(q_parts) / len(q_parts)) if q_parts else None

    # Value (0-25)
    v_parts = []
    if pe is not None:
        v_parts.append(_s_inv(pe, 10, 40))
    fy = u.get("fcf_yield")
    if fy is not None:
        v_parts.append(_s_lin(fy * 100.0, 3, 8))
    mos = u.get("mos_dcf")
    if mos is not None:
        v_parts.append(_s_lin(mos, 0, 30))
    value = (sum(p for p in v_parts if p is not None) / len([p for p in v_parts if p is not None])) if v_parts else None

    # Safety (0-25)
    s_parts = []
    ic = u.get("interest_coverage")
    if ic is not None:
        s_parts.append(_s_lin(ic, 3, 8))
    cr = u.get("current_ratio")
    if cr is not None:
        s_parts.append(_s_lin(cr, 1, 2))
    if not is_financial and de_pct is not None:
        s_parts.append(_s_inv(de_pct, 30, 120))
    safety = (sum(p for p in s_parts if p is not None) / len([p for p in s_parts if p is not None])) if s_parts else None

    # Growth (0-25)
    g_parts = []
    if u.get("rev_cagr") is not None:
        g_parts.append(_s_lin(u["rev_cagr"], 5, 20))
    if u.get("eps_cagr") is not None:
        g_parts.append(_s_lin(u["eps_cagr"], 5, 20))
    growth = (sum(p for p in g_parts if p is not None) / len([p for p in g_parts if p is not None])) if g_parts else None

    def _scale(x):
        return (x * 0.25) if x is not None else 0.0

    composite = _scale(quality) + _scale(value) + _scale(safety) + _scale(growth)
    stars = max(1, min(5, round(composite / 20.0))) if composite > 0 else 0
    return (quality, value, safety, growth, composite, stars)
