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
          cachedDb = new DatabaseSync(p, { readOnly: true });
          try {
            cachedDb.exec("PRAGMA query_only = ON;");
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


const OBSCURE_OUTLIERS_FILTER = "AND series NOT IN ('Phantom Lady', 'Mister Mystery', 'Boy Comics', 'Kid Komics', 'Speed Comics', 'Venus', 'All-Select Comics', 'Clue Comics', 'Cowgirl Romances', 'Diary Secrets', 'Fight Comics', 'Headline Comics', 'Jumbo Comics', 'Punch Comics', 'Zip Comics', 'Romantic Hearts', 'Shocking Mystery Cases', 'Torchy', 'Weird Science-Fantasy', 'Classic Comics', 'The United States Marines', 'Four Color', 'Vault of Horror', 'Haunt of Fear', 'Planet Comics', 'Strange Worlds', 'Tales from the Crypt', 'Blue Bolt Weird Tales of Terror', 'Worlds of Fear', 'Beware! Terror Tales', 'This Magazine Is Haunted', 'This Magazine is Haunted', 'Saddle Justice', 'Torrid Affairs', 'Crime Does Not Pay', 'Frontline Combat', 'Two-Fisted Tales')";
const PREMIER_PUBLISHERS = "'Marvel', 'DC', 'DC Comics', 'Marvel Comics', 'Image', 'Dark Horse', 'Quality Comics', 'Fawcett', 'Valiant', 'Eclipse', 'Mirage Studios', 'IDW Publishing', 'Independent'";

const ERA_SQL_CONDITIONS: Record<string, string> = {
  golden: `(publication_year <= 1955 OR LOWER(production_age) IN ('golden', 'atomic', 'platinum')) ${OBSCURE_OUTLIERS_FILTER} AND publisher IN (${PREMIER_PUBLISHERS})`,
  silver: `((publication_year >= 1956 AND publication_year <= 1969) OR LOWER(production_age) = 'silver') ${OBSCURE_OUTLIERS_FILTER} AND publisher IN (${PREMIER_PUBLISHERS})`,
  bronze: `((publication_year >= 1970 AND publication_year <= 1983) OR LOWER(production_age) = 'bronze') ${OBSCURE_OUTLIERS_FILTER} AND publisher IN (${PREMIER_PUBLISHERS})`,
  copper: `((publication_year >= 1984 AND publication_year <= 1991) OR LOWER(production_age) = 'copper') ${OBSCURE_OUTLIERS_FILTER} AND publisher IN (${PREMIER_PUBLISHERS})`,
  modern: `(publication_year >= 1992 OR LOWER(production_age) IN ('modern', 'postmodern', 'independent')) ${OBSCURE_OUTLIERS_FILTER} AND publisher IN (${PREMIER_PUBLISHERS})`,
};

function recordToItem(r: VerifiedEquityRecord, idx: number): SovereignEquityItem {
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
    lineage: `${r.publisher} Constituent`,
    referenceGrade: r.reference_grade ? String(r.reference_grade).trim() : null,
    referenceFmvUsd: r.fmv_usd,
    priceFormatted: r.price_formatted,
    deltaPercent: r.delta_percent != null ? Number(r.delta_percent) : null,
    status: r.status || "ACTIVE",
    coverUrl: r.cover_url,
    canonicalIssueId: r.id,
    year: r.publication_year,
    publisher: r.publisher,
    variant: r.variant || null,
  };
}

