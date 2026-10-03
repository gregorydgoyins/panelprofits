import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import type { SovereignEquityItem } from "./canonical-equities";

export interface VerifiedEquityRecord {
  id: string;
  series: string;
  issue_number: string;
  title: string;
  publication_year: number;
  publisher: string;
  fmv_usd: number;
  price_formatted: string;
  cover_url: string;
  ticker: string;
  origin_era: string;
  production_age: string;
  reference_grade: string;
  gregory_score: number;
  delta_percent: number;
  status: string;
  variant: string | null;
  source_product_id?: string | null;
}

let cachedDb: any = null;
let sqliteAvailable: boolean | null = null;

function getDb(): any {
  if (cachedDb) return cachedDb;
  if (sqliteAvailable === false) return null;

  try {
    const require = createRequire(import.meta.url);
    const { DatabaseSync } = require("node:sqlite");
    sqliteAvailable = true;

    // Project-relative path resolution
    const dbPaths = [
      path.join(process.cwd(), "data", "pp115k.sqlite"),
      path.join(process.cwd(), "panel-profits", "data", "pp115k.sqlite"),
    ];

    for (const p of dbPaths) {
      if (fs.existsSync(p)) {
        try {
          cachedDb = new DatabaseSync(p);
          return cachedDb;
        } catch (err) {
          console.warn(`Failed to open sqlite db at ${p}:`, err);
        }
      }
    }
  } catch (err) {
    sqliteAvailable = false;
    console.warn("node:sqlite is not available in this runtime:", err);
  }
  return null;
}

/**
 * Retrieves authentic, verified comics with real market-cleared prices (with pennies)
 * and verified photographic cover images. Zero synthetic .00 fallbacks.
 */
export function getVerifiedRealEquities(offset = 0, limit = 80, random = false): {
  items: SovereignEquityItem[];
  totalEligible: number;
} {
  const db = getDb();
  if (!db) {
    return { items: [], totalEligible: 0 };
  }

  try {
    // Total count of verified comics meeting the $17.01 floor and strict cover gate
    const countRow = db
      .prepare(
        "SELECT COUNT(*) AS c FROM verified_equities WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != ''"
      )
      .get() as { c: number } | undefined;
    const totalEligible = countRow?.c || 0;

    if (totalEligible === 0) {
      return { items: [], totalEligible: 0 };
    }

    let rows: VerifiedEquityRecord[] = [];
    if (random) {
      // Randomized traversal across the full price spectrum ($17.01 to Max)
      rows = db
        .prepare(
          `SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
           FROM verified_equities 
           WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' 
           ORDER BY RANDOM() 
           LIMIT ?`
        )
        .all(limit) as unknown as VerifiedEquityRecord[];
    } else {
      // Cursor offset once-through traversal
      const safeOffset = offset % totalEligible;
      rows = db
        .prepare(
          `SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
           FROM verified_equities 
           WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' 
           ORDER BY id ASC 
           LIMIT ? OFFSET ?`
        )
        .all(limit, safeOffset) as unknown as VerifiedEquityRecord[];
    }

    const items: SovereignEquityItem[] = rows.map((r, idx) => ({
      id: r.id || `eq-${idx}`,
      seatNumber: idx + 1,
      seatType: "PRIMARY_DOMESTIC",
      ticker: r.ticker,
      series: r.series,
      issueNumber: r.issue_number,
      title: r.title,
      originEra: r.origin_era || "MODERN",
      productionAge: r.production_age || "modern",
      lineage: `${r.publisher} Landmark Constituent`,
      referenceGrade: r.reference_grade || "9.8",
      referenceFmvUsd: r.fmv_usd,
      priceFormatted: r.price_formatted,
      gregoryScore: r.gregory_score || 192.5,
      deltaPercent: r.delta_percent || 0.45,
      status: r.status || "ACTIVE",
      coverUrl: r.cover_url,
      canonicalIssueId: r.id,
      year: r.publication_year,
      publisher: r.publisher,
      variant: r.variant || null,
    }));

    return { items, totalEligible };
  } catch (err) {
    console.error("Error reading verified_equities from sqlite:", err);
    return { items: [], totalEligible: 0 };
  }
}

/**
 * Resolves a comic equity by ID, source_product_id (pp-XXXX), or ticker.
 * Executes in <1ms against local SQLite.
 */
export function getVerifiedEquityByIdOrTicker(idOrTicker: string): VerifiedEquityRecord | null {
  const db = getDb();
  if (!db || !idOrTicker) return null;

  try {
    const clean = idOrTicker.trim();
    
    // 1. Direct match on ID
    let row = db
      .prepare("SELECT * FROM verified_equities WHERE id = ? LIMIT 1")
      .get(clean) as unknown as VerifiedEquityRecord | undefined;
    if (row) return row;

    // 2. Match on pp-[source_product_id] or raw source_product_id
    if (/^pp-/i.test(clean) || /^\d+$/.test(clean)) {
      const numPart = clean.replace(/^pp-/i, "");
      row = db
        .prepare("SELECT * FROM verified_equities WHERE source_product_id = ? LIMIT 1")
        .get(numPart) as unknown as VerifiedEquityRecord | undefined;
      if (row) return row;
    }

    // 3. Match on ticker (case-insensitive)
    row = db
      .prepare("SELECT * FROM verified_equities WHERE ticker = ? COLLATE NOCASE LIMIT 1")
      .get(clean.toUpperCase()) as unknown as VerifiedEquityRecord | undefined;
    if (row) return row;

    return null;
  } catch (err) {
    console.warn(`Error resolving verified equity for ${idOrTicker}:`, err);
    return null;
  }
}

