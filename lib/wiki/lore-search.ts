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

function loadLoreIndex(): LoreIndexData {
  if (cachedIndex) return cachedIndex;
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

  // Populate slug lookup map
  cachedSlugMap = new Map();
  if (cachedIndex) {
    for (const [uni, chars] of Object.entries(cachedIndex.universes || {})) {
      for (const ch of chars) {
        cachedSlugMap.set(ch.slug, {
          slug: ch.slug,
          title: ch.title,
          universe: ch.universe || uni.toUpperCase(),
          type: "character",
          reality: ch.reality,
          alignment: ch.alignment,
          creators: ch.creators,
          first_appearance: ch.first_appearance,
          summary: ch.summary,
        });
      }
    }

    for (const it of cachedIndex.items || []) {
      cachedSlugMap.set(it.slug, {
        slug: it.slug,
        title: it.title,
        universe: it.universe,
        type: "item",
        reality: it.reality,
        creators: it.creators,
        first_appearance: it.first_appearance,
        summary: it.summary,
      });
    }

    for (const loc of cachedIndex.locations || []) {
      cachedSlugMap.set(loc.slug, {
        slug: loc.slug,
        title: loc.title,
        universe: loc.universe,
        type: "location",
        reality: loc.reality,
        creators: loc.creators,
        first_appearance: loc.first_appearance,
        summary: loc.summary,
      });
    }

    for (const tm of cachedIndex.teams || []) {
      cachedSlugMap.set(tm.slug, {
        slug: tm.slug,
        title: tm.title,
        universe: tm.universe,
        type: "team",
        reality: tm.reality,
        creators: tm.creators,
        first_appearance: tm.first_appearance,
        summary: tm.summary,
      });
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

/**
 * Retrieves a single lore entity by its slug.
 */
export function getLoreEntityBySlug(slug: string): LoreEntitySummary | null {
  loadLoreIndex();
  if (!cachedSlugMap) return null;
  return cachedSlugMap.get(slug) || null;
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
