import path from "path";
import fs from "fs";

export interface WikiLookupResult {
  term: string;
  slug: string;
  category: string;
  definition: string;
  translation: string;
  type: "lexicon" | "character" | "creator" | "artifact" | "team" | "location";
  universe?: string;
  role?: string;
  creators?: string;
  firstAppearance?: string;
  comicExample?: string;
  canonicalFormula?: string;
  sourceDb: string;
  url: string;
}

// Database cache handles
let cbrDb: any = null;
let investopediaDb: any = null;
let marvelDb: any = null;
let dcDb: any = null;
let starwarsDb: any = null;

function resolveDbPath(relativePath: string): string | null {
  const candidates = [
    path.join(process.cwd(), relativePath),
    path.join(process.cwd(), "..", relativePath),
    path.join(__dirname, "..", "..", "..", relativePath),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return path.resolve(c);
    }
  }
  return null;
}

function getDatabase(dbName: "cbr" | "investopedia" | "marvel" | "dc" | "starwars"): any | null {
  if (typeof window !== "undefined") return null;

  try {
    const { DatabaseSync } = eval("require")("node:sqlite");

    if (dbName === "cbr") {
      if (cbrDb) return cbrDb;
      const p = resolveDbPath("financial_glossary_dump/cbr_market_lexicon.db");
      if (p) {
        cbrDb = new DatabaseSync(p, { readOnly: true });
        return cbrDb;
      }
    }

    if (dbName === "investopedia") {
      if (investopediaDb) return investopediaDb;
      const p = resolveDbPath("financial_glossary_dump/investopedia.db");
      if (p) {
        investopediaDb = new DatabaseSync(p, { readOnly: true });
        return investopediaDb;
      }
    }

    if (dbName === "marvel") {
      if (marvelDb) return marvelDb;
      const p = resolveDbPath("marvel_database_dump/marvel_database.db");
      if (p) {
        marvelDb = new DatabaseSync(p, { readOnly: true });
        return marvelDb;
      }
    }

    if (dbName === "dc") {
      if (dcDb) return dcDb;
      const p = resolveDbPath("dc_database_dump/dc_database.db");
      if (p) {
        dcDb = new DatabaseSync(p, { readOnly: true });
        return dcDb;
      }
    }

    if (dbName === "starwars") {
      if (starwarsDb) return starwarsDb;
      const p = resolveDbPath("publisher_dumps/starwars/starwars_database.db");
      if (p) {
        starwarsDb = new DatabaseSync(p, { readOnly: true });
        return starwarsDb;
      }
    }
  } catch (err) {
    console.warn(`[local-fandom-lookup] Failed initializing ${dbName} database:`, err);
  }

  return null;
}

/**
 * Look up comic market principles & financial definitions from CBR Lexicon (4,654 terms)
 */
export function lookupCbrLexicon(term: string): WikiLookupResult | null {
  const db = getDatabase("cbr");
  if (!db) return null;

  try {
    const cleanTerm = term.trim();
    const slug = cleanTerm.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Exact match by term or slug
    let stmt = db.prepare(`
      SELECT term, slug, category, investopedia_definition, panel_profits_translation, canonical_formula, comic_example
      FROM cbr_market_lexicon
      WHERE LOWER(term) = LOWER(?) OR slug = ?
      LIMIT 1
    `);
    let row = stmt.get(cleanTerm, slug) as any;

    if (!row) {
      // Partial prefix / LIKE match
      stmt = db.prepare(`
        SELECT term, slug, category, investopedia_definition, panel_profits_translation, canonical_formula, comic_example
        FROM cbr_market_lexicon
        WHERE term LIKE ? OR panel_profits_translation LIKE ?
        LIMIT 1
      `);
      row = stmt.get(`%${cleanTerm}%`, `%${cleanTerm}%`) as any;
    }

    if (row) {
      return {
        term: row.term,
        slug: row.slug || slug,
        category: row.category || "Equities & Market Mechanics",
        definition: row.investopedia_definition || "Core financial market principle.",
        translation: row.panel_profits_translation || "Sequential art underwriting application.",
        type: "lexicon",
        comicExample: row.comic_example || undefined,
        canonicalFormula: row.canonical_formula || undefined,
        sourceDb: "cbr_market_lexicon.db",
        url: `/lexicon?term=${encodeURIComponent(row.slug || slug)}`,
      };
    }
  } catch (err) {
    console.warn("[local-fandom-lookup] lookupCbrLexicon error:", err);
  }

  return null;
}

