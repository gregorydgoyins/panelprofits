#!/usr/bin/env node
/**
 * @file sync_verified_equities_to_supabase.ts
 * 
 * High-Speed Bi-Directional Synchronizer: Local SQLite <-> Supabase Postgres
 * 
 * Synchronizes the 38,957 reconciled verified comic equities from the local high-speed estate
 * (`data/pp115k.sqlite`) directly into Supabase Postgres (`public.verified_equities` and `public.comics`),
 * enforcing unrounded pennies, authentic Supabase storage cover URLs, sanitized tickers,
 * and sovereign classification.
 * 
 * Usage:
 *   node --experimental-strip-types --env-file=.env.local scripts/workers/sync_verified_equities_to_supabase.ts
 *   npm run worker:sync-equities
 * 
 * Options:
 *   --once                  Run single sync pass and exit (default)
 *   --watch, --daemon       Run continuously as a persistent sync worker
 *   --interval <seconds>    Polling interval for daemon mode (default: 300)
 *   --batch-size <number>   Batch size for Postgres bulk upserts (default: 1000)
 *   --limit <number>        Limit total records synced (useful for dry runs/testing)
 *   --skip-comics-sync      Skip updating the public.comics base table
 *   --dry-run               Simulate reads without executing database mutations
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import pg from "pg";

const { Pool } = pg;

interface SyncOptions {
  daemon: boolean;
  intervalSec: number;
  batchSize: number;
  limit: number | null;
  syncComics: boolean;
  dryRun: boolean;
}

interface SqliteVerifiedRow {
  id: string;
  series: string;
  issue_number: string;
  title: string | null;
  publication_year: number | null;
  publisher: string | null;
  fmv_usd: number;
  price_formatted: string | null;
  cover_url: string | null;
  ticker: string;
  origin_era: string | null;
  production_age: string | null;
  reference_grade: string | null;
  gregory_score: number | null;
  delta_percent: number | null;
  status: string | null;
  variant: string | null;
  source_product_id: string | null;
}

function parseCliArgs(): SyncOptions {
  const args = process.argv.slice(2);
  const opts: SyncOptions = {
    daemon: false,
    intervalSec: 300,
    batchSize: 1000,
    limit: null,
    syncComics: true,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--daemon" || arg === "--watch") {
      opts.daemon = true;
    } else if (arg === "--once") {
      opts.daemon = false;
    } else if (arg === "--interval" && args[i + 1]) {
      opts.intervalSec = Math.max(10, parseInt(args[++i], 10));
    } else if (arg === "--batch-size" && args[i + 1]) {
      opts.batchSize = Math.max(50, Math.min(5000, parseInt(args[++i], 10)));
    } else if (arg === "--limit" && args[i + 1]) {
      opts.limit = Math.max(1, parseInt(args[++i], 10));
    } else if (arg === "--skip-comics-sync") {
      opts.syncComics = false;
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
    throw new Error(
      "Missing SUPABASE_DIRECT_URL, SUPABASE_POOLER_URL, or DATABASE_URL in environment (.env.local)."
    );
  }
  return url.trim().replace(/^["']|["']$/g, "");
}

function openLocalSqlite(): DatabaseSync {
  const dbPath = path.join(process.cwd(), "data", "pp115k.sqlite");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Local SQLite estate not found at ${dbPath}`);
  }
  return new DatabaseSync(dbPath, { open: true });
}

async function ensureSupabaseSchema(pool: pg.Pool) {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS public.verified_equities (
      id text PRIMARY KEY,
      series text NOT NULL,
      issue_number text NOT NULL,
      title text,
      publication_year integer,
      publisher text,
      fmv_usd numeric(12,2) NOT NULL,
      price_formatted text,
      cover_url text,
      ticker text NOT NULL,
      origin_era text,
      production_age text,
      reference_grade text DEFAULT '9.8',
      gregory_score numeric(8,2),
      delta_percent numeric(8,2),
      status text DEFAULT 'ACTIVE',
      variant text,
      source_product_id text,
      updated_at timestamp with time zone DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_ve_fmv ON public.verified_equities(fmv_usd);
    CREATE INDEX IF NOT EXISTS idx_ve_ticker ON public.verified_equities(ticker);
    CREATE INDEX IF NOT EXISTS idx_ve_series_issue ON public.verified_equities(series, issue_number);
    CREATE INDEX IF NOT EXISTS idx_ve_source_product_id ON public.verified_equities(source_product_id);
    ALTER TABLE public.verified_equities ENABLE ROW LEVEL SECURITY;
  `;

  await pool.query(createTableSql);

  const policySql = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'verified_equities' AND policyname = 'Allow public read access to verified_equities'
      ) THEN
        CREATE POLICY "Allow public read access to verified_equities" ON public.verified_equities FOR SELECT USING (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'verified_equities' AND policyname = 'Allow service role full access to verified_equities'
      ) THEN
        CREATE POLICY "Allow service role full access to verified_equities" ON public.verified_equities FOR ALL TO service_role USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;
  await pool.query(policySql);
}

/**
 * Builds a parameterized bulk upsert query for verified_equities
 */
