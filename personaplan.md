# personaplan.md — Persona Stock Reports Feature

> Standalone, additive feature for RupeeMap. **No dependency on `kronos-service`**
> (kronos is local WIP and must never be committed or relied upon). The persona
> feature builds its own isolated Python environment.

## 1. Feasibility
The app already provides the pieces we reuse (none from kronos):
- **Symbol resolution**: `src/lib/stock-detection.ts` + `src/app/api/stock-search` (name → ticker).
- **PDF download**: `file-saver` (already a dependency).
- **Our 5 persona generators** (`gen_index.py` + `gen_reports.py`) are built and branding-correct.
- Chosen: **all 5 personas** (user picks any/multiple) · **dedicated new page** ·
  **download buttons only** · **Next.js `child_process`** (no sidecar).

## 2. Architecture
```
/stock-report page
   │ name + selected personas
   ▼
POST /api/persona-report  (Next route, spawns Python via child_process)
   │ for each persona, concurrently:
   ▼
persona-reports/<persona>/generate_one.py  (analyze() + Report() → PDF temp file)
   ▼
Route → JSON { reports:[{persona, fileName, data:base64}] }
   ▼
file-saver → one Download button per persona
```

## 3. Implementation

### 3.1 Bring generators into the repo (isolated)
New top-level `persona-reports/` (independent of kronos):
```
persona-reports/
  requirements.txt        # yfinance, fpdf2, pymupdf  (standalone; do NOT share kronos venv)
  generate_one.py          # entry point for the route
  warren-buffett/   { gen_index.py, gen_reports.py, references/, logo.png }
  joel-greenblatt/  { ... }
  benjamin-graham/  { ... }
  peter-lynch/      { ... }
  buffett-munger/   { ... }
```
- Copy each skill's `reports/` contents (gen_index.py, gen_reports.py, references/, logo.png).
- One tiny edit per `gen_reports.py`: `FONT = os.getenv("PERSONA_FONT", <system font>)` so it is
  not bound to a macOS path. Default to a system font that exists locally; for distribution set
  `PERSONA_FONT` to a bundled **open-source** font (e.g. DejaVuSans). We deliberately do **NOT**
  commit any proprietary font file.
- `gen_index.py` cache dir is overridden via `PERSONA_CACHE` env so it does not write outside the repo.
- `generate_one.py(symbol, name, persona, out_path)`: imports that persona's `gen_index`
  (`load_raw`+`analyze`) and `gen_reports.Report`, calls `Report(data).output(out_path)`.
  100% reuse, no rewrite.

### 3.2 API route — `src/app/api/persona-report/route.ts`
- `POST { symbol, companyName?, personas:string[] }`.
- Validate personas against the 5; normalize symbol via `stock-detection`.
- For each persona, `spawn` `python3 persona-reports/generate_one.py ...` **concurrently**
  (`Promise.all`), unique temp file each.
- Return `JSON { reports:[{persona, fileName, data:<base64>}] }` (base64 + file-saver =
  simplest "download buttons only", no extra route/file cleanup).
- `export const maxDuration = 300;`
- Per-persona error isolation; optional short-TTL in-memory cache.

### 3.3 Frontend — `src/app/stock-report/page.tsx` (new dedicated page)
- Stock input with autocomplete reusing `src/lib/stock-detection.ts`.
- 5 selectable persona cards (Warren Buffett, Joel Greenblatt, Benjamin Graham, Peter Lynch,
  Buffett & Munger), multi-select.
- Generate → loading state (~10–30s for several personas).
- Results: one **Download** button per persona (file-saver), optional verdict badge.
- Style: shadcn/ui + Tailwind + Framer Motion (per `DESIGN_BRIEF`).

### 3.4 Navigation
Single nav entry → `/stock-report` (only change to existing chrome).

### 3.5 Config
- `pip install -r persona-reports/requirements.txt` into a **dedicated venv**
  (`persona-reports/.venv`), separate from kronos.
- `PERSONA_FONT` env → font path.
- `PERSONA_PYTHON` env → python interpreter (defaults to `python3`).

## 4. Non-impact / safety
- **No edits** to existing calculators, chat, forecast, kronos, or their routes.
- All new: `persona-reports/`, one API route, one page, one nav link, `personaplan.md`.
- Only edit to *persona code* is the portable-font line + cache-env line.

## 5. Version-control hygiene (kronos rule)
- **Never stage or commit `kronos-service/`** — local WIP, must stay uncommitted.
- Commit scope limited to: `persona-reports/`, `src/app/api/persona-report/`,
  `src/app/stock-report/`, nav change, `personaplan.md`.
- Verify `.gitignore` continues to exclude `kronos-service/` local changes before any commit.

## 6. Risks & mitigations
| Risk | Mitigation |
|---|---|
| `yfinance` latency / rate-limits | Concurrency + loading spinner (same data source app already uses for prices) |
| **Python must exist in host runtime** (child_process, not sidecar) | Fine for local/dev. ⚠️ Node-only hosts (e.g. Vercel) need a Python runtime or a switch to the sidecar pattern later — tracked as a future option, not blocking |
| base64 JSON size | 50–300 KB/report; fine |
| Font missing off-Mac | `PERSONA_FONT` env override to a bundled open-source font |
| Accidental kronos commit | Strict commit scope + gitignore |

## 7. Validation
1. `python3 persona-reports/generate_one.py --persona joel-greenblatt --symbol INFY` → correct branding, no overlap.
2. `curl -XPOST /api/persona-report` (INFY + 2 personas) → two base64 reports.
3. UI: enter "Infosys" → Buffett + Greenblatt → two working downloads.
