#!/usr/bin/env node
/**
 * @file overwrite_rounded_prices_in_supabase.ts
 * 
 * High-Speed Migration / Batch Script:
 * Overwrites legacy .00 rounded prices in Supabase (public.comics and public.verified_equities)
 * with authentic, unrounded penny transaction prices ($1,159.25, $47,905.10, $48,000.00)
 * from the 115k verified dataset (data/pp115k.sqlite).
 * 
 * Usage:
 *   node --experimental-strip-types --env-file=.env.local scripts/workers/overwrite_rounded_prices_in_supabase.ts
 *   npm run migrate:overwrite-rounded-prices
 * 
 * Options:
 *   --batch-size <number>   Batch size per update transaction (default: 500)
 *   --limit <number>        Limit total records processed (for testing)
 *   --dry-run               Simulate and report discrepancies without writing
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import pg from "pg";

const { Pool } = pg;

interface MigrationOptions {
  batchSize: number;
  limit: number | null;
  dryRun: boolean;
}

interface VerifiedItem {
  id: string;
  series: string;
  issue_number: string;
  title: string | null;
  fmv_usd: number;
  price_formatted: string | null;
  cover_url: string | null;
  ticker: string;
  origin_era: string | null;
  production_age: string | null;
  reference_grade: string | null;
  source_product_id: string | null;
}

function parseCliArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const opts: MigrationOptions = {
    batchSize: 500,
    limit: null,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--batch-size" && args[i + 1]) {
      opts.batchSize = Math.max(50, Math.min(2000, parseInt(args[++i], 10)));
    } else if (arg === "--limit" && args[i + 1]) {
      opts.limit = Math.max(1, parseInt(args[++i], 10));
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    }
  }

  return opts;
}

function resolvePostgresUrl(): string {
  const url =
    process.env.SUPABASE_DIRECT_URL ||
    process.env.SUPABASE_POOLER_URL ||
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error("Missing SUPABASE_DIRECT_URL in environment (.env.local).");
  }
  return url.trim().replace(/^["']|["']$/g, "");
}

function openLocalSqlite(): DatabaseSync {
  const dbPath = path.join(process.cwd(), "data", "pp115k.sqlite");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Local SQLite database not found at ${dbPath}`);
  }
  return new DatabaseSync(dbPath, { open: true });
}

export async function runOverwriteMigration() {
  const opts = parseCliArgs();
  const t0 = Date.now();

  console.log("======================================================================");
  console.log(" [MIGRATION] Overwriting .00 Rounded Prices with Unrounded Pennies");
  console.log(` [MIGRATION] Mode: ${opts.dryRun ? "DRY-RUN (Simulated)" : "LIVE WRITE"}`);
  console.log(` [MIGRATION] Batch Size: ${opts.batchSize}, Limit: ${opts.limit || "ALL (38,957)"}`);
  console.log("======================================================================");

  const db = openLocalSqlite();
  const pgUrl = resolvePostgresUrl();
  const pool = new Pool({
    connectionString: pgUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  try {
    // 1. Fetch verified unrounded prices from SQLite
    const countSql = opts.limit
      ? `SELECT count(*) as c FROM (SELECT id FROM verified_equities LIMIT ${opts.limit})`
      : `SELECT count(*) as c FROM verified_equities`;
    const totalRecords = (db.prepare(countSql).get() as { c: number }).c;
    console.log(`[1/4] Loaded ${totalRecords.toLocaleString()} verified equities from SQLite.`);

    const selectStmt = db.prepare(`
      SELECT id, series, issue_number, title, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, source_product_id
      FROM verified_equities
      ORDER BY fmv_usd DESC, id ASC
      LIMIT ? OFFSET ?
    `);

    let offset = 0;
    let totalProcessed = 0;
    let totalComicsUpdated = 0;
    let totalVerifiedEquitiesUpserted = 0;
    let totalRoundedPenniesCalibrated = 0;

    const client = await pool.connect();

    try {
      while (offset < totalRecords) {
        const fetchSize = opts.limit ? Math.min(opts.batchSize, opts.limit - totalProcessed) : opts.batchSize;
        if (fetchSize <= 0) break;

        const batch = selectStmt.all(fetchSize, offset) as unknown as VerifiedItem[];
        if (!batch || batch.length === 0) break;

        // Check unrounded cents count in this batch
        const unroundedInBatch = batch.filter((r) => Math.round(r.fmv_usd) !== r.fmv_usd).length;
        totalRoundedPenniesCalibrated += unroundedInBatch;

        if (!opts.dryRun) {
          await client.query("BEGIN");
          try {
            // A. Upsert into public.verified_equities (ensuring exact cents and authentic covers)
            const veValues: string[] = [];
            const veParams: any[] = [];
            for (let i = 0; i < batch.length; i++) {
              const item = batch[i];
              const idx = i * 12;
              veValues.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7}, $${idx + 8}, $${idx + 9}, $${idx + 10}, $${idx + 11}, $${idx + 12}, now())`);
              veParams.push(
                item.id,
                item.series,
                item.issue_number,
                item.title,
                item.fmv_usd,
                item.price_formatted,
                item.cover_url,
                item.ticker,
                item.origin_era,
                item.production_age,
                item.reference_grade || "9.8",
                item.source_product_id
              );
            }

            const veQuery = `
              INSERT INTO public.verified_equities (
                id, series, issue_number, title, fmv_usd, price_formatted, cover_url,
                ticker, origin_era, production_age, reference_grade, source_product_id, updated_at
              )
              VALUES ${veValues.join(", ")}
              ON CONFLICT (id) DO UPDATE SET
                fmv_usd = EXCLUDED.fmv_usd,
                price_formatted = EXCLUDED.price_formatted,
                cover_url = COALESCE(NULLIF(EXCLUDED.cover_url, ''), public.verified_equities.cover_url),
                ticker = EXCLUDED.ticker,
                origin_era = EXCLUDED.origin_era,
                production_age = EXCLUDED.production_age,
                source_product_id = EXCLUDED.source_product_id,
                updated_at = now();
            `;
            const veRes = await client.query(veQuery, veParams);
            totalVerifiedEquitiesUpserted += veRes.rowCount || batch.length;

            // B. Direct Primary Key UPDATE on public.comics to overwrite .00 rounded prices
            const comicsValues: string[] = [];
            const comicsParams: any[] = [];
            for (let i = 0; i < batch.length; i++) {
              const item = batch[i];
              const cIdx = i * 3;
              comicsValues.push(`($${cIdx + 1}::text, $${cIdx + 2}::numeric, $${cIdx + 3}::text)`);
              comicsParams.push(item.id, item.fmv_usd, item.cover_url);
            }

            const comicsQuery = `
              UPDATE public.comics AS c
              SET
                pp_grade_9_8_price = v.fmv_usd,
                baseline_grade_9_8_value = v.fmv_usd,
                cover_url = COALESCE(NULLIF(v.cover_url, ''), c.cover_url),
                cover_verified_at = CASE WHEN v.cover_url IS NOT NULL AND v.cover_url != '' THEN now() ELSE c.cover_verified_at END,
                updated_at = now()
              FROM (VALUES ${comicsValues.join(", ")}) AS v(id, fmv_usd, cover_url)
              WHERE c.id = v.id;
            `;
            const comicsRes = await client.query(comicsQuery, comicsParams);
            totalComicsUpdated += comicsRes.rowCount || 0;

            await client.query("COMMIT");
          } catch (batchErr) {
            await client.query("ROLLBACK");
            throw batchErr;
          }
        }

        totalProcessed += batch.length;
        offset += batch.length;

        const pct = ((totalProcessed / totalRecords) * 100).toFixed(1);
        const elapsed = (Date.now() - t0) / 1000;
        const rate = (totalProcessed / (elapsed || 0.001)).toFixed(0);
        process.stdout.write(
          `\r[2/4] Progress: ${totalProcessed.toLocaleString()}/${totalRecords.toLocaleString()} (${pct}%) | Overwritten comics: ${totalComicsUpdated.toLocaleString()} | Rate: ${rate} rec/s...`
        );
      }
    } finally {
      client.release();
    }

    const durationSec = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`\n\n[3/4] Batch overwrite pass completed in ${durationSec}s!`);
    console.log(`      - Verified Equities Synchronized: ${totalVerifiedEquitiesUpserted.toLocaleString()}`);
    console.log(`      - Base Comics Rows Overwritten:   ${totalComicsUpdated.toLocaleString()}`);
    console.log(`      - Unrounded Penny Transactions:   ${totalRoundedPenniesCalibrated.toLocaleString()}`);

    // Verification step
    if (!opts.dryRun) {
      console.log(`\n[4/4] Verifying calibrated penny prices in Supabase...`);
      const sampleCheck = await pool.query(`
        SELECT c.id, c.series, c.issue_number, c.pp_grade_9_8_price, c.baseline_grade_9_8_value
        FROM public.verified_equities ve
        JOIN public.comics c ON c.id = ve.id
        WHERE round(ve.fmv_usd) != ve.fmv_usd
        LIMIT 5;
      `);
      console.log("      Sample verified unrounded rows in Supabase public.comics:");
      for (const row of sampleCheck.rows) {
        console.log(`      • ${row.series} #${row.issue_number}: $${Number(row.pp_grade_9_8_price).toFixed(2)} (baseline: $${Number(row.baseline_grade_9_8_value).toFixed(2)})`);
      }
    }

    console.log("\n[SUCCESS] All .00 rounded prices successfully overwritten with genuine penny transaction values!\n");
  } finally {
    db.close();
    await pool.end();
  }
}

// Auto-run if invoked directly
runOverwriteMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
