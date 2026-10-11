/**
 * A character's footprint: every priced book it appears in, and its share of each issue.
 *
 *   NAV = Σ over books (share × market price)         (canon fund NAV, quantities = issue shares)
 *   price per unit = NAV ÷ units                       (units = fundInitialNav ÷ fundInitialSharePrice)
 *
 * The footprint comes from Grand Comics Database story credits joined to the catalog (pp_character_footprint_*).
 * Early-era credits in that database are often blank (Detective #27 lists no Batman), so curated anchor books — the
 * graph's defining books and each roster character's first appearance — are merged in at a stated share.
 *
 * Era slices partition the same books, so Golden + Silver + Bronze + Modern equals the whole character.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { createCachedQuery } from "@/lib/cache/wrapper";
import { GAME_DESIGN } from "./canon-params";

export type Era = "GOLDEN" | "SILVER" | "BRONZE" | "MODERN";
export const ERAS: Era[] = ["GOLDEN", "SILVER", "BRONZE", "MODERN"];
export const ERA_LABEL: Record<Era, string> = {
  GOLDEN: "Golden Age (to 1955)",
  SILVER: "Silver Age (1956–69)",
  BRONZE: "Bronze Age (1970–85)",
  MODERN: "Modern Age (1986–)",
};
export const FOOTPRINT_UNITS = GAME_DESIGN.fundInitialNav / GAME_DESIGN.fundInitialSharePrice;
/** Share credited to a curated anchor book that the story credits missed. */
export const ANCHOR_SHARE = 0.35;

export function eraOf(year: number | null | undefined): Era {
  const y = year ?? 2000;
  return y < 1956 ? "GOLDEN" : y < 1970 ? "SILVER" : y < 1986 ? "BRONZE" : "MODERN";
}

export interface FootprintBook {
  series: string;
  issue: string;
  year: number | null;
  share: number;
  px: number; // stored market price when the footprint was built
}
export interface Footprint {
  nameKey: string;
  top: FootprintBook[]; // the most valuable constituents
  eras: Record<Era, { books: number; nav: number }>; // full footprint, stored
}

export const bookKey = (series: string, issue: string, year: number | null | undefined) => `${series.toLowerCase()}|${issue}|${year ?? ""}`;

export interface Anchor { series: string; issue: string; year: number; share?: number }
export interface LivePrices { get(key: string): number | undefined }

export interface FootprintValue {
  nav: number; // total, USD
  byEra: Record<Era, { nav: number; books: number }>;
  drift: number; // how far the live leaders have moved from their stored prices
  liveBooks: number; // constituents priced live
  topBooks: { label: string; share: number; price: number }[];
}

/**
 * Values a footprint at live prices. Constituents with a live price use it; the rest follow the leaders:
 * stored price × drift, where drift is the share-weighted move of the constituents that are live.
 */
