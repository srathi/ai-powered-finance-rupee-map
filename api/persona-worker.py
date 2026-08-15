"""Vercel Python serverless function: generate one persona PDF.

Called (one persona per invocation) by the Next.js route
`src/app/api/persona-report/route.ts` when running on Vercel. Keeps each
invocation under the Hobby 10s limit. Returns the same JSON shape the Node
route expects: { persona, fileName, data(base64) } or { persona, error }.
"""
import os
import sys
import json
import base64
import traceback

HERE = os.path.dirname(os.path.abspath(__file__))


def _json(code, obj):
    return {
        "statusCode": code,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(obj),
    }


def handler(request, context=None):
    try:
        body = request.get("body", "{}")
        if isinstance(body, (bytes, bytearray)):
            body = body.decode("utf-8")
        data = json.loads(body or "{}")

        symbol = (data.get("symbol") or "").strip()
        name = data.get("companyName") or symbol
        industry = data.get("industry") or ""
        person = data.get("persona") or (data.get("personas") or [None])[0]

        if not symbol or not person:
            return _json(400, {"error": "Missing symbol or persona"})

        # Import the generator package. persona-reports/ is at the repo root,
        # one level above this api/ function.
        repo_root = os.path.dirname(HERE)
        sys.path.insert(0, os.path.join(repo_root, "persona-reports"))
        import generate_one

        out = generate_one.run_one(person, symbol, name, industry)
        with open(out, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        try:
            os.unlink(out)
        except Exception:
            pass

        safe = symbol.replace("/", "").replace(":", "")
        fname = f"{person}_{safe}.pdf"
        return _json(200, {"persona": person, "fileName": fname, "data": b64})
    except Exception as e:
        return _json(
            500,
            {
                "persona": (data or {}).get("persona"),
                "error": str(e)[:500],
            },
        )
