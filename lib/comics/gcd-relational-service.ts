import fs from "fs";
import path from "path";
import { createRequire } from "node:module";

const requireModule = createRequire(import.meta.url);

export interface GcdVariantItem {
  id: number;
  issueNumber: string;
  variantName: string;
  price: string;
  barcode: string;
  publicationDate: string;
  coverUrl?: string;
  catalogId?: string;
  coverArtist?: string;
}

export interface GcdForeignEditionItem {
  reprintId: number;
  targetIssueId: number;
  seriesName: string;
  country: string;
  language: string;
  publicationDate: string;
  issueNumber: string;
  publisherName?: string;
  notes?: string;
  isDomesticSpecial?: boolean;
}

export interface GcdCreatorCredit {
  role: string;
  name: string;
}

export interface GcdStoryItem {
  id: number;
  title: string;
  sequenceNumber: number;
  pageCount: number;
  characters: string;
  synopsis: string;
  credits: GcdCreatorCredit[];
}

export interface GcdRelationalData {
  baseIssueId: number;
  seriesName: string;
  issueNumber: string;
  publicationDate: string;
  variants: GcdVariantItem[];
  foreignEditions: GcdForeignEditionItem[];
  stories: GcdStoryItem[];
  issueCredits: GcdCreatorCredit[];
  allWriters: string[];
  allPencilers: string[];
  allInkers: string[];
  allColorists: string[];
  allLetterers: string[];
  allEditors: string[];
  allCoverArtists: string[];
}

const GCD_DB_PATH = "/Users/macuser/Downloads/gcd-full-As1Act/2026-09-15.db";

let dbInstance: any = null;
let isBundledDb = false;
let dbAvailable: boolean | null = null;
const memoryCache = new Map<string, GcdRelationalData | null>();

function getGcdDatabase(): any | null {
  if (dbAvailable === false) return null;
  if (dbInstance) return dbInstance;

  const { DatabaseSync } = requireModule("node:sqlite");

  try {
    // 1. Check if 6.3GB local GCD database exists
    if (fs.existsSync(GCD_DB_PATH)) {
      dbInstance = new DatabaseSync(GCD_DB_PATH, { readOnly: true });
      isBundledDb = false;
      dbAvailable = true;
      return dbInstance;
    }

    // 2. Fall back to bundled data/pp115k.sqlite (used in Vercel serverless production)
    const bundledPaths = [
      path.join(process.cwd(), "data", "pp115k.sqlite"),
      path.join(process.cwd(), "panel-profits", "data", "pp115k.sqlite"),
    ];

    for (const p of bundledPaths) {
      if (fs.existsSync(p)) {
        dbInstance = new DatabaseSync(p, { readOnly: true });
        isBundledDb = true;
        dbAvailable = true;
        return dbInstance;
      }
    }

    dbAvailable = false;
    return null;
  } catch (err) {
    console.warn("GCD SQLite connection unavailable:", err);
    dbAvailable = false;
    return null;
  }
}

/**
 * Resolves full GCD relational tree: all variant covers, foreign editions,
 * story sequences, and creator rolls for any comic issue.
 */