export function valueFootprint(fp: Footprint, live: LivePrices, anchors: Anchor[] = []): FootprintValue {
  const books = new Map<string, FootprintBook>();
  for (const b of fp.top) books.set(bookKey(b.series, b.issue, b.year), { ...b }); // copy: never mutate the cached footprint
  const topStored: Record<Era, number> = { GOLDEN: 0, SILVER: 0, BRONZE: 0, MODERN: 0 };
  for (const b of fp.top) topStored[eraOf(b.year)] += b.share * b.px;

  // anchors the credits missed (or under-credit): share = max(existing, stated)
  const extra: { b: FootprintBook; livePx: number }[] = [];
  for (const a of anchors) {
    const k = bookKey(a.series, a.issue, a.year);
    const livePx = live.get(k);
    if (livePx == null) continue;
    const share = a.share ?? ANCHOR_SHARE;
    const ex = books.get(k);
    if (ex) { if (share > ex.share) ex.share = share; continue; }
    extra.push({ b: { series: a.series, issue: a.issue, year: a.year, share, px: livePx }, livePx });
  }

  let wLive = 0;
  let wStored = 0;
  let liveBooks = 0;
  for (const b of books.values()) {
    const p = live.get(bookKey(b.series, b.issue, b.year));
    if (p != null) { wLive += b.share * p; wStored += b.share * b.px; liveBooks++; }
  }
  const drift = wStored > 0 ? wLive / wStored : 1;

  const byEra: Record<Era, { nav: number; books: number }> = {
    GOLDEN: { nav: 0, books: fp.eras.GOLDEN.books },
    SILVER: { nav: 0, books: fp.eras.SILVER.books },
    BRONZE: { nav: 0, books: fp.eras.BRONZE.books },
    MODERN: { nav: 0, books: fp.eras.MODERN.books },
  };
  for (const e of ERAS) byEra[e].nav += Math.max(0, fp.eras[e].nav - topStored[e]) * drift; // the tail follows the leaders
  const topBooks: FootprintValue["topBooks"] = [];
  for (const b of books.values()) {
    const p = live.get(bookKey(b.series, b.issue, b.year)) ?? b.px * drift;
    byEra[eraOf(b.year)].nav += b.share * p;
    topBooks.push({ label: `${b.series} #${b.issue}${b.year ? ` (${b.year})` : ""}`, share: b.share, price: p });
  }
  for (const x of extra) {
    const e = eraOf(x.b.year);
    byEra[e].nav += x.b.share * x.livePx;
    byEra[e].books += 1;
    topBooks.push({ label: `${x.b.series} #${x.b.issue} (${x.b.year})`, share: x.b.share, price: x.livePx });
  }
  const nav = ERAS.reduce((s, e) => s + byEra[e].nav, 0);
  topBooks.sort((a, b) => b.share * b.price - a.share * a.price);
  return { nav, byEra, drift, liveBooks, topBooks: topBooks.slice(0, 5) };
}

export function footprintsFromRows(top: any[] | null | undefined, eras: any[] | null | undefined): Map<string, Footprint> {
  const out = new Map<string, Footprint>();
  const get = (k: string) => {
    let f = out.get(k);
    if (!f) {
      f = { nameKey: k, top: [], eras: { GOLDEN: { books: 0, nav: 0 }, SILVER: { books: 0, nav: 0 }, BRONZE: { books: 0, nav: 0 }, MODERN: { books: 0, nav: 0 } } };
      out.set(k, f);
    }
    return f;
  };
  for (const r of top ?? []) get(String(r.name_key)).top.push({ series: String(r.series), issue: String(r.issue), year: r.year != null ? Number(r.year) : null, share: Number(r.share), px: Number(r.px) });
  for (const r of eras ?? []) {
    const e = String(r.era) as Era;
    if (ERAS.includes(e)) get(String(r.name_key)).eras[e] = { books: Number(r.books) || 0, nav: Number(r.nav) || 0 };
  }
  return out;
}

async function pageAll(table: string, cols: string): Promise<any[]> {
  const supabase = createAdminServerClient();
  const out: any[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data } = await supabase.from(table).select(cols).order("name_key", { ascending: true }).range(from, from + 999);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

async function fetchFootprintsRaw(): Promise<[string, Footprint][]> {
  const [top, eras] = await Promise.all([
    pageAll("pp_character_footprint_top", "name_key,series,issue,year,share,px,rk"),
    pageAll("pp_character_footprint_era", "name_key,era,books,nav"),
  ]);
  return [...footprintsFromRows(top, eras)];
}

export const getFootprintEntries = createCachedQuery(fetchFootprintsRaw, "asset-footprints", {
  ttlSeconds: 6 * 3600,
  staleWhileRevalidateSeconds: 24 * 3600,
  tags: ["assets"],
});

/** Graph node to footprint key (the name the story credits use). */
export const FOOTPRINT_KEYS: Record<string, string> = {
  batman: "batman", bruce_wayne: "bruce wayne", joker: "joker", two_face: "two-face", harvey_dent: "harvey dent", harley: "harley quinn",
  superman: "superman", clark_kent: "clark kent", lex_luthor: "lex luthor",
  spider_man: "spider-man", peter_parker: "peter parker", green_goblin: "green goblin", daredevil: "daredevil", kingpin: "kingpin",
  iron_man: "iron man", hulk: "hulk", wolverine: "wolverine", black_panther: "black panther", doom: "doctor doom",
};

export const rosterKey = (name: string) => name.toLowerCase().trim().replace(/^the\s+/, "");
