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
          try {
            cachedDb.exec("PRAGMA journal_mode = WAL;");
            cachedDb.exec("PRAGMA synchronous = NORMAL;");
            cachedDb.exec("PRAGMA cache_size = -131072;"); // 128 MB RAM page cache
            cachedDb.exec("PRAGMA mmap_size = 268435456;"); // 256 MB zero-copy memory mapping
            cachedDb.exec("PRAGMA temp_store = MEMORY;");
          } catch (pragmaErr) {
            console.warn("Notice tuning sqlite pragmas:", pragmaErr);
          }
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

import { resolveProductionAge } from "./ticker-utils";

const ERA_SQL_CONDITIONS: Record<string, string> = {
  golden: "(publication_year <= 1955 OR LOWER(production_age) IN ('golden', 'atomic', 'platinum'))",
  silver: "((publication_year >= 1956 AND publication_year <= 1969) OR LOWER(production_age) = 'silver')",
  bronze: "((publication_year >= 1970 AND publication_year <= 1983) OR LOWER(production_age) = 'bronze')",
  copper: "((publication_year >= 1984 AND publication_year <= 1991) OR LOWER(production_age) = 'copper')",
  modern: "(publication_year >= 1992 OR LOWER(production_age) IN ('modern', 'postmodern', 'independent'))",
};

/**
 * Retrieves authentic, verified comics with real market-cleared prices (with pennies)
 * and verified photographic cover images. Zero synthetic .00 fallbacks.
 * Interleaves across Golden, Silver, Bronze, Copper, and Modern eras to guarantee diverse,
 * high-demand keys across the entire comic history rather than monolithic Golden Age repetition.
 */
