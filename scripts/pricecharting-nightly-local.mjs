#!/usr/bin/env node
/**
 * Daily PriceCharting price load, run from THIS Mac.
 *
 * PriceCharting answers 503 to the same download when it comes from cloud servers (Supabase, Vercel, GitHub),
 * so the file is downloaded here and pushed into the loader the app already has: /api/ingestion/pricecharting
 * (begin -> chunk -> check -> commit -> finish). Every step on the server is idempotent, and a day that is
 * already loaded is skipped, so running this more than once a day is safe.
 *
 * Config (outside the repo, chmod 600): ~/.panel-profits/pricecharting.env
 *   PRICECHARTING_CSV_URL=<your PriceCharting download-custom link>
 *   GPA_INGESTION_SECRET=<same value the app uses>
 *   PP_BASE_URL=https://comicbookstockexchange.com      (optional)
 *   ALERT_WEBHOOK_URL=<Zapier "Catch Hook" (or any webhook) URL>   (optional; gets a JSON post on load and on failure)
 * Nothing secret is ever written to the log.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";

const DIR = process.env.PP_NIGHTLY_DIR || path.join(os.homedir(), ".panel-profits");
const LOG = path.join(DIR, "pricecharting-nightly.log");
const OK_FILE = path.join(DIR, "last-success.txt");
const TMP = path.join(DIR, "pc-download.csv");
const STEP = 2_000_000; // characters per chunk (the loader accepts well under Vercel's 4.5 MB body limit)
const PARTS = 8;
const CONC = 2;
const MIN_BYTES = 5_000_000;
const WAITS_MS = [Number(process.env.PP_RETRY_WAIT_MS ?? 60_000)]; // between the 2 attempts in one run (the 20-minute schedule retries after that)
const ALERT_EVERY_MS = 6 * 3600_000; // failure alerts are sent at most this often
const ALERT_FILE = path.join(DIR, "last-failure-alert.txt");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function loadEnv(file) {
  const out = {};
  let text = "";
  try { text = fs.readFileSync(file, "utf8"); } catch { return out; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

fs.mkdirSync(DIR, { recursive: true });
const env = { ...loadEnv(path.join(DIR, "pricecharting.env")), ...process.env };
const BASE = (env.PP_BASE_URL || "https://comicbookstockexchange.com").replace(/\/$/, "");
const SECRET = env.GPA_INGESTION_SECRET || "";
const CSV_URL = env.PRICECHARTING_CSV_URL || "";

const redact = (s) => {
  let t = String(s);
  for (const secret of [SECRET, CSV_URL, (() => { try { return new URL(CSV_URL).searchParams.get("t") || ""; } catch { return ""; } })()]) {
    if (secret && secret.length > 6) t = t.split(secret).join("<hidden>");
  }
  return t;
};
const log = (msg) => {
  const line = `${new Date().toISOString()} ${redact(msg)}\n`;
  try { fs.appendFileSync(LOG, line); } catch {}
  process.stdout.write(line);
};
const notify = (title, msg) => {
  if (process.platform !== "darwin") return;
  try { execFileSync("osascript", ["-e", `display notification ${JSON.stringify(redact(msg))} with title ${JSON.stringify(title)}`]); } catch {}
};
const webhook = async (payload) => {
  if (!env.ALERT_WEBHOOK_URL) return;
  try {
    await fetch(env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "panel-profits-pricecharting", host: os.hostname(), at: new Date().toISOString(), ...payload }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) { log(`alert webhook failed: ${e.message}`); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lastGood = () => { try { return fs.readFileSync(OK_FILE, "utf8").trim(); } catch { return "never"; } };

async function api(label, action, extra = {}) {
  const res = await fetch(`${BASE}/api/ingestion/pricecharting`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SECRET}` },
    body: JSON.stringify({ action, label, ...extra }),
    signal: AbortSignal.timeout(180_000),
  });
  let json = {};
  try { json = await res.json(); } catch {}
  if (!res.ok || json.ok === false) throw new Error(`${action}: ${json.error || `HTTP ${res.status}`}`);
  return json;
}

function download() {
  const u = new URL(CSV_URL);
  u.searchParams.set("category", "comic-books");
  try { fs.rmSync(TMP, { force: true }); } catch {}
  const r = spawnSync("curl", [
    "-sS", "-L", "--fail", "--retry", process.env.PP_CURL_RETRIES ?? "2", "--retry-delay", "15", "--max-time", "900",
    "-A", UA, "-H", "Accept: text/csv,text/plain,application/octet-stream,*/*;q=0.8",
    "-o", TMP, u.toString(),
  ], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`download failed: ${(r.stderr || "").trim().split("\n").pop() || `curl exit ${r.status}`}`);
  const size = fs.statSync(TMP).size;
  if (size < MIN_BYTES) throw new Error(`download too small (${size} bytes): ${fs.readFileSync(TMP, "utf8").slice(0, 120)}`);
  return size;
}

