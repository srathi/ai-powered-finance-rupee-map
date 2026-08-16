#!/usr/bin/env python3
"""Generate branded Aswath Damodaran-style equity screen PDFs for RupeeMap.in."""
import os
from fpdf import FPDF
import common_fin  # shared quantitative engine

FONT = os.getenv("PERSONA_FONT", "/Library/Fonts/Arial Unicode.ttf")
OUT = os.path.join("/tmp", "ashwath-damodaran_reports")
LOGO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo.png")  # local logo next to this script
os.makedirs(OUT, exist_ok=True)

# ---- palette ----
NAVY = (19, 41, 61)
TEAL = (15, 76, 92)
TEAL2 = (22, 110, 110)
LIGHT = (236, 242, 243)
GREY = (90, 100, 105)
AMBER = (224, 138, 30)
GREEN = (39, 110, 50)
RED = (176, 42, 42)
WHITE = (255, 255, 255)
DARK = (33, 37, 41)

DECISION_COLOR = {
    "BUY CANDIDATE": GREEN,
    "WATCH": AMBER,
    "AVOID": RED,
}

DISCLAIMER = (
    "Financial data in this report may differ slightly from other sources due to variations in "
    "accounting standards and reporting methods or differences in data providers. This report is "
    "AI-generated and may contain errors or inaccuracies. Always verify information independently "
    "before making any investment decisions. This report does not constitute financial advice and is "
    "provided for informational purposes only. You are solely responsible for any investment decisions "
    "and their outcomes."
)

PERSONA = (
"This report is written in the voice and discipline of Aswath Damodaran, Professor of Finance at NYU Stern and the 'Dean of Valuation'. His bridge between narrative and numbers guides every line below:\n\n- Every valuation is a story made tangible: the narrative and the numbers must agree, not contradict.\n- Derive intrinsic value through disciplined DCF; only pay up when growth and reinvestment justify it.\n- Insist ROIC exceeds the cost of capital and that the business has real pricing power.\n- Treat explosive implied growth with suspicion; fragile, circular or unbacked-by-cash-flow assumptions are fatal flaws.\n\nThese screens are a first pass - the kind of narrative-plus-numbers sanity check Damodaran would run before trusting a price. They are educational, not a recommendation to buy or sell."
)

