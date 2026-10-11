/**
 * link_supabase_storage_covers.ts
 * 
 * Links verified high-resolution Supabase Storage assets (from our 25,370 asset estate)
 * to their respective PostgreSQL comic entities where storage path was previously unlinked.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { DatabaseSync } from "node:sqlite";

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
  console.error("[Storage Linker] Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const sqlitePath = path.resolve(process.cwd(), "data", "pp115k.sqlite");
const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });

async function linkCovers() {
  console.log("=========================================================");
  console.log("   SUPABASE STORAGE COVER ENTITY LINKING ENGINE          ");
  console.log("=========================================================");

  const rows = sqlite.prepare(
    `SELECT series, issue_number, source_id, cover_url 
     FROM highres_covers 
     WHERE cover_url LIKE '%supabase.co%' AND source_id IS NOT NULL AND source_id != ''`
  ).all() as Array<{ series: string; issue_number: string; source_id: string; cover_url: string }>;

  console.log(`Loaded ${rows.length} verified Supabase Storage assets from highres_covers estate.`);

  const CHUNK_SIZE = 100;
  let totalChecked = 0;
  let totalLinked = 0;
  let alreadyLinked = 0;

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const sourceIds = chunk.map((r) => String(r.source_id));

    // Query matching books from PostgreSQL by pp_source_id
    const { data: dbComics, error } = await supabase
      .from("comics")
      .select("id, pp_source_id, cover_storage_path")
      .in("pp_source_id", sourceIds);

    if (error) {
      console.warn(`[Batch ${i}] Error:`, error.message);
      continue;
    }

    if (!dbComics || dbComics.length === 0) continue;

    const dbMap = new Map(dbComics.map((c) => [String(c.pp_source_id), c]));

    const updates = [];
    for (const item of chunk) {
      totalChecked++;
      const dbMatch = dbMap.get(String(item.source_id));
      if (!dbMatch) continue;

      if (!dbMatch.cover_storage_path || dbMatch.cover_storage_path.trim() === "") {
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
              .eq("id", dbMatch.id)
          );
          totalLinked++;
        }
      } else {
        alreadyLinked++;
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    if ((i + CHUNK_SIZE) % 1000 === 0 || i + CHUNK_SIZE >= rows.length) {
      console.log(`[Progress] Processed ${Math.min(i + CHUNK_SIZE, rows.length)} / ${rows.length} | Newly Linked: ${totalLinked} | Already Linked: ${alreadyLinked}`);
    }
  }

  console.log("\n=========================================================");
  console.log("               LINKING SUMMARY COMPLETE                  ");
  console.log("=========================================================");
  console.log(`Total Candidates Checked:   ${totalChecked}`);
  console.log(`Newly Linked to Storage:    ${totalLinked}`);
  console.log(`Already Properly Linked:    ${alreadyLinked}`);
  console.log("=========================================================\n");
}

linkCovers().catch((err) => {
  console.error("[FATAL ERROR]", err);
  process.exit(1);
});
