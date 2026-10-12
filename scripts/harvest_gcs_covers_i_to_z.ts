import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

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
  console.error("[GCS Harvester] Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function harvestLetter(letter: string) {
  const prefix = `Pictures/${letter}/`;
  let marker = "";
  let totalKeys = 0;
  let page = 0;
  const t0 = performance.now();

  console.log(`[Harvester] Starting letter ${letter} (${prefix})...`);

  while (true) {
    page++;
    let url = `https://storage.googleapis.com/panel-profits-covers-all/?prefix=${encodeURIComponent(prefix)}&max-keys=1000`;
    if (marker) url += `&marker=${encodeURIComponent(marker)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Harvester] Letter ${letter} page ${page} returned HTTP ${res.status}`);
        break;
      }

      const text = await res.text();
      const matches = [...text.matchAll(/<Contents><Key>([^<]+)<\/Key><Generation>(\d+)<\/Generation>.*?<Size>(\d+)<\/Size><\/Contents>/gs)];
      if (matches.length === 0) break;

      const rows = matches.map((m) => ({
        key: m[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'"),
        generation: m[2],
        size_bytes: parseInt(m[3], 10),
      }));

      const { error } = await supabase
        .from("gcs_cover_keys")
        .upsert(rows, { onConflict: "key", ignoreDuplicates: true });

      if (error) {
        console.warn(`[Harvester] Insert warning for ${letter} p${page}:`, error.message);
      }

      totalKeys += rows.length;
      if (page % 10 === 0) {
        console.log(`[Harvester] Letter ${letter}: ${totalKeys.toLocaleString()} keys indexed (page ${page})...`);
      }

      const isTruncated = text.includes("<IsTruncated>true</IsTruncated>");
      if (!isTruncated) break;

      const nextMarkerMatch = text.match(/<NextMarker>([^<]+)<\/NextMarker>/);
      marker = nextMarkerMatch ? nextMarkerMatch[1] : rows[rows.length - 1].key;
    } catch (err: any) {
      console.error(`[Harvester] Exception on ${letter} page ${page}:`, err.message);
      break;
    }
  }

  const elapsedSec = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`✓ [Harvester] Letter ${letter} complete: ${totalKeys.toLocaleString()} keys in ${elapsedSec}s`);
  return totalKeys;
}

async function main() {
  const letters = ["J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  console.log("=========================================================");
  console.log(`   GCS COVERS HARVESTER: Letters ${letters[0]} through ${letters[letters.length - 1]} `);
  console.log("=========================================================");

  let grandTotal = 0;
  for (const letter of letters) {
    const count = await harvestLetter(letter);
    grandTotal += count;
  }

  console.log("=========================================================");
  console.log(`✓ ALL LETTERS J-Z FINISHED: ${grandTotal.toLocaleString()} total keys added to gcs_cover_keys!`);
  console.log("=========================================================");
}

main().catch(console.error);
