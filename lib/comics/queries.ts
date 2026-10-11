import { createAdminServerClient } from "@/lib/supabase/admin";
import { ComicRecord, ComicSearchParams, ComicQueryResult } from "@/lib/comics/types";
import { createCachedQuery } from "@/lib/cache/wrapper";
import ce70Dossiers from "@/lib/equity/ce70-dossiers-data.json";
import { getAuthoritativeCoverStrict } from "@/lib/comics/cover-authority";
import { formatComicEquityTicker } from "@/lib/equity/ticker-formatting";
import { getVerifiedEquityByIdOrTicker } from "@/lib/equity/verified-equities-service";

export const DEFAULT_PAGE_SIZE = 24;

export async function getComics(params: ComicSearchParams): Promise<ComicQueryResult> {
  const supabase = createAdminServerClient();
  const limit = Math.min(Math.max(Number(params.limit) || DEFAULT_PAGE_SIZE, 1), 50);

  let query = supabase
    .from("comics")
    .select("*");

  const hasSearch = Boolean(params.q && params.q.trim());

  // Clean exposes series as its canonical text field; broader search fields are unavailable.
  if (hasSearch) {
    const cleanQ = params.q!.trim();
    query = query.ilike("series", `%${cleanQ.replace(/[%_]/g, "\\$&")}%`);
  }

  // Exact issue number filter
  if (params.issue && params.issue.trim()) {
    query = query.eq("issue_number", params.issue.trim());
  }

  // Publisher filter
  if (params.publisher && params.publisher.trim()) {
    const cleanPub = params.publisher.trim().replace(/[%_]/g, "\\$&");
    query = query.ilike("publisher", `%${cleanPub}%`);
  }

  // Keyset cursor pagination
  if (params.cursor && params.cursor.trim()) {
    query = query.gt("id", params.cursor.trim());
  }

  query = query.order("id", { ascending: true });

  query = query.limit(limit + 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching comics from Supabase:", error);
    return {
      comics: [],
      nextCursor: null,
      prevCursor: params.cursor || null,
      hasMore: false,
    };
  }

  const items: ComicRecord[] = (data as ComicRecord[]) || [];
  const hasMore = items.length > limit;
  const comics = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore && comics.length > 0 ? comics[comics.length - 1].id : null;

  return {
    comics,
    nextCursor,
    prevCursor: params.cursor || null,
    hasMore,
  };
}

export interface ParsedComicSlug {
  rawSeriesSlug: string;
  candidateSeries: string[];
  issueNumber: string;
  year?: number;
  variant?: string;
}

