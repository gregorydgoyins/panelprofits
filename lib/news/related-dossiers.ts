import {
  findLoreEntitiesInTextAsync,
  GENERIC_REAL_WORLD_LOCATIONS,
  LORE_OBSCURE_COLLISION_BLOCKLIST,
  type LoreEntitySummary,
} from "@/lib/wiki/lore-search";
import { findCbrTermsInText, type CbrTermTextMatch } from "@/lib/lexicon/cbr-lexicon";

/**
 * A single real, live-queried wiki dossier (character, team, item, or location) matched
 * inside a piece of news article text, carrying the full detail available on
 * public.ppcf_wiki_pages -- not just the flattened term/type pair EntityWikiDef uses for
 * inline text linking. Used to render "News Rail v2" (RelatedDossiersRail), which surfaces
 * real debut/creator/summary data per matched entity rather than a bare clickable term.
 */
export interface RelatedDossierEntity {
  slug: string;
  title: string;
  universe: string;
  type: "character" | "item" | "location" | "team";
  summary: string;
  creators?: string;
  firstAppearance?: string;
  ticker?: string;
  wikiPath: string;
}

export interface RelatedUniverseGroup {
  universe: string;
  entities: RelatedDossierEntity[];
}

/** A real financial/market-mechanics glossary term (from the 4,653-term CBR lexicon)
 *  matched inside the same article text, alongside the lore/character dossiers. */
export interface RelatedLexiconTerm {
  slug: string;
  term: string;
  category: string;
  definition: string;
  wikiPath: string;
}

export interface RelatedDossiersResult {
  universeGroups: RelatedUniverseGroup[];
  lexiconTerms: RelatedLexiconTerm[];
  totalEntityCount: number;
}

const EMPTY_RESULT: RelatedDossiersResult = {
  universeGroups: [],
  lexiconTerms: [],
  totalEntityCount: 0,
};

function isBlockedTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return GENERIC_REAL_WORLD_LOCATIONS.has(lower) || LORE_OBSCURE_COLLISION_BLOCKLIST.has(lower);
}

function toDossierEntity(lore: LoreEntitySummary): RelatedDossierEntity {
  const type: RelatedDossierEntity["type"] =
    lore.type === "item" || lore.type === "location" || lore.type === "team" ? lore.type : "character";
  return {
    slug: lore.slug,
    title: lore.title,
    universe: (lore.universe || "MARVEL").toUpperCase(),
    type,
    summary: lore.summary || "",
    creators: lore.creators || undefined,
    firstAppearance: lore.first_appearance || undefined,
    ticker: lore.ticker,
    wikiPath: `/wiki/entry/${lore.slug}`,
  };
}

/**
 * Groups matched dossiers by universe for rail display, sorted with the largest (most
 * relevant) universe group first and universes with equal counts sorted alphabetically for
 * a stable order across renders.
 */
export function groupDossiersByUniverse(entities: RelatedDossierEntity[]): RelatedUniverseGroup[] {
  const byUniverse = new Map<string, RelatedDossierEntity[]>();
  for (const entity of entities) {
    const list = byUniverse.get(entity.universe);
    if (list) {
      list.push(entity);
    } else {
      byUniverse.set(entity.universe, [entity]);
    }
  }

  return Array.from(byUniverse.entries())
    .map(([universe, group]) => ({ universe, entities: group }))
    .sort((a, b) => b.entities.length - a.entities.length || a.universe.localeCompare(b.universe));
}

/** Maps real CBR lexicon term matches to the shape the rail renders, preferring the
 *  in-house Panel Profits translation over the raw Investopedia definition when both exist. */
export function mapLexiconMatches(matches: CbrTermTextMatch[]): RelatedLexiconTerm[] {
  return matches.map(({ entry }) => ({
    slug: entry.slug,
    term: entry.term,
    category: entry.category,
    definition: entry.panel_profits_translation || entry.investopedia_definition || "",
    wikiPath: `/lexicon/${entry.slug}`,
  }));
}

const dossierCache = new Map<string, { data: RelatedDossiersResult; loadedAt: number }>();
const DOSSIER_CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Real, live-queried "related dossiers" for a piece of news article text: full-detail
 * character/team/item/location matches across all 7 ingested wiki universes (via
 * findLoreEntitiesInTextAsync -> public.ppcf_wiki_pages), grouped by universe, plus matched
 * real financial/market-mechanics glossary terms (via findCbrTermsInText -> the 4,653-term
 * CBR lexicon). This is the data source for RelatedDossiersRail ("news rail v2") -- unlike
 * getDynamicEntitiesForText, it preserves universe/creators/first_appearance/summary instead
 * of flattening every lore match down to a bare character/lexicon term pair, since the rail
 * needs to actually display that detail, not just link it.
 */
export async function getRelatedDossiersForText(
  text: string,
  limit = 24
): Promise<RelatedDossiersResult> {
  if (!text || !text.trim()) return EMPTY_RESULT;

  const cacheKey = `${limit}:${text.slice(0, 120)}`;
  const cached = dossierCache.get(cacheKey);
  if (cached && Date.now() - cached.loadedAt <= DOSSIER_CACHE_TTL_MS) return cached.data;

  let loreMatches: LoreEntitySummary[] = [];
  try {
    loreMatches = await findLoreEntitiesInTextAsync(text, limit);
  } catch {
    // Graceful fallback if the wiki index is unavailable -- an empty rail section, never a
    // fabricated placeholder standing in for real data.
    loreMatches = [];
  }

  const seenSlugs = new Set<string>();
  const entities: RelatedDossierEntity[] = [];
  for (const lore of loreMatches) {
    if (isBlockedTitle(lore.title)) continue;
    if (seenSlugs.has(lore.slug)) continue;
    seenSlugs.add(lore.slug);
    entities.push(toDossierEntity(lore));
  }

  let lexiconMatches: CbrTermTextMatch[] = [];
  try {
    lexiconMatches = findCbrTermsInText(text, 10);
  } catch {
    lexiconMatches = [];
  }

  const result: RelatedDossiersResult = {
    universeGroups: groupDossiersByUniverse(entities),
    lexiconTerms: mapLexiconMatches(lexiconMatches),
    totalEntityCount: entities.length,
  };

  dossierCache.set(cacheKey, { data: result, loadedAt: Date.now() });
  return result;
}
