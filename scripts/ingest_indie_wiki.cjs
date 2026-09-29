#!/usr/bin/env node
/**
 * scripts/ingest_indie_wiki.cjs
 *
 * Ingests the real, previously-unloaded indie/creator-owned-publisher
 * character manifest (publisher_dumps/indie_character_manifest.json) into
 * public.ppcf_wiki_pages, mirroring scripts/ingest_marvel_wiki.cjs.
 *
 * IMPORTANT source-format note (verified, differs from every other
 * ingest_*_wiki.cjs script): publisher_dumps/image/imagecomics_pages_current.xml.7z
 * and publisher_dumps/darkhorse/darkhorse_pages_current.xml.7z are NOT real
 * archives -- each is a 354-byte AWS S3 "InvalidObjectState / storage class
 * DEEP_ARCHIVE" XML error response (the underlying wiki dump was never
 * actually downloaded). The ONLY real, usable data for Image Comics and
 * Dark Horse -- and for Spawn and Transformers, which have no XML dump at
 * all -- is publisher_dumps/indie_character_manifest.json, a flat JSON
 * object of {"imagecomics": [...], "darkhorse": [...], "spawn": [...],
 * "transformers": [...]} where each entry is just a page-title STRING (no
 * summary, creators, first_appearance, or any other metadata -- the manifest
 * genuinely does not contain more than a name). Every row this script
 * produces is therefore CHARACTER / NEEDS_REVIEW with a generic
 * "<Publisher> character: <name>" summary; this is not a shortcut, it is
 * the full extent of the real source data. Do not backfill richer summaries
 * from outside knowledge -- that would violate the zero-hardcoded-data rule
 * this script exists to satisfy.
 *
 * Connects the same way the rest of the codebase does: @supabase/supabase-js
 * with SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (falling back to SUPABASE_SERVICE_KEY), matching lib/supabase/admin.ts.
 * No credentials are hardcoded here; run with `node --env-file=.env.local`
 * (or any process that already has those vars exported) from the repo root.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest_indie_wiki.cjs --dry-run [--source <file>]
 *   node --env-file=.env.local scripts/ingest_indie_wiki.cjs --live [--source <file>] [--batch-size 500]
 *   node --env-file=.env.local scripts/ingest_indie_wiki.cjs --dry-run --brand darkhorse
 *
 * --brand <imagecomics|darkhorse|spawn|transformers>: restrict to one brand
 *   (default: all four).
 * --dry-run (default): parses and normalizes every real source record, computes
 *   exact row counts and data-quality stats, and validates slug uniqueness --
 *   but performs NO network access. Safe to run anywhere.
 * --live: performs the real batched upsert into Supabase. First fetches every
 *   slug already present in ppcf_wiki_pages (paginated) and seeds the local
 *   dedup registry with them -- verified necessary: e.g. 221 of the
 *   "darkhorse"/"imagecomics" manifest slugs collide with the DC dump
 *   (DC absorbed the WildStorm imprint, so the same characters exist in
 *   both real sources) and 141 collide with the Star Wars dump (Dark Horse
 *   published Star Wars comics for years). Without seeding, whichever
 *   script runs second would silently overwrite the other's distinct row
 *   via onConflict:'slug'. Requires network access to the project's
 *   Supabase host.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const sourceArgIdx = args.indexOf("--source");
const sourceCandidates = [
  sourceArgIdx >= 0 && args[sourceArgIdx + 1] ? args[sourceArgIdx + 1] : null,
  process.env.INDIE_MANIFEST_FILE,
  path.resolve(__dirname, "../../publisher_dumps/indie_character_manifest.json"),
  path.join(process.env.HOME || "", "Documents/anti gravity panel profits/publisher_dumps/indie_character_manifest.json"),
  path.join(process.env.HOME || "", "mnt/Documents/anti gravity panel profits/publisher_dumps/indie_character_manifest.json"),
];
const SOURCE_FILE = sourceCandidates.find((f) => f && fs.existsSync(f)) || path.resolve(__dirname, "../../publisher_dumps/indie_character_manifest.json");
const batchArgIdx = args.indexOf("--batch-size");
const BATCH_SIZE =
  batchArgIdx >= 0 && args[batchArgIdx + 1] ? parseInt(args[batchArgIdx + 1], 10) : 500;
const brandArgIdx = args.indexOf("--brand");
const BRAND_FILTER = brandArgIdx >= 0 && args[brandArgIdx + 1] ? args[brandArgIdx + 1] : null;

const BRANDS = [
  { key: "imagecomics", universe: "IMAGE", label: "Image Comics" },
  { key: "darkhorse", universe: "DARK_HORSE", label: "Dark Horse" },
  { key: "spawn", universe: "SPAWN", label: "Spawn Universe" },
  { key: "transformers", universe: "TRANSFORMERS", label: "Transformers" },
];

// ---------------------------------------------------------------------------
// Cleaning helpers
// ---------------------------------------------------------------------------

function baseTitleFromPageTitle(pageTitle) {
  return String(pageTitle || "")
    .replace(/\s*\([^()]*\)\s*$/, "")
    .trim();
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

// The manifest's per-brand arrays are raw MediaWiki page-title lists and
// include a small number of non-character navigation/template artifacts
// (measured against the real file: 6 of 4215 entries total -- '%^9', '%^2'
// leaked template tokens, and 'List of characters' / 'List of creatures and
// races' index pages). Entries that merely start with a quote character
// (e.g. '"Angel" Scream', a real Transformers nickname) are NOT junk and
// must not be filtered.
function isJunkEntry(raw) {
  const s = String(raw || "").trim();
  if (!s) return true;
  if (s.startsWith("%")) return true;
  if (/^list of /i.test(s)) return true;
  return false;
}

const slugCounts = new Map();
function uniqueSlug(base) {
  let s = base || "entity";
  if (!slugCounts.has(s)) {
    slugCounts.set(s, 1);
    return s;
  }
  const n = slugCounts.get(s) + 1;
  slugCounts.set(s, n);
  return `${s}-${n}`;
}

// ---------------------------------------------------------------------------
// Row builder
// ---------------------------------------------------------------------------

const stats = {}; // per-brand: { total, junk_skipped, produced }

function buildCharacterRow(rawTitle, brand) {
  const base = baseTitleFromPageTitle(rawTitle);
  const displayTitle = base || rawTitle;
  return {
    slug: uniqueSlug(slugify(rawTitle)),
    display_title: displayTitle,
    page_type: "CHARACTER",
    summary: `${brand.label} character: ${displayTitle}`,
    // The manifest carries no origin/creators/first_appearance metadata at
    // all -- every row is honestly marked NEEDS_REVIEW rather than
    // presented as a complete, verified page.
    page_status: "NEEDS_REVIEW",
    universe: brand.universe,
    reality: null,
    creators: null,
    first_appearance: null,
  };
}

// ---------------------------------------------------------------------------
// Supabase (live mode only)
// ---------------------------------------------------------------------------

async function getSupabaseClient() {
  const { createClient } = require("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY in environment"
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function seedExistingSlugs(supabase) {
  const PAGE = 1000;
  let from = 0;
  let total = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("ppcf_wiki_pages")
      .select("slug")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Failed to fetch existing slugs: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) slugCounts.set(row.slug, 1);
    total += data.length;
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`  Seeded slug registry with ${total} existing rows from Supabase.`);
}

async function upsertBatches(rows, label, supabase) {
  let inserted = 0;
  let failed = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    let attempt = 0;
    let lastErr = null;
    while (attempt < 2) {
      attempt++;
      const { error } = await supabase
        .from("ppcf_wiki_pages")
        .upsert(batch, { onConflict: "slug" });
      if (!error) {
        lastErr = null;
        break;
      }
      lastErr = error;
    }
    if (lastErr) {
      failed += batch.length;
      errors.push({ batchStart: i, message: lastErr.message });
      console.error(`  [error] ${label} batch @${i}: ${lastErr.message}`);
    } else {
      inserted += batch.length;
    }
    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`  ${label}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} upserted`);
    }
  }
  return { inserted, failed, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Mode: ${LIVE ? "LIVE (will write to Supabase)" : "DRY RUN (no network access)"}`);
  console.log(`Source file: ${SOURCE_FILE}`);
  if (BRAND_FILTER) console.log(`Brand filter: ${BRAND_FILTER}`);

  let supabase = null;
  if (LIVE) {
    console.log("\nConnecting to Supabase...");
    supabase = await getSupabaseClient();
    console.log("Fetching existing slugs to seed the collision registry...");
    await seedExistingSlugs(supabase);
  }

  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Source manifest not found: ${SOURCE_FILE}`);
    process.exitCode = 1;
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf-8"));

  const rowsByBrand = {};
  for (const brand of BRANDS) {
    if (BRAND_FILTER && brand.key !== BRAND_FILTER) continue;
    const list = Array.isArray(manifest[brand.key]) ? manifest[brand.key] : [];
    stats[brand.key] = { total: list.length, junk_skipped: 0, produced: 0 };
    const rows = [];
    for (const rawTitle of list) {
      if (isJunkEntry(rawTitle)) {
        stats[brand.key].junk_skipped++;
        continue;
      }
      rows.push(buildCharacterRow(rawTitle, brand));
      stats[brand.key].produced++;
    }
    rowsByBrand[brand.key] = rows;
  }

  console.log("\n=== Real source record counts (parsed) ===");
  let totalProduced = 0;
  for (const brand of BRANDS) {
    if (!stats[brand.key]) continue;
    const s = stats[brand.key];
    console.log(
      `  ${brand.label.padEnd(14)} (universe=${brand.universe}): manifest_entries=${s.total} junk_skipped=${s.junk_skipped} CHARACTER_rows=${s.produced}`
    );
    totalProduced += s.produced;
  }
  console.log(`  TOTAL CHARACTER rows: ${totalProduced}`);

  const dupSlugs = [...slugCounts.values()].filter((c) => c > 1).length;
  console.log(`\nSlug collisions resolved with numeric suffixes: ${dupSlugs}`);

  if (!LIVE) {
    console.log("\nDry run complete. No data was written. Re-run with --live to upsert into Supabase.");
    return;
  }

  const results = {};
  for (const brand of BRANDS) {
    if (!rowsByBrand[brand.key]) continue;
    console.log(`\nUpserting ${brand.label} CHARACTER (${rowsByBrand[brand.key].length} rows)...`);
    results[brand.key] = await upsertBatches(rowsByBrand[brand.key], brand.label, supabase);
  }

  console.log("\n=== LIVE ingestion results ===");
  let totalInserted = 0;
  let totalFailed = 0;
  for (const brand of BRANDS) {
    if (!results[brand.key]) continue;
    const r = results[brand.key];
    console.log(`  ${brand.label}: inserted=${r.inserted} failed=${r.failed}`);
    totalInserted += r.inserted;
    totalFailed += r.failed;
  }
  console.log(`  TOTAL inserted=${totalInserted} failed=${totalFailed}`);

  if (totalFailed > 0) {
    console.error("\nSome batches failed. This is NOT a complete ingestion -- see errors above.");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exitCode = 1;
});