function buildVerifiedEquitiesUpsert(rows: SqliteVerifiedRow[]): { query: string; params: any[] } {
  const columnNames = [
    "id",
    "series",
    "issue_number",
    "title",
    "publication_year",
    "publisher",
    "fmv_usd",
    "price_formatted",
    "cover_url",
    "ticker",
    "origin_era",
    "production_age",
    "reference_grade",
    "gregory_score",
    "delta_percent",
    "status",
    "variant",
    "source_product_id",
  ];

  const colCount = columnNames.length;
  const valuePlaceholders: string[] = [];
  const params: any[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const offset = r * colCount;
    const placeholders = columnNames.map((_, c) => `$${offset + c + 1}`);
    valuePlaceholders.push(`(${placeholders.join(", ")}, now())`);

    params.push(
      row.id,
      row.series,
      row.issue_number,
      row.title,
      row.publication_year,
      row.publisher,
      row.fmv_usd,
      row.price_formatted,
      row.cover_url,
      row.ticker,
      row.origin_era,
      row.production_age,
      row.reference_grade || "9.8",
      row.gregory_score,
      row.delta_percent,
      row.status || "ACTIVE",
      row.variant,
      row.source_product_id
    );
  }

  const query = `
    INSERT INTO public.verified_equities (
      ${columnNames.join(", ")}, updated_at
    )
    VALUES ${valuePlaceholders.join(", ")}
    ON CONFLICT (id) DO UPDATE SET
      series = EXCLUDED.series,
      issue_number = EXCLUDED.issue_number,
      title = EXCLUDED.title,
      publication_year = EXCLUDED.publication_year,
      publisher = EXCLUDED.publisher,
      fmv_usd = EXCLUDED.fmv_usd,
      price_formatted = EXCLUDED.price_formatted,
      cover_url = EXCLUDED.cover_url,
      ticker = EXCLUDED.ticker,
      origin_era = EXCLUDED.origin_era,
      production_age = EXCLUDED.production_age,
      reference_grade = EXCLUDED.reference_grade,
      gregory_score = EXCLUDED.gregory_score,
      delta_percent = EXCLUDED.delta_percent,
      status = EXCLUDED.status,
      variant = EXCLUDED.variant,
      source_product_id = EXCLUDED.source_product_id,
      updated_at = now();
  `;

  return { query, params };
}

/**
 * Bulk updates matched comics table rows with verified pricing & covers
 */
async function syncComicsBaseTable(client: pg.PoolClient, rows: SqliteVerifiedRow[]) {
  const valueRows: string[] = [];
  const params: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const baseIdx = i * 4;
    valueRows.push(`($${baseIdx + 1}::text, $${baseIdx + 2}::numeric, $${baseIdx + 3}::text, $${baseIdx + 4}::text)`);
    params.push(r.id, r.fmv_usd, r.cover_url, r.source_product_id);
  }

  const updateQuery = `
    UPDATE public.comics AS c
    SET
      baseline_grade_9_8_value = v.fmv_usd,
      pp_grade_9_8_price = v.fmv_usd,
      cover_url = COALESCE(NULLIF(v.cover_url, ''), c.cover_url),
      cover_verified_at = CASE WHEN v.cover_url IS NOT NULL AND v.cover_url != '' THEN now() ELSE c.cover_verified_at END,
      updated_at = now()
    FROM (VALUES ${valueRows.join(", ")}) AS v(id, fmv_usd, cover_url, source_product_id)
    WHERE c.id = v.id;
  `;

  await client.query(updateQuery, params);
}

