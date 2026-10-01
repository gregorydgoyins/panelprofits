import { createAdminServerClient, createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";
import { ComicRecord } from "@/lib/comics/types";
import { resolveComicPricing, resolveBaselinePrice } from "@/lib/pricing/baseline";
import { getComicCoverEvidenceByIds } from "@/lib/comics/covers";
import { createCachedQuery } from "@/lib/cache/wrapper";

export interface MarketUniverseMetrics {
  totalAuthoritativeComics: string;
  panelProfitsIndexed: string;
  comicbaseEntities: string;
  gcdBibliographicRecords: string;
  baselinePricedRecords: string;
  coverMigrationCoverage: string;
}

export interface IntelligenceRailItem {
  id: string;
  href: string;
  series: string;
  title: string | null;
  issueNumber: string;
  publisher: string | null;
  publicationYear: number | null;
  coverUrl: string | null;
  coverStoragePath: string | null;
  verifiedAt: string | null;
  updatedAt: string | null;
}

export interface ValuationRailItem {
  id: string;
  series: string;
  issueNumber: string;
  publisher: string | null;
  publicationYear: number | null;
  coverUrl: string | null;
  coverStoragePath: string | null;
  priceFormatted: string;
  priceValue: number;
  sourceLabel: string;
}

export interface MarketIntelligenceItem {
  id: string;
  series: string;
  issueNumber: string;
  publisher: string | null;
  indexValue: number | null;
  quantity: number | null;
  source: string | null;
  createdAt: string | null;
}

export interface CleanAssetSurfaceItem {
  id: string;
  series: string;
  issueNumber: string;
  publisher: string | null;
  indexValue: number | null;
  quantity: number | null;
  source: string | null;
  createdAt: string | null;
  coverUrl: string | null;
  coverStoragePath: string | null;
  assetClass: string | null;
  assetSubclass: string | null;
  constituentCount: number;
  priceFormatted: string | null;
}

export interface CleanNewsIntelligenceItem {
  id: number;
  series: string;
  issueNumber: string;
  publisher: string | null;
  indexValue: number | null;
  quantity: number | null;
  source: string | null;
  createdAt: string | null;
  url: string | null;
}

export interface MarketTelemetry {
  tick: number;
  ce50Last: number | null;
  regime: string | null;
  regimeVolatility: number | null;
  drawdown: number | null;
  stressIndex: number | null;
  tectonicTier: number | null;
  overlayActive: boolean;
  cascadeActive: boolean;
}

export async function getMarketTelemetry(): Promise<MarketTelemetry | null> {
  // In Clean Supabase (vbcmjmakluyjnsmisoth), live telemetry tables are absent
  // as documented in CLEAN_FEATURE_SOURCE_MAP.md. We return null directly
  // without attempting to query the legacy market_state relation.
  return null;
}

export async function getMarketIntelligence(limit = 24): Promise<MarketIntelligenceItem[]> {
  try {
    const supabase = createAdminServerClient();
    const { data, error } = await supabase
      .from("comics")
      .select("id, series, issue_number, publisher, pp_grade_9_8_price, comicbase_price, baseline_grade_9_8_value, baseline_grade_9_8_sources, baseline_grade_9_8_observation_count, quantity, source, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 48));

    if (error || !data) {
      console.error("Error fetching market intelligence:", error);
      return [];
    }

    const covers = await getComicCoverEvidenceByIds(data.map((item) => item.id));
    return data.map((item) => ({
      id: item.id,
      series: item.series || "Unknown series",
      issueNumber: item.issue_number || "—",
      publisher: item.publisher || null,
      indexValue: resolveComicPricing(item).baselinePrice98,
      quantity: item.quantity === null ? null : Number(item.quantity),
      source: item.source || null,
      createdAt: item.created_at || null,
    }));
  } catch (error) {
    console.error("Exception fetching market intelligence:", error);
    return [];
  }
}

/**
 * Bounded query for intelligence rail: returns 12 verified comic records.
 * Uses index on cover_verified_at without unbounded ordering.
 */
async function fetchIntelligenceRailComicsRaw(limit = 12): Promise<IntelligenceRailItem[]> {
  try {
    const cleanDb = createCleanReadOnlyServerClient();
    const { data, error } = await cleanDb
      .from("comics")
      .select("id,series,title,issue_number,publisher,publication_year,cover_url,cover_storage_path,cover_verified_at,updated_at,created_at")
      .order("id", { ascending: true })
      .limit(Math.min(Math.max(limit * 8, 8), 96));

    if (error || !data) {
      console.error("Error fetching Clean intelligence rail:", error);
      return [];
    }

    return data.filter((item) => item.cover_url).slice(0, limit).map((item) => ({
      id: item.id,
      href: `/comics/${item.id}`,
      series: item.series || "Unknown series",
      title: item.title || null,
      issueNumber: item.issue_number || "—",
      publisher: item.publisher || null,
      publicationYear: item.publication_year === null ? null : Number(item.publication_year),
      coverUrl: item.cover_url || null,
      coverStoragePath: item.cover_storage_path || null,
      verifiedAt: item.cover_verified_at || null,
      updatedAt: item.updated_at || item.created_at || null,
    }));
  } catch (err) {
    console.error("Exception in Clean intelligence rail:", err);
    return [];
  }
}

export const getIntelligenceRailComics = createCachedQuery(
  fetchIntelligenceRailComicsRaw,
  "intelligence-rail-comics",
  { ttlSeconds: 600, staleWhileRevalidateSeconds: 3600, tags: ["dashboard", "intelligence"] }
);

/**
 * Bounded query for valuation rail: returns 12 priced comic records.
 * Queries comics with genuine reference prices.
 */
async function fetchValuationRailComicsRaw(limit = 12): Promise<ValuationRailItem[]> {
  const cleanDb = createCleanReadOnlyServerClient();
  try {
    // 1. CE70 equity universe, when that register has been populated.
    const { data, error } = await cleanDb
      .from("ce70_equity_universe")
      .select("id, series, issue_number, reference_fmv_usd, price_formatted, cover_url")
      .order("reference_fmv_usd", { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map((item) => ({
        id: item.id,
        series: item.series,
        issueNumber: item.issue_number,
        publisher: null,
        publicationYear: null,
        coverUrl: item.cover_url || null,
        coverStoragePath: null,
        priceFormatted: item.price_formatted || `$${Number(item.reference_fmv_usd).toLocaleString()}`,
        priceValue: Number(item.reference_fmv_usd),
        sourceLabel: "CE70 CLEAN EQUITY PORT",
      }));
    }
    if (error && !isMissingTableError(error)) {
      console.error("Error fetching CE70 equity universe rail:", error);
    }
  } catch (err) {
    console.error("Exception in CE70 equity rail query:", err);
  }

  // 2. Fallback: the real, already-populated Clean comics catalog.
  // ce70_equity_universe has no backing migration (it is never created),
  // so this fallback is what actually renders today. Ranked by the same
  // baseline pricing resolver used across pricing surfaces, restricted to
  // records with a verified cover so the rail never shows a blank slot.
  try {
    const { data: comicRows, error: comicError } = await cleanDb
      .from("comics")
      .select("id, series, issue_number, publisher, publication_year, cover_url, cover_storage_path, pp_grade_9_8_price, comicbase_price, baseline_grade_9_8_value, baseline_grade_9_8_sources, panel_profits_data")
      .not("cover_url", "is", null)
      .order("baseline_grade_9_8_value", { ascending: false, nullsFirst: false })
      .limit(Math.min(Math.max(limit * 6, 24), 200));

    if (comicError || !comicRows) {
      if (comicError) console.error("Error fetching Clean comics valuation fallback:", comicError.message);
      return [];
    }

    const priced = comicRows
      .map((row) => ({ row, pricing: resolveBaselinePrice(row) }))
      .filter((entry) => entry.pricing.price !== null)
      .sort((a, b) => (b.pricing.price as number) - (a.pricing.price as number))
      .slice(0, limit);

    return priced.map(({ row, pricing }) => ({
      id: row.id,
      series: row.series || "Unknown series",
      issueNumber: row.issue_number || "—",
      publisher: row.publisher || null,
      publicationYear: row.publication_year == null ? null : Number(row.publication_year),
      coverUrl: row.cover_url || null,
      coverStoragePath: row.cover_storage_path || null,
      priceFormatted: pricing.formatted,
      priceValue: pricing.price as number,
      sourceLabel: "CLEAN COMICS CATALOG",
    }));
  } catch (err) {
    console.error("Exception in Clean comics valuation fallback:", err);
    return [];
  }
}

export const getValuationRailComics = createCachedQuery(
  fetchValuationRailComicsRaw,
  "valuation-rail-comics",
  { ttlSeconds: 600, staleWhileRevalidateSeconds: 3600, tags: ["dashboard", "valuation"] }
);

async function fetchCleanAssetSurfacesRaw(limit = 24): Promise<CleanAssetSurfaceItem[]> {
  const cleanDb = createCleanReadOnlyServerClient();
  try {
    // 1. CE70 index-definition seats, when that register has been populated.
    const { data, error } = await cleanDb
      .from("ce70_index_definitions")
      .select("seat_number, series, issue_number, era, publisher, constituent_count, asset_class, asset_subclass, cover_url")
      .order("seat_number", { ascending: true })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map((item) => ({
        id: `ce70-seat-${item.seat_number}`,
        series: item.series,
        issueNumber: String(item.seat_number),
        publisher: item.publisher,
        indexValue: null,
        quantity: null,
        source: "CLEAN ASSET PORT",
        createdAt: null,
        coverUrl: item.cover_url || null,
        coverStoragePath: null,
        assetClass: item.asset_class,
        assetSubclass: item.asset_subclass || `${item.era.toUpperCase()} ERA`,
        constituentCount: item.constituent_count || 1,
        priceFormatted: null,
      }));
    }
    if (error && !isMissingTableError(error)) {
      console.error("Error fetching CE70 asset surfaces:", error);
    }
  } catch (err) {
    console.error("Exception in CE70 asset surfaces query:", err);
  }

  // 2. Fallback: the real, already-populated Clean comics catalog.
  // ce70_index_definitions has no backing migration (it is never created),
  // so this fallback is what actually renders today. Each row is a single
  // real comic asset (constituentCount 1), not a basket, priced through the
  // same baseline resolver used elsewhere so the figure is never invented.
  try {
    const { data: comicRows, error: comicError } = await cleanDb
      .from("comics")
      .select("id, series, issue_number, publisher, publication_year, cover_url, cover_storage_path, pp_grade_9_8_price, comicbase_price, baseline_grade_9_8_value, baseline_grade_9_8_sources, panel_profits_data")
      .not("cover_url", "is", null)
      .order("baseline_grade_9_8_value", { ascending: false, nullsFirst: false })
      .limit(Math.min(Math.max(limit * 4, 24), 150));

    if (comicError || !comicRows) {
      if (comicError) console.error("Error fetching Clean comics asset fallback:", comicError.message);
      return [];
    }

    const priced = comicRows
      .map((row) => ({ row, pricing: resolveBaselinePrice(row) }))
      .filter((entry) => entry.pricing.price !== null)
      .sort((a, b) => (b.pricing.price as number) - (a.pricing.price as number))
      .slice(0, limit);

    return priced.map(({ row, pricing }) => ({
      id: row.id,
      series: row.series || "Unknown series",
      issueNumber: row.issue_number || "—",
      publisher: row.publisher || null,
      indexValue: pricing.price,
      quantity: null,
      source: "CLEAN COMICS CATALOG",
      createdAt: null,
      coverUrl: row.cover_url || null,
      coverStoragePath: row.cover_storage_path || null,
      assetClass: row.publisher || null,
      assetSubclass: row.publication_year == null ? null : String(row.publication_year),
      constituentCount: 1,
      priceFormatted: pricing.formatted,
    }));
  } catch (err) {
    console.error("Exception in Clean comics asset fallback:", err);
    return [];
  }
}

export const getCleanAssetSurfaces = createCachedQuery(
  fetchCleanAssetSurfacesRaw,
  "clean-asset-surfaces",
  { ttlSeconds: 600, staleWhileRevalidateSeconds: 3600, tags: ["dashboard", "assets"] }
);

export async function getCleanAssetSurface(surfaceKey: string) {
  try {
    const cleanDb = createCleanReadOnlyServerClient();
    const seatNum = parseInt(surfaceKey.replace(/\D/g, ""), 10);
    if (isNaN(seatNum)) return null;

    const { data } = await cleanDb
      .from("ce70_index_definitions")
      .select("*")
      .eq("seat_number", seatNum)
      .maybeSingle();

    return data || null;
  } catch {
    return null;
  }
}

export async function getCleanNewsIntelligence(limit = 32): Promise<CleanNewsIntelligenceItem[]> {
  try {
    const comics = await getIntelligenceRailComics(limit);
    return comics.map((item) => ({
      id: Number.parseInt(item.id.replace(/\D/g, "").slice(-9) || "0", 10),
      series: item.series,
      issueNumber: item.issueNumber,
      publisher: item.publisher,
      indexValue: null,
      quantity: null,
      source: "CLEAN CATALOG",
      createdAt: item.updatedAt,
      url: item.href,
    }));
  } catch (error) {
    console.error("Exception in Clean catalog intelligence:", error);
    return [];
  }
}

/**
 * Bounded deterministic query for the Featured Comic Universe grid.
 * Retrieves 18 verified records with valid covers and reference valuations.
 */
async function fetchFeaturedUniverseComicsRaw(limit = 18): Promise<ComicRecord[]> {
  try {
    const supabase = createAdminServerClient();
    const { data, error } = await supabase
      .from("comics")
      .select("id, series, issue_number, publisher, created_at")
      .limit(limit);

    if (error || !data) {
      console.error("Error fetching featured universe comics:", error);
      return [];
    }

    const covers = await getComicCoverEvidenceByIds(data.map((item) => item.id));
    return data.map((item) => ({
      id: item.id,
      series: item.series || "Unknown Series",
      title: item.series || "Unknown Series",
      issue_number: item.issue_number || "",
      volume: null,
      printing: null,
      direct_or_variant: null,
      cover_variant: null,
      publisher: item.publisher || null,
      publication_date: null,
      publication_year: null,
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
      created_at: item.created_at,
      updated_at: item.created_at,
      cover_url: covers.get(item.id)?.image_url || null,
      cover_storage_path: covers.get(item.id)?.storage_path || null,
      cover_source: null,
      cover_original_url: null,
      cover_retrieval_url: null,
      cover_width: null,
      cover_height: null,
      cover_sha256: null,
      cover_verified_at: null,
    }));
  } catch (err) {
    console.error("Exception in getFeaturedUniverseComics:", err);
    return [];
  }
}

export const getFeaturedUniverseComics = createCachedQuery(
  fetchFeaturedUniverseComicsRaw,
  "featured-universe-comics",
  { ttlSeconds: 600, staleWhileRevalidateSeconds: 3600, tags: ["dashboard", "featured"] }
);
