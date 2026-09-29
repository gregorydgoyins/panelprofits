/**
 * run_daily_wire_ingest.cjs
 *
 * Unified High-Volume News & Curated Syndication Engine.
 * Ingests from:
 * 1. 403 Curated & Industry RSS/Atom Channels
 * 2. 5 Multi-Wire APIs (NewsData, Perigon, TheNewsAPI, AskNews, NewsAPI)
 *
 * Evaluates editorial quality, deduplicates syndicated clone coverage,
 * and persists directly into Supabase public.pp_news_stories.
 */

const { execSync } = require('child_process');
const path = require('path');

async function runDailyIngestion() {
  console.log('=== STARTING HIGH-VOLUME UNIFIED WIRE & CURATED INGESTION ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  const projectRoot = path.resolve(__dirname, '..');
  try {
    execSync('npx tsx scripts/ingest_all_news.ts', {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env,
    });
  } catch (err) {
    console.error('Unified ingest execution failed:', err);
    process.exit(1);
  }
}

runDailyIngestion().catch((err) => {
  console.error('Fatal ingestion error:', err);
  process.exit(1);
});
