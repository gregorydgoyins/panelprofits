import fs from "fs";
import path from "path";

export interface LoreEntitySummary {
  slug: string;
  title: string;
  universe: "MARVEL" | "DC" | "STAR_WARS" | "IMAGE" | "DARK_HORSE" | "SPAWN" | "TRANSFORMERS" | string;
  type: "character" | "item" | "location" | "team";
  reality?: string;
  alignment?: string;
  creators?: string;
  first_appearance?: string;
  summary: string;
  alter_ego?: string;
  ticker?: string;
  gadgets_and_weapons?: string[];
  locations_and_hideouts?: string[];
  super_teams?: string[];
  allies?: string[];
  rogues_gallery?: string[];
  landmark_debuts?: Array<{
    title: string;
    significance: string;
    catalogUrl: string;
    era?: string;
    assetTier?: string;
  }>;
}

interface LoreIndexData {
  total_indexed: number;
  universe_breakdown: Record<string, number>;
  universes: Record<string, Array<{ slug: string; title: string; universe: string; reality?: string; alignment?: string; creators?: string; first_appearance?: string; summary: string }>>;
  items: Array<{ slug: string; title: string; universe: string; reality?: string; creators?: string; first_appearance?: string; summary: string }>;
  locations: Array<{ slug: string; title: string; universe: string; reality?: string; creators?: string; first_appearance?: string; summary: string }>;
  teams: Array<{ slug: string; title: string; universe: string; reality?: string; creators?: string; first_appearance?: string; summary: string }>;
}

let cachedIndex: LoreIndexData | null = null;
let cachedSlugMap: Map<string, LoreEntitySummary> | null = null;
let cachedTitleMap: Map<string, LoreEntitySummary> | null = null;

function loadLoreIndex(): LoreIndexData {
  if (cachedIndex) return cachedIndex;
  if (typeof window !== "undefined") {
    return {
      total_indexed: 0,
      universe_breakdown: {},
      universes: {},
      items: [],
      locations: [],
      teams: [],
    };
  }
  try {
    const indexPath = path.join(process.cwd(), "lib/wiki/multi_universe_character_index.json");
    if (fs.existsSync(indexPath)) {
      const raw = fs.readFileSync(indexPath, "utf-8");
      cachedIndex = JSON.parse(raw);
    } else {
      cachedIndex = {
        total_indexed: 0,
        universe_breakdown: {},
        universes: {},
        items: [],
        locations: [],
        teams: [],
      };
    }
  } catch {
    cachedIndex = {
      total_indexed: 0,
      universe_breakdown: {},
      universes: {},
      items: [],
      locations: [],
      teams: [],
    };
  }

  // Populate slug and title lookup maps
  cachedSlugMap = new Map();
  cachedTitleMap = new Map();
  if (cachedIndex) {
    const registerTitle = (title: string, summary: LoreEntitySummary) => {
      const clean = title.trim().toLowerCase();
      if (clean.length >= 3 && !cachedTitleMap!.has(clean)) {
        cachedTitleMap!.set(clean, summary);
      }
    };

    for (const [uni, chars] of Object.entries(cachedIndex.universes || {})) {
      for (const ch of chars) {
        const itemSummary: LoreEntitySummary = {
          slug: ch.slug,
          title: ch.title,
          universe: ch.universe || uni.toUpperCase(),
          type: "character",
          reality: ch.reality,
          alignment: ch.alignment,
          creators: ch.creators,
          first_appearance: ch.first_appearance,
          summary: ch.summary,
        };
        cachedSlugMap.set(ch.slug, itemSummary);
        registerTitle(ch.title, itemSummary);
      }
    }

    for (const it of cachedIndex.items || []) {
      const itemSummary: LoreEntitySummary = {
        slug: it.slug,
        title: it.title,
        universe: it.universe,
        type: "item",
        reality: it.reality,
        creators: it.creators,
        first_appearance: it.first_appearance,
        summary: it.summary,
      };
      cachedSlugMap.set(it.slug, itemSummary);
      registerTitle(it.title, itemSummary);
    }

    for (const loc of cachedIndex.locations || []) {
      const itemSummary: LoreEntitySummary = {
        slug: loc.slug,
        title: loc.title,
        universe: loc.universe,
        type: "location",
        reality: loc.reality,
        creators: loc.creators,
        first_appearance: loc.first_appearance,
        summary: loc.summary,
      };
      cachedSlugMap.set(loc.slug, itemSummary);
      registerTitle(loc.title, itemSummary);
    }

    for (const tm of cachedIndex.teams || []) {
      const itemSummary: LoreEntitySummary = {
        slug: tm.slug,
        title: tm.title,
        universe: tm.universe,
        type: "team",
        reality: tm.reality,
        creators: tm.creators,
        first_appearance: tm.first_appearance,
        summary: tm.summary,
      };
      cachedSlugMap.set(tm.slug, itemSummary);
      registerTitle(tm.title, itemSummary);
    }
  }

  return cachedIndex || {
    total_indexed: 0,
    universe_breakdown: {},
    universes: {},
    items: [],
    locations: [],
    teams: [],
  };
}

/**
 * Searches multi-universe lore index for characters, items, locations, and teams.
 */
