#!/usr/bin/env python3
"""Single-stock persona report generator.

Entry point invoked by the Next.js API route (one OS process per persona, so
module imports are isolated per persona). Produces exactly one branded PDF.

Usage:
  python3 generate_one.py --persona <slug> --symbol <TICKER> \
          --name "<Company>" --industry "<Industry>" --out <path.pdf>
"""
import os
import sys
import argparse
import importlib

PERSONA_DIR = os.path.dirname(os.path.abspath(__file__))

# slug -> folder name under persona-reports/
PERSONAS = {
    "warren-buffett": "warren-buffett",
    "joel-greenblatt": "joel-greenblatt",
    "benjamin-graham": "benjamin-graham",
    "peter-lynch": "peter-lynch",
    "buffett-munger": "buffett-munger",
    "mohnish-pabrai": "mohnish-pabrai",
    "howard-marks": "howard-marks",
    "ashwath-damodaran": "ashwath-damodaran",
    "raamdeo-agarwal": "raamdeo-agarwal",
    "robert-kiyosaki": "robert-kiyosaki",
}


def _load_persona_modules(folder):
    """Put this persona's folder on the path and (re)import its modules."""
    folder_path = os.path.join(PERSONA_DIR, folder)
    if folder_path not in sys.path:
        sys.path.insert(0, folder_path)
    # Drop any cached modules so a warm process can switch personas cleanly.
    for mod in ("gen_index", "gen_reports"):
        sys.modules.pop(mod, None)
    return importlib.import_module("gen_index"), importlib.import_module("gen_reports")


def run_one(person, symbol, name, industry, out_path=None):
    """Generate one persona PDF. Returns the output PDF path.

    Used by the Vercel Python worker (api/persona-worker.py) so generation can
    run server-side without spawning a separate Python process.
    """
    folder = PERSONAS.get(person)
    if not folder:
        raise ValueError(f"Unknown persona: {person}")

    gen_index, gen_reports = _load_persona_modules(folder)
    fetched = gen_index.load_raw(symbol)
    data = gen_index.analyze(symbol, name or symbol, industry, fetched)

    if out_path is None:
        import tempfile
        out_path = os.path.join(
            tempfile.gettempdir(), f"pr_{person}_{symbol}_{os.getpid()}.pdf"
        )
    gen_reports.Report(data).output(out_path)
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--persona", required=True, help="persona slug")
    ap.add_argument("--symbol", required=True, help="ticker, e.g. INFY.NS")
    ap.add_argument("--name", default="")
    ap.add_argument("--industry", default="")
    ap.add_argument("--out", required=True, help="output PDF path")
    args = ap.parse_args()

    folder = PERSONAS.get(args.persona)
    if not folder:
        print(f"Unknown persona: {args.persona}", file=sys.stderr)
        sys.exit(2)

    gen_index, gen_reports = _load_persona_modules(folder)
    fetched = gen_index.load_raw(args.symbol)
    data = gen_index.analyze(
        args.symbol, args.name or args.symbol, args.industry, fetched
    )
    gen_reports.Report(data).output(args.out)
    print(args.out)


if __name__ == "__main__":
    main()
