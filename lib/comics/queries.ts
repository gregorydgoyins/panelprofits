import { createAdminServerClient, createCleanReadOnlyServerClient, createPublicReadOnlyClient } from "@/lib/supabase/admin";
import { ComicRecord, ComicSearchParams, ComicQueryResult } from "@/lib/comics/types";
import { createCachedQuery } from "@/lib/cache/wrapper";
import ce70Dossiers from "@/lib/equity/ce70-dossiers-data.json";
import { getAuthoritativeCoverStrict } from "@/lib/comics/cover-authority";
import { formatComicEquityTicker } from "@/lib/equity/ticker-formatting";
import { getCatalogComicById, getCatalogComicBySourceProductId, getVerifiedEquityByIdOrTicker } from "@/lib/equity/verified-equities-service";
import ppix100Data from "@/lib/equity/ppix-100-constituents.json";

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
    const { data } = await q.order("pp_grade_9_8_price", { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
    return data ? finalizeComic(data as ComicRecord) : null;
  } catch (err) {
    console.warn("Notice looking up stored comic by series and issue:", err);
    return null;
  }
}

export async function getComicById(id: string): Promise<ComicRecord | null> {
  if (!id || typeof id !== "string") return null;

  // Layer 0: Normalization & alias resolution
  let cleanId = decodeURIComponent(id)
    .trim()
    .replace(/^https?:\/\/[^\/]+\/(?:game\/[^\/]+\/)?/i, "")
    .replace(/^\/comics\//i, "")
    .replace(/^\/equity\//i, "")
    .replace(/[\/\?#].*$/, "")
    .replace(/^\$/, "")
    .trim();

  // Spawn #300 (4th Printing) alias for variant prefix or OCR typo hash
  if (
    cleanId.includes("9100c0db") ||
    cleanId.includes("9100cedb") ||
    cleanId.includes("9100ccdb") ||
    (cleanId.startsWith("var-prt4") && cleanId.includes("33455"))
  ) {
    cleanId = "9100cedb288d14d461a02acb8fe23bc9d8bb2fbbbea33455e3996ada7fe4d562";
  }

  // Strip landmark- or lm- prefixes (e.g. landmark-act01, landmark-act01-0, lm-act01)
  if (/^(?:landmark|lm)-/i.test(cleanId)) {
    cleanId = cleanId.replace(/^(?:landmark|lm)-/i, "").replace(/-\d+$/, "");
  }

  // Strip variant prefixes like var-prt4-, var-cvr-a-, or extract embedded 64-char hex ID
  if (cleanId.startsWith("var-")) {
    const embeddedHex = cleanId.match(/([a-f0-9]{64})/i)?.[1];
    if (embeddedHex) {
      cleanId = embeddedHex;
    } else {
      cleanId = cleanId.replace(/^var-(?:[a-z0-9]+-)+/i, "").replace(/^(?:var-)+/i, "");
    }
  }

  // 1985 Transformers #4 Skybound reprint or typo hash -> original Marvel 1985 #4
  if (
    cleanId === "c2fd6ba5cc9177887397a07fb5c804b7eb1cdc7c33c8ab51dada672679073c2" ||
    cleanId === "f461f722956cfb813b19b7a421b44ec74a9eb492211ea7c6999a36f6d0f666f3" ||
    cleanId.startsWith("f461f722956")
  ) {
    cleanId = "f461f7228539e44876fde6b1e331bda11357a7556b13bafd28afd5cdab5add12";
  }
  // Blue Book #4 typo redirect
  if (cleanId === "7cd12c0bab811858f9abdbbf427c00f23a74979f90bd90f022cf1721f81047d4") {
    cleanId = "7ed12c0bab811858f9abdbbf427c00f23a74979f90bd90f022cf1721f81047d4";
  }
  // Fantastic Four Annual #7 typo redirect
  if (
    cleanId === "9eba4562c5d04bbacb9c33d4c073d25901cf87cda8d1531b7f4bdd3cc21a1390" ||
    cleanId.startsWith("9eba4562c5")
  ) {
    cleanId = "9eba4562c6d04bbacb9e33d4c073d25901ef87ede8d1631b7f4bdd3ce21a1390";
  }

  // Layer 1: direct primary key match (hex SHA-256 / UUID / numeric pp_source_id)
  const isHexOrUuid = /^[a-f0-9]{32,64}$/i.test(cleanId) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const isPpNumeric = /^pp-\d+$/i.test(cleanId) || /^\d{4,10}$/.test(cleanId);

  if (isHexOrUuid || isPpNumeric) {
    try {
      const supabase = createAdminServerClient();
      let query = supabase.from("comics").select("*");
      if (isPpNumeric) {
        const numId = cleanId.replace(/^pp-/i, "");
        query = query.eq("pp_source_id", numId).order("pp_grade_9_8_price", { ascending: false, nullsFirst: false }).limit(1);
      } else {
        query = query.eq("id", cleanId).limit(1);
      }
      let { data, error } = await query.maybeSingle();
      if ((error || !data) && !isPpNumeric) {
        try {
          const pub = createPublicReadOnlyClient();
          const pubRes = await pub.from("comics").select("*").eq("id", cleanId).maybeSingle();
          if (pubRes.data) {
            data = pubRes.data;
            error = null;
          }
        } catch (_) {}
      }
      if (!error && data) return finalizeComic(data as ComicRecord);

      // Local catalog mirror: a stored row with the same fields, used only when the database has no row.
      const sqliteRow = getCatalogComicById(cleanId);
      if (sqliteRow) {
        const stamp = new Date().toISOString();
        return finalizeComic({
          id: sqliteRow.id,
          series: sqliteRow.series,
          title: sqliteRow.title || sqliteRow.series,
          issue_number: sqliteRow.issue_number,
          volume: null,
          printing: null,
          direct_or_variant: sqliteRow.variant || null,
          cover_variant: null,
          publisher: sqliteRow.publisher || null,
          publication_date: null,
          publication_year: sqliteRow.publication_year || null,
          upc: null,
          alt_upc: null,
          pp_source_id: sqliteRow.source_product_id || null,
          comicbase_source_id: sqliteRow.comicbase_id || null,
          gcd_source_id: sqliteRow.gcd_id || null,
          pp_grade_9_8_price: sqliteRow.fmv_usd || null,
          comicbase_price: null,
          baseline_grade_9_8_value: sqliteRow.fmv_usd || null,
          baseline_grade_9_8_sources: null,
          baseline_grade_9_8_observation_count: null,
          panel_profits_data: sqliteRow.ticker ? ({ ticker: sqliteRow.ticker } as any) : null,
          comicbase_data: null,
          gcd_data: null,
          search_document: null,
          created_at: stamp,
          updated_at: stamp,
          cover_url: sqliteRow.cover_url || null,
          cover_storage_path: null,
          cover_source: "local_catalog",
          cover_original_url: sqliteRow.cover_url || null,
          cover_retrieval_url: sqliteRow.cover_url || null,
          cover_width: null,
          cover_height: null,
          cover_sha256: null,
          cover_verified_at: null,
        });
      }
    } catch (dbErr) {
      console.warn("Direct DB lookup notice in getComicById:", dbErr);
    }
  }

  // Layer 2: ticker or id known to the verified-equity index -> the stored comics row for that book
  const localVerified = getVerifiedEquityByIdOrTicker(cleanId);
  if (localVerified) {
    const ppId = (localVerified as any).source_product_id ? String((localVerified as any).source_product_id) : null;
    if (ppId) {
      try {
        const supabase = createAdminServerClient();
        const { data } = await supabase
          .from("comics")
          .select("*")
          .eq("pp_source_id", ppId)
          .order("pp_grade_9_8_price", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();
        if (data) return finalizeComic(data as ComicRecord);
      } catch (err) {
        console.warn("Notice looking up stored comic for verified equity:", err);
      }
    }
    const byTitle = await findStoredComic(localVerified.series, localVerified.issue_number, localVerified.publication_year);
    if (byTitle) return byTitle;
  }

  // Layer 3: CE70 seat reference (seat-7, ce70-7, canonical id, title slug or ticker) -> stored comics row
  const seatMatch = cleanId.match(/^(?:seat|ce70)[-_]?(\d+)$/i) || (cleanId.match(/^(\d+)$/) ? [null, cleanId] : null);
  const targetSeatNum = seatMatch ? parseInt(seatMatch[1], 10) : null;

  const matchedSeat = (ce70Dossiers as any[]).find((d) => {
    if (targetSeatNum !== null && Number(d.seatNumber) === targetSeatNum) return true;
    if (d.canonicalId && d.canonicalId.toLowerCase() === cleanId.toLowerCase()) return true;
    if (String(d.title).toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanId.toLowerCase()) return true;

    const seriesName = String(d.title).split("#")[0].trim();
    const issueNum = (String(d.title).match(/#(\d+[\w-]*)/) || ["", "1"])[1];
    const ticker = formatComicEquityTicker(seriesName, issueNum);
    const cleanQuery = cleanId.toLowerCase().replace(/[^a-z0-9]/g, "");
    return ticker.toLowerCase() === cleanId.toLowerCase() || ticker.toLowerCase() === cleanQuery;
  });

  if (matchedSeat) {
    const titleParts = String(matchedSeat.title).split(/#(\d+.*)/);
    const seriesName = titleParts[0]?.trim() || matchedSeat.title;
    const issueNum = titleParts[1]?.trim() || "1";
    const stored = await findStoredComic(seriesName, issueNum, matchedSeat.year ? Number(matchedSeat.year) : null);
    if (stored) return stored;
  }

  // PPIX 100 constituent (ppix-100-7) -> stored comics row
  const ppixMatch = cleanId.match(/^ppix[-_]?100[-_]?(\d+)$/i);
  if (ppixMatch) {
    const book = (ppix100Data as any[])[parseInt(ppixMatch[1], 10) - 1];
    if (book) {
      const stored = await findStoredComic(book.series, String(book.issueNumber), book.year ? Number(book.year) : null);
      if (stored) return stored;
    }
  }

  // Layer 4: PPCF canonical comics table (real stored row; carries no prices)
  if (/^ppcf[-_]/i.test(cleanId) || cleanId.startsWith("PPCF-")) {
    try {
      const cleanDb = createCleanReadOnlyServerClient();
      const { data: ppcf, error: cleanError } = await cleanDb
        .from("ppcf_canonical_comics")
        .select("ppcf_id,series_name,issue_number,publication_date,issue_title,variant_name,created_at,cover_url,cover_storage_path,cover_source")
        .eq("ppcf_id", cleanId)
        .maybeSingle();

      if (!cleanError && ppcf) {
        const timestamp = ppcf.created_at || new Date().toISOString();
        const series = ppcf.series_name || "";
        const year = ppcf.publication_date ? parseInt(ppcf.publication_date.slice(0, 4), 10) || null : null;
        return finalizeComic({
          id: ppcf.ppcf_id,
          series,
          title: ppcf.issue_title || series,
          issue_number: ppcf.issue_number || "",
          volume: null,
          printing: null,
          direct_or_variant: ppcf.variant_name || null,
          cover_variant: null,
          publisher: null,
          publication_date: ppcf.publication_date || null,
          publication_year: year,
          upc: null,
          alt_upc: null,
          pp_source_id: null,
          comicbase_source_id: null,
          gcd_source_id: null,
          pp_grade_9_8_price: null,
          comicbase_price: null,
          baseline_grade_9_8_value: null,
          baseline_grade_9_8_sources: null,
          baseline_grade_9_8_observation_count: null,
          panel_profits_data: null,
          comicbase_data: null,
          gcd_data: null,
          search_document: null,
          created_at: timestamp,
          updated_at: timestamp,
          cover_url: ppcf.cover_url || null,
          cover_storage_path: ppcf.cover_storage_path || null,
          cover_source: ppcf.cover_source || null,
          cover_original_url: ppcf.cover_url || null,
          cover_retrieval_url: ppcf.cover_url || null,
          cover_width: null,
          cover_height: null,
          cover_sha256: null,
          cover_verified_at: null,
        });
      }
    } catch (ppcfErr) {
      console.warn("Notice querying ppcf_canonical_comics:", ppcfErr);
    }
  }

  // Layer 5: CE70 equity universe (ids, tickers, slugs, canonical ids) -> stored comics row
  try {
    const cleanDb = createCleanReadOnlyServerClient();
    const normalizedId = cleanId.toLowerCase();
    const cleanSlug = normalizedId.replace(/[^a-z0-9]/g, "");

    let { data: eqRow } = await cleanDb
      .from("ce70_equity_universe")
      .select("*")
      .or(`id.eq.${cleanId},canonical_issue_id.eq.${cleanId}`)
      .maybeSingle();

    if (!eqRow) {
      const { data: allEquities } = await cleanDb.from("ce70_equity_universe").select("*");
      if (allEquities && allEquities.length > 0) {
        eqRow = allEquities.find((r: any) => {
          if (r.id.toLowerCase() === normalizedId) return true;
          if (r.canonical_issue_id && r.canonical_issue_id.toLowerCase() === normalizedId) return true;
          const ticker = formatComicEquityTicker(r.series, r.issue_number);
          if (ticker.toLowerCase() === normalizedId || ticker.toLowerCase().replace(/\./g, "") === cleanSlug) return true;
          const slug = (r.series + r.issue_number).toLowerCase().replace(/[^a-z0-9]/g, "");
          const cidSlug = (r.canonical_issue_id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return slug === cleanSlug || (cidSlug.length > 0 && cidSlug.includes(cleanSlug));
        }) || null;
      }
    }

    if (eqRow) {
      const stored = await findStoredComic(eqRow.series, eqRow.issue_number || "1");
      if (stored) return stored;
    }
  } catch (err) {
    console.warn("Notice querying ce70_equity_universe in getComicById:", err);
  }

  // Layer 6: slug / title / issue resolution (web slugs, PriceCharting URLs, canonical titles)
  const parsedSlug = parseComicSlug(cleanId);
  if (parsedSlug.candidateSeries.length > 0 && parsedSlug.issueNumber) {
    try {
      const supabase = createAdminServerClient();
      let slugQuery = supabase
        .from("comics")
        .select("*")
        .in("series", parsedSlug.candidateSeries)
        .eq("issue_number", parsedSlug.issueNumber);
      if (parsedSlug.year) slugQuery = slugQuery.eq("publication_year", parsedSlug.year);
      slugQuery = slugQuery.order("pp_grade_9_8_price", { ascending: false, nullsFirst: false }).limit(1);
      let { data: slugComic } = await slugQuery.maybeSingle();

      if (!slugComic && parsedSlug.year) {
        const retryRes = await supabase
          .from("comics")
          .select("*")
          .in("series", parsedSlug.candidateSeries)
          .eq("issue_number", parsedSlug.issueNumber)
          .order("pp_grade_9_8_price", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();
        if (retryRes.data) slugComic = retryRes.data;
      }
      if (slugComic) return finalizeComic(slugComic as ComicRecord);
    } catch (slugDbErr) {
      console.warn("Notice in slug resolution query against Supabase:", slugDbErr);
    }

    try {
      for (const candSeries of parsedSlug.candidateSeries) {
        const catalogMatch = getCatalogComicBySourceProductId(null, candSeries, parsedSlug.issueNumber);
        if (catalogMatch?.source_product_id) {
          const supabase = createAdminServerClient();
          const { data: byProdId } = await supabase
            .from("comics")
            .select("*")
            .eq("pp_source_id", catalogMatch.source_product_id)
            .limit(1)
            .maybeSingle();
          if (byProdId) return finalizeComic(byProdId as ComicRecord);
        }
      }
    } catch (sqliteErr) {
      console.warn("Notice in catalog slug fallback:", sqliteErr);
    }
  }

  // Layer 7: fuzzy series search against the stored comics rows
  try {
    const supabase = createAdminServerClient();
    const cleanSearch = cleanId.replace(/[-_]+/g, " ").trim();
    if (cleanSearch.length >= 3) {
      const { data: searchMatches } = await supabase
        .from("comics")
        .select("*")
        .ilike("series", `%${cleanSearch.replace(/[%_]/g, "\\$&")}%`)
        .order("pp_grade_9_8_price", { ascending: false, nullsFirst: false })
        .limit(1);
      if (searchMatches && searchMatches.length > 0) return finalizeComic(searchMatches[0] as ComicRecord);
    }
  } catch (searchErr) {
    console.warn("Notice in Layer 7 search fallback:", searchErr);
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