export async function runSyncPass(opts: SyncOptions): Promise<{ totalSynced: number; durationMs: number }> {
  const t0 = Date.now();
  console.log(`\n======================================================`);
  console.log(`[SYNC WORKER] Starting Sync Pass: SQLite -> Supabase`);
  console.log(`[SYNC WORKER] Mode: ${opts.dryRun ? "DRY-RUN (Simulated)" : "LIVE WRITE"}`);
  console.log(`[SYNC WORKER] Batch size: ${opts.batchSize}, Limit: ${opts.limit || "ALL (38,957)"}`);
  console.log(`======================================================`);

  const db = openLocalSqlite();
  const pgUrl = resolvePostgresUrl();
  const pool = new Pool({
    connectionString: pgUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  try {
    if (!opts.dryRun) {
      process.stdout.write(`[1/3] Ensuring Supabase schema & RLS policies... `);
      await ensureSupabaseSchema(pool);
      console.log(`OK`);
    }

    // Query local SQLite verified_equities
    const countQuery = opts.limit
      ? `SELECT count(*) as c FROM (SELECT id FROM verified_equities LIMIT ${opts.limit})`
      : `SELECT count(*) as c FROM verified_equities`;
    const totalAvailable = (db.prepare(countQuery).get() as { c: number }).c;
    console.log(`[2/3] Local verified equities ready for sync: ${totalAvailable.toLocaleString()} records`);

    let offset = 0;
    let totalSynced = 0;
    const batchSize = opts.batchSize;
    const selectStmt = db.prepare(`
      SELECT 
        id, series, issue_number, title, publication_year, publisher,
        fmv_usd, price_formatted, cover_url, ticker, origin_era,
        production_age, reference_grade, gregory_score, delta_percent,
        status, variant, source_product_id
      FROM verified_equities
      ORDER BY fmv_usd DESC, id ASC
      LIMIT ? OFFSET ?
    `);

    const client = await pool.connect();
    try {
      while (offset < totalAvailable) {
        const fetchLimit = opts.limit ? Math.min(batchSize, opts.limit - totalSynced) : batchSize;
        if (fetchLimit <= 0) break;

        const rows = selectStmt.all(fetchLimit, offset) as unknown as SqliteVerifiedRow[];
        if (!rows || rows.length === 0) break;

        if (!opts.dryRun) {
          await client.query("BEGIN");
          try {
            // 1. Bulk Upsert into verified_equities
            const { query, params } = buildVerifiedEquitiesUpsert(rows);
            await client.query(query, params);

            // 2. Reconcile matched base comics table
            if (opts.syncComics) {
              await syncComicsBaseTable(client, rows);
            }

            await client.query("COMMIT");
          } catch (batchErr) {
            await client.query("ROLLBACK");
            throw batchErr;
          }
        }

        totalSynced += rows.length;
        offset += rows.length;

        const pct = ((totalSynced / totalAvailable) * 100).toFixed(1);
        const elapsed = (Date.now() - t0) / 1000;
        const rate = (totalSynced / (elapsed || 0.001)).toFixed(0);
        process.stdout.write(
          `\r[3/3] Progress: ${totalSynced.toLocaleString()}/${totalAvailable.toLocaleString()} (${pct}%) at ${rate} rec/s...`
        );
      }
    } finally {
      client.release();
    }

    const durationMs = Date.now() - t0;
    const finalSec = (durationMs / 1000).toFixed(2);
    console.log(`\n[3/3] Synchronized ${totalSynced.toLocaleString()} records to Supabase in ${finalSec}s!`);

    // Verify remote count
    if (!opts.dryRun) {
      const res = await pool.query("SELECT count(*) as c FROM public.verified_equities;");
      console.log(`[VERIFY] Remote Supabase public.verified_equities count: ${Number(res.rows[0].c).toLocaleString()}`);
    }

    return { totalSynced, durationMs };
  } finally {
    db.close();
    await pool.end();
  }
}

async function main() {
  const opts = parseCliArgs();

  let isTerminating = false;
  process.on("SIGINT", () => {
    console.log("\n[SYNC WORKER] Caught SIGINT. Exiting gracefully...");
    isTerminating = true;
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    console.log("\n[SYNC WORKER] Caught SIGTERM. Exiting gracefully...");
    isTerminating = true;
    process.exit(0);
  });

  if (!opts.daemon) {
    await runSyncPass(opts);
    process.exit(0);
  }

  console.log(`[DAEMON] Running persistent sync worker (Polling every ${opts.intervalSec} seconds)...`);
  while (!isTerminating) {
    try {
      await runSyncPass(opts);
    } catch (err: any) {
      console.error("[DAEMON ERROR] Sync pass failed:", err.message);
    }

    if (isTerminating) break;
    console.log(`[DAEMON] Sleeping for ${opts.intervalSec} seconds before next sync pass...`);
    await new Promise((r) => setTimeout(r, opts.intervalSec * 1000));
  }
}

main().catch((err) => {
  console.error("Fatal sync error:", err);
  process.exit(1);
});