const KNOWN_TICKER_ROOTS: Record<string, string[]> = {
  tra: ["The Transformers", "Transformers"],
  asm: ["Amazing Spider-Man", "The Amazing Spider-Man"],
  bat: ["Batman", "Detective Comics"],
  act: ["Action Comics", "Superman"],
  det: ["Detective Comics", "Batman"],
  xmn: ["X-Men", "Uncanny X-Men", "The X-Men"],
  gsx: ["Giant-Size X-Men", "X-Men"],
  ff: ["Fantastic Four"],
  hul: ["Incredible Hulk", "The Incredible Hulk"],
  hlk: ["Incredible Hulk", "The Incredible Hulk"],
  ih: ["Incredible Hulk", "The Incredible Hulk"],
  tos: ["Tales of Suspense", "Iron Man"],
  tta: ["Tales to Astonish", "Hulk"],
  ji: ["Journey into Mystery", "Thor"],
  sm: ["Spider-Man", "Peter Parker, The Spectacular Spider-Man"],
  jim: ["Journey into Mystery", "Thor"],
  cap: ["Captain America"],
  av: ["Avengers", "The Avengers"],
  ave: ["Avengers", "The Avengers"],
  avg: ["Avengers", "The Avengers"],
  gl: ["Green Lantern"],
  fla: ["The Flash", "Flash"],
  dare: ["Daredevil"],
  dd: ["Daredevil"],
  sw: ["Secret Wars", "Marvel Super Heroes Secret Wars", "Star Wars"],
  tmnt: ["Teenage Mutant Ninja Turtles"],
  spawn: ["Spawn"],
  spw: ["Spawn"],
  wd: ["The Walking Dead", "Walking Dead"],
  wkd: ["The Walking Dead", "Walking Dead"],
  goc: ["God Country", "Gotham Central"],
  con: ["DC Connect", "Coneheads"],
  dkk: ["Batman: The Dark Knight", "The Dark Knight Returns", "Dark Knight Returns", "Batman: Legends of the Dark Knight"],
  dkr: ["The Dark Knight Returns", "Dark Knight Returns"],
  dki: ["Dark Knight III: The Master Race"],
  dks: ["Dark Knight Strikes Again"],
  ldk: ["Batman: Legends of the Dark Knight"],
  wch: ["Watchmen"],
  tod: ["The Tomb of Dracula", "Tomb of Dracula"],
  uf: ["Ultimate Fallout"],
  nm: ["New Mutants", "The New Mutants"],
  shc: ["Showcase"],
  st: ["Strange Tales"],
  css: ["Crime SuspenStories"],
  mad: ["MAD"],
  aqm: ["Aquaman"],
  inv: ["Invincible"],
  prc: ["Preacher"],
  snd: ["The Sandman", "Sandman"],
  hlb: ["Hellblazer", "John Constantine, Hellblazer"],
  swp: ["Swamp Thing", "The Saga of the Swamp Thing"],
  ntt: ["The New Teen Titans", "New Teen Titans", "Teen Titans"],
  jla: ["Justice League of America", "Justice League"],
  btb: ["The Brave and the Bold", "Brave and the Bold"],
  ylm: ["Y: The Last Man"],
  kgc: ["Kingdom Come"],
  wos: ["Web of Spider-Man"],
  fns: ["Friendly Neighborhood Spider-Man"],
  sns: ["Sensational Spider-Man"],
  mms: ["Miles Morales: Spider-Man"],
  usm: ["Ultimate Spider-Man"],
  ssm: ["The Spectacular Spider-Man", "Spectacular Spider-Man", "Peter Parker, The Spectacular Spider-Man"],
  bwk: ["Batman: White Knight"],
  bsb: ["Batman: Shadow of the Bat"],
  bdk: ["Batman: The Dark Knight"],
  asb: ["All-Star Batman"],
  abm: ["Absolute Batman"],
  bar: ["Batman and Robin"],
  bmb: ["Batman Beyond"],
  bma: ["The Batman Adventures", "Batman Adventures"],
  wca: ["West Coast Avengers"],
  yav: ["Young Avengers"],
  sav: ["Secret Avengers"],
  nav: ["New Avengers"],
  uav: ["Uncanny Avengers"],
  xft: ["X-Factor"],
  xfc: ["X-Force"],
  anx: ["All-New X-Men"],
  nxm: ["New X-Men"],
  wxm: ["Weapon X"],
  uxm: ["Ultimate X-Men"],
  axm: ["Astonishing X-Men"],
  th: ["Thor", "The Mighty Thor"],
  ww: ["Wonder Woman"],
  ss: ["Silver Surfer"],
  irm: ["Iron Man", "The Invincible Iron Man"],
  asc: ["All Star Comics"],
};

/**
 * Robust slug parser that breaks URLs, web slugs, and compound keys into canonical candidate series titles,
 * issue numbers, and optional publication years.
 * Examples:
 *   - "the-transformers-4-1985" -> series: ["The Transformers", "Transformers"], issue: "4", year: 1985
 *   - "amazing-spider-man-300" -> series: ["Amazing Spider-Man", "The Amazing Spider-Man", ...], issue: "300"
 *   - "https://www.pricecharting.com/game/comic-books-transformers/the-transformers-4-1985" -> extracted & resolved
 */