/** Splits at line ends into pieces of about STEP characters. Exported for the self-test. */
export function splitChunks(text, step = STEP) {
  const pieces = [];
  let buf = text;
  while (buf.length > step) {
    const cut = buf.lastIndexOf("\n", step);
    if (cut < 0) break;
    pieces.push(buf.slice(0, cut + 1));
    buf = buf.slice(cut + 1);
  }
  if (buf.length) pieces.push(buf);
  return pieces;
}

async function runOnce() {
  const today = new Date().toISOString().slice(0, 10);
  const label = `PriceCharting nightly ${today}`;
  const begin = await api(label, "begin");
  if (begin.skipped) return { skipped: true, label };

  try {
    const bytes = download();
    log(`downloaded ${(bytes / 1e6).toFixed(1)} MB`);
    const text = fs.readFileSync(TMP, "utf8");
    const pieces = splitChunks(text);
    let first = true;
    let staged = 0;
    for (const piece of pieces) {
      const out = await api(label, "chunk", { csv: piece, first });
      staged += Number(out.staged || 0);
      first = false;
    }
    const check = await api(label, "check");
    for (let part = 0; part < PARTS; part += CONC) {
      const slice = Array.from({ length: CONC }, (_, i) => part + i).filter((p) => p < PARTS);
      await Promise.all(slice.map((p) => api(label, "commit", { snap: today, part: p, parts: PARTS })));
    }
    await api(label, "finish");
    return { label, rows: check.rows ?? staged, previous: check.previous_rows ?? 0 };
  } catch (e) {
    await api(label, "finish").catch(() => {});
    throw e;
  } finally {
    try { fs.rmSync(TMP, { force: true }); } catch {}
  }
}

async function main() {
  if (!CSV_URL || !SECRET) {
    const msg = `missing ${!CSV_URL ? "PRICECHARTING_CSV_URL" : "GPA_INGESTION_SECRET"} in ${path.join(DIR, "pricecharting.env")}`;
    log(msg);
    notify("PriceCharting load NOT set up", msg);
    await webhook({ status: "failed", error: msg, last_good: lastGood() });
    process.exit(2);
  }
  let lastErr = "";
  for (let attempt = 1; attempt <= WAITS_MS.length + 1; attempt++) {
    try {
      const r = await runOnce();
      if (r.skipped) { log(`${r.label}: already loaded today, nothing to do`); return; }
      fs.writeFileSync(OK_FILE, `${new Date().toISOString().slice(0, 10)}\n`);
      try { fs.rmSync(ALERT_FILE, { force: true }); } catch {}
      log(`${r.label}: loaded ${r.rows} comics (previous snapshot ${r.previous})`);
      notify("PriceCharting prices loaded", `${Number(r.rows).toLocaleString()} comics for ${new Date().toISOString().slice(0, 10)}`);
      await webhook({ status: "loaded", date: new Date().toISOString().slice(0, 10), rows: r.rows, previous_rows: r.previous });
      return;
    } catch (e) {
      lastErr = redact(e.message || e);
      log(`attempt ${attempt} failed: ${lastErr}`);
      if (attempt <= WAITS_MS.length) await sleep(WAITS_MS[attempt - 1]);
    }
  }
  // Same failure repeats every 20 minutes until it is fixed: alert at most every 6 hours, not every run.
  let lastAlert = 0;
  try { lastAlert = Number(fs.readFileSync(ALERT_FILE, "utf8")) || 0; } catch {}
  if (Date.now() - lastAlert >= ALERT_EVERY_MS) {
    try { fs.writeFileSync(ALERT_FILE, String(Date.now())); } catch {}
    notify("PriceCharting load FAILED", `${lastErr.slice(0, 120)} (last good load: ${lastGood()})`);
    await webhook({ status: "failed", error: lastErr.slice(0, 300), last_good: lastGood() });
  }
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("pricecharting-nightly-local.mjs")) await main();
