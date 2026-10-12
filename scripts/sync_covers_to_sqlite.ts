import { createClient } from "@supabase/supabase-js";
import { DatabaseSync } from "node:sqlite";
import * as fs from "fs";
import * as path from "path";

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
  console.error("[Sync] Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const sqlitePath = path.resolve(process.cwd(), "data", "pp115k.sqlite");
if (!fs.existsSync(sqlitePath)) {
  console.error("[Sync] SQLite database not found at", sqlitePath);
  process.exit(1);
}

const sqlite = new DatabaseSync(sqlitePath);

// Ensure highres_covers table and index exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS highres_covers (
    series TEXT, 
    issue_number TEXT, 
    year INTEGER, 
    cover_url TEXT, 
    source_id TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_hr_covers ON highres_covers(series, issue_number);
  CREATE INDEX IF NOT EXISTS idx_hr_source ON highres_covers(source_id);
`);

const insertStmt = sqlite.prepare(`
  INSERT INTO highres_covers (series, issue_number, year, cover_url, source_id)
  VALUES (?, ?, ?, ?, ?)
`);

async function run() {
  console.log("=========================================================");
  console.log("     FAST STREAMING RAIL COVERS TO LOCAL SQLITE INDEX    ");
  console.log("=========================================================");
  console.log("Target Database:", sqlitePath);

  // Get total count of rail_books with valid covers
  const { count: totalCovers, error: countErr } = await supabase
    .from("rail_books")
    .select("*", { count: "exact", head: true })
    .not("cover_url", "is", null)
    .not("cover_url", "like", "%526.jpg%");

  if (countErr || !totalCovers) {
    console.error("[Sync] Failed to count rail_books:", countErr?.message);
    process.exit(1);
  }

  console.log(`Found ${totalCovers.toLocaleString()} authentic covers in rail_books to sync.`);

  const CHUNK_SIZE = 5000;
  let offset = 0;
  let inserted = 0;
  const t0 = performance.now();

  while (offset < totalCovers) {
    const { data, error } = await supabase
      .from("rail_books")
      .select("series, issue_number, year, cover_url, comics_id")
      .not("cover_url", "is", null)
      .not("cover_url", "like", "%526.jpg%")
      .range(offset, offset + CHUNK_SIZE - 1);

    if (error) {
      console.error(`[Sync] Error fetching chunk at offset ${offset}:`, error.message);
      break;
    }

    if (!data || data.length === 0) break;

    // Insert chunk into SQLite inside a single atomic transaction
    sqlite.exec("BEGIN TRANSACTION;");
    for (const row of data) {
      if (row.series && row.issue_number && row.cover_url) {
        insertStmt.run(
          String(row.series).trim(),
          String(row.issue_number).trim(),
          row.year || null,
          String(row.cover_url).trim(),
          row.comics_id || null
        );
        inserted++;
      }
    }
    sqlite.exec("COMMIT;");

    offset += data.length;

    if (offset % 25000 === 0 || offset >= totalCovers) {
      const elapsedSec = ((performance.now() - t0) / 1000).toFixed(1);
      const rate = Math.round(inserted / ((performance.now() - t0) / 1000));
      console.log(
        `  [SYNC PROGRESS] ${inserted.toLocaleString()} / ${totalCovers.toLocaleString()} covers indexed (${elapsedSec}s, ${rate} rows/sec)...`
      );
    }
  }

  const finalSec = ((performance.now() - t0) / 1000).toFixed(1);
  console.log("=========================================================");
  console.log(`✓ SYNC COMPLETE: ${inserted.toLocaleString()} authentic covers written to local SQLite index in ${finalSec}s!`);
  console.log("=========================================================");
}

run().catch((err) => {
  console.error("[FATAL ERROR]", err);
  process.exit(1);
});