export function parseComicSlug(slug: string): ParsedComicSlug {
  const clean = slug
    .trim()
    .replace(/^https?:\/\/[^\/]+\/(?:game\/[^\/]+\/)?/i, "")
    .replace(/^\/comics\//i, "")
    .replace(/^\/equity\//i, "")
    .replace(/[\/\?#].*$/, "")
    .trim();

  // Pattern 0: Standard Financial Equity Ticker (e.g. TRA.004.SOV, ASM.300.SOV, GOC01, CON04, DKK01, ASM300)
  const tickerMatch = clean.match(/^([a-z]{2,5})[._]?(\d{1,4})(?:\.[a-z0-9]+)?$/i);
  if (tickerMatch) {
    const root = tickerMatch[1].toLowerCase();
    const issue = String(parseInt(tickerMatch[2], 10));
    const candidateSeries = KNOWN_TICKER_ROOTS[root] ? [...KNOWN_TICKER_ROOTS[root]] : [];

    // Also enrich candidate series from verified equities lookup if available
    try {
      const dbMatch = getVerifiedEquityByIdOrTicker(clean);
      if (dbMatch?.series && !candidateSeries.includes(dbMatch.series)) {
        candidateSeries.unshift(dbMatch.series);
      }
    } catch (_) {}

    return {
      rawSeriesSlug: root,
      candidateSeries,
      issueNumber: issue,
    };
  }

  // Pattern 1: series-issue-year (e.g. the-transformers-4-1985, amazing-spider-man-300-1988)
  const patternYear = clean.match(/^(.*?)[-_](\d+[\w.]*)[-_](19\d\d|20\d\d)(?:[-_](.*))?$/i);
  let rawSeries = "";
  let issue = "1";
  let year: number | undefined = undefined;
  let variant: string | undefined = undefined;

  if (patternYear) {
    rawSeries = patternYear[1];
    issue = patternYear[2];
    year = parseInt(patternYear[3], 10);
    variant = patternYear[4];
  } else {
    // Pattern 2: series-issue (e.g. the-transformers-4, amazing-spider-man-300)
    const patternStandard = clean.match(/^(.*?)[-_](\d+[\w.]*)(?:[-_](.*))?$/i);
    if (patternStandard) {
      rawSeries = patternStandard[1];
      issue = patternStandard[2];
      variant = patternStandard[3];
    } else {
      rawSeries = clean;
      issue = "1";
    }
  }

  const words = rawSeries.replace(/[-_]+/g, " ").trim().split(/\s+/).filter(Boolean);
  const titleCased = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  const candidates = new Set<string>();
  if (titleCased) {
    candidates.add(titleCased);

    if (/^the\s+/i.test(titleCased)) {
      candidates.add(titleCased.replace(/^the\s+/i, ""));
    } else {
      candidates.add(`The ${titleCased}`);
    }

    const hyphenated = titleCased
      .replace(/\bSpider Man\b/i, "Spider-Man")
      .replace(/\bX Men\b/i, "X-Men")
      .replace(/\bIron Man\b/i, "Iron-Man")
      .replace(/\bAnt Man\b/i, "Ant-Man")
      .replace(/\bBat Man\b/i, "Batman")
      .replace(/\bSuper Man\b/i, "Superman");
    candidates.add(hyphenated);
    if (/^the\s+/i.test(hyphenated)) {
      candidates.add(hyphenated.replace(/^the\s+/i, ""));
    } else {
      candidates.add(`The ${hyphenated}`);
    }

    if (titleCased.toLowerCase().includes(" and ")) {
      candidates.add(titleCased.replace(/\band\b/gi, "&"));
    }
    if (titleCased.includes("&")) {
      candidates.add(titleCased.replace(/&/g, "and"));
    }
    if (titleCased.toLowerCase().includes("vs")) {
      candidates.add(titleCased.replace(/\bvs\.?\b/gi, "vs."));
      candidates.add(titleCased.replace(/\bvs\.?\b/gi, "Vs"));
      candidates.add(titleCased.replace(/\bvs\.?\b/gi, "Vs."));
    }

    if (year) {
      candidates.add(`${titleCased} (${year})`);
      candidates.add(`${titleCased} (${year - 1})`);
      candidates.add(`${hyphenated} (${year})`);
      candidates.add(`${hyphenated} (${year - 1})`);
    }
  }

  return {
    rawSeriesSlug: rawSeries,
    candidateSeries: Array.from(candidates),
    issueNumber: issue,
    year,
    variant,
  };
}

/**
 * Marks a real `comics` row for display. Nothing is added from outside the row except:
 *  - the ticker (a symbol derived from series + issue),
 *  - the CE70 seat number when this exact book is a seat in the CE70 index,
 *  - a cover from the verified-cover registry when one exists for this exact book.
 * Prices, dates, publisher, census and every other field are exactly what is stored.
 */
function finalizeComic(comic: ComicRecord): ComicRecord {
  const existingPp = (comic.panel_profits_data && typeof comic.panel_profits_data === "object") ? comic.panel_profits_data : {};
  const title = `${(comic.series || "").trim()} #${(comic.issue_number || "").trim()}`.toLowerCase();
  const seat = (ce70Dossiers as any[]).find((d) => {
    if (comic.id && d.canonicalId && String(d.canonicalId).toLowerCase() === comic.id.toLowerCase()) return true;
    return String(d.title || "").toLowerCase() === title &&
      (!d.year || !comic.publication_year || Number(d.year) === Number(comic.publication_year));
  });

  const authCover = getAuthoritativeCoverStrict(comic.series, comic.issue_number, comic.publisher, comic.publication_year);

  return {
    ...comic,
    ...(authCover ? {
      cover_url: authCover,
      cover_original_url: authCover,
      cover_retrieval_url: authCover,
      cover_source: "VERIFIED_REGISTRY",
    } : {}),
    panel_profits_data: {
      ...existingPp,
      ticker: (existingPp as any).ticker?.replace(/\.SOV$/i, "") || formatComicEquityTicker(comic.series, comic.issue_number),
      ...(seat ? { seat_number: Number(seat.seatNumber) } : {}),
    } as any,
  };
}

/** Best-priced stored `comics` row for a series + issue (+ year when given). null when the book is not stored. */
async function findStoredComic(series: string, issue: string, year?: number | null): Promise<ComicRecord | null> {
  if (!series || !issue) return null;
  try {
    const supabase = createAdminServerClient();
    let q = supabase.from("comics").select("*").eq("series", series).eq("issue_number", issue);
    if (year) q = q.eq("publication_year", year);
    let { data } = await q.order("pp_grade_9_8_price", { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
    if (!data && year) {
      // The stored year can disagree with the book's real year; fall back to the best-priced record for the title.
      ({ data } = await supabase.from("comics").select("*").eq("series", series).eq("issue_number", issue)
        .order("pp_grade_9_8_price", { ascending: false, nullsFirst: false }).limit(1).maybeSingle());
    }
    return data ? finalizeComic(data as ComicRecord) : null;
  } catch (err) {
    console.warn("Notice looking up stored comic by series and issue:", err);
    return null;
  }
}

/**
 * One path in, from the stored tables only:
 *  1. record id (hex / uuid)            -> comics.id
 *  2. PriceCharting number (pp-123456)  -> comics.pp_source_id
 *  3. CE70 seat reference (seat-7)      -> the seat's book in comics
 *  4. ticker or verified-equity id      -> verified_equities (Supabase) -> comics
 * Anything else is not stored, so null.
 */
export async function getComicById(id: string): Promise<ComicRecord | null> {
  if (!id || typeof id !== "string") return null;

  let cleanId = decodeURIComponent(id)
    .trim()
    .replace(/^https?:\/\/[^\/]+\/(?:game\/[^\/]+\/)?/i, "")
    .replace(/^\/comics\//i, "")
    .replace(/^\/equity\//i, "")
    .replace(/[\/\?#].*$/, "")
    .replace(/^\$/, "")
    .trim();
  if (!cleanId) return null;

  const supabase = createAdminServerClient();
  const isHexOrUuid = /^[a-f0-9]{32,64}$/i.test(cleanId) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const isPpNumeric = /^(pp-)?\d{4,10}$/i.test(cleanId);

  try {
    // 1. record id
    if (isHexOrUuid) {
      const { data } = await supabase.from("comics").select("*").eq("id", cleanId).maybeSingle();
      return data ? finalizeComic(data as ComicRecord) : null;
    }

    // 2. PriceCharting number
    if (isPpNumeric) {
      const { data } = await supabase
        .from("comics")
        .select("*")
        .eq("pp_source_id", cleanId.replace(/^pp-/i, ""))
        .order("pp_grade_9_8_price", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      return data ? finalizeComic(data as ComicRecord) : null;
    }

    // 3. CE70 seat reference
    const seatMatch = cleanId.match(/^(?:seat|ce70)[-_]?(\d+)$/i);
    if (seatMatch) {
      const seat = (ce70Dossiers as any[]).find((d) => Number(d.seatNumber) === parseInt(seatMatch[1], 10));
      if (!seat) return null;
      const parts = String(seat.title).split(/#(\d+.*)/);
      return await findStoredComic(parts[0]?.trim() || seat.title, parts[1]?.trim() || "1", seat.year ? Number(seat.year) : null);
    }

    // 4. ticker or verified-equity id
    const { data: ve } = await supabase
      .from("verified_equities")
      .select("series,issue_number,publication_year,source_product_id")
      .or(`id.eq.${cleanId},ticker.eq.${cleanId.toUpperCase()}`)
      .order("fmv_usd", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    if (ve) {
      if (ve.source_product_id) {
        const { data } = await supabase
          .from("comics")
          .select("*")
          .eq("pp_source_id", String(ve.source_product_id))
          .order("pp_grade_9_8_price", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();
        if (data) return finalizeComic(data as ComicRecord);
      }
      return await findStoredComic(ve.series, ve.issue_number, ve.publication_year);
    }
  } catch (err) {
    console.warn("getComicById lookup failed:", err);
  }
  return null;
}

export type ComicsPricingCoverage = {
  totalCount: number | null;
  pricedCount: number | null;
};

/**
 * Real, dynamically-queried catalog-scale counts (no hardcoded figures): how many
 * `comics` rows exist versus how many actually carry pricing (`comicbase_price` or
 * `pp_grade_9_8_price` populated). Used so pages that surface a priced subset (e.g. the
 * market ticker) can say honestly how much of the catalog that subset represents,
 * instead of implying the whole catalog is priced.
 */
async function fetchComicsPricingCoverageRaw(): Promise<ComicsPricingCoverage> {
  const supabase = createAdminServerClient();
  const [total, priced] = await Promise.all([
    supabase.from("comics").select("*", { count: "exact", head: true }),
    supabase
      .from("comics")
      .select("*", { count: "exact", head: true })
      .or("comicbase_price.not.is.null,pp_grade_9_8_price.not.is.null"),
  ]);

  if (total.error) console.error("Error counting comics catalog:", total.error);
  if (priced.error) console.error("Error counting priced comics:", priced.error);

  return {
    totalCount: total.error ? null : total.count,
    pricedCount: priced.error ? null : priced.count,
  };
}

export const getComicsPricingCoverage = createCachedQuery(
  fetchComicsPricingCoverageRaw,
  "comics-pricing-coverage",
  { ttlSeconds: 3600, staleWhileRevalidateSeconds: 86400, tags: ["comics", "pricing"] }
);

/** Highest-priced stored comics that have a cover. Database rows only; no local fallback list. */
async function fetchFeaturedComicsRaw(limit = 12): Promise<ComicRecord[]> {
  try {
    const supabase = createAdminServerClient();
    const { data, error } = await supabase
      .from("comics")
      .select("*")
      .not("cover_url", "is", null)
      .gt("baseline_grade_9_8_value", 50)
      .order("baseline_grade_9_8_value", { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map((row) => finalizeComic(row as ComicRecord));
    }
  } catch (err) {
    console.warn("Notice querying Supabase for featured comics:", err);
  }
  return [];
}

export const getFeaturedComics = createCachedQuery(
  fetchFeaturedComicsRaw,
  "featured-comics-market",
  { ttlSeconds: 600, staleWhileRevalidateSeconds: 3600, tags: ["comics", "featured"] }
);