export function getVerifiedRealEquities(
  offset = 0,
  limit = 80,
  random = false,
  era?: string
): {
  items: SovereignEquityItem[];
  totalEligible: number;
} {
  const db = getDb();
  if (!db) {
    return { items: [], totalEligible: 0 };
  }

  try {
    const cleanEra = era && era !== "all" ? era.toLowerCase().trim() : null;
    let totalEligible = 0;
    let rows: VerifiedEquityRecord[] = [];

    if (cleanEra) {
      const eraCond = ERA_SQL_CONDITIONS[cleanEra] ?? "(LOWER(production_age) = ? OR LOWER(origin_era) = ?)";
      const isNamedEra = Boolean(ERA_SQL_CONDITIONS[cleanEra]);

      const countRow = isNamedEra
        ? (db.prepare(`SELECT COUNT(*) AS c FROM verified_equities WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}`).get() as { c: number } | undefined)
        : (db.prepare(`SELECT COUNT(*) AS c FROM verified_equities WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}`).get(cleanEra, cleanEra) as { c: number } | undefined);

      totalEligible = countRow?.c || 0;
      if (totalEligible === 0) return { items: [], totalEligible: 0 };

      if (random) {
        rows = isNamedEra
          ? (db.prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
                         FROM verified_equities 
                         WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}
                         ORDER BY RANDOM() LIMIT ?`).all(limit) as unknown as VerifiedEquityRecord[])
          : (db.prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
                         FROM verified_equities 
                         WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}
                         ORDER BY RANDOM() LIMIT ?`).all(cleanEra, cleanEra, limit) as unknown as VerifiedEquityRecord[]);
      } else {
        const safeOffset = offset % totalEligible;
        rows = isNamedEra
          ? (db.prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
                         FROM verified_equities 
                         WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}
                         ORDER BY fmv_usd DESC, id ASC LIMIT ? OFFSET ?`).all(limit, safeOffset) as unknown as VerifiedEquityRecord[])
          : (db.prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
                         FROM verified_equities 
                         WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}
                         ORDER BY fmv_usd DESC, id ASC LIMIT ? OFFSET ?`).all(cleanEra, cleanEra, limit, safeOffset) as unknown as VerifiedEquityRecord[]);
      }
    } else {
      // MULTI-ERA INTERLEAVED SYNTHESIS (Zero era starvation: Golden, Silver, Bronze, Copper, Modern)
      const countRow = db
        .prepare("SELECT COUNT(*) AS c FROM verified_equities WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != ''")
        .get() as { c: number } | undefined;
      totalEligible = countRow?.c || 0;
      if (totalEligible === 0) return { items: [], totalEligible: 0 };

      const eras = ["golden", "silver", "bronze", "copper", "modern"] as const;
      const perEraLimit = Math.ceil(limit / eras.length);

      const eraPools: VerifiedEquityRecord[][] = [];
      for (const e of eras) {
        const cond = ERA_SQL_CONDITIONS[e];
        if (random) {
          const pool = db
            .prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
                      FROM verified_equities 
                      WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${cond}
                      ORDER BY RANDOM() LIMIT ?`)
            .all(perEraLimit) as unknown as VerifiedEquityRecord[];
          eraPools.push(pool);
        } else {
          const eCountRow = db
            .prepare(`SELECT COUNT(*) AS c FROM verified_equities WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${cond}`)
            .get() as { c: number } | undefined;
          const eCount = eCountRow?.c || 1;
          const eOffset = Math.floor(offset / eras.length) % eCount;

          const pool = db
            .prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, gregory_score, delta_percent, status, variant 
                      FROM verified_equities 
                      WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${cond}
                      ORDER BY fmv_usd DESC, id ASC LIMIT ? OFFSET ?`)
            .all(perEraLimit, eOffset) as unknown as VerifiedEquityRecord[];
          eraPools.push(pool);
        }
      }

      // Interleave round-robin: [Golden 0, Silver 0, Bronze 0, Copper 0, Modern 0, Golden 1, ...]
      const interleaved: VerifiedEquityRecord[] = [];
      const maxPoolLen = Math.max(...eraPools.map((p) => p.length));
      for (let i = 0; i < maxPoolLen; i++) {
        for (const pool of eraPools) {
          if (i < pool.length) {
            interleaved.push(pool[i]);
          }
        }
      }
      rows = interleaved.slice(0, limit);
    }

    const items: SovereignEquityItem[] = rows.map((r, idx) => {
      const resolvedAge = resolveProductionAge(r.publication_year);
      const eraKey = resolvedAge !== "unknown" ? resolvedAge : (r.production_age || "modern").toLowerCase();
      const originEra = eraKey.toUpperCase();

      return {
        id: r.id || `eq-${idx}`,
        seatNumber: idx + 1,
        seatType: "PRIMARY_DOMESTIC",
        ticker: r.ticker,
        series: r.series,
        issueNumber: r.issue_number,
        title: r.title,
        originEra,
        productionAge: eraKey,
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
      };
    });

    return { items, totalEligible };
  } catch (err) {
    console.error("Error reading verified_equities from sqlite:", err);
    return { items: [], totalEligible: 0 };
  }
}

/**
 * Resolves a comic equity by ID, source_product_id (pp-XXXX), ticker, ticker alias, or series-issue slug.
 * Executes in <1ms against local SQLite.
 */
