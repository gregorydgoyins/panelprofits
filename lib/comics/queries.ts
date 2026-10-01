import { createAdminServerClient, createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { ComicRecord, ComicSearchParams, ComicQueryResult } from "@/lib/comics/types";
import { getComicCoverEvidence } from "@/lib/comics/covers";
import { createCachedQuery } from "@/lib/cache/wrapper";

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

export async function getComicById(id: string): Promise<ComicRecord | null> {
  if (!id || typeof id !== "string") return null;

  const supabase = createAdminServerClient();
  const { data, error } = await supabase
    .from("comics")
    .select("*")
    .eq("id", id.trim())
    .maybeSingle();

  if (error) {
    console.error(`Error fetching comic with ID ${id}:`, error);
    return null;
  }

  if (data) return data as ComicRecord;

  const cleanDb = createCleanReadOnlyServerClient();
  const { data: ppcf, error: cleanError } = await cleanDb
    .from("ppcf_canonical_comics")
    .select("ppcf_id,series_name,issue_number,publication_date,issue_title,variant_name,created_at,cover_url,cover_storage_path,cover_source")
    .eq("ppcf_id", id.trim())
    .maybeSingle();

  if (cleanError || !ppcf) return null;

  const timestamp = ppcf.created_at || new Date().toISOString();
  const series = ppcf.series_name || "Verified Comic";
  const year = ppcf.publication_date ? parseInt(ppcf.publication_date.slice(0, 4), 10) || null : null;

  return {
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
    cover_verified_at: ppcf.cover_url ? timestamp : null,
  };
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

async function fetchFeaturedComicsRaw(limit = 6): Promise<ComicRecord[]> {
  const supabase = createAdminServerClient();
  const { data, error } = await supabase
    .from("comics")
    .select("*")
    .not("comicbase_price", "is", null)
    .gt("comicbase_price", 50)
    .order("id", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured comics:", error);
    return [];
  }

  return (data as ComicRecord[]) || [];
}

export const getFeaturedComics = createCachedQuery(
  fetchFeaturedComicsRaw,
  "featured-comics-market",
  { ttlSeconds: 600, staleWhileRevalidateSeconds: 3600, tags: ["comics", "featured"] }
);