/**
 * Look up financial terms from Investopedia (4,642 terms)
 */
export function lookupInvestopedia(term: string): WikiLookupResult | null {
  const db = getDatabase("investopedia");
  if (!db) return null;

  try {
    const cleanTerm = term.trim();
    const slug = cleanTerm.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    let stmt = db.prepare(`
      SELECT title, slug, category, summary, key_takeaways
      FROM investopedia_terms
      WHERE LOWER(title) = LOWER(?) OR slug = ?
      LIMIT 1
    `);
    let row = stmt.get(cleanTerm, slug) as any;

    if (!row) {
      stmt = db.prepare(`
        SELECT title, slug, category, summary, key_takeaways
        FROM investopedia_terms
        WHERE title LIKE ?
        LIMIT 1
      `);
      row = stmt.get(`%${cleanTerm}%`) as any;
    }

    if (row) {
      return {
        term: row.title,
        slug: row.slug || slug,
        category: row.category || "Investopedia Financial Principle",
        definition: row.summary || "Investopedia market benchmark definition.",
        translation: `Key Takeaway: ${row.key_takeaways ? row.key_takeaways.slice(0, 180) : "Underwriting discipline anchor."}`,
        type: "lexicon",
        sourceDb: "investopedia.db",
        url: `/lexicon?term=${encodeURIComponent(row.slug || slug)}`,
      };
    }
  } catch (err) {
    console.warn("[local-fandom-lookup] lookupInvestopedia error:", err);
  }

  return null;
}

function cleanWikiText(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .replace(/^\|\s*(?:CurrentAlias|Aliases|Name)\s*=\s*/i, "")
    .replace(/\*+/g, "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
    .replace(/\{\{[^}]+\}\}/g, "")
    .split("\n")[0]
    .trim();
}

/**
 * Look up character, creator, item, or team in Marvel Database (130,000+ entities)
 */
export function lookupMarvelDatabase(name: string): WikiLookupResult | null {
  const db = getDatabase("marvel");
  if (!db) return null;

  try {
    const cleanName = name.trim();

    // 1. Check marvel_characters (103,802 rows) - Try exact match first
    let stmt = db.prepare(`
      SELECT page_title, name, current_alias, creators, first_appearance, universe, alignment
      FROM marvel_characters
      WHERE LOWER(page_title) = LOWER(?) 
         OR LOWER(page_title) = LOWER(?) 
         OR LOWER(name) = LOWER(?) 
         OR LOWER(current_alias) = LOWER(?)
      LIMIT 1
    `);
    let row = stmt.get(cleanName, `${cleanName} (earth-616)`, cleanName, cleanName) as any;

    if (!row) {
      stmt = db.prepare(`
        SELECT page_title, name, current_alias, creators, first_appearance, universe, alignment
        FROM marvel_characters
        WHERE LOWER(page_title) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?) OR LOWER(current_alias) LIKE LOWER(?)
        LIMIT 1
      `);
      row = stmt.get(`${cleanName} (%`, `${cleanName}%`, `${cleanName}%`) as any;
    }

    if (row) {
      const alias = cleanWikiText(row.current_alias);
      const rawName = cleanWikiText(row.name);
      const cleanTitle = row.page_title.split("(")[0].trim();
      const displayTitle = alias || rawName || cleanTitle || cleanName;

      return {
        term: displayTitle,
        slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: "Marvel Universe Canon",
        definition: `${displayTitle} is a canonical Marvel character residing in ${row.universe || "Earth-616"}. First appeared in ${row.first_appearance || "classic Marvel continuity"}.`,
        translation: `Integral continuity asset created by ${row.creators || "Marvel Bullpen"}. Key appearances drive direct-market demand and back-issue liquidity.`,
        type: "character",
        universe: row.universe || "Earth-616",
        role: row.alignment === "Bad" ? "Antagonist / Villain" : "Protagonist / Hero",
        creators: row.creators || undefined,
        firstAppearance: row.first_appearance || undefined,
        sourceDb: "marvel_database.db",
        url: `/catalog?q=${encodeURIComponent(cleanName)}`,
      };
    }

    // 2. Check marvel_creators (8,705 rows)
    stmt = db.prepare(`
      SELECT name, birth_date, country
      FROM marvel_creators
      WHERE LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?)
      LIMIT 1
    `);
    const cRow = stmt.get(cleanName, `${cleanName}%`) as any;
    if (cRow) {
      return {
        term: cRow.name,
        slug: cRow.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: "Marvel Creator Retrospective",
        definition: `Credited comic book creator for Marvel Comics.`,
        translation: `Bullpen talent whose scripting, penciling, or cover artwork drives certified census premiums and key collector appeal.`,
        type: "creator",
        universe: "Marvel Bullpen",
        role: "Legendary Creator",
        sourceDb: "marvel_database.db",
        url: `/catalog?q=${encodeURIComponent(cRow.name)}`,
      };
    }

    // 3. Check marvel_artifacts_and_locations (12,633 rows)
    stmt = db.prepare(`
      SELECT name, category, first_appearance, creators, universe, description
      FROM marvel_artifacts_and_locations
      WHERE LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?)
      LIMIT 1
    `);
    const aRow = stmt.get(cleanName, `${cleanName}%`) as any;
    if (aRow) {
      return {
        term: aRow.name,
        slug: aRow.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: `Marvel ${aRow.category || "Artifact / Location"}`,
        definition: aRow.description || `Landmark artifact or location in ${aRow.universe || "Earth-616"}. First appeared in ${aRow.first_appearance || "Marvel continuity"}.`,
        translation: `Canonical landmark anchoring major crossover events and cosmic storyline arcs.`,
        type: "artifact",
        universe: aRow.universe || "Earth-616",
        creators: aRow.creators || undefined,
        firstAppearance: aRow.first_appearance || undefined,
        sourceDb: "marvel_database.db",
        url: `/catalog?q=${encodeURIComponent(aRow.name)}`,
      };
    }
  } catch (err) {
    console.warn("[local-fandom-lookup] lookupMarvelDatabase error:", err);
  }

  return null;
}

