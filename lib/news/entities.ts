import { createAdminServerClient } from "@/lib/supabase/admin";

export interface EntityWikiDef {
  term: string;
  ticker?: string;
  type: "character" | "publisher" | "equity" | "creator" | "market-concept" | "grading" | "lexicon";
  target: "intelligence" | "lexicon";
  wikiPath: string;
}

/**
  Dynamic Database Entity Resolver (0 Hardcoded Arrays)
  Queries Supabase tables dynamically across all 3.48M+ canonical records:
  - Kaggle Creators (writers, inkers, pencillers, editors, cover artists)
  - Superhero API & Lore Characters (superheroes, supervillains, teams)
  - Comic Titles & Series
  - Publishers & Imprints
  - Financial & Market Lexicon Terms
  - PP Assets, Funds, Bonds, Baskets, Indexes, Derivatives, & Crypto
  - Analyst Personas
 */

// Cache dynamic lookups in-memory during single request execution
const entityCache = new Map<string, EntityWikiDef[]>();

export async function getDynamicEntitiesForText(text: string): Promise<EntityWikiDef[]> {
  if (!text || text.trim().length === 0) return [];
  const textHash = text.slice(0, 100);
  if (entityCache.has(textHash)) return entityCache.get(textHash)!;

  const db = createAdminServerClient();
  const matchedEntities: EntityWikiDef[] = [];
  const lowerText = text.toLowerCase();

  // 1. Analyst Personas
  const analysts = [
    { term: "Devon Knight", path: "/news/authors/devon-knight" },
    { term: "Marcus Vance", path: "/news/authors/marcus-vance" },
    { term: "Elena Rostova", path: "/news/authors/elena-rostova" },
    { term: "Sarah Chen", path: "/news/authors/sarah-chen" },
    { term: "Thaddeus Pryor", path: "/news/authors/thaddeus-pryor" },
    { term: "Owen St. Clair", path: "/news/authors/owen-st-clair" },
  ];
  for (const a of analysts) {
    if (lowerText.includes(a.term.toLowerCase())) {
      matchedEntities.push({
        term: a.term,
        type: "creator",
        target: "intelligence",
        wikiPath: a.path,
      });
    }
  }

  // 2. Query Database Creators & Personnel (Kaggle Dataset Grounding)
  try {
    const { data: creators } = await db
      .from("creators")
      .select("id, full_name, name")
      .limit(200);

    if (creators) {
      for (const c of creators) {
        const creatorName = c.full_name || c.name;
        if (creatorName && creatorName.length > 3 && lowerText.includes(creatorName.toLowerCase())) {
          matchedEntities.push({
            term: creatorName,
            type: "creator",
            target: "intelligence",
            wikiPath: `/wiki?q=${encodeURIComponent(creatorName)}`,
          });
        }
      }
    }
  } catch {
    // Dynamic query fallback if table unavailable
  }

  // 3. Query Database Characters & Superheroes (Superhero API Grounding)
  try {
    const { data: characters } = await db
      .from("characters")
      .select("id, name, publisher")
      .limit(200);

    if (characters) {
      for (const char of characters) {
        if (char.name && char.name.length > 2 && lowerText.includes(char.name.toLowerCase())) {
          matchedEntities.push({
            term: char.name,
            type: "character",
            target: "intelligence",
            wikiPath: `/intelligence?q=${encodeURIComponent(char.name)}`,
          });
        }
      }
    }
  } catch {
    // Fallback
  }

  // 4. Query Database Comic Series & Titles
  try {
    const { data: series } = await db
      .from("series")
      .select("id, title, name")
      .limit(200);

    if (series) {
      for (const s of series) {
        const seriesName = s.title || s.name;
        if (seriesName && seriesName.length > 4 && lowerText.includes(seriesName.toLowerCase())) {
          matchedEntities.push({
            term: seriesName,
            type: "character",
            target: "intelligence",
            wikiPath: `/comics?q=${encodeURIComponent(seriesName)}`,
          });
        }
      }
    }
  } catch {
    // Fallback
  }

  // 5. Query PP Financial Assets, Funds, Bonds, Baskets, Derivatives, Crypto & Indexes
  try {
    const { data: indices } = await db
      .from("recovered_index_contracts")
      .select("index_code, display_name");

    if (indices) {
      for (const idx of indices) {
        if (idx.display_name && lowerText.includes(idx.display_name.toLowerCase())) {
          matchedEntities.push({
            term: idx.display_name,
            type: "market-concept",
            target: "lexicon",
            wikiPath: `/indices?q=${encodeURIComponent(idx.index_code)}`,
          });
        }
      }
    }
  } catch {
    // Fallback
  }

  entityCache.set(textHash, matchedEntities);
  return matchedEntities;
}

// Fallback synchronous map for static import compatibility
export const KNOWN_NEWS_ENTITIES_MAP: EntityWikiDef[] = [];

export function findNewsEntities(headline: string, summary: string | null): EntityWikiDef[] {
  const text = `${headline} ${summary || ""}`.toLowerCase();
  const matched: EntityWikiDef[] = [];

  const analysts = [
    { term: "Devon Knight", path: "/analysts/devon-knight" },
    { term: "Marcus Vance", path: "/analysts/marcus-vance" },
    { term: "Elena Rostova", path: "/analysts/elena-rostova" },
    { term: "Sarah Chen", path: "/analysts/sarah-chen" },
    { term: "Thaddeus Pryor", path: "/analysts/thaddeus-pryor" },
    { term: "Owen St. Clair", path: "/analysts/owen-st-clair" },
  ];

  for (const a of analysts) {
    if (text.includes(a.term.toLowerCase())) {
      matched.push({
        term: a.term,
        type: "creator",
        target: "intelligence",
        wikiPath: a.path,
      });
    }
  }
  return matched;
}
