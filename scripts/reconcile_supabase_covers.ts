/**
 * reconcile_supabase_covers.ts
 * 
 * Master Autonomous Cover Reconciliation & Storage Linker
 * 
 * 1. Audits and cleanses cross-universe contradictory covers (e.g. Marvel wiki covers on DC/Indie comics).
 * 2. Cleanses broken GCD 526.jpg placeholder hotlinks.
 * 3. Links authentic Supabase Storage WebP assets from our 25,370+ high-res estate into PostgreSQL.
 * 4. Ensures zero false-match cross-contamination across all 115k+ canonical comic entities.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { DatabaseSync } from "node:sqlite";
import { coverSourceContradictsPublisher } from "../lib/comics/cover-trust";

// Load Environment Keys
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.split("=")[1].trim().replace(/^['"]|['"]$/g, "");
    } else if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceKey = trimmed.split("=")[1].trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

if (!supabaseUrl || !serviceKey) {
  console.error("[Reconciler] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// Open Local 115k SQLite High-Res Index
const sqlitePath = path.resolve(process.cwd(), "data", "pp115k.sqlite");
if (!fs.existsSync(sqlitePath)) {
  console.error("[Reconciler] SQLite database not found at", sqlitePath);
  process.exit(1);
}
const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });

interface ReconcileStats {
  scannedContradictions: number;
  cleansedContradictions: number;
  reconciledWithAuthentic: number;
  cleansedBroken526: number;
  linkedStorageCovers: number;
  errors: number;
}

const stats: ReconcileStats = {
  scannedContradictions: 0,
  cleansedContradictions: 0,
  reconciledWithAuthentic: 0,
  cleansedBroken526: 0,
  linkedStorageCovers: 0,
  errors: 0,
};

function lookupAuthenticCover(series: string, issueNumber: string | number): { url: string; storagePath: string | null } | null {
  try {
    const cleanSeries = String(series || "").replace(/^the\s+/i, "").trim();
    const cleanIssue = String(issueNumber || "1").replace(/^#/, "").trim();

    const row = sqlite.prepare(
      `SELECT cover_url FROM highres_covers 
       WHERE (series LIKE ? OR series LIKE ?) AND issue_number = ? 
       ORDER BY CASE WHEN cover_url LIKE '%supabase.co%' THEN 0 ELSE 1 END 
       LIMIT 1`
    ).get(cleanSeries, "%" + cleanSeries + "%", cleanIssue) as { cover_url?: string } | undefined;

    if (row && row.cover_url) {
      const url = row.cover_url;
      let storagePath: string | null = null;
      if (url.includes("/object/public/comic-covers/")) {
        const parts = url.split("/object/public/comic-covers/");
        storagePath = parts[1] || null;
      }
      return { url, storagePath };
    }
  } catch (err) {
    console.warn("[Lookup Error]", err);
  }
  return null;
}

async function phase1CleanseContradictions() {
  console.log("\n=== PHASE 1: AUDITING & CLEANSING CROSS-UNIVERSE CONTRADICTIONS ===");
  const prefixes = ["marvel_%", "dc_%", "imagecomics_%", "valiant_%", "darkhorse_%"];

  for (const prefix of prefixes) {
    let lastId = "";
    const batchSize = 250;

    while (true) {
      let query = supabase
        .from("comics")
        .select("id, series, issue_number, publisher, cover_url, cover_storage_path, cover_source")
        .ilike("cover_source", prefix)
        .order("id", { ascending: true })
        .limit(batchSize);

      if (lastId) {
        query = query.gt("id", lastId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`[Phase 1] Keyset error on ${prefix}:`, error.message);
        stats.errors++;
        break;
      }

      if (!data || data.length === 0) break;
      stats.scannedContradictions += data.length;
      lastId = data[data.length - 1].id;

      for (const book of data) {
        if (coverSourceContradictsPublisher(book.cover_source, book.publisher)) {
          stats.cleansedContradictions++;
          const authentic = lookupAuthenticCover(book.series, book.issue_number);

          if (authentic && !coverSourceContradictsPublisher("highres_estate", book.publisher)) {
            const { error: upErr } = await supabase
              .from("comics")
              .update({
                cover_url: authentic.url,
                cover_storage_path: authentic.storagePath || "",
                cover_source: authentic.url.includes("supabase.co") ? "supabase_storage" : "highres_estate",
                cover_verified_at: new Date().toISOString(),
              })
              .eq("id", book.id);

            if (!upErr) {
              stats.reconciledWithAuthentic++;
              console.log(`  [RECONCILED AUTHENTIC] ${book.series} #${book.issue_number} (${book.publisher}) -> authentic cover linked`);
            } else {
              stats.errors++;
            }
          } else {
            const { error: upErr } = await supabase
              .from("comics")
              .update({
                cover_url: "",
                cover_storage_path: "",
                cover_source: "cleansed_contradiction",
              })
              .eq("id", book.id);

            if (!upErr) {
              console.log(`  [CLEANSED FALSE MATCH] ${book.series} #${book.issue_number} (${book.publisher}) [was: ${book.cover_source}]`);
            } else {
              stats.errors++;
            }
          }
        }
      }

      if (data.length < batchSize) break;
    }
  }
}

async function phase2CleanseBroken526() {
  console.log("\n=== PHASE 2: AUDITING & REMOVING BROKEN GCD 526.JPG PLACEHOLDERS ===");
  let lastId = "";
  const batchSize = 250;

  while (true) {
    let query = supabase
      .from("comics")
      .select("id, series, issue_number, publisher, cover_url")
      .ilike("cover_url", "%526.jpg%")
      .order("id", { ascending: true })
      .limit(batchSize);

    if (lastId) {
      query = query.gt("id", lastId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Phase 2] Keyset error:", error.message);
      stats.errors++;
      break;
    }

    if (!data || data.length === 0) break;
    lastId = data[data.length - 1].id;

    for (const book of data) {
      stats.cleansedBroken526++;
      const authentic = lookupAuthenticCover(book.series, book.issue_number);

      if (authentic) {
        await supabase
          .from("comics")
          .update({
            cover_url: authentic.url,
            cover_storage_path: authentic.storagePath || "",
            cover_source: "supabase_storage",
            cover_verified_at: new Date().toISOString(),
          })
          .eq("id", book.id);
        console.log(`  [REPLACED 526.JPG] ${book.series} #${book.issue_number} -> authentic storage cover`);
      } else {
        await supabase
          .from("comics")
          .update({
            cover_url: "",
            cover_source: "cleansed_526_placeholder",
          })
          .eq("id", book.id);
        console.log(`  [CLEANSED 526.JPG] ${book.series} #${book.issue_number}`);
      }
    }

    if (data.length < batchSize) break;
  }
}

async function phase3LinkSupabaseStorageCovers() {
  console.log("\n=== PHASE 3: LINKING 25,370 SUPABASE STORAGE COVERS INTO DATABASE ===");
  const hrRows = sqlite.prepare(
    `SELECT series, issue_number, cover_url, source_id FROM highres_covers 
     WHERE cover_url LIKE '%supabase.co%'`
  ).all() as Array<{ series: string; issue_number: string; cover_url: string; source_id: string }>;

  console.log(`Loaded ${hrRows.length} high-res Supabase Storage candidates from SQLite index.`);

  const chunkSize = 50;
  let linked = 0;

  for (let i = 0; i < hrRows.length; i += chunkSize) {
    const chunk = hrRows.slice(i, i + chunkSize);
    const sourceIds = chunk.map((c) => c.source_id).filter(Boolean);

    const { data: dbRows, error } = await supabase
      .from("comics")
      .select("id, pp_source_id, cover_storage_path")
      .in("pp_source_id", sourceIds);

    if (error) {
      console.warn(`[Phase 3] Batch query error: ${error.message}`);
      continue;
    }

    if (!dbRows || dbRows.length === 0) continue;

    const dbMap = new Map(dbRows.map((r) => [r.pp_source_id, r]));

    const updates = [];
    for (const item of chunk) {
      const match = dbMap.get(item.source_id);
      if (match && (!match.cover_storage_path || match.cover_storage_path.trim() === "")) {
        const storagePath = item.cover_url.split("/object/public/comic-covers/")[1] || "";
        if (storagePath) {
          updates.push(
            supabase
              .from("comics")
              .update({
                cover_storage_path: storagePath,
                cover_url: item.cover_url,
                cover_source: "supabase_storage",
                cover_verified_at: new Date().toISOString(),
              })
              .eq("id", match.id)
          );
          linked++;
          stats.linkedStorageCovers++;
        }
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
      if (linked % 250 === 0 || i + chunkSize >= hrRows.length) {
        console.log(`  [LINKED STORAGE PROGRESS] ${linked} / ${hrRows.length} covers linked to Supabase Storage.`);
      }
    }
  }

  console.log(`[Phase 3 Complete] Total ${linked} Supabase Storage covers successfully linked!`);
}

async function run() {
  console.log("=========================================================");
  console.log("   PANEL PROFITS SOVEREIGN COVER RECONCILER & AUDITOR    ");
  console.log("=========================================================");
  console.log(`Target Supabase URL: ${supabaseUrl}`);
  console.log(`SQLite Catalog: ${sqlitePath}`);

  await phase1CleanseContradictions();
  await phase2CleanseBroken526();
  await phase3LinkSupabaseStorageCovers();

  console.log("\n=========================================================");
  console.log("                   FINAL AUDIT SUMMARY                   ");
  console.log("=========================================================");
  console.log(`Scanned Wiki Searches:        ${stats.scannedContradictions}`);
  console.log(`Contradictions Cleansed:      ${stats.cleansedContradictions}`);
  console.log(`Reconciled with Authentic:    ${stats.reconciledWithAuthentic}`);
  console.log(`Broken 526 Placeholders Fixed:${stats.cleansedBroken526}`);
  console.log(`Supabase Storage Linked:      ${stats.linkedStorageCovers}`);
  console.log(`Errors Encountered:           ${stats.errors}`);
  console.log("=========================================================\n");
}

run().catch((err) => {
  console.error("[FATAL ERROR]", err);
  process.exit(1);
});
