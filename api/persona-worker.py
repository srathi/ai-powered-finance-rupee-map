"""Vercel Python serverless function: generate one persona PDF.

Served at /api/persona-worker. Handles a single persona per invocation
(keeps each call under the Hobby 10s limit). Returns JSON:
  { persona, fileName, data(base64) }  or  { persona, error }

NOTE: Vercel's file-based Python functions require `handler` to be a
BaseHTTPRequestHandler subclass (a framework preset like Flask would take
over all routing and conflict with the Next.js app, so we avoid that).
"""
import os
import sys
import json
import base64
from http.server import BaseHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(HERE)


class handler(BaseHTTPRequestHandler):
    def _send_json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw.decode("utf-8") or "{}")

            symbol = (data.get("symbol") or "").strip()
            name = data.get("companyName") or symbol
            industry = data.get("industry") or ""
            person = data.get("persona") or (data.get("personas") or [None])[0]

            if not symbol or not person:
                self._send_json(400, {"error": "Missing symbol or persona"})
                return

            sys.path.insert(0, os.path.join(REPO_ROOT, "persona-reports"))
            import generate_one

            out = generate_one.run_one(person, symbol, name, industry)
            with open(out, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("ascii")
            try:
                os.unlink(out)
            except Exception:
                pass

            safe = symbol.replace("/", "").replace(":", "")
            self._send_json(
                200,
                {"persona": person, "fileName": f"{person}_{safe}.pdf", "data": b64},
            )
        except Exception as e:
            self._send_json(
                500,
                {"persona": (data or {}).get("persona"), "error": str(e)[:500]},
            )

    def log_message(self, *args):
        pass
