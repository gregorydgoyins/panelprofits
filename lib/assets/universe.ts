/**
 * The character universe: how many characters actually exist per publisher universe, counted from the Fandom wiki
 * pages already in the database (pp_universe_census_v2 over pp_character_roster).
 *
 * Honest counting: a wiki page is one person in one reality, so pages overstate the cast. "individuals" collapses a
 * person's pages across realities; "primeIndividuals" counts only people in the publisher's main continuities
 * (Marvel Earth-616; DC New Earth / Prime Earth / Earth-One / Earth-Two); "codenames" counts shared identities once
 * (hundreds of different people have been "Spider-Man" or "Batman").
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { createCachedQuery } from "@/lib/cache/wrapper";

export interface UniverseCensus {
  universe: string; // MARVEL | DC | IMAGE | DARK_HORSE | SPAWN | TRANSFORMERS | STAR_WARS
  wikiPages: number;
  individuals: number;
  primeIndividuals: number;
  codenames: number;
  realities: number;
  individualsWithFirstBook: number;
}

export function censusFromRows(rows: any[] | null | undefined): UniverseCensus[] {
  return (rows ?? []).map((r) => ({
    universe: String(r.universe),
    wikiPages: Number(r.wiki_pages) || 0,
    individuals: Number(r.individuals) || 0,
    primeIndividuals: Number(r.prime_individuals) || 0,
    codenames: Number(r.codenames) || 0,
    realities: Number(r.realities) || 0,
    individualsWithFirstBook: Number(r.individuals_with_first_book) || 0,
  }));
}

const fmt = (n: number) => n.toLocaleString("en-US");

/** Graph/ticker universe label ("DC", "Marvel") to the census key. */
export function censusKey(label: string | undefined): string {
  return String(label ?? "").toUpperCase().replace(/\s+/g, "_");
}

export function censusLine(c: UniverseCensus | undefined): string {
  if (!c) return "";
  const prime = c.primeIndividuals === c.individuals ? "" : `${fmt(c.primeIndividuals)} in main continuity, `;
  return `${prime}${fmt(c.individuals)} individuals across ${fmt(c.realities || 1)} realit${c.realities === 1 ? "y" : "ies"}`;
}

async function fetchCensusRaw(): Promise<UniverseCensus[]> {
  const supabase = createAdminServerClient();
  const { data } = await supabase.from("pp_universe_census_v2").select("*");
  return censusFromRows(data);
}

export const getUniverseCensus = createCachedQuery(fetchCensusRaw, "asset-universe-census", {
  ttlSeconds: 6 * 3600,
  staleWhileRevalidateSeconds: 24 * 3600,
  tags: ["assets"],
});