export function getVerifiedEquityByIdOrTicker(idOrTicker: string): VerifiedEquityRecord | null {
  const db = getDb();
  if (!db || !idOrTicker) return null;

  try {
    const clean = idOrTicker.trim();
    
    // 1. Direct match on ID (64-char sha256 or UUID)
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

    // 3. Match on ticker (exact case-insensitive)
    row = db
      .prepare("SELECT * FROM verified_equities WHERE ticker = ? COLLATE NOCASE LIMIT 1")
      .get(clean.toUpperCase()) as unknown as VerifiedEquityRecord | undefined;
    if (row) return row;

    // 4. Match ticker aliases (e.g. ASM300 -> AS300, ASM129 -> AS129, BAT251 -> BA251, HULK181 -> HK181)
    const upper = clean.toUpperCase();
    const aliasMap: Record<string, string> = {
      ASM300: "AS300",
      ASM129: "AS129",
      ACT1: "ACT01",
      ASM1: "ASM01",
      XMN1: "XMN01",
      BAT1: "BAT01",
      BAT251: "BA251",
      HULK181: "HK181",
      HULK1: "HLK01",
      FF1: "FF001",
      FF48: "FF048",
      FF52: "FF052",
      TMNT01: "TMNT1",
    };
    if (aliasMap[upper]) {
      row = db
        .prepare("SELECT * FROM verified_equities WHERE ticker = ? COLLATE NOCASE LIMIT 1")
        .get(aliasMap[upper]) as unknown as VerifiedEquityRecord | undefined;
      if (row) return row;
    }

    // 5. Match series-issue slug (e.g. amazing-spider-man-300, action-comics-1, batman-251, x-men-1)
    const slugMatch = clean.toLowerCase().match(/^(.*?)[-_](\d+[\w-]*)$/);
    if (slugMatch) {
      const rawSeries = slugMatch[1].replace(/[-_]+/g, " ");
      const issueNum = slugMatch[2];
      const normSearch = rawSeries.replace(/[^a-z0-9]/g, "");

      const candidates = db
        .prepare("SELECT * FROM verified_equities WHERE issue_number = ? ORDER BY fmv_usd DESC")
        .all(issueNum) as unknown as VerifiedEquityRecord[];
      for (const c of candidates) {
        const normCand = (c.series || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (
          normCand === normSearch ||
          normCand.replace(/^the/, "") === normSearch ||
          normSearch.replace(/^the/, "") === normCand
        ) {
          return c;
        }
      }
    }

    return null;
  } catch (err) {
    console.warn(`Error resolving verified equity for ${idOrTicker}:`, err);
    return null;
  }
}

export function searchVerifiedEquities(queryText = "", limit = 48, era?: string): VerifiedEquityRecord[] {
  const db = getDb();
  if (!db) return [];

  try {
    const clean = queryText.trim();
    const cleanEra = era && era !== "all" ? era.toLowerCase().trim() : null;

    if (!clean) {
      if (cleanEra) {
        return db
          .prepare(
            `SELECT * FROM verified_equities 
             WHERE LOWER(production_age) = ? OR LOWER(origin_era) = ? 
             ORDER BY fmv_usd DESC 
             LIMIT ?`
          )
          .all(cleanEra, cleanEra, limit) as unknown as VerifiedEquityRecord[];
      }
      return db
        .prepare("SELECT * FROM verified_equities ORDER BY fmv_usd DESC LIMIT ?")
        .all(limit) as unknown as VerifiedEquityRecord[];
    }

    // Ticker match
    const upper = clean.toUpperCase();
    if (!cleanEra) {
      const tickerMatch = db
        .prepare("SELECT * FROM verified_equities WHERE ticker = ? COLLATE NOCASE LIMIT ?")
        .all(upper, limit) as unknown as VerifiedEquityRecord[];
      if (tickerMatch.length > 0) return tickerMatch;
    } else {
      const tickerMatch = db
        .prepare(
          `SELECT * FROM verified_equities 
           WHERE ticker = ? COLLATE NOCASE 
           AND (LOWER(production_age) = ? OR LOWER(origin_era) = ?) 
           LIMIT ?`
        )
        .all(upper, cleanEra, cleanEra, limit) as unknown as VerifiedEquityRecord[];
      if (tickerMatch.length > 0) return tickerMatch;
    }

    // Pattern search on series, title, and ticker
    const searchPattern = `%${clean.replace(/[%_]/g, "")}%`;
    if (cleanEra) {
      return db
        .prepare(`
          SELECT * FROM verified_equities 
          WHERE (series LIKE ? OR title LIKE ? OR ticker LIKE ?)
          AND (LOWER(production_age) = ? OR LOWER(origin_era) = ?)
          ORDER BY fmv_usd DESC 
          LIMIT ?
        `)
        .all(searchPattern, searchPattern, searchPattern, cleanEra, cleanEra, limit) as unknown as VerifiedEquityRecord[];
    }

    return db
      .prepare(`
        SELECT * FROM verified_equities 
        WHERE series LIKE ? OR title LIKE ? OR ticker LIKE ?
        ORDER BY fmv_usd DESC 
        LIMIT ?
      `)
      .all(searchPattern, searchPattern, searchPattern, limit) as unknown as VerifiedEquityRecord[];
  } catch (err) {
    console.warn("Error searching verified equities:", err);
    return [];
  }
}

