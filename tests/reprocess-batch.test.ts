import { test } from "vitest";
import { createAdminServerClient } from "../lib/supabase/admin";
import { processNewsIngestion } from "../lib/news/feed";

test("reprocess live news stories through grounded ingestion pipeline", async () => {
  const db = createAdminServerClient();
  const { data, error } = await db
    .from("pp_news_stories")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(30);

  if (error || !data) {
    console.error("Error fetching stories for reprocessing:", error);
    return;
  }

  console.log(`\n======================================================`);
  console.log(`REPROCESSING ${data.length} ACTIVE DATABASE STORIES`);
  console.log(`======================================================\n`);

  let processedCount = 0;
  let successCount = 0;

  for (const row of data) {
    processedCount += 1;
    console.log(`[${processedCount}/${data.length}] Ingesting: "${row.headline}" (${row.id})...`);
    const success = await processNewsIngestion(row);
    if (success) {
      successCount += 1;
      console.log(`   └─ SUCCESS: Updated story ${row.id}`);
    } else {
      console.log(`   └─ REJECTED: Story ${row.id} failed audit gate.`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`REPROCESSING COMPLETE: ${successCount}/${processedCount} STORIES RE-GROUNDED AND PERSISTED`);
  console.log(`======================================================\n`);
}, 120000);