/**
 * Look up character, creator, item, or team in DC Database (39,000+ entities)
 */
export function lookupDcDatabase(name: string): WikiLookupResult | null {
  const db = getDatabase("dc");
  if (!db) return null;

  try {
    const cleanName = name.trim();

    // 1. Check dc_characters (33,662 rows)
    let stmt = db.prepare(`
      SELECT page_title, name, current_alias, creators, first_appearance, universe, alignment
      FROM dc_characters
      WHERE LOWER(page_title) LIKE LOWER(?) OR LOWER(current_alias) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?)
      LIMIT 1
    `);
    let row = stmt.get(`%${cleanName}%`, `%${cleanName}%`, `%${cleanName}%`) as any;

    if (row) {
      const displayTitle = row.current_alias?.replace(/^\|\s*Aliases\s*=\s*/i, "").split("*")[0]?.trim() || row.name || row.page_title.split("(")[0].trim();
      return {
        term: displayTitle || cleanName,
        slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: "DC Universe Canon",
        definition: `${displayTitle} is a canonical DC character in ${row.universe || "New Earth / Prime Earth"}. First appeared in ${row.first_appearance || "DC Comics continuity"}.`,
        translation: `Sovereign DC continuity participant created by ${row.creators || "DC Editorial"}. Anchors classic runs and key back-issue volume.`,
        type: "character",
        universe: row.universe || "DC Prime Earth",
        role: row.alignment === "Bad" ? "Rogues Gallery / Supervillain" : "Justice League / Superhero",
        creators: row.creators || undefined,
        firstAppearance: row.first_appearance || undefined,
        sourceDb: "dc_database.db",
        url: `/catalog?q=${encodeURIComponent(cleanName)}`,
      };
    }

    // 2. Check dc_artifacts_and_locations (3,538 rows)
    stmt = db.prepare(`
      SELECT name, category, first_appearance, creators, universe, description
      FROM dc_artifacts_and_locations
      WHERE LOWER(name) LIKE LOWER(?)
      LIMIT 1
    `);
    const aRow = stmt.get(`%${cleanName}%`) as any;
    if (aRow) {
      return {
        term: aRow.name,
        slug: aRow.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: `DC ${aRow.category || "Location / Artifact"}`,
        definition: aRow.description || `Legendary DC asset or location. Debut: ${aRow.first_appearance || "DC continuity"}.`,
        translation: `High-conviction lore asset anchoring pivotal Batman, Superman, or DC crossover continuity.`,
        type: "location",
        universe: aRow.universe || "DC Universe",
        creators: aRow.creators || undefined,
        firstAppearance: aRow.first_appearance || undefined,
        sourceDb: "dc_database.db",
        url: `/catalog?q=${encodeURIComponent(aRow.name)}`,
      };
    }
  } catch (err) {
    console.warn("[local-fandom-lookup] lookupDcDatabase error:", err);
  }

  return null;
}