# ---------------- company data ----------------
COMPANIES = [
    {
        "company": "Tata Consultancy Services",
        "ticker": "NSE: TCS",
        "sector": "IT Services & Consulting",
        "date": "2026-08-15",
        "decision": "DEEP RESEARCH",
        "tagline": "A dominant, net-cash IT-services leader with stable margins and a growing dividend.",
        "business": "TCS is India's largest IT services and consulting company, running software, cloud, "
                    "and digital-transformation projects for global enterprises. Its biggest segment is "
                    "Banking, Financial Services and Insurance (BFSI, Rs 1,066,170 million TTM), then "
                    "Consumer, Communication/Media/Tech, Manufacturing, and Life Sciences.",
        "driver": "Steady BFSI and cloud deal wins plus disciplined cost control; revenue rose from "
                  "Rs 1,917,540 million (FY2022) to Rs 2,758,590 million (TTM), a 7.70% TTM gain.",
        "diagnostics": [
            ("Cyclicality", "Low", "Medium", "Every-year revenue growth, no EPS cycle."),
            ("Turnaround status", "None", "High", "Revenue and EPS still rising, just slower."),
            ("Growth profile", "Slow (decelerating)", "Medium", "EPS growth fell from 19.50% (FY2022) to 1.07% TTM; 2Y EPS CAGR ~4-5%."),
            ("Business maturity", "Mature", "High", "Dominant large-cap with broad global reach."),
            ("Asset angle", "Weak", "Medium", "Net cash Rs 337,220 million, only ~4% of market cap."),
            ("Dominant lenses", "Mature slow-growth; valuation discipline amid deceleration", "High", "The key open question is whether the slowdown is cyclical or structural."),
        ],
        "flaws": [
            ("EPS trend", "PASS", "Positive and growing (Rs 103.62 -> Rs 137.64); acceptable for slow-growth."),
            ("Debt danger", "PASS", "Interest-bearing debt Rs 113,090 million vs equity Rs 1,107,540 million -> D/E ~10%; very safe."),
            ("Valuation", "WATCH", "Trailing P/E ~17.2, forward ~15.3; rich PEG on recent ~1% growth but P/E not excessive."),
            ("Recent trend", "PASS", "Latest quarter net income Rs 133,490 vs Rs 137,180 prior; mild dip, not severe."),
            ("Cash flow", "PASS", "FCF Rs 481,590 million broadly confirms net income Rs 497,990 million."),
            ("Dividend", "PASS", "Consistent, rising; yield ~4.7%, DPS Rs 111 current."),
        ],
        "category": "As a mature slow-growth name, the appeal is the generous, consistent dividend (~4.7% yield) "
                    "plus net-cash safety. Not deeply cheap, but ~17x earnings on a dominant franchise is reasonable.",
        "bonus": [
            "Net-cash balance sheet (Rs 337,220 million).",
            "Rising dividend; ~4.7% yield.",
            "Stable share count (~3,618 million), no dilution.",
        ],
        "decision_reason": "Passes all safety/fatal-flaw filters: a dominant, net-cash IT-services leader with "
                           "stable ~18% net margins and a growing ~4.7% dividend, priced at a reasonable ~17x earnings. "
                           "Category fit: Mature / Stalwart-like slow-growth.",
        "revisit": "Deep research should resolve whether the growth deceleration (EPS growth 19% -> 1% TTM) is "
                   "cyclical softness or structural.",
        "sources": [
            ("StockAnalysis TCS Financials", "https://stockanalysis.com/quote/nse/TCS/financials/"),
            ("StockAnalysis TCS Balance Sheet", "https://stockanalysis.com/quote/nse/TCS/financials/balance-sheet/"),
            ("Investing.com TCS Financial Summary", "https://www.investing.com/equities/tata-consultancy-services-financial-summary"),
        ],
    },
    {
        "company": "Piccadily Agro Industries",
        "ticker": "NSE: PICCADIL",
        "sector": "Alcoholic Beverages / Sugar & Distillery",
        "date": "2026-08-15",
        "decision": "WATCHLIST",
        "tagline": "A genuine premium-spirits growth story, but not investable until cash flow and price clear up.",
        "business": "Piccadily Agro makes alcoholic beverages and sugar in India, running a Sugar segment and a "
                    "Distillery segment. Its best-known brand is Indri single malt whisky, plus ethanol, extra "
                    "neutral alcohol, rum, and vodka.",
        "driver": "Premium single-malt (Indri) expansion and new distillery capacity, with FY26 revenue crossing "
                  "Rs 1,038 Cr (up 26.9% from Rs 818 Cr in FY25).",
        "diagnostics": [
            ("Cyclicality", "Moderate", "Low", "Spirits demand fairly steady, but sugar/ethanol tied to agri and policy."),
            ("Turnaround status", "None", "Medium", "Recovered from weak FY23 (EPS Rs 2.37) to Rs 13.95 in FY26."),
            ("Growth profile", "Moderate/accelerating", "Medium", "Net profit Rs 137.5 Cr (+34% YoY), revenue +26.9% in FY26."),
            ("Business maturity", "Scaling", "Medium", "Premium brand and capacity still ramping."),
            ("Asset angle", "None", "Medium", "Debt-to-equity ~59%, no net cash."),
            ("Dominant lenses", "Growth story (premiumization); cash-flow quality and valuation risk", "High", "The price already assumes the Indri thesis works."),
        ],
        "flaws": [
            ("EPS trend", "PASS", "Rising (Rs 2.37 FY23 -> Rs 13.95 FY26); acceptable."),
            ("Debt danger", "WATCH", "D/E ~59% (interest-bearing); elevated but below the 80% all-other threshold; watch given heavy capex."),
            ("Valuation", "WATCH", "Trailing P/E ~45 (range 41-56); above 40 with growth not yet proven sustainable."),
            ("Recent trend", "PASS", "FY26 strong; stock ~Rs 586-692, well below 52-week high Rs 809.70."),
            ("Cash flow", "FLAG", "Operating cash flow negative in FY25 (-Rs 27 Cr) and levered FCF negative TTM despite rising net income - a quality concern."),
            ("Dividend", "PASS", "None paid (payout 0%); not a slow-growth name, so not disqualifying."),
        ],
        "category": "A growth story: the Indri premiumization thesis is real, but negative free cash flow and a "
                    "~45x multiple mean the price already assumes success.",
        "bonus": [
            "None found (no dividend, no buyback; high promoter holding ~68% but no recent insider buying evidenced).",
        ],
        "decision_reason": "Genuine, understandable growth in premium Indian spirits, but currently not investable "
                           "due to negative free cash flow and a rich ~45x valuation.",
        "revisit": "Revisit on 1-2 quarters of positive free-cash-flow conversion and/or a pullback toward the "
                   "lower half of the 52-week range (Rs 515-640).",
        "sources": [
            ("ET Money PICCADIL Financials", "https://www.etmoney.com/stocks/piccadily-agro-industries-ltd/financials/805"),
            ("StockAnalysis PICCADIL", "https://stockanalysis.com/quote/nse/PICCADIL/"),
            ("Yahoo Finance PICCADIL.NS", "https://uk.finance.yahoo.com/quote/PICCADIL.NS/"),
            ("Simply Wall St 530305", "https://simplywall.st/stocks/in/food-beverage-tobacco/bse-530305/piccadily-agro-industries-shares"),
        ],
    },
    {
        "company": "Happy Forgings",
        "ticker": "NSE: HAPPYFORGE",
        "sector": "Capital Goods / Forgings & Machined Components",
        "date": "2026-08-15",
        "decision": "WATCHLIST",
        "tagline": "A high-quality, low-debt forging franchise - expensive after a big rally.",
        "business": "Happy Forgings makes forged and machined components for automotive (crankshafts, axle beams, "
                    "steering knuckles), railway, windmill, and oil & gas customers in India and abroad.",
        "driver": "Capacity expansion plus non-automotive/export diversification; analysts forecast ~14-18% revenue "
                  "growth and 30%+ earnings growth over the next 2-3 years.",
        "diagnostics": [
            ("Cyclicality", "Moderate/High", "Medium", "Demand tied to commercial-vehicle and industrial capex cycles."),
            ("Turnaround status", "None", "High", "EPS rising every year."),
            ("Growth profile", "Stalwart-like, with expected re-acceleration", "Medium", "2Y EPS CAGR ~9% (FY24 Rs 26.78 -> FY26 Rs 31.99), but 30%+ forecast ahead."),
            ("Business maturity", "Scaling", "Medium", "Ongoing capex for new capacity."),
            ("Asset angle", "None", "Medium", "Slight net debt (D/E ~15.5%), not net cash."),
            ("Dominant lenses", "Valuation discipline after a big run-up; cyclicality/export-softness risk", "High", "The price embeds the expansion story."),
        ],
        "flaws": [
            ("EPS trend", "PASS", "Positive and steady (FY23 Rs 23.32 -> FY26 Rs 31.99); acceptable."),
            ("Debt danger", "PASS", "D/E ~15.5%; very safe."),
            ("Valuation", "WATCH", "Trailing P/E ~46 (range 42-52), forward ~36-42; PEG ~4.2 - above the 2.5 red-flag line and P/E >40."),
            ("Recent trend", "WATCH", "FY26 revenue ~Rs 1,577 Cr with net margin ~19.5%; stock up ~44-75% in a year near 52-week highs (Rs 862-1,966)."),
            ("Cash flow", "PASS", "Operating cash flow covers net income (CFO/PAT ~1.0); FCF positive but modest given heavy capex."),
            ("Dividend", "PASS", "Pays ~Rs 4/share but yield only ~0.2-0.3%; not a slow-growth dividend play."),
        ],
        "category": "A quality growth / cyclical name: strong margins (~19.5% net, ~57% gross) and a clean balance "
                    "sheet, but the price already embeds the expansion story.",
        "bonus": [
            "Very low debt and high interest coverage (~39x).",
            "High promoter holding (~78%), no pledge.",
            "Consistent, rising EPS.",
        ],
        "decision_reason": "A high-quality, low-debt forging franchise with steady earnings and a credible "
                           "capacity-expansion thesis, but currently not investable due to a rich ~46x P/E (PEG ~4) "
                           "after a 44-75% one-year rally.",
        "revisit": "Revisit on a pullback toward the lower half of the 52-week range (~Rs 862-1,200) or evidence "
                   "that expansion delivers the forecast 30%+ earnings growth.",
        "sources": [
            ("Simply Wall St HAPPYFORGE", "https://simplywall.st/stocks/in/capital-goods/nse-happyforge/happy-forgings-shares"),
            ("Finology Ticker HAPPYFORGE", "https://ticker.finology.in/company/HAPPYFORGE"),
            ("Debut Plus HAPPYFORGE", "https://debut.plus/stocks/HAPPYFORGE/report"),
            ("StockAnalysis HAPPYFORGE", "https://stockanalysis.com/quote/nse/HAPPYFORGE/financials/"),
        ],
    },
    {
        "company": "Sansera Engineering",
        "ticker": "NSE: SANSERA",
        "sector": "Auto Components / Precision Engineering",
        "date": "2026-08-15",
        "decision": "WATCHLIST",
        "tagline": "A real fast grower with a diversification story - priced for perfection.",
        "business": "Sansera makes high-precision forged and machined components for automotive (connecting rods, "
                    "rocker arms, crankshafts) and non-automotive markets (aerospace, off-road, agriculture, medical implants).",
        "driver": "Diversification beyond autos into aerospace, defense and semiconductors plus capacity expansion; "
                  "FY26 revenue rose 18% to Rs 35.6b and net income jumped 51%.",
        "diagnostics": [
            ("Cyclicality", "Moderate/High", "Medium", "Auto-component demand tied to vehicle and CV cycles."),
            ("Turnaround status", "None", "High", "Earnings rising every year."),
            ("Growth profile", "Fast", "Medium-High", "2Y EPS CAGR ~23% (FY24 Rs 34.65 -> FY26 Rs 52.09); 5-yr profit CAGR ~26%."),
            ("Business maturity", "Scaling", "Medium", "Heavy capex for new capacity/verticals."),
            ("Asset angle", "None", "Medium", "Modest debt, not net cash."),
            ("Dominant lenses", "Valuation stretch after a huge rally; negative free cash flow from capex; EV-transition risk", "High", "The price embeds success."),
        ],
        "flaws": [
            ("EPS trend", "PASS", "Strong and accelerating; acceptable for a fast grower."),
            ("Debt danger", "PASS", "D/E ~15-19%; very safe (well below the 33% fast-growth threshold)."),
            ("Valuation", "WATCH", "Trailing P/E ~62-70 (forward ~42-57); PEG ~2.3-3.0 - at/above the 2.5 red-flag line, far above ~1.0 'perfect'."),
            ("Recent trend", "WATCH", "FY26 strong, but stock up ~150-200% in a year and trades above the average analyst target (~Rs 3,119)."),
            ("Cash flow", "FLAG", "Levered FCF negative (heavy capex); operating cash flow ~0.9x net income - a quality watchpoint."),
            ("Dividend", "PASS", "~Rs 4/share, yield ~0.1%; not a slow-growth name."),
        ],
        "category": "A fast grower: real earnings momentum and a credible non-auto diversification story, but the "
                    "price already embeds that success.",
        "bonus": [
            "Low debt and healthy interest coverage.",
            "Genuine 5-year profit CAGR of ~26%.",
            "Diversification reduces single-sector dependence.",
        ],
        "decision_reason": "A high-quality, low-debt fast-growing company with a real diversification thesis, but "
                           "currently not investable due to a rich ~62-70x P/E (PEG ~2.3-3.0) after a 150-200% rally "
                           "and persistent negative free cash flow.",
        "revisit": "Revisit on a meaningful pullback (toward the lower half of the 52-week range, ~Rs 1,216-2,200) "
                   "or evidence that free cash flow turns positive as the capex cycle matures.",
        "sources": [
            ("Simply Wall St SANSERA", "https://simplywall.st/stocks/in/automobiles/nse-sansera/sansera-engineering-shares"),
            ("StockAnalysis SANSERA", "https://stockanalysis.com/quote/nse/SANSERA"),
            ("Devyara SANSERA", "https://devyara.com/en-us/nse/sansera/financial-analysis"),
            ("Investing.com SASE", "https://www.investing.com/equities/sansera-engineering-financial-summary"),
        ],
    },
]


