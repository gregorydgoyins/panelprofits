#!/usr/bin/env node
/**
 * scripts/ingest_starwars_wiki.cjs
 *
 * Ingests the real, previously-unloaded Star Wars (Wookieepedia) dump
 * (starwars_characters.jsonl) into public.ppcf_wiki_pages, mirroring
 * scripts/ingest_marvel_wiki.cjs.
 *
 * The Star Wars source schema is NOT the same as Marvel's/DC's: each record
 * has {title, name, species, gender, homeworld, affiliation, creators,
 * continuity, image_file} -- there is no current_alias, origin, or
 * first_appearance field, and there are no separate teams/creators/lore
 * files (only publisher_dumps/starwars/starwars_characters.jsonl carries
 * real data; the marvel_*.jsonl files that also exist in that directory are
 * 0-byte leftovers from an unrelated run and are intentionally never read
 * by this script). So this script produces CHARACTER rows only.
 *
 * Connects the same way the rest of the codebase does: @supabase/supabase-js
 * with SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (falling back to SUPABASE_SERVICE_KEY), matching lib/supabase/admin.ts.
 * No credentials are hardcoded here; run with `node --env-file=.env.local`
 * (or any process that already has those vars exported) from the repo root.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest_starwars_wiki.cjs --dry-run [--source <dir>]
 *   node --env-file=.env.local scripts/ingest_starwars_wiki.cjs --live [--source <dir>] [--batch-size 500]
 *
 * --dry-run (default): parses and normalizes every real source record, computes
 *   exact row counts and data-quality stats, and validates slug uniqueness --
 *   but performs NO network access. Safe to run anywhere.
 * --live: performs the real batched upsert into Supabase. First fetches every
 *   slug already present in ppcf_wiki_pages (paginated) and seeds the local
 *   dedup registry with them -- verified necessary: 141 of this dump's slugs
 *   collide with the Dark-Horse-published Star Wars entries already carried
 *   in the indie manifest (e.g. Boba Fett, Kit Fisto, Luminara Unduli), and
 *   52 collide with Marvel-dump slugs. Without seeding, whichever script
 *   runs second would silently overwrite the other's distinct row via
 *   onConflict:'slug'. Requires network access to the project's Supabase host.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const args = process.argv.slice(2);
const LIVE = args.includes("--live");
const sourceArgIdx = args.indexOf("--source");
const sourceCandidates = [
  sourceArgIdx >= 0 && args[sourceArgIdx + 1] ? args[sourceArgIdx + 1] : null,
  process.env.STARWARS_DUMP_DIR,
  path.resolve(__dirname, "../../publisher_dumps/starwars"),
  path.join(process.env.HOME || "", "Documents/anti gravity panel profits/publisher_dumps/starwars"),
  path.join(process.env.HOME || "", "mnt/Documents/anti gravity panel profits/publisher_dumps/starwars"),
];
const SOURCE_DIR = sourceCandidates.find((dir) => dir && fs.existsSync(dir)) || path.resolve(__dirname, "../../publisher_dumps/starwars");
const batchArgIdx = args.indexOf("--batch-size");
const BATCH_SIZE =
  batchArgIdx >= 0 && args[batchArgIdx + 1] ? parseInt(args[batchArgIdx + 1], 10) : 500;

const FILES = {
  characters: "starwars_characters.jsonl",
};

// ---------------------------------------------------------------------------
// Cleaning helpers -- measured against the real dump:
//   - 70.9% of `homeworld` values carry leftover infobox key=value residue
//     from an adjacent field (frequently a birth-date leak, e.g. "|birth=3976
//     BBY"), not an actual homeworld.
//   - 57.9% of `affiliation` values are MediaWiki bullet lists
//     (e.g. "*Jedi Order **Jedi High Council **Lost Jedi *Galactic
//     Republic") -- this is real structured data, not corruption, and is
//     parsed into a flat "; "-joined list below.
//   - 0.7% of `name` values carry a literal "<br />" tag.
// ---------------------------------------------------------------------------

function stripHtml(raw) {
  return String(raw || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ");
}

function cleanName(raw, fallback) {
  const s = stripHtml(raw).replace(/\s+/g, " ").trim();
  return s || fallback || null;
}

const BBY_ABY_PATTERN = /\b\d{1,4}\s*(BBY|ABY)\b/i;

function cleanHomeworld(raw) {
  if (!raw) return null;
  let s = stripHtml(raw).trim();
  if (!s) return null;
  const pipeKv = s.match(/^\|\s*[A-Za-z ]+\s*=\s*(.*)$/);
  if (pipeKv) s = pipeKv[1].trim();
  if (s.startsWith("*")) s = s.replace(/^\*+/, "").trim();
  if (!s || s.includes("|") || s.includes("=") || s.length > 60) return null;
  if (BBY_ABY_PATTERN.test(s)) return null; // birth/death-date leak, not a place
  return s;
}

function cleanAffiliationList(raw, maxLen) {
  if (!raw) return "";
  let s = stripHtml(raw).trim();
  if (!s) return "";
  const pipeKv = s.match(/^\|\s*[A-Za-z ]+\s*=\s*(.*)$/);
  if (pipeKv) s = pipeKv[1].trim();
  if (s.includes("|") || s.includes("=")) return "";
  const parts = s
    .split("*")
    .map((x) => x.trim())
    .filter(Boolean);
  let out = parts.length ? parts.join("; ") : s;
  out = out.replace(/\s+/g, " ").trim();
  if (maxLen && out.length > maxLen) out = out.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
  return out;
}

function cleanParagraph(raw, maxLen) {
  if (!raw) return "";
  let s = stripHtml(raw);
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
// Row builder
// ---------------------------------------------------------------------------

const stats = {
  characters: {
    total: 0,
    homeworld_used: 0,
    homeworld_discarded_as_corrupt: 0,
    affiliation_used: 0,
    needs_review: 0,
    continuity: { Canon: 0, Legends: 0, other: 0 },
  },
};

function buildCharacterRow(rec) {
  stats.characters.total++;
  const pageTitle = rec.title || "";
  const base = baseTitleFromPageTitle(pageTitle);
  const displayTitle = cleanName(rec.name, base || pageTitle) || "Unknown Character";

  const homeworldRaw = rec.homeworld || "";
  const homeworld = cleanHomeworld(homeworldRaw);
  if (homeworld) stats.characters.homeworld_used++;
  else if (homeworldRaw.trim()) stats.characters.homeworld_discarded_as_corrupt++;

  const affiliation = cleanAffiliationList(rec.affiliation, 250);
  if (affiliation) stats.characters.affiliation_used++;

  const species = cleanParagraph(rec.species, 60);
  const gender = cleanParagraph(rec.gender, 30);

  const parts = [];
  if (species) parts.push(`Species: ${species}`);
  if (gender) parts.push(`Gender: ${gender}`);
  if (homeworld) parts.push(`Homeworld: ${homeworld}`);
  if (affiliation) parts.push(`Affiliation: ${affiliation}`);
  const summary = parts.length ? parts.join(". ") : `Star Wars character: ${displayTitle}`;
  const isThin = parts.length === 0;
  if (isThin) stats.characters.needs_review++;

  const continuity = (rec.continuity || "").trim();
  if (continuity === "Canon") stats.characters.continuity.Canon++;
  else if (continuity === "Legends") stats.characters.continuity.Legends++;
  else stats.characters.continuity.other++;

  return {
    slug: uniqueSlug(slugify(pageTitle)),
    display_title: displayTitle,
    page_type: "CHARACTER",
    summary,
    page_status: isThin ? "NEEDS_REVIEW" : "READY",
    universe: "STAR_WARS",
    // Star Wars has no Earth-616-style default reality; pass the source's own
    // Canon/Legends continuity value through untouched, or null if absent --
    // never fabricate one.
    reality: continuity || null,
    creators: cleanParagraph(rec.creators, 300) || null,
    first_appearance: null, // field does not exist in this source schema
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
  console.log(`Source dir: ${SOURCE_DIR}`);

  let supabase = null;
  if (LIVE) {
    console.log("\nConnecting to Supabase...");
    supabase = await getSupabaseClient();
    console.log("Fetching existing slugs to seed the collision registry...");
    await seedExistingSlugs(supabase);
  }

  const allRows = { characters: [] };

  console.log("\nReading starwars_characters.jsonl...");
  await readJsonl(path.join(SOURCE_DIR, FILES.characters), (rec) => {
    allRows.characters.push(buildCharacterRow(rec));
  });

  console.log("\n=== Real source record counts (parsed) ===");
  console.log(`  CHARACTER: ${allRows.characters.length}`);

  console.log("\n=== Data-quality stats ===");
  console.log(
    `  homeworld: used=${stats.characters.homeworld_used} discarded_as_corrupt=${stats.characters.homeworld_discarded_as_corrupt}`
  );
  console.log(`  affiliation used: ${stats.characters.affiliation_used}`);
  console.log(`  needs_review (no usable metadata at all): ${stats.characters.needs_review}`);
  console.log(
    `  continuity: Canon=${stats.characters.continuity.Canon} Legends=${stats.characters.continuity.Legends} other/empty=${stats.characters.continuity.other}`
  );

  const dupSlugs = [...slugCounts.values()].filter((c) => c > 1).length;
  console.log(`\nSlug collisions resolved with numeric suffixes: ${dupSlugs}`);

  if (!LIVE) {
    console.log("\nDry run complete. No data was written. Re-run with --live to upsert into Supabase.");
    return;
  }

  console.log(`\nUpserting CHARACTER (${allRows.characters.length} rows)...`);
  const result = await upsertBatches(allRows.characters, "CHARACTER", supabase);

  console.log("\n=== LIVE ingestion results ===");
  console.log(`  CHARACTER: inserted=${result.inserted} failed=${result.failed}`);

  if (result.failed > 0) {
    console.error("\nSome batches failed. This is NOT a complete ingestion -- see errors above.");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exitCode = 1;
});