/**
 * Look up character in Star Wars Database (44,162 characters)
 */
export function lookupStarWarsDatabase(name: string): WikiLookupResult | null {
  const db = getDatabase("starwars");
  if (!db) return null;

  try {
    const cleanName = name.trim();
    const stmt = db.prepare(`
      SELECT page_title, name, species, homeworld, affiliation, creators, continuity
      FROM starwars_characters
      WHERE LOWER(page_title) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?)
      LIMIT 1
    `);
    const row = stmt.get(`%${cleanName}%`, `%${cleanName}%`) as any;

    if (row) {
      const displayTitle = row.name || row.page_title.split("(")[0].trim();
      return {
        term: displayTitle || cleanName,
        slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: "Star Wars Expanded Universe / Canon",
        definition: `${displayTitle} is a ${row.species || "galactic"} character from ${row.homeworld || "the galaxy far, far away"}. Affiliation: ${row.affiliation || "Independent"}. Continuity: ${row.continuity || "Legends & Canon"}.`,
        translation: `Integral galactic lore figure created by ${row.creators || "Lucasfilm"}. Anchors key comic runs and Marvel/Dark Horse variant interest.`,
        type: "character",
        universe: "STAR WARS",
        role: "Galactic Figure",
        creators: row.creators || undefined,
        sourceDb: "starwars_database.db",
        url: `/catalog?q=${encodeURIComponent(cleanName)}`,
      };
    }
  } catch (err) {
    console.warn("[local-fandom-lookup] lookupStarWarsDatabase error:", err);
  }

  return null;
}

/**
 * Master multi-universe and financial lexicon lookup engine.
 * Cascades across 1.8M local Fandom pages and 9,000+ financial definitions.
 */
export function lookupUnifiedFandomEntity(
  term: string,
  typeHint?: "character" | "creator" | "lexicon" | "artifact" | "team" | "location",
  universeHint?: string
): WikiLookupResult | null {
  const clean = term.trim();
  if (!clean || clean.length < 2) return null;

  const uniUpper = (universeHint || "").toUpperCase();

  // 1. If financial/market principle or type is lexicon, prioritize CBR Lexicon & Investopedia
  if (
    typeHint === "lexicon" ||
    clean.includes("Floor") ||
    clean.includes("FMV") ||
    clean.includes("Tomato") ||
    clean.includes("Breakeven") ||
    clean.includes("Sunk") ||
    clean.includes("CGC") ||
    clean.includes("CBCS") ||
    clean.includes("Census") ||
    clean.includes("Liquidation") ||
    clean.includes("Spread") ||
    clean.includes("Arbitrage") ||
    clean.includes("CPR") ||
    clean.includes("Direct") ||
    clean.includes("Newsstand")
  ) {
    const cbr = lookupCbrLexicon(clean);
    if (cbr) return cbr;
    const inv = lookupInvestopedia(clean);
    if (inv) return inv;
  }

  // 2. Route by universe hint if present
  if (uniUpper.includes("MARVEL")) {
    const m = lookupMarvelDatabase(clean);
    if (m) return m;
  } else if (uniUpper.includes("DC")) {
    const d = lookupDcDatabase(clean);
    if (d) return d;
  } else if (uniUpper.includes("STAR WARS") || uniUpper.includes("LUCAS")) {
    const sw = lookupStarWarsDatabase(clean);
    if (sw) return sw;
  }

  // 3. General cascade across all local databases
  // Check Marvel (130k entities)
  const m = lookupMarvelDatabase(clean);
  if (m) return m;

  // Check DC (39k entities)
  const d = lookupDcDatabase(clean);
  if (d) return d;

  // Check Star Wars (44k entities)
  const sw = lookupStarWarsDatabase(clean);
  if (sw) return sw;

  // Check CBR Lexicon (4.6k terms)
  const cbr = lookupCbrLexicon(clean);
  if (cbr) return cbr;

  // Check Investopedia (4.6k terms)
  const inv = lookupInvestopedia(clean);
  if (inv) return inv;

  return null;
}
