/**
 * The roster: the most prominent characters of each publisher universe, from the Fandom wiki pages and the Grand
 * Comics Database appearance counts already in the database (pp_character_equity_v2).
 *
 * A character's equity is a share of its first-appearance book. The share is its prominence (story appearances)
 * over the prominence of everyone who debuted in that book, plus a fixed prior for everything else a book is worth
 * (art, creators, scarcity) — so Superman takes a big slice of Action #1 and a one-story walk-on takes none.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { createCachedQuery } from "@/lib/cache/wrapper";

export interface RosterCharacter {
  universe: string; // DC | MARVEL
  name: string; // codename on the wiki
  slug: string; // wiki page
  series: string;
  issue: string;
  year: number | null;
  comicsId: string;
  stories: number; // GCD story appearances
  share: number; // share of the first-appearance book's value
}

export const ROSTER_PER_UNIVERSE = 60;

export function rosterFromRows(rows: any[] | null | undefined, perUniverse = ROSTER_PER_UNIVERSE): RosterCharacter[] {
  const out: RosterCharacter[] = [];
  const seen = new Set<string>();
  // Many people share a codename and share its appearance count; the original bearer is the earliest debut.
  const yr = (x: any) => (x.book_year != null ? Number(x.book_year) : 9999);
  const sorted = (rows ?? []).slice().sort((a, b) => Number(b.stories) - Number(a.stories) || yr(a) - yr(b));
  const counts = new Map<string, number>();
  for (const r of sorted) {
    const u = String(r.universe);
    const key = `${u}|${String(r.codename).toLowerCase().replace(/^the\s+/, "")}`;
    if (seen.has(key)) continue; // one equity per codename: the most prominent bearer
    if ((counts.get(u) ?? 0) >= perUniverse) continue;
    const share = Number(r.share);
    if (!(share > 0)) continue;
    seen.add(key);
    counts.set(u, (counts.get(u) ?? 0) + 1);
    out.push({
      universe: u,
      name: String(r.codename),
      slug: String(r.slug),
      series: String(r.first_series),
      issue: String(r.first_issue),
      year: r.book_year != null ? Number(r.book_year) : null,
      comicsId: String(r.comics_id),
      stories: Number(r.stories) || 0,
      share,
    });
  }
  return out;
}

export async function fetchRosterRaw(): Promise<RosterCharacter[]> {
  const supabase = createAdminServerClient();
  const cols = "universe,codename,slug,first_series,first_issue,book_year,comics_id,stories,share";
  const per = async (u: string) =>
    (await supabase.from("pp_character_equity_v2").select(cols).eq("universe", u).order("stories", { ascending: false }).limit(ROSTER_PER_UNIVERSE * 3)).data ?? [];
  const [dc, marvel] = await Promise.all([per("DC"), per("MARVEL")]);
  return rosterFromRows([...dc, ...marvel]);
}

export const getRoster = createCachedQuery(fetchRosterRaw, "asset-roster", {
  ttlSeconds: 6 * 3600,
  staleWhileRevalidateSeconds: 24 * 3600,
  tags: ["assets"],
});
