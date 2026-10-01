import { executeMasterNewsIngestion } from "../lib/news/ingestion-engine";
import { createAdminServerClient } from "../lib/supabase/admin";

async function main() {
  console.log("=== Starting Master Comic Intelligence Ingestion ===");
  const t0 = Date.now();

  const result = await executeMasterNewsIngestion(16);
  const duration = ((Date.now() - t0) / 1000).toFixed(2);

  console.log(`\n=== Ingestion Completed in ${duration}s ===`);
  console.log(`Total Stories Ingested/Updated: ${result.totalIngested}`);
  console.log(`Errors: ${result.totalErrors}`);
  console.log("\nSource Breakdown:");
  console.log(`- YouTube Video Essays & Retrospectives: ${result.breakdown.videoCount}`);
  console.log(`- News Wire APIs (NewsData, Perigon, etc.): ${result.breakdown.wireCount}`);
  console.log(`- Dedicated Comic Trade & Journalism: ${result.breakdown.tradeCount}`);
  console.log(`- Pro Creator Substacks & Newsletters: ${result.breakdown.creatorCount}`);
  console.log(`- Secondary Market & Valuation Trackers: ${result.breakdown.marketCount}`);

  // Inspect database count and sample
  const db = createAdminServerClient();
  const { count } = await db.from("pp_news_stories").select("*", { count: "exact", head: true });
  console.log(`\nTotal verified stories now in pp_news_stories: ${count}`);

  const { data: sample } = await db
    .from("pp_news_stories")
    .select("source,category,headline,published_at")
    .order("published_at", { ascending: false })
    .limit(8);

  console.log("\nFresh Ingested Story Sample:");
  for (const s of sample || []) {
    console.log(`[${s.source}] (${s.category}) ${s.headline} | ${s.published_at}`);
  }
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