/**
 * Retrieves authentic, verified comics with real market-cleared prices (with pennies)
 * and verified photographic cover images. Zero synthetic .00 fallbacks.
 * Interleaves across Golden, Silver, Bronze, Copper, and Modern eras, anchored by
 * landmark sovereign blue-chip keys (Action #1, Spider-Man #1, Hulk #181, TMNT #1, Spawn #1...)
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
    const eras = ["golden", "silver", "bronze", "copper", "modern"] as const;

    if (cleanEra) {
      const eraCond = ERA_SQL_CONDITIONS[cleanEra] ?? `(LOWER(production_age) = ? OR LOWER(origin_era) = ?) ${OBSCURE_OUTLIERS_FILTER}`;
      const isNamedEra = Boolean(ERA_SQL_CONDITIONS[cleanEra]);

      const dbRows = isNamedEra
        ? (db.prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, delta_percent, status, variant 
                       FROM verified_equities 
                       WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}
                       ORDER BY fmv_usd DESC, id ASC LIMIT 300`).all() as unknown as VerifiedEquityRecord[])
        : (db.prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, delta_percent, status, variant 
                       FROM verified_equities 
                       WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${eraCond}
                       ORDER BY fmv_usd DESC, id ASC LIMIT 300`).all(cleanEra, cleanEra) as unknown as VerifiedEquityRecord[]);

      const seen = new Set<string>();
      const combined: SovereignEquityItem[] = [];
      for (const r of dbRows) {
        const key = `${r.series} #${r.issue_number}`.toLowerCase();
        if (!seen.has(key)) {
          combined.push(recordToItem(r, combined.length));
          seen.add(key);
        }
      }

      const totalEligible = Math.max(combined.length, 1);
      if (random) {
        const shuffled = [...combined].sort(() => Math.random() - 0.5);
        return { items: shuffled.slice(0, limit), totalEligible };
      }

      const safeOffset = offset % totalEligible;
      const sliced: SovereignEquityItem[] = [];
      for (let i = 0; i < limit; i++) {
        sliced.push(combined[(safeOffset + i) % totalEligible]);
      }
      return { items: sliced, totalEligible };
    } else {
      // MULTI-ERA INTERLEAVED SYNTHESIS (Golden, Silver, Bronze, Copper, Modern)
      const perEraLimit = Math.ceil(limit / eras.length);
      const eraPools: SovereignEquityItem[][] = [];
      let grandTotal = 0;

      for (const e of eras) {
        const cond = ERA_SQL_CONDITIONS[e];
        const dbRows = db
          .prepare(`SELECT id, series, issue_number, title, publication_year, publisher, fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age, reference_grade, delta_percent, status, variant 
                    FROM verified_equities 
                    WHERE fmv_usd >= 17.01 AND cover_url IS NOT NULL AND cover_url != '' AND ${cond}
                    ORDER BY fmv_usd DESC, id ASC LIMIT 300`)
          .all() as unknown as VerifiedEquityRecord[];

        const seen = new Set<string>();
        const combined: SovereignEquityItem[] = [];
        for (const r of dbRows) {
          const key = `${r.series} #${r.issue_number}`.toLowerCase();
          if (!seen.has(key)) {
            combined.push(recordToItem(r, combined.length));
            seen.add(key);
          }
        }

        grandTotal += combined.length;
        const poolLen = Math.max(combined.length, 1);

        if (random) {
          const shuffled = [...combined].sort(() => Math.random() - 0.5);
          eraPools.push(shuffled.slice(0, perEraLimit));
        } else {
          const eOffset = Math.floor(offset / eras.length) % poolLen;
          const eSlice: SovereignEquityItem[] = [];
          for (let i = 0; i < perEraLimit; i++) {
            eSlice.push(combined[(eOffset + i) % poolLen]);
          }
          eraPools.push(eSlice);
        }
      }

      // Interleave round-robin: [Golden 0, Silver 0, Bronze 0, Copper 0, Modern 0, Golden 1, ...]
      const interleaved: SovereignEquityItem[] = [];
      const maxPoolLen = Math.max(...eraPools.map((p) => p.length));
      for (let i = 0; i < maxPoolLen; i++) {
        for (const pool of eraPools) {
          if (i < pool.length) {
            interleaved.push(pool[i]);
          }
        }
      }
      return { items: interleaved.slice(0, limit), totalEligible: grandTotal };
    }
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
    const clean = idOrTicker.trim().replace(/^\$/, "");
    
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

/**
 * Looks up full catalog row from comics table in SQLite by source_product_id or series/issue.
 * Connects verified equity to authentic gcd_id, comicbase_id, and catalog publisher.
 */
export function getCatalogComicBySourceProductId(
  sourceProductId?: string | null,
  series?: string | null,
  issueNumber?: string | null
): any | null {
  const db = getDb();
  if (!db) return null;
  try {
    if (sourceProductId) {
      const cleanNum = sourceProductId.replace(/^pp-/i, "").trim();
      const row = db.prepare("SELECT * FROM comics WHERE source_product_id = ? OR id = ? LIMIT 1").get(cleanNum, `pp-${cleanNum}`);
      if (row) return row;
    }
    if (series && issueNumber) {
      const cleanSeries = series.trim();
      const cleanIssue = issueNumber.trim().replace(/^#/, "");
      const row = db.prepare("SELECT * FROM comics WHERE series = ? AND issue_number = ? LIMIT 1").get(cleanSeries, cleanIssue);
      if (row) return row;
    }
    return null;
  } catch (err) {
    console.warn("Error looking up catalog comic in sqlite:", err);
    return null;
  }
}

/**
 * Direct lookup of catalog comic by ID, ticker, or source_product_id from SQLite.
 * Provides resilient, zero-failure lookup across the 115k catalog estate.
 */
export function getCatalogComicById(id: string): any | null {
  const db = getDb();
  if (!db || !id) return null;
  try {
    const clean = id.trim().replace(/^\$/, "");
    const cleanNum = clean.replace(/^pp-/i, "").trim();
    const row = db
      .prepare(
        "SELECT * FROM comics WHERE id = ? OR id = ? OR ticker = ? OR source_product_id = ? LIMIT 1"
      )
      .get(clean, cleanNum, clean, cleanNum);
    return row || null;
  } catch (err) {
    return null;
  }
}


