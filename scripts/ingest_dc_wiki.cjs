#!/usr/bin/env node
/**
 * scripts/ingest_dc_wiki.cjs
 *
 * Ingests the real, previously-unloaded DC Database Fandom dump
 * (dc_characters.jsonl, dc_teams.jsonl, dc_lore_and_artifacts.jsonl,
 * dc_creators.jsonl, dc_issues.jsonl) into public.ppcf_wiki_pages, mirroring
 * scripts/ingest_marvel_wiki.cjs so the wiki/entity-matching pipeline can
 * resolve against the full real DC corpus instead of a hardcoded list.
 *
 * Connects the same way the rest of the codebase does: @supabase/supabase-js
 * with SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (falling back to SUPABASE_SERVICE_KEY), matching lib/supabase/admin.ts.
 * No credentials are hardcoded here; run with `node --env-file=.env.local`
 * (or any process that already has those vars exported) from the repo root.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest_dc_wiki.cjs --dry-run [--source <dir>]
 *   node --env-file=.env.local scripts/ingest_dc_wiki.cjs --live [--source <dir>] [--batch-size 500]
 *
 * --dry-run (default): parses and normalizes every real source record, computes
 *   exact row counts and data-quality stats, and validates slug uniqueness --
 *   but performs NO network access. Safe to run anywhere.
 * --live: performs the real batched upsert into Supabase. First fetches every
 *   slug already present in ppcf_wiki_pages (paginated) and seeds the local
 *   dedup registry with them, so a slug this DC dump shares with an
 *   already-loaded Marvel/other-publisher row (verified to happen -- e.g.
 *   DC's absorbed WildStorm-imprint characters collide with the Image
 *   manifest, and Dark-Horse-published Star Wars comics collide with the
 *   Star Wars dump) gets a numeric suffix instead of silently overwriting
 *   that other, distinct entity. Requires network access to the project's
 *   Supabase host.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const sourceArgIdx = args.indexOf("--source");
const sourceCandidates = [
  sourceArgIdx >= 0 && args[sourceArgIdx + 1] ? args[sourceArgIdx + 1] : null,
  process.env.DC_DUMP_DIR,
  path.resolve(__dirname, "../../dc_database_dump"),
  path.join(process.env.HOME || "", "Documents/anti gravity panel profits/dc_database_dump"),
  path.join(process.env.HOME || "", "mnt/Documents/anti gravity panel profits/dc_database_dump"),
];
const SOURCE_DIR = sourceCandidates.find((dir) => dir && fs.existsSync(dir)) || path.resolve(__dirname, "../../dc_database_dump");
const batchArgIdx = args.indexOf("--batch-size");
const BATCH_SIZE =
  batchArgIdx >= 0 && args[batchArgIdx + 1] ? parseInt(args[batchArgIdx + 1], 10) : 500;

const FILES = {
  characters: "dc_characters.jsonl",
  teams: "dc_teams.jsonl",
  creators: "dc_creators.jsonl",
  lore: "dc_lore_and_artifacts.jsonl",
  issues: "dc_issues.jsonl",
};

// ---------------------------------------------------------------------------
// Cleaning helpers -- same MediaWiki-infobox-residue heuristics as the Marvel
// script (measured against the real DC dump: ~28.9% of current_alias values
// and ~38.0% of dc_teams.jsonl headquarters values match this corruption
// pattern -- lower than Marvel's 51.7% current_alias rate, but real).
// ---------------------------------------------------------------------------

function cleanInfoboxField(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;
  const pipeKv = s.match(/^\|\s*[A-Za-z ]+\s*=\s*(.*)$/);
  if (pipeKv) s = pipeKv[1].trim();
  if (s.startsWith("*")) s = s.replace(/^\*+/, "").trim();
  if (s.includes("*")) s = s.split("*")[0].trim();
  if (!s || s.length > 50 || s.includes("|") || s.includes("=")) return null;
  return s;
}

function baseTitleFromPageTitle(pageTitle) {
  // "Barry Allen (New Earth)" -> "Barry Allen"
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

function cleanParagraph(raw, maxLen) {
  if (!raw) return "";
  let s = String(raw);
  s = s.replace(/<br\s*\/?>/gi, " ");
  s = s.replace(/\b(thumb|left|right|center)\|[0-9]*(px)?\|?/gi, " ");
  s = s.replace(/\{\{[^}]*\}\}/g, " ");
  s = s.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2");
  s = s.replace(/'''''|'''|''/g, "");
  s = s.replace(/\s+/g, " ").trim();
  if (maxLen && s.length > maxLen) {
    s = s.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
  }
  return s;
}

// Global slug registry across all source files in this run -> dedupe
// collisions rather than silently overwriting a distinct entity. In --live
// mode this is seeded with every slug already in Supabase before any of
// this dump's rows are generated (see fetchExistingSlugs below).
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

async function readJsonl(filePath, onRecord) {
  if (!fs.existsSync(filePath)) {
    console.log(`  [skip] ${path.basename(filePath)} not found`);
    return 0;
  }
  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    console.log(`  [skip] ${path.basename(filePath)} is empty (0 bytes)`);
    return 0;
  }
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });
  let n = 0;
  let malformed = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch (e) {
      malformed++;
      continue;
    }
    onRecord(rec);
    n++;
  }
  if (malformed > 0) console.log(`  [warn] ${malformed} unparsable JSON lines skipped`);
  return n;
}

// ---------------------------------------------------------------------------
// Row builders -- map one source record to one public.ppcf_wiki_pages row.
// ---------------------------------------------------------------------------

const stats = {
  characters: { total: 0, alias_used: 0, name_fallback: 0, title_fallback: 0, needs_review: 0 },
  teams: { total: 0, needs_review: 0 },
  items: { total: 0 },
  locations: { total: 0 },
  vehicles: { total: 0 },
};

function buildCharacterRow(rec) {
  stats.characters.total++;
  const pageTitle = rec.title || "";
  const base = baseTitleFromPageTitle(pageTitle);
  const aliasClean = cleanInfoboxField(rec.current_alias);
  const nameClean = cleanInfoboxField(rec.name);

  let displayTitle;
  if (aliasClean) {
    displayTitle = aliasClean;
    stats.characters.alias_used++;
  } else if (nameClean) {
    displayTitle = nameClean;
    stats.characters.name_fallback++;
  } else {
    displayTitle = base || pageTitle || "Unknown Character";
    stats.characters.title_fallback++;
  }

  // DC does not have one unambiguous "home" continuity the way Marvel's
  // Earth-616 is -- do not fabricate a default; leave reality null when the
  // source record's own `universe` field is empty rather than guessing.
  const reality = (rec.universe || "").trim() || null;
  const originClean = cleanParagraph(rec.origin, 500);
  const summary = originClean || `DC Universe character: ${displayTitle}`;
  const creators = cleanParagraph(rec.creators, 300) || null;
  const firstAppearance = cleanParagraph(rec.first_appearance, 150) || null;

  const isThin = !originClean && !creators && !firstAppearance;
  if (isThin) stats.characters.needs_review++;

  return {
    slug: uniqueSlug(slugify(pageTitle)),
    display_title: displayTitle,
    page_type: "CHARACTER",
    summary,
    page_status: isThin ? "NEEDS_REVIEW" : "READY",
    universe: "DC",
    reality,
    creators,
    first_appearance: firstAppearance,
  };
}

function buildTeamRow(rec) {
  stats.teams.total++;
  const pageTitle = rec.title || "";
  const displayTitle = cleanInfoboxField(rec.name) || baseTitleFromPageTitle(pageTitle) || pageTitle;
  const hq = cleanParagraph(rec.headquarters, 200);
  const leaders = cleanParagraph(rec.leaders, 200);
  const parts = [];
  if (leaders) parts.push(`Led by: ${leaders}`);
  if (hq) parts.push(`Headquarters: ${hq}`);
  const summary = parts.join(". ") || `DC team: ${displayTitle}`;
  const isThin = !hq && !leaders && !rec.creators && !rec.first_appearance;
  if (isThin) stats.teams.needs_review++;

  return {
    slug: uniqueSlug(slugify(pageTitle)),
    display_title: displayTitle,
    page_type: "TEAM",
    summary,
    page_status: isThin ? "NEEDS_REVIEW" : "READY",
    universe: "DC",
    reality: (rec.universe || "").trim() || null,
    creators: cleanParagraph(rec.creators, 300) || null,
    first_appearance: cleanParagraph(rec.first_appearance, 150) || null,
  };
}

const CATEGORY_TO_PAGE_TYPE = {
  ITEM_OR_WEAPON: "ITEM",
  LOCATION_OR_HIDEOUT: "LOCATION",
  VEHICLE: "VEHICLE",
};

function buildLoreRow(rec) {
  const pageType = CATEGORY_TO_PAGE_TYPE[rec.category];
  if (!pageType) return null; // unknown category -- do not guess, skip and report
  if (pageType === "ITEM") stats.items.total++;
  else if (pageType === "LOCATION") stats.locations.total++;
  else if (pageType === "VEHICLE") stats.vehicles.total++;

  const pageTitle = rec.title || "";
  const displayTitle = cleanInfoboxField(rec.name) || baseTitleFromPageTitle(pageTitle) || pageTitle;
  const desc = cleanParagraph(rec.description, 600);
  const summary = desc || `DC ${pageType.toLowerCase()}: ${displayTitle}`;

  return {
    slug: uniqueSlug(slugify(pageTitle)),
    display_title: displayTitle,
    page_type: pageType,
    summary,
    page_status: desc ? "READY" : "NEEDS_REVIEW",
    universe: "DC",
    reality: (rec.universe || "").trim() || null,
    creators: cleanParagraph(rec.creators, 300) || null,
    first_appearance: cleanParagraph(rec.first_appearance, 150) || null,
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

// Seed the local slug registry with every slug already in ppcf_wiki_pages so
// this dump's collisions with already-loaded rows (Marvel or any other
// publisher run before this one) get numeric-suffixed instead of silently
// overwritten by the upsert's onConflict:'slug'.
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
  console.log(`Source dir: ${SOURCE_DIR}`);

  let supabase = null;
  if (LIVE) {
    console.log("\nConnecting to Supabase...");
    supabase = await getSupabaseClient();
    console.log("Fetching existing slugs to seed the collision registry...");
    await seedExistingSlugs(supabase);
  }

  const allRows = { characters: [], teams: [], items: [], locations: [], vehicles: [] };

  console.log("\nReading dc_characters.jsonl...");
  await readJsonl(path.join(SOURCE_DIR, FILES.characters), (rec) => {
    allRows.characters.push(buildCharacterRow(rec));
  });

  console.log("Reading dc_teams.jsonl...");
  await readJsonl(path.join(SOURCE_DIR, FILES.teams), (rec) => {
    allRows.teams.push(buildTeamRow(rec));
  });

  console.log("Reading dc_creators.jsonl (expected empty per current dump)...");
  await readJsonl(path.join(SOURCE_DIR, FILES.creators), () => {});

  console.log("Reading dc_lore_and_artifacts.jsonl...");
  let unknownCategories = 0;
  await readJsonl(path.join(SOURCE_DIR, FILES.lore), (rec) => {
    const row = buildLoreRow(rec);
    if (!row) {
      unknownCategories++;
      return;
    }
    if (row.page_type === "ITEM") allRows.items.push(row);
    else if (row.page_type === "LOCATION") allRows.locations.push(row);
    else if (row.page_type === "VEHICLE") allRows.vehicles.push(row);
  });
  if (unknownCategories > 0) {
    console.log(`  [warn] ${unknownCategories} lore/artifact records had an unrecognized category and were skipped`);
  }

  console.log("Reading dc_issues.jsonl (expected empty per current dump)...");
  await readJsonl(path.join(SOURCE_DIR, FILES.issues), () => {});

  const totalRows =
    allRows.characters.length +
    allRows.teams.length +
    allRows.items.length +
    allRows.locations.length +
    allRows.vehicles.length;

  console.log("\n=== Real source record counts (parsed) ===");
  console.log(`  CHARACTER: ${allRows.characters.length}`);
  console.log(`  TEAM:      ${allRows.teams.length}`);
  console.log(`  ITEM:      ${allRows.items.length}`);
  console.log(`  LOCATION:  ${allRows.locations.length}`);
  console.log(`  VEHICLE:   ${allRows.vehicles.length}`);
  console.log(`  TOTAL:     ${totalRows}`);

  console.log("\n=== Data-quality stats ===");
  console.log(
    `  characters: alias_used=${stats.characters.alias_used} name_fallback=${stats.characters.name_fallback} title_fallback=${stats.characters.title_fallback} needs_review=${stats.characters.needs_review}`
  );
  console.log(`  teams needs_review: ${stats.teams.needs_review}`);

  const dupSlugs = [...slugCounts.values()].filter((c) => c > 1).length;
  console.log(`\nSlug collisions resolved with numeric suffixes: ${dupSlugs}`);

  if (!LIVE) {
    console.log("\nDry run complete. No data was written. Re-run with --live to upsert into Supabase.");
    return;
  }

  const results = {};
  for (const [label, key] of [
    ["CHARACTER", "characters"],
    ["TEAM", "teams"],
    ["ITEM", "items"],
    ["LOCATION", "locations"],
    ["VEHICLE", "vehicles"],
  ]) {
    console.log(`\nUpserting ${label} (${allRows[key].length} rows)...`);
    results[label] = await upsertBatches(allRows[key], label, supabase);
  }

  console.log("\n=== LIVE ingestion results ===");
  let totalInserted = 0;
  let totalFailed = 0;
  for (const [label, r] of Object.entries(results)) {
    console.log(`  ${label}: inserted=${r.inserted} failed=${r.failed}`);
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
