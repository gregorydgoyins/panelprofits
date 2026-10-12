/**
 * Whole-universe character footprints, measured from the Fandom issue pages (every character the wiki lists in every
 * issue, with its role) joined to the catalog prices — not from story credits, which are blank for much of the early era.
 *
 *   weight of a character in an issue = role (featured 10, antagonist 7, supporting 4, other 1.5), × 1.5 on a first appearance
 *   share  = weight ÷ (everyone's weight in that issue + 10 for the rest of what a book is worth), capped at 40%
 *   NAV    = Σ share × market price over every priced book the character appears in
 *
 * data/universe/character-footprints.json holds the leading characters of each publisher with their leading books;
 * data/universe/character-index.json.gz holds every measured character. Both are written by
 * build_footprints.py and export_repo_data.py in ingestion/CHARACTER_FOOTPRINT_2026-10-11 from the local Fandom and price files.
 * Cover price is never used as a value: it is a printed price from 1940-2020, not a market price. Issues with neither a catalog nor a ComicBase price are unpriced.
 * Ages are derived from the issue's year at read time; nothing stores an era tag.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Era, Footprint, FootprintBook } from "./footprint";
import { ERAS } from "./footprint";

export interface UniverseCharacter {
  key: string; // wiki page, reality suffix removed, lower-case
  name: string;
  universe: "DC" | "MARVEL";
  issues: number; // issues the wiki lists it in (priced or not)
  nav: number; // stored footprint, USD
  firstYear: number | null;
  debut: { year: number; ppId: number; page: string } | null;
  footprint: Footprint;
}

/** Graph node → wiki page that holds the same person's appearances. A hero and its secret identity share one page. */
export const UNIVERSE_KEYS: Record<string, string> = {
  batman: "bruce wayne", joker: "joker", two_face: "harvey dent", harley: "harleen quinzel",
  superman: "kal-el", lex_luthor: "lex luthor",
  spider_man: "peter parker", green_goblin: "norman osborn", daredevil: "matthew murdock", kingpin: "wilson fisk",
  iron_man: "anthony stark", hulk: "bruce banner", wolverine: "james howlett", black_panther: "t'challa", doom: "victor von doom",
};

const TITLE = /^(.*?) Vol [0-9]+ (.+)$/;

export function universeFromRows(rows: any[] | null | undefined): UniverseCharacter[] {
  const out: UniverseCharacter[] = [];
  for (const r of rows ?? []) {
    const e: number[] = r.e ?? [];
    const eras = {} as Record<Era, { books: number; nav: number }>;
    ERAS.forEach((era, i) => (eras[era] = { books: Number(e[i * 2]) || 0, nav: Number(e[i * 2 + 1]) || 0 }));
    const top: FootprintBook[] = [];
    for (const b of r.b ?? []) {
      const m = TITLE.exec(String(b[3] ?? ""));
      top.push({ ppId: String(b[0]), share: Number(b[1]), year: b[2] != null ? Number(b[2]) : null, series: m ? m[1] : String(b[3] ?? ""), issue: m ? m[2] : "", px: Number(b[4]) });
    }
    out.push({
      key: String(r.k),
      name: String(r.n),
      universe: r.u === "MARVEL" ? "MARVEL" : "DC",
      issues: Number(r.i) || 0,
      nav: Number(r.v) || 0,
      firstYear: r.f != null ? Number(r.f) : null,
      debut: Array.isArray(r.d) ? { year: Number(r.d[0]), ppId: Number(r.d[1]), page: String(r.d[2]) } : null,
      footprint: { nameKey: String(r.k), top, eras },
    });
  }
  return out;
}

let cache: UniverseCharacter[] | null = null;
export function getUniverseCharacters(): UniverseCharacter[] {
  if (cache) return cache;
  try {
    cache = universeFromRows(JSON.parse(readFileSync(join(process.cwd(), "data/universe/character-footprints.json"), "utf8")));
  } catch {
    cache = [];
  }
  return cache;
}

/** Leading characters of each publisher by footprint NAV, skipping `UNIVERSE|key` entries already issued some other way. */
export function leadingCharacters(chars: UniverseCharacter[], perUniverse: number, skip: Set<string> = new Set()): UniverseCharacter[] {
  const out: UniverseCharacter[] = [];
  for (const u of ["DC", "MARVEL"] as const) {
    out.push(
      ...chars
        .filter((c) => c.universe === u && !skip.has(`${c.universe}|${c.key}`) && c.issues >= 5 && c.footprint.top.length >= 3)
        .sort((a, b) => b.nav - a.nav)
        .slice(0, perUniverse),
    );
  }
  return out;
}
