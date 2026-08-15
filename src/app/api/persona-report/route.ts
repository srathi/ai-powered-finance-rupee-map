import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const runtime = "nodejs";
// Vercel Hobby caps function duration at 10s. Each request handles a single
// persona (the UI is single-select), so one worker call stays well under this.
export const maxDuration = 10;

const PYTHON = process.env.PERSONA_PYTHON || "python3";
const GENERATE_SCRIPT = path.join(process.cwd(), "persona-reports", "generate_one.py");

export const ALLOWED_PERSONAS = [
  "warren-buffett",
  "joel-greenblatt",
  "benjamin-graham",
  "peter-lynch",
  "buffett-munger",
  "mohnish-pabrai",
  "howard-marks",
  "ashwath-damodaran",
  "raamdeo-agarwal",
  "robert-kiyosaki",
] as const;

type PersonaReport = { persona: string; fileName: string; data: string } | { persona: string; error: string };

// On Vercel, delegate generation to the Python serverless function
// (api/persona-worker.py) since Node functions can't spawn Python. Locally we
// keep the direct spawn path (PERSONA_PYTHON).
const IS_PROD = !!process.env.VERCEL;

async function fetchWorker(
  persona: string,
  symbol: string,
  name: string,
  industry: string,
  workerBase: string
): Promise<PersonaReport> {
  try {
    const res = await fetch(workerBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, companyName: name, industry, persona }),
    });
    const d = await res.json();
    if (d.error) return { persona, error: d.error };
    return { persona, fileName: d.fileName, data: d.data };
  } catch (e) {
    return { persona, error: (e as Error).message };
  }
}

function generateOne(
  persona: string,
  symbol: string,
  name: string,
  industry: string,
  workerBase?: string
): Promise<PersonaReport> {
  if (workerBase) {
    return fetchWorker(persona, symbol, name, industry, workerBase);
  }
  return new Promise((resolve) => {
    const outPath = path.join(
      os.tmpdir(),
      `pr_${persona}_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`
    );
    const args = [
      GENERATE_SCRIPT,
      "--persona",
      persona,
      "--symbol",
      symbol,
      "--name",
      name,
      "--industry",
      industry,
      "--out",
      outPath,
    ];

    const proc = spawn(PYTHON, args, { cwd: process.cwd() });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (err) => {
      resolve({ persona, error: `spawn failed: ${err.message}` });
    });
    proc.on("close", (code) => {
      try {
        if (code !== 0 || !fs.existsSync(outPath)) {
          resolve({
            persona,
            error: stderr.slice(-500) || `python exited with code ${code}`,
          });
          return;
        }
        const data = fs.readFileSync(outPath).toString("base64");
        fs.unlinkSync(outPath);
        const fileName = `${persona}_${symbol.replace(/[^\w]/g, "")}.pdf`;
        resolve({ persona, fileName, data });
      } catch (e) {
        resolve({ persona, error: (e as Error).message });
      }
    });
  });
}

export async function POST(request: NextRequest) {
  let body: {
    symbol?: string;
    companyName?: string;
    industry?: string;
    personas?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const symbol = (body.symbol || "").trim();
  if (!symbol) {
    return NextResponse.json({ error: "Missing 'symbol'" }, { status: 400 });
  }

  const requested = Array.isArray(body.personas) ? body.personas : [];
  const personas = requested.filter((p): p is string =>
    (ALLOWED_PERSONAS as readonly string[]).includes(p)
  );
  if (personas.length === 0) {
    return NextResponse.json(
      { error: "No valid personas selected", allowed: ALLOWED_PERSONAS },
      { status: 400 }
    );
  }

  const name = body.companyName || symbol;
  const industry = body.industry || "";

  // On Vercel, point each persona's generation at the Python worker.
  const workerBase = IS_PROD
    ? new URL("/api/persona-worker", request.url).toString()
    : undefined;

  // Run all selected personas concurrently.
  const reports = await Promise.all(
    personas.map((p) => generateOne(p, symbol, name, industry, workerBase))
  );

  return NextResponse.json({ symbol, reports });
}
