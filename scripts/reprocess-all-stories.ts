import { Client } from "pg";
import { generatePanelProfitsArticle, cleanScrapedText } from "../lib/news/generator";
import { AUTHOR_PERSONAS } from "../lib/news/authors";

const CONNECTION_STRING = process.env.SUPABASE_DIRECT_URL;

if (!CONNECTION_STRING) {
  console.error("Missing SUPABASE_DIRECT_URL in environment.");
  process.exit(1);
}

function cleanLegacyBoilerplate(text: string): string {
  if (!text) return "";
  let cleaned = text.trim();

  // If publication parameters marker exists, extract the middle pure source text
  const pubMatch = cleaned.match(/publication parameters:\s*([\s\S]*?)(?:Panel Profits analysts note|From a comic equity|Looking ahead,|$)/i);
  if (pubMatch && pubMatch[1].trim().length > 20) {
    cleaned = pubMatch[1].trim();
  } else {
    // Filter out any sentence or block with legacy boilerplate
    cleaned = cleaned
      .split(/(?<=[.!?])\s+|\n\n+/)
      .filter((s) => 
        !/Official industry reporting confirms|Recent distribution data|Industry solicitations|Publishing updates from|Media production reports|Independent creator publishing|According to verified reporting|Panel Profits analysts note|From a comic equity|When studio optioning|In terms of asset quality|Analyzing the broader market|Looking ahead, |Panel Profits will continue tracking|release parameters establish/i.test(s)
      )
      .join(" ")
      .trim();
  }
  return cleaned;
}

async function reprocessAllStories() {
  const client = new Client({ connectionString: CONNECTION_STRING });
  await client.connect();

  console.log("Connected to Supabase PostgreSQL database.");

  const { rows } = await client.query(`
    SELECT id, story_key, source, source_url, headline, summary, url, published_at 
    FROM public.pp_news_stories 
    ORDER BY published_at DESC NULLS LAST, ingested_at DESC;
  `);

  console.log(`Retrieved ${rows.length} total stories from pp_news_stories.`);

  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const strippedRaw = cleanLegacyBoilerplate(row.summary || "");

    // Generate clean, original, substantive article
    const generated = generatePanelProfitsArticle({
      storyKey: row.story_key || row.id,
      source: row.source,
      sourceUrl: row.source_url || row.url,
      headline: row.headline,
      rawSummary: strippedRaw,
      scrapedContent: null,
      publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    });

    const cleanSummary = generated.paragraphs.join("\n\n");
    const author = generated.assignedAuthorName;
    const cleanHeadline = cleanScrapedText(generated.headline);

    try {
      await client.query(
        `UPDATE public.pp_news_stories 
         SET headline = $1, summary = $2, author = $3 
         WHERE id = $4`,
        [cleanHeadline, cleanSummary, author, row.id]
      );
      updatedCount++;
      if ((i + 1) % 25 === 0 || i === rows.length - 1) {
        console.log(`[${i + 1}/${rows.length}] Updated story: "${cleanHeadline.slice(0, 50)}..." by ${author}`);
      }
    } catch (err: any) {
      console.error(`Error updating story ${row.id}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`REPROCESSING COMPLETE: ${updatedCount}/${rows.length} stories successfully cleansed & backfilled!`);
  console.log(`Errors: ${errorCount}`);
  console.log(`======================================================\n`);

  // Verify 0 Mad Lib sentences remain
  const check = await client.query(`
    SELECT count(*) 
    FROM public.pp_news_stories 
    WHERE summary ILIKE '%Panel Profits analysts note%' 
       OR summary ILIKE '%Recent distribution data%' 
       OR summary ILIKE '%Official industry reporting confirms%' 
       OR summary ILIKE '%Looking ahead, %';
  `);

  console.log(`Post-reprocessing Mad Lib boilerplate count in database: ${check.rows[0].count}`);

  await client.end();
}

reprocessAllStories().catch((err) => {
  console.error("Fatal error during reprocessing:", err);
  process.exit(1);
});