export function searchLoreEntities(query: string, limit = 18): LoreEntitySummary[] {
  const index = loadLoreIndex();
  if (!query || !query.trim()) {
    return [];
  }

  const q = query.toLowerCase().trim();
  const results: LoreEntitySummary[] = [];

  // Helper matcher
  const matchEntry = (item: { title: string; summary?: string; creators?: string; first_appearance?: string }, type: LoreEntitySummary["type"], universe: string, slug: string, reality?: string, alignment?: string) => {
    const titleMatch = item.title.toLowerCase().includes(q);
    const faMatch = item.first_appearance?.toLowerCase().includes(q);
    const creatorMatch = item.creators?.toLowerCase().includes(q);

    if (titleMatch || faMatch || creatorMatch) {
      results.push({
        slug,
        title: item.title,
        universe,
        type,
        reality,
        alignment,
        creators: item.creators,
        first_appearance: item.first_appearance,
        summary: item.summary || "",
      });
    }
  };

  // 1. Search items & weapons first if relevant
  for (const it of index.items || []) {
    if (results.length >= limit) break;
    matchEntry(it, "item", it.universe, it.slug, it.reality);
  }

  // 2. Search locations & cities
  for (const loc of index.locations || []) {
    if (results.length >= limit) break;
    matchEntry(loc, "location", loc.universe, loc.slug, loc.reality);
  }

  // 3. Search teams
  for (const tm of index.teams || []) {
    if (results.length >= limit) break;
    matchEntry(tm, "team", tm.universe, tm.slug, tm.reality);
  }

  // 4. Search characters across universes
  for (const [uni, chars] of Object.entries(index.universes || {})) {
    for (const ch of chars) {
      if (results.length >= limit) break;
      matchEntry(ch, "character", ch.universe || uni.toUpperCase(), ch.slug, ch.reality, ch.alignment);
    }
    if (results.length >= limit) break;
  }

  return results.slice(0, limit);
}

const SLUG_ALIASES: Record<string, string> = {
  batman: "bruce-wayne-earth-two",
  "bruce-wayne": "bruce-wayne-earth-two",
  "dark-knight": "bruce-wayne-earth-two",
  superman: "kal-l-earth-two",
  "clark-kent": "kal-l-earth-two",
  "spider-man": "peter-parker-earth-1610",
  spiderman: "peter-parker-earth-1610",
  "peter-parker": "peter-parker-earth-1610",
  deadpool: "wade-wilson-earth-616",
  joker: "joker-earth-two",
  wolverine: "james-howlett-earth-811",
};

/**
 * Retrieves a single lore entity by its slug.
 */
export function getLoreEntityBySlug(slug: string): LoreEntitySummary | null {
  loadLoreIndex();
  if (!slug || !cachedSlugMap) return null;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct slug match
  if (cachedSlugMap.has(cleanSlug)) {
    return cachedSlugMap.get(cleanSlug)!;
  }

  // 2. Direct alias match
  const alias = SLUG_ALIASES[cleanSlug];
  if (alias && cachedSlugMap.has(alias)) {
    return cachedSlugMap.get(alias)!;
  }

  // 3. Match by title from cachedTitleMap (e.g. "batman", "iron man")
  const titlePhrase = cleanSlug.replace(/-/g, " ");
  if (cachedTitleMap && cachedTitleMap.has(titlePhrase)) {
    return cachedTitleMap.get(titlePhrase)!;
  }

  return null;
}

/**
 * Returns featured premier entities for the wiki overview.
 */
export function getFeaturedLoreEntities(): LoreEntitySummary[] {
  const index = loadLoreIndex();
  const featured: LoreEntitySummary[] = [];

  // Top characters
  const marvelChars = index.universes?.marvel?.slice(0, 4) || [];
  for (const ch of marvelChars) {
    featured.push({ ...ch, type: "character" });
  }

  const dcChars = index.universes?.dc?.slice(0, 4) || [];
  for (const ch of dcChars) {
    featured.push({ ...ch, type: "character" });
  }

  // Top items
  for (const it of (index.items || []).slice(0, 4)) {
    featured.push({ ...it, type: "item" });
  }

  // Top locations
  for (const loc of (index.locations || []).slice(0, 4)) {
    featured.push({ ...loc, type: "location" });
  }

  return featured;
}

const LORE_STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "into", "over", "under", "about",
  "comic", "comics", "book", "books", "issue", "issues", "first", "last", "cover", "year",
  "price", "prices", "sale", "sales", "auction", "record", "market", "grade", "graded",
  "hero", "heroes", "villain", "villains", "team", "world", "earth", "time", "death", "life",
  "city", "state", "star", "dark", "light", "high", "gold", "silver", "bronze", "modern",
  "cgc", "cbcs", "pgx", "mint", "near", "fine", "good", "very", "rare", "scarce", "panel",
  "collector", "collectors", "collection", "collections", "creator", "creators", "reader",
  "readers", "writer", "writers", "artist", "artists", "studio", "studios", "character",
  "characters", "equity", "valuation", "slab", "slabs", "inventory", "spread", "spreads"
]);

/**
 * Rapidly extracts lore entities mentioned inside unstructured text
 * using n-gram exact tokenization against indexed characters, items, locations, and teams.
 */
export function findLoreEntitiesInText(text: string, limit = 6): LoreEntitySummary[] {
  if (!text || !text.trim()) return [];
  loadLoreIndex();
  if (!cachedTitleMap) return [];

  const cleanWords = text
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const matched: LoreEntitySummary[] = [];
  const seenSlugs = new Set<string>();

  // Check 4-grams down to 1-grams to prioritize longest matches
  for (let n = 4; n >= 1; n--) {
    for (let i = 0; i <= cleanWords.length - n; i++) {
      if (matched.length >= limit) break;
      const phrase = cleanWords.slice(i, i + n).join(" ").toLowerCase();

      // Filter out 1-word stop words or short words
      if (n === 1) {
        if (phrase.length < 4 || LORE_STOP_WORDS.has(phrase)) continue;
      }

      const entity = cachedTitleMap.get(phrase);
      if (entity && !seenSlugs.has(entity.slug)) {
        seenSlugs.add(entity.slug);
        matched.push(entity);
      }
    }
    if (matched.length >= limit) break;
  }

  return matched;
}