export async function getGcdRelationalData(
  gcdIssueId: string | number | null,
  seriesName?: string,
  issueNumber?: string
): Promise<GcdRelationalData | null> {
  const cacheKey = `${gcdIssueId || ""}_${(seriesName || "").toLowerCase()}_${issueNumber || ""}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || null;
  }

  const db = getGcdDatabase();
  if (!db) return null;

  try {
    let issue: any = null;
    let baseId = 0;

    if (isBundledDb) {
      // Bundled database mode (Vercel production)
      let numId = typeof gcdIssueId === "string" ? parseInt(gcdIssueId, 10) : (gcdIssueId || 0);

      if (!numId && seriesName && issueNumber) {
        const cleanSeries = seriesName.trim();
        const cleanIssue = issueNumber.trim().replace(/^#/, "");
        const comicRow = db
          .prepare("SELECT gcd_id FROM comics WHERE series LIKE ? AND issue_number = ? AND gcd_id IS NOT NULL LIMIT 1")
          .get(`%${cleanSeries}%`, cleanIssue) as any;
        if (comicRow && comicRow.gcd_id) numId = parseInt(comicRow.gcd_id, 10);
      }

      if (!numId) {
        memoryCache.set(cacheKey, null);
        return null;
      }

      // Find base issue if this is a variant
      const varLookup = db.prepare("SELECT base_issue_id FROM gcd_variants WHERE variant_issue_id = ?").get(numId) as any;
      baseId = varLookup?.base_issue_id || numId;

      const variantsRaw = db
        .prepare("SELECT variant_issue_id as id, number, publication_date, variant_name, price, barcode FROM gcd_variants WHERE base_issue_id = ? ORDER BY variant_issue_id ASC")
        .all(baseId) as any[];

      const foreignRaw = db
        .prepare("SELECT reprint_id, target_issue_id, number, series_name, country, language, publication_date FROM gcd_foreign_editions WHERE origin_issue_id = ? ORDER BY country ASC")
        .all(baseId) as any[];

      const variants: GcdVariantItem[] = variantsRaw.map((v) => ({
        id: v.id,
        issueNumber: String(v.number),
        variantName: v.variant_name || (v.id === baseId ? "Primary Direct / Regular Cover" : `Variant #${v.id}`),
        price: v.price || "",
        barcode: v.barcode || "",
        publicationDate: v.publication_date || "",
      }));

      const foreignEditions: GcdForeignEditionItem[] = foreignRaw.map((f) => ({
        reprintId: f.reprint_id,
        targetIssueId: f.target_issue_id,
        seriesName: f.series_name,
        country: f.country,
        language: f.language,
        publicationDate: f.publication_date,
        issueNumber: String(f.number),
        isDomesticSpecial: f.country === "United States",
      }));

      const result: GcdRelationalData = {
        baseIssueId: baseId,
        seriesName: seriesName || "",
        issueNumber: issueNumber || "",
        publicationDate: "",
        variants,
        foreignEditions,
        stories: [],
        issueCredits: [],
        allWriters: [],
        allPencilers: [],
        allInkers: [],
        allColorists: [],
        allLetterers: [],
        allEditors: [],
        allCoverArtists: [],
      };

      memoryCache.set(cacheKey, result);
      return result;
    }

    if (gcdIssueId) {
      const numId = typeof gcdIssueId === "string" ? parseInt(gcdIssueId, 10) : gcdIssueId;
      if (!isNaN(numId)) {
        issue = db
          .prepare(
            "SELECT id, series_id, number, publication_date, variant_of_id, variant_name, price, barcode FROM gcd_issue WHERE id = ?"
          )
          .get(numId);
      }
    }

    if (!issue && seriesName && issueNumber) {
      const cleanIssue = String(issueNumber).trim().replace(/^#/, "");
      
      // Extract target year if embedded in seriesName like "Absolute Batman (2024)"
      const mYear = seriesName.match(/\((\d{4})\)/);
      const targetYear = mYear ? parseInt(mYear[1], 10) : null;
      
      const cleanSeries = seriesName
        .replace(/\s*\(\d{4}\)/g, "")
        .replace(/\s*\([^)]*\)/g, "")
        .trim();
      const cleanSeriesNoThe = cleanSeries.toLowerCase().startsWith("the ")
        ? cleanSeries.slice(4).trim()
        : cleanSeries;
      const cleanSeriesWithThe = `The ${cleanSeriesNoThe}`;

      issue = db
        .prepare(
          `SELECT i.id, i.series_id, i.number, i.publication_date, i.variant_of_id, i.variant_name, i.price, i.barcode, s.name as series_name
           FROM gcd_issue i
           JOIN gcd_series s ON i.series_id = s.id
           JOIN stddata_country c ON s.country_id = c.id
           WHERE (s.name = ? COLLATE NOCASE OR s.name = ? COLLATE NOCASE OR s.name LIKE ? COLLATE NOCASE)
             AND i.number = ?
           ORDER BY
             CASE WHEN s.country_id = 225 THEN 0 ELSE 1 END,
             CASE WHEN ? IS NOT NULL AND s.year_began = ? THEN 0 ELSE 1 END,
             CASE WHEN s.name = ? COLLATE NOCASE OR s.name = ? COLLATE NOCASE THEN 0 ELSE 1 END,
             i.id ASC
           LIMIT 1`
        )
        .get(
          cleanSeriesNoThe,
          cleanSeriesWithThe,
          `${cleanSeriesNoThe}%`,
          cleanIssue,
          targetYear,
          targetYear,
          cleanSeriesNoThe,
          cleanSeriesWithThe
        );
    }

    if (!issue) {
      memoryCache.set(cacheKey, null);
      return null;
    }

    baseId = issue.variant_of_id || issue.id;

    // Get series details
    const seriesRow = db.prepare("SELECT name FROM gcd_series WHERE id = ?").get(issue.series_id) as any;
    const resolvedSeriesName = seriesRow?.name || seriesName || "";

    // 1. Get all published variants (cover variants, printings, foils)
    const variantsRaw = db
      .prepare(
        `SELECT id, number, publication_date, variant_name, price, barcode
         FROM gcd_issue
         WHERE variant_of_id = ? OR id = ?
         ORDER BY id ASC`
      )
      .all(baseId, baseId) as any[];

    // Fetch cover artists for these variants from sequence 0 credits
    const variantArtistsMap = new Map<number, string>();
    if (variantsRaw.length > 0) {
      try {
        const varIds = variantsRaw.map((v) => v.id);
        const placeholders = varIds.map(() => "?").join(",");
        const artistsRaw = db
          .prepare(
            `SELECT s.issue_id, c.gcd_official_name, ct.name as role
             FROM gcd_story s
             JOIN gcd_story_credit sc ON sc.story_id = s.id
             JOIN gcd_creator c ON sc.creator_id = c.id
             JOIN gcd_credit_type ct ON sc.credit_type_id = ct.id
             WHERE s.issue_id IN (${placeholders}) AND s.sequence_number = 0`
          )
          .all(...varIds) as any[];

        for (const a of artistsRaw) {
          const existing = variantArtistsMap.get(a.issue_id);
          if (!existing) {
            variantArtistsMap.set(a.issue_id, a.gcd_official_name);
          } else if (!existing.includes(a.gcd_official_name)) {
            variantArtistsMap.set(a.issue_id, `${existing}, ${a.gcd_official_name}`);
          }
        }
      } catch (creditErr) {
        console.warn("Cover artist extraction for variants skipped:", creditErr);
      }
    }

    const variants: GcdVariantItem[] = variantsRaw.map((v) => ({
      id: v.id,
      issueNumber: String(v.number),
      variantName: v.variant_name || (v.id === baseId ? "Primary Direct / Regular Cover" : `Variant #${v.id}`),
      price: v.price || "",
      barcode: v.barcode || "",
      publicationDate: v.publication_date || "",
      coverArtist: variantArtistsMap.get(v.id),
    }));

    // 2. Get all international & foreign editions linked via gcd_reprint (both direct issue origin & story-level origin)
    const foreignRaw = db
      .prepare(
        `SELECT r.id as reprint_id, ti.id as target_issue_id, ti.number, s.name as series_name,
                p.name as publisher_name, c.name as country, l.name as language,
                ti.publication_date, r.notes
         FROM gcd_reprint r
         JOIN gcd_issue ti ON r.target_issue_id = ti.id
         JOIN gcd_series s ON ti.series_id = s.id
         LEFT JOIN gcd_publisher p ON s.publisher_id = p.id
         JOIN stddata_country c ON s.country_id = c.id
         JOIN stddata_language l ON s.language_id = l.id
         WHERE r.origin_issue_id = ?

         UNION

         SELECT r.id as reprint_id, ti.id as target_issue_id, ti.number, s.name as series_name,
                p.name as publisher_name, c.name as country, l.name as language,
                ti.publication_date, r.notes
         FROM gcd_reprint r
         JOIN gcd_story ts ON r.target_id = ts.id
         JOIN gcd_issue ti ON ts.issue_id = ti.id
         JOIN gcd_series s ON ti.series_id = s.id
         LEFT JOIN gcd_publisher p ON s.publisher_id = p.id
         JOIN stddata_country c ON s.country_id = c.id
         JOIN stddata_language l ON s.language_id = l.id
         WHERE r.origin_id IN (SELECT id FROM gcd_story WHERE issue_id = ?)
         ORDER BY country ASC, publication_date ASC`
      )
      .all(baseId, baseId) as any[];

    // Deduplicate foreign editions by target_issue_id
    const seenForeign = new Set<number>();
    const foreignEditions: GcdForeignEditionItem[] = [];
    for (const f of foreignRaw) {
      if (!seenForeign.has(f.target_issue_id)) {
        seenForeign.add(f.target_issue_id);
        const isDomestic = f.country === "United States";
        foreignEditions.push({
          reprintId: f.reprint_id,
          targetIssueId: f.target_issue_id,
          seriesName: f.series_name,
          country: f.country,
          language: f.language,
          publicationDate: f.publication_date || "",
          issueNumber: String(f.number),
          publisherName: f.publisher_name || undefined,
          notes: f.notes ? String(f.notes).trim() : undefined,
          isDomesticSpecial: isDomestic,
        });
      }
    }

    // 3. Get story contents & synopses
    const storiesRaw = db
      .prepare(
        `SELECT id, title, feature, sequence_number, page_count, synopsis, characters
         FROM gcd_story
         WHERE issue_id = ?
         ORDER BY sequence_number ASC`
      )
      .all(baseId) as any[];

    const stories: GcdStoryItem[] = [];
    const writersSet = new Set<string>();
    const pencilersSet = new Set<string>();
    const inkersSet = new Set<string>();
    const coloristsSet = new Set<string>();
    const letterersSet = new Set<string>();
    const coverArtistsSet = new Set<string>();

    for (const s of storiesRaw) {
      const creditsRaw = db
        .prepare(
          `SELECT sc.id, ct.name as role, c.gcd_official_name as name
           FROM gcd_story_credit sc
           JOIN gcd_creator c ON sc.creator_id = c.id
           JOIN gcd_credit_type ct ON sc.credit_type_id = ct.id
           WHERE sc.story_id = ?`
        )
        .all(s.id) as any[];

      const storyCredits: GcdCreatorCredit[] = creditsRaw.map((cr) => {
        const role = String(cr.role || "").toLowerCase();
        const name = String(cr.name || "").trim();
        if (role.includes("script") || role.includes("writer")) writersSet.add(name);
        if (role.includes("pencil")) pencilersSet.add(name);
        if (role.includes("ink")) inkersSet.add(name);
        if (role.includes("color")) coloristsSet.add(name);
        if (role.includes("letter")) letterersSet.add(name);
        return { role: cr.role, name };
      });

      stories.push({
        id: s.id,
        title: s.title || (s.sequence_number === 0 ? "Cover Gallery" : `Sequence #${s.sequence_number}`),
        sequenceNumber: s.sequence_number,
        pageCount: Number(s.page_count) || 0,
        characters: s.characters || "",
        synopsis: s.synopsis || "",
        credits: storyCredits,
      });
    }

    // 4. Get issue-level credits (editors, cover artists)
    const issueCreditsRaw = db
      .prepare(
        `SELECT ic.id, ct.name as role, c.gcd_official_name as name
         FROM gcd_issue_credit ic
         JOIN gcd_creator c ON ic.creator_id = c.id
         JOIN gcd_credit_type ct ON ic.credit_type_id = ct.id
         WHERE ic.issue_id = ?`
      )
      .all(baseId) as any[];

    const editorsSet = new Set<string>();
    const issueCredits: GcdCreatorCredit[] = issueCreditsRaw.map((ic) => {
      const role = String(ic.role || "").toLowerCase();
      const name = String(ic.name || "").trim();
      if (role.includes("edit")) editorsSet.add(name);
      if (role.includes("cover") || role.includes("art")) coverArtistsSet.add(name);
      return { role: ic.role, name };
    });

    const result: GcdRelationalData = {
      baseIssueId: baseId,
      seriesName: resolvedSeriesName,
      issueNumber: String(issue.number),
      publicationDate: issue.publication_date || "",
      variants,
      foreignEditions,
      stories,
      issueCredits,
      allWriters: Array.from(writersSet),
      allPencilers: Array.from(pencilersSet),
      allInkers: Array.from(inkersSet),
      allColorists: Array.from(coloristsSet),
      allLetterers: Array.from(letterersSet),
      allEditors: Array.from(editorsSet),
      allCoverArtists: Array.from(coverArtistsSet),
    };

    memoryCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error("Error querying GCD relational database:", err);
    memoryCache.set(cacheKey, null);
    return null;
  }
}
