import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const requireModule = createRequire(import.meta.url);

export interface ComicBaseData {
  "CB - ID"?: string;
  "CB - Price"?: string;
  "CB - Cover Price"?: string;
  "CB - Value Year 1"?: string;
  "CB - Value Year 2"?: string;
  "CB - Value Year 3"?: string;
  "CB - Value Year 4"?: string;
  "CB - Condition"?: string;
  "CB - Top Grade"?: string;
  "CB - Number Graded"?: number;
  [key: string]: any;
}

export interface ComicBaseRecord {
  cbId: string;
  series: string;
  issueNumber: string;
  publisher?: string | null;
  publicationDate?: string | null;
  year?: number | null;
  price?: number | null;
  coverPrice?: number | null;
  val2021?: number | null;
  val2022?: number | null;
  val2023?: number | null;
  val2024?: number | null;
  condition?: string | null;
  topGrade?: string | null;
  comicbaseData: ComicBaseData;
}

let dbInstance: any = null;
let dbChecked = false;

function getComicBaseDb(): any | null {
  if (dbChecked) return dbInstance;
  dbChecked = true;

  const candidatePaths = [
    path.join(process.cwd(), "data", "comicbase.sqlite"),
    path.join(process.cwd(), "panel-profits", "data", "comicbase.sqlite"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const { DatabaseSync } = requireModule("node:sqlite");
        dbInstance = new DatabaseSync(p, { readOnly: true });
        return dbInstance;
      } catch (_) {}
    }
  }

  return null;
}

function cleanSeriesName(name: string): string {
  let s = (name || "").replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  if (s.startsWith("the ")) s = s.slice(4).trim();
  return s;
}

const memoryCache = new Map<string, ComicBaseRecord | null>();

/**
 * Resolves authentic ComicBase 4-year valuation history and condition grades
 * directly from data/comicbase.sqlite (1.258 million records).
 */
export function resolveComicBaseRecord(
  series?: string | null,
  issueNumber?: string | number | null,
  year?: number | null,
  upc?: string | null
): ComicBaseRecord | null {
  if (!series || !issueNumber) return null;

  const cleanSeries = cleanSeriesName(series);
  const cleanIssue = String(issueNumber).trim().replace(/^#/, "");
  const cacheKey = `${cleanSeries}:${cleanIssue}:${year || "any"}:${upc || "none"}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || null;
  }

  const db = getComicBaseDb();
  if (!db) {
    memoryCache.set(cacheKey, null);
    return null;
  }

  try {
    let row: any = null;

    // 1. Exact UPC match if available
    if (upc && upc.trim()) {
      row = db
        .prepare("SELECT * FROM comicbase_items WHERE upc = ? LIMIT 1")
        .get(upc.trim()) as any;
    }

    // 2. Series + Issue + Year match
    const altSeries = cleanSeries.endsWith(" comics") ? cleanSeries.replace(/\s+comics$/i, "") : null;

    if (!row && year) {
      if (altSeries) {
        row = db
          .prepare(
            `SELECT * FROM comicbase_items 
             WHERE (clean_series = ? OR clean_series = ?) AND issue_number = ? AND (year = ? OR year IS NULL)
             ORDER BY CASE WHEN year = ? THEN 0 ELSE 1 END, price DESC
             LIMIT 1`
          )
          .get(cleanSeries, altSeries, cleanIssue, year, year) as any;
      } else {
        row = db
          .prepare(
            `SELECT * FROM comicbase_items 
             WHERE clean_series = ? AND issue_number = ? AND (year = ? OR year IS NULL)
             ORDER BY CASE WHEN year = ? THEN 0 ELSE 1 END, price DESC
             LIMIT 1`
          )
          .get(cleanSeries, cleanIssue, year, year) as any;
      }
    }

    // 3. Fallback: Series + Issue match (closest year or best price)
    if (!row) {
      if (altSeries) {
        row = db
          .prepare(
            `SELECT * FROM comicbase_items 
             WHERE (clean_series = ? OR clean_series = ?) AND issue_number = ?
             ORDER BY price DESC
             LIMIT 1`
          )
          .get(cleanSeries, altSeries, cleanIssue) as any;
      } else {
        row = db
          .prepare(
            `SELECT * FROM comicbase_items 
             WHERE clean_series = ? AND issue_number = ?
             ORDER BY price DESC
             LIMIT 1`
          )
          .get(cleanSeries, cleanIssue) as any;
      }
    }

    if (!row) {
      memoryCache.set(cacheKey, null);
      return null;
    }

    const pubMatch = row.series?.match(/\(([^)]+)\)/);
    const resolvedPub = row.publisher || (pubMatch ? pubMatch[1] : null);

    const comicbaseData: ComicBaseData = {
      "CB - ID": row.cb_id,
      "CB - Price": row.price ? String(row.price) : undefined,
      "CB - Raw Price": row.price ? String(row.price) : undefined,
      "ComicBase - Grade RAW": row.price ? String(row.price) : undefined,
      "CB - Cover Price": row.cover_price ? String(row.cover_price) : undefined,
      "CB - Value Year 1": row.val_2021 ? String(row.val_2021) : undefined,
      "CB - Value Year 2": row.val_2022 ? String(row.val_2022) : undefined,
      "CB - Value Year 3": row.val_2023 ? String(row.val_2023) : undefined,
      "CB - Value Year 4": row.val_2024 ? String(row.val_2024) : undefined,
      "CB - Condition": row.condition || "NM",
      "CB - Top Grade": row.top_grade || undefined,
      "CB - Number Graded": row.number_graded || 0,
      pub_date: row.publication_date || undefined,
    };

    const record: ComicBaseRecord = {
      cbId: row.cb_id,
      series: row.series,
      issueNumber: row.issue_number,
      publisher: resolvedPub,
      publicationDate: row.publication_date,
      year: row.year,
      price: row.price,
      coverPrice: row.cover_price,
      val2021: row.val_2021,
      val2022: row.val_2022,
      val2023: row.val_2023,
      val2024: row.val_2024,
      condition: row.condition,
      topGrade: row.top_grade,
      comicbaseData,
    };

    memoryCache.set(cacheKey, record);
    return record;
  } catch (err) {
    console.warn("ComicBase SQLite query failed:", err);
    memoryCache.set(cacheKey, null);
    return null;
  }
}