def s(text):
    """Make text safe for the Arial Unicode font (keep Rs symbol)."""
    if text is None:
        return ""
    # Arial Unicode supports Rs (U+20B9) and most chars; replace only unsupported arrows.
    text = text.replace("\u2192", "->")
    return text


class Report(FPDF):
    def __init__(self, data):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.data = data
        self._wm = self._ensure_watermark()
        self.set_auto_page_break(auto=True, margin=18)
        self.add_font("Arial", "", FONT)
        self.add_font("Arial", "B", FONT)
        self.set_margins(18, 22, 18)
        self.cover()
        self.persona_page()
        self.body()

    # ---------- header / footer ----------
    def header(self):
        if self.page_no() == 1:
            return
        if os.path.exists(LOGO_PATH):
            self.image(LOGO_PATH, x=18, y=8, w=10)
            self.set_xy(31, 9)
            self.set_font("Arial", "B", 9)
            self.set_text_color(*TEAL)
            self.cell(95, 5, s("RupeeMap.in"), ln=0)
            self.set_xy(31, 14)
            self.set_font("Arial", "", 8)
            self.set_text_color(*GREY)
            self.cell(95, 4, s("Aswath Damodaran Style Equity Screen"), ln=0)
            self.set_xy(192, 9)
            self.set_font("Arial", "", 8)
            self.set_text_color(*GREY)
            self.cell(0, 5, s(self.data["ticker"]), align="R", ln=1)
        else:
            self.set_xy(18, 8)
            self.set_font("Arial", "B", 9)
            self.set_text_color(*TEAL)
            self.cell(95, 5, s("RupeeMap.in"), ln=0)
            self.set_xy(18, 14)
            self.set_font("Arial", "", 8)
            self.set_text_color(*GREY)
            self.cell(95, 4, s("Aswath Damodaran Style Equity Screen"), ln=0)
            self.set_xy(192, 8)
            self.set_font("Arial", "", 8)
            self.cell(0, 5, s(self.data["ticker"]), align="R", ln=1)
        self.set_draw_color(*TEAL2)
        self.set_line_width(0.3)
        self.line(18, 20, 192, 20)
        self.set_text_color(*DARK)
        self.set_y(22)

    def footer(self):
        if self.page_no() == 1:
            return
        self._draw_watermark()
        self.set_y(-14)
        self.set_font("Arial", "", 7)
        self.set_text_color(*GREY)
        self.cell(0, 5, s("Prepared by RupeeMap.in  -  Not financial advice  -  Page %d" % self.page_no()),
                  align="C")
        self.set_text_color(*DARK)

    # ---------- watermark ----------
    def _ensure_watermark(self):
        src = LOGO_PATH
        if not os.path.exists(src):
            return None
        wm = os.path.join(OUT, "logo_watermark.png")
        if os.path.exists(wm):
            return wm
        try:
            from PIL import Image
            im = Image.open(src).convert("RGBA")
            a = im.split()[-1].point(lambda p: int(p * 0.09))
            im.putalpha(a)
            im.save(wm)
            return wm
        except Exception:
            return None

    def _draw_watermark(self):
        wm = getattr(self, "_wm", None)
        if not wm or not os.path.exists(wm):
            return
        try:
            from PIL import Image
            with Image.open(wm) as im:
                iw, ih = im.size
            w = 95
            h = w * ih / float(iw)
            x = (210 - w) / 2.0
            y = (297 - h) / 2.0
            self.image(wm, x=x, y=y, w=w)
        except Exception:
            return

    # ---------- cover ----------
    def cover(self):
        self.add_page()
        # ---- background finance motif (behind everything) ----
        # subtle graph-paper grid across the page
        self.set_draw_color(233, 237, 238)
        self.set_line_width(0.1)
        for gx in range(18, 193, 9):
            self.line(gx, 8, gx, 277)
        for gy in range(8, 278, 9):
            self.line(18, gy, 192, gy)
        # ascending "mountain range" line-chart, filled beneath for a silhouette
        chart = [(18, 72), (32, 62), (44, 66), (58, 54), (70, 58), (86, 46),
                 (100, 50), (116, 42), (130, 48), (148, 40), (162, 46),
                 (178, 42), (192, 38)]
        self.set_fill_color(196, 227, 229)
        self.polygon([(18, 74)] + chart + [(192, 74)], style="F")
        self.set_draw_color(*TEAL2)
        self.set_line_width(0.9)
        for i in range(len(chart) - 1):
            self.line(chart[i][0], chart[i][1], chart[i + 1][0], chart[i + 1][1])
        self.set_fill_color(*TEAL2)
        for (cx, cy) in chart:
            self.circle(cx, cy, 0.9, "F")
        # thin teal top accent bar
        self.set_fill_color(*TEAL)
        self.rect(0, 0, 210, 4, "F")

        # ---- brand / logo row ----
        if os.path.exists(LOGO_PATH):
            self.image(LOGO_PATH, x=18, y=12, w=20)
            self.set_xy(44, 18)
            self.set_font("Arial", "", 10)
            self.set_text_color(*GREY)
            self.cell(0, 6, s("Equity Research  -  Aswath Damodaran Style Screen"), ln=1)
            self.set_xy(44, 26)
        else:
            self.set_xy(18, 16)
            self.set_font("Arial", "B", 13)
            self.set_text_color(*TEAL)
            self.cell(0, 8, s("RupeeMap.in"), ln=1)
            self.set_font("Arial", "", 9)
            self.set_text_color(*GREY)
            self.cell(0, 6, s("Equity Research  -  Aswath Damodaran Style Screen"), ln=1)
            self.set_xy(18, 32)
        self.set_font("Arial", "B", 9)
        self.set_text_color(*TEAL2)
        self.cell(0, 6, s("QUICK RESEARCH REPORT"), ln=1)

        # company block
        self.set_text_color(*DARK)
        self.set_xy(18, 94)
        self.set_font("Arial", "B", 26)
        self.multi_cell(174, 11, s(self.data["company"]))
        self.set_font("Arial", "", 12)
        self.set_text_color(*TEAL2)
        self.set_x(18)
        self.cell(0, 8, s(self.data["ticker"] + "   |   " + self.data["sector"]), ln=1)
        self.set_text_color(*GREY)
        self.set_x(18)
        self.set_font("Arial", "", 10)
        self.cell(0, 7, s("Report date: " + self.data["date"]), ln=1)

        # tagline box
        self.set_xy(18, 118)
        self.set_fill_color(*LIGHT)
        self.set_draw_color(*TEAL2)
        self.set_line_width(0.4)
        self.rect(18, 118, 174, 26, "DF")
        self.set_xy(22, 122)
        self.set_font("Arial", "B", 9)
        self.set_text_color(*TEAL)
        self.cell(0, 6, s("The one-line verdict"), ln=1)
        self.set_xy(22, 128)
        self.set_font("Arial", "", 11)
        self.set_text_color(*DARK)
        self.multi_cell(166, 5.5, s(self.data["tagline"]))

        # decision badge
        col = DECISION_COLOR[self.data["decision"]]
        self.set_fill_color(*col)
        self.rect(18, 152, 174, 16, "F")
        self.set_xy(18, 152)
        self.set_font("Arial", "B", 13)
        self.set_text_color(*WHITE)
        self.cell(174, 16, s("DECISION:  " + self.data["decision"]), align="C", ln=1)

        # persona mini-quote
        self.set_xy(18, 178)
        self.set_font("Arial", "I", 10)
        self.set_text_color(*GREY)
        self.multi_cell(174, 5.5, s('"A good valuation is a bridge between stories and numbers."  -  Aswath Damodaran'))

        # market snapshot (CMP + 52-week range + key stats)
        def _money(v):
            try:
                return "Rs " + format(float(v), ",.2f")
            except Exception:
                return "n/a"

        def _num(v, nd=2):
            try:
                return format(float(v), f",.{nd}f")
            except Exception:
                return "n/a"

        def _cap(v):
            try:
                fv = float(v)
                if fv >= 1e12:
                    return "Rs " + format(fv / 1e12, ".1f") + "L Cr"
                return "Rs " + format(fv / 1e7, ",.0f") + " Cr"
            except Exception:
                return "n/a"

        cmp_v = self.data.get("cmp")
        hi_v = self.data.get("high52")
        lo_v = self.data.get("low52")
        pe_v = self.data.get("pe")
        dy_v = self.data.get("dy")
        mcap_v = self.data.get("mcap")
        yr_v = self.data.get("yr_return")
        peg_v = self.data.get("peg")
        box_y = 188
        self.set_xy(18, box_y)
        self.set_fill_color(*LIGHT)
        self.set_draw_color(*TEAL2)
        self.set_line_width(0.4)
        self.rect(18, box_y, 174, 58, "DF")

        # title + CMP
        self.set_xy(22, box_y + 4)
        self.set_font("Arial", "B", 9)
        self.set_text_color(*TEAL)
        self.cell(0, 6, s("Market Snapshot  (as of " + str(self.data.get("date", "")) + ")"), ln=1)
        self.set_xy(22, box_y + 11)
        self.set_font("Arial", "B", 11)
        self.set_text_color(*DARK)
        self.cell(0, 6, s("CMP: " + _money(cmp_v)), ln=1)

        # 52-week range bar with CMP marker
        track_x0, track_x1, track_y = 30, 182, box_y + 34
        try:
            frac = (float(cmp_v) - float(lo_v)) / (float(hi_v) - float(lo_v))
            frac = max(0.0, min(1.0, frac))
        except Exception:
            frac = 0.5
        mx = track_x0 + frac * (track_x1 - track_x0)

        self.set_draw_color(*GREY)
        self.set_line_width(1.2)
        self.line(track_x0, track_y, track_x1, track_y)
        self.set_draw_color(*TEAL2)
        self.set_line_width(0.6)
        self.line(track_x0, track_y - 2, track_x0, track_y + 2)
        self.line(track_x1, track_y - 2, track_x1, track_y + 2)
        self.set_fill_color(*AMBER)
        self.circle(mx, track_y, 2.3, "F")

        # % below 52-wk high, above the marker
        try:
            off_high = (float(hi_v) - float(cmp_v)) / float(hi_v) * 100.0
            off_label = f"{off_high:.0f}% below 52-wk high"
        except Exception:
            off_label = ""
        if off_label:
            self.set_xy(mx - 32, track_y - 9)
            self.set_font("Arial", "B", 8)
            self.set_text_color(*AMBER)
            self.cell(64, 4, s(off_label), align="C", ln=0)

        # labels under the bar
        self.set_font("Arial", "", 8)
        self.set_text_color(*GREY)
        self.set_xy(track_x0 - 2, track_y + 3)
        self.cell(60, 4, s("52-wk Low  " + _money(lo_v)), ln=0)
        self.set_xy(track_x1 - 62, track_y + 3)
        self.cell(64, 4, s("52-wk High  " + _money(hi_v)), align="R", ln=0)
        # position in range (centre gap)
        try:
            pos_label = f"{frac * 100:.0f}% of 52-wk range"
        except Exception:
            pos_label = ""
        if pos_label:
            self.set_xy(88, track_y + 3)
            self.cell(34, 4, s(pos_label), align="C", ln=0)

        # stat chips row
        chip_y = box_y + 44
        chips = [
            ("P/E", _num(pe_v, 1), DARK),
            ("PEG", _num(peg_v, 1), DARK),
            ("Div Yield", (_num(dy_v, 1) + "%") if dy_v is not None else "n/a", DARK),
            ("Market Cap", _cap(mcap_v), DARK),
            ("1Y Return",
             (f"{float(yr_v) * 100:+.0f}%") if yr_v is not None else "n/a",
             GREEN if (yr_v or 0) >= 0 else RED),
        ]
        col_w = 33.6
        for i, (lab, val, col) in enumerate(chips):
            cx = 22 + i * col_w
            self.set_xy(cx, chip_y)
            self.set_font("Arial", "", 8)
            self.set_text_color(*GREY)
            self.cell(col_w - 3, 4, s(lab), ln=1)
            self.set_xy(cx, chip_y + 4)
            self.set_font("Arial", "B", 10)
            self.set_text_color(*col)
            self.cell(col_w - 3, 5, s(val), ln=1)

        self.set_text_color(*DARK)

        # footer brand line
        self.set_xy(18, 250)
        self.set_font("Arial", "", 8)
        self.set_text_color(*GREY)
        self.multi_cell(174, 5, s("RupeeMap.in (https://rupeemap.in/) applies a Aswath Damodaran-inspired, evidence-based "
                                  "screening method to public companies. This document is for educational and "
                                  "informational purposes only and is not a recommendation to buy or sell any security."))

    # ---------- persona ----------
    def persona_page(self):
        self.add_page()
        self.section_title("The Aswath Damodaran Persona")
        self.set_font("Arial", "", 10.5)
        self.set_text_color(*DARK)
        self.set_x(18)
        self.multi_cell(174, 5.6, s(PERSONA))
        self.ln(4)
        self.set_font("Arial", "I", 9.5)
        self.set_text_color(*GREY)
        self.set_x(18)
        self.multi_cell(174, 5.2, s("Every report in this series follows the same discipline: route the request, "
                                    "gather evidence from public web sources, screen against the fatal-flaw tests "
                                    "above, and end with one of three calls - AVOID, WATCH, or BUY CANDIDATE."))

    # ---------- helpers ----------
    def section_title(self, title):
        self.set_font("Arial", "B", 14)
        self.set_text_color(*TEAL)
        self.set_x(18)
        self.cell(0, 9, s(title), ln=1)
        self.set_draw_color(*TEAL2)
        self.set_line_width(0.5)
        self.line(18, self.get_y(), 192, self.get_y())
        self.ln(3)
        self.set_text_color(*DARK)

    def sub(self, text):
        self.set_font("Arial", "B", 10.5)
        self.set_text_color(*NAVY)
        self.set_x(18)
        self.cell(0, 6, s(text), ln=1)
        self.set_text_color(*DARK)

    # ---------- body ----------
    # ---- universal quantitative deep-dive (common_fin) ----
    def render_universal(self):
        d = self.data
        u = d.get("universal") or {}
        if not u:
            return

        def row(label, value):
            self.set_font("Arial", "B", 9.5)
            self.set_text_color(*NAVY)
            self.set_x(18)
            self.cell(92, 5.4, s(label), ln=0)
            self.set_text_color(*DARK)
            self.set_font("Arial", "", 9.5)
            self.cell(0, 5.4, s(value), ln=1)

        self.ln(2)
        self.section_title("Quantitative Deep-Dive (5-Year View)")
        row("Revenue CAGR", common_fin.fmt_pct(u.get("rev_cagr")))
        row("Net-profit CAGR", common_fin.fmt_pct(u.get("ni_cagr")))
        row("EPS CAGR", common_fin.fmt_pct(u.get("eps_cagr")))
        row("FCF CAGR", common_fin.fmt_pct(u.get("fcf_cagr")))
        row("EPS positive (of years)", common_fin.fmt_pct(u.get("eps_positive_pct")))
        row("EPS growth-consistency", common_fin.fmt_pct(u.get("eps_growth_consistency")))
        row("Interest coverage", common_fin.fmt_x(u.get("interest_coverage")))
        row("Current ratio", common_fin.fmt_x(u.get("current_ratio")))
        row("Quick ratio", common_fin.fmt_x(u.get("quick_ratio")))
        fy = u.get("fcf_yield")
        row("FCF yield", common_fin.fmt_pct(fy * 100.0 if fy is not None else None))
        sp = u.get("fwd_pe_spread")
        if sp is not None:
            row("Forward vs trailing P/E", f'{common_fin.fmt_pct(sp, 0)} ({"fwd cheaper" if sp > 0 else "fwd richer"})')
        else:
            row("Forward vs trailing P/E", "n/a")

        self.ln(1)
        self.section_title("Intrinsic Value & Margin of Safety")
        if u.get("iv_dcf") is not None:
            row("DCF intrinsic value (Rs cr)", common_fin.fmt_crore(u.get("iv_dcf")))
            row("  margin of safety", common_fin.fmt_pct(u.get("mos_dcf")))
        if u.get("graham_number") is not None:
            row("Graham number", common_fin.fmt_num(u.get("graham_number")))
            row("  margin of safety", common_fin.fmt_pct(u.get("mos_graham")))
        if u.get("iv_owner_earnings") is not None:
            row("Owner-earnings value (Rs cr)", common_fin.fmt_crore(u.get("iv_owner_earnings")))
            row("  margin of safety", common_fin.fmt_pct(u.get("mos_owner_earnings")))
        common_fin.render_note(self, "How to read: " + common_fin.explain_intrinsic_value(u))

        self.ln(1)
        self.section_title("Composite Score")
        comp = u.get("composite")
        st = u.get("stars")
        if comp is not None:
            self.set_font("Arial", "B", 11)
            self.set_text_color(*TEAL2)
            self.set_x(18)
            self.cell(0, 7, s(f"Overall: {comp:.0f}/100   {common_fin.stars(st)}"), ln=1)
            self.set_font("Arial", "", 8.5)
            self.set_text_color(*GREY)
            self.set_x(18)
            self.multi_cell(174, 4.6, s(
                "Sub-scores -> Quality "
                + common_fin.fmt_num(u.get("sub_quality"))
                + " | Value " + common_fin.fmt_num(u.get("sub_value"))
                + " | Safety " + common_fin.fmt_num(u.get("sub_safety"))
                + " | Growth " + common_fin.fmt_num(u.get("sub_growth"))))
            self.set_text_color(*DARK)
        self.ln(1)

    def body(self):
        d = self.data
        self.add_page()
        self.section_title("1) Understandability & Growth Story")
        self.sub("What the business does")
        self.set_font("Arial", "", 10)
        self.set_x(18)
        self.multi_cell(174, 5.3, s(d["business"]))
        self.ln(1.5)
        self.sub("One concrete growth driver")
        self.set_font("Arial", "", 10)
        self.set_x(18)
        self.multi_cell(174, 5.3, s(d["driver"]))

        self.ln(2)
        self.section_title("2) Diagnostic Profile")
        for label, state, conv, ev in d["diagnostics"]:
            # each element on its own line -> long labels can never collide with the state
            self.set_font("Arial", "B", 10)
            self.set_text_color(*NAVY)
            self.set_x(18)
            self.multi_cell(174, 6, s(label), ln=1)
            self.set_text_color(*TEAL2)
            self.set_font("Arial", "B", 9.5)
            self.set_x(18)
            self.multi_cell(174, 6, s(state), ln=1, align="L")
            self.set_x(18)
            self.set_text_color(*GREY)
            self.set_font("Arial", "", 9)
            self.cell(0, 5, s("Conviction: " + conv), ln=1)
            self.set_text_color(*DARK)
            self.set_font("Arial", "", 9.5)
            self.set_x(18)
            self.multi_cell(174, 4.8, s("Evidence: " + ev))
            self.ln(1.5)

        self.ln(1)
        self.section_title("3) Fatal Flaw Check")
        self.render_universal()

        for label, status, text in d["flaws"]:
            cmap = {"PASS": GREEN, "WATCH": AMBER, "FLAG": RED}
            self.set_font("Arial", "B", 10)
            self.set_text_color(*NAVY)
            self.set_x(18)
            self.cell(40, 6, s(label), ln=0)
            self.set_text_color(*cmap.get(status, DARK))
            self.cell(22, 6, s(status), ln=1)
            self.set_text_color(*DARK)
            self.set_font("Arial", "", 9.5)
            self.set_x(18)
            self.multi_cell(174, 4.8, s(text))
            self.ln(1)

        self.ln(1)
        self.section_title("4) Quality & Moat Verdict")
        self.set_font("Arial", "", 10)
        self.set_x(18)
        self.multi_cell(174, 5.3, s(d["category"]))

        self.ln(2)
        self.section_title("5) Bonus Points")
        self.set_font("Arial", "", 10)
        for b in d["bonus"]:
            self.set_x(18)
            self.cell(5, 5.3, s("-"), ln=0)
            self.multi_cell(169, 5.3, s(b))

        self.ln(2)
        self.section_title("6) Decision")
        col = DECISION_COLOR[d["decision"]]
        self.set_fill_color(*col)
        self.set_text_color(*WHITE)
        self.set_font("Arial", "B", 11)
        self.set_x(18)
        self.cell(174, 8, s(d["decision"] + "  -  " + d["tagline"]), ln=1, fill=True)
        self.set_text_color(*DARK)
        self.ln(2)
        self.set_font("Arial", "", 10)
        self.set_x(18)
        self.multi_cell(174, 5.3, s("Why: " + d["decision_reason"]))
        self.ln(1)
        self.set_x(18)
        self.multi_cell(174, 5.3, s("Revisit trigger: " + d["revisit"]))

        # sources
        self.ln(3)
        self.section_title("Sources")
        self.set_font("Arial", "", 8.5)
        self.set_text_color(*GREY)
        for label, url in d["sources"]:
            self.set_x(18)
            self.multi_cell(174, 4.4, s("- " + label + ": " + url))
        self.ln(3)
        self.set_fill_color(*LIGHT)
        self.set_text_color(*GREY)
        self.set_font("Arial", "", 8)
        self.set_x(18)
        self.multi_cell(174, 4.2, s(DISCLAIMER), fill=True)


def main():
    for d in COMPANIES:
        pdf = Report(d)
        slug = d["ticker"].split(":")[-1].strip().replace(".", "")
        path = os.path.join(OUT, slug + ".pdf")
        pdf.output(path)
        print("wrote", path)


if __name__ == "__main__":
    main()
