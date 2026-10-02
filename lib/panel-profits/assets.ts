import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { panelProfitsGrades, comicBaseGrades, getHighestGradedPrice } from "@/lib/pricing/source-ladder";
import { INITIAL_SURFACE_ASSETS } from "@/lib/assets/initial-assets";

export interface AssetRegistryRecord {
  id: string;
  series: string;
  issue_number: string | null;
  publisher: string | null;
  index_value: number | null;
  source: string | null;
  cover: { image_url: string | null; storage_path: string | null } | null;
}

export interface EquityRegistryRecord {
  id: string;
  variant_id: string;
  anchor_grade: string | null;
  anchor_price_usd: number | null;
  anchor_sales_volume: number | null;
  anchor_confidence: string | null;
  sov_grade: string | null;
  sov_price_usd: number | null;
  asset_class: string | null;
  price_9_9_usd: number | null;
  price_10_0_usd: number | null;
  census_total_graded: number | null;
  census_9_8: number | null;
  census_9_9: number | null;
  census_10_0: number | null;
  scarcity_tier: string | null;
  supply_adjustment: number | null;
  computed_at: string | null;
  comic: {
    id: string;
    series: string;
    issue_number: string | null;
    publisher: string | null;
    publication_year: number | null;
  } | null;
}

export interface DetailedAssetSurface {
  id: string;
  surface_key: string;
  series: string;
  title: string | null;
  issue_number: string | null;
  publisher: string | null;
  publication_year: number | null;
  origin_era: string | null;
  production_age: string | null;
  lineage: string | null;
  reference_grade: string | null;
  reference_fmv_usd: number | null;
  price_formatted: string | null;
  gregory_score: number | null;
  evidence_confidence: string | null;
  seat_number: number | null;
  seat_type: string | null;
  status: string;
  cover_url: string | null;
  canonical_issue_id: string | null;
  source: string;
}

export async function getAssetRegistry(limit = 48): Promise<AssetRegistryRecord[]> {
  try {
    const db = createCleanReadOnlyServerClient();
    
    // First query CE70 equity universe records
    const { data: equityRows } = await db
      .from("ce70_equity_universe")
      .select("id, series, issue_number, reference_fmv_usd, cover_url, canonical_issue_id, origin_era")
      .order("reference_fmv_usd", { ascending: false })
      .limit(limit);

    // Also query comics catalog with valid cover URLs
    const { data: comicRows } = await db
      .from("comics")
      .select("id, series, issue_number, publisher, baseline_grade_9_8_value, pp_grade_9_8_price, cover_url, cover_storage_path")
      .not("cover_url", "is", null)
      .order("baseline_grade_9_8_value", { ascending: false, nullsFirst: false })
      .limit(limit);

    const results: AssetRegistryRecord[] = [];
    const seenIds = new Set<string>();

    if (equityRows && equityRows.length > 0) {
      for (const row of equityRows) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          results.push({
            id: row.id,
            series: row.series || "Unknown Series",
            issue_number: row.issue_number || null,
            publisher: "Constitutional CE70",
            index_value: row.reference_fmv_usd ? Number(row.reference_fmv_usd) : null,
            source: "CE70 Universe",
            cover: {
              image_url: row.cover_url || null,
              storage_path: null,
            },
          });
        }
      }
    }

    if (comicRows && comicRows.length > 0) {
      for (const row of comicRows) {
        if (!seenIds.has(row.id) && results.length < limit) {
          seenIds.add(row.id);
          results.push({
            id: row.id,
            series: row.series || "Unknown Series",
            issue_number: row.issue_number || null,
            publisher: row.publisher || null,
            index_value: row.baseline_grade_9_8_value ? Number(row.baseline_grade_9_8_value) : (row.pp_grade_9_8_price ? Number(row.pp_grade_9_8_price) : null),
            source: "Clean Catalog",
            cover: {
              image_url: row.cover_url || null,
              storage_path: row.cover_storage_path || null,
            },
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error("Failed to load asset registry:", err);
    return [];
  }
}

export async function getEquityRegistry(limit = 48): Promise<EquityRegistryRecord[]> {
  try {
    const db = createCleanReadOnlyServerClient();
    const { data: rows, error } = await db
      .from("ce70_equity_universe")
      .select("*")
      .order("reference_fmv_usd", { ascending: false })
      .limit(limit);

    if (error || !rows) {
      console.warn("Failed to fetch CE70 equity universe:", error?.message);
      return [];
    }

    return rows.map((r) => {
      const refGrade = r.reference_grade ? String(r.reference_grade) : null;
      const refPrice = r.reference_fmv_usd ? Number(r.reference_fmv_usd) : null;
      const is99 = refGrade === "9.9";
      const is100 = refGrade === "10.0" || refGrade === "10";

      return {
        id: r.id,
        variant_id: r.canonical_issue_id || r.id,
        anchor_grade: refGrade || (refPrice ? "UNGRADED" : "Unpriced"),
        anchor_price_usd: refPrice,
        anchor_sales_volume: null,
        anchor_confidence: r.evidence_confidence || "HIGH_HISTORICAL",
        sov_grade: refGrade || (refPrice ? "UNGRADED" : "Unpriced"),
        sov_price_usd: refPrice,
        asset_class: r.origin_era ? `${String(r.origin_era).toUpperCase()}_EQUITY` : "SOVEREIGN_EQUITY",
        price_9_9_usd: is99 ? refPrice : null,
        price_10_0_usd: is100 ? refPrice : null,
        census_total_graded: null,
        census_9_8: null,
        census_9_9: null,
        census_10_0: null,
        scarcity_tier: Number(r.reference_fmv_usd || 0) > 10000 ? "ULTRA_TIER_1" : "INVESTMENT_GRADE",
        supply_adjustment: 1.05,
        computed_at: r.updated_at || r.created_at || new Date().toISOString(),
        comic: {
          id: r.id,
          series: r.series || "Unknown Series",
          issue_number: r.issue_number || null,
          publisher: "Marvel / DC",
          publication_year: null,
        },
      };
    });
  } catch (err) {
    console.error("Failed to load equity registry:", err);
    return [];
  }
}

export async function getCleanEquityDetail(surfaceKey: string): Promise<DetailedAssetSurface | null> {
  try {
    const db = createCleanReadOnlyServerClient();
    const cleanKey = surfaceKey.trim();

    // 0. If key is a seat reference (e.g. seat-1, seat-01, 1), check ce70_index_definitions & ce70_equity_universe
    const seatMatch = cleanKey.match(/^(?:seat-?)?(\d+)$/i);
    const seatNum = seatMatch ? parseInt(seatMatch[1], 10) : null;

    if (seatNum != null) {
      // Check ce70_index_definitions first for rich constitutional metadata
      const { data: indexDef } = await db
        .from("ce70_index_definitions")
        .select("*")
        .eq("seat_number", seatNum)
        .maybeSingle();

      // Also check ce70_equity_universe for pricing
      const { data: equitySeat } = await db
        .from("ce70_equity_universe")
        .select("*")
        .eq("seat_number", seatNum)
        .order("reference_fmv_usd", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (indexDef || equitySeat) {
        const title = indexDef?.title_issue || equitySeat?.title || equitySeat?.series || "Constitutional Seat";
        const series = indexDef?.series || equitySeat?.series || title;
        const issueNum = indexDef?.issue_number || equitySeat?.issue_number || "1";
        const refPrice = equitySeat?.reference_fmv_usd ? Number(equitySeat.reference_fmv_usd) : null;
        const gScore = indexDef?.gregory_score ? Number(indexDef.gregory_score) : (equitySeat?.gregory_score ? Number(equitySeat.gregory_score) : 195.0);

        return {
          id: `seat-${seatNum}`,
          surface_key: cleanKey,
          series,
          title,
          issue_number: issueNum,
          publisher: indexDef?.publisher || equitySeat?.publisher || "Independent / Classic",
          publication_year: indexDef?.year || null,
          origin_era: String(indexDef?.era || equitySeat?.origin_era || "GOLDEN").toUpperCase(),
          production_age: String(indexDef?.era || equitySeat?.production_age || "GOLDEN").toUpperCase(),
          lineage: `${series} Constitutional Lineage`,
          reference_grade: equitySeat?.reference_grade ? String(equitySeat.reference_grade) : "9.8",
          reference_fmv_usd: refPrice,
          price_formatted: equitySeat?.price_formatted || (refPrice ? `$${refPrice.toLocaleString()}` : "Unpriced"),
          gregory_score: gScore,
          evidence_confidence: "CONSTITUTIONAL_CE70_VERIFIED",
          seat_number: seatNum,
          seat_type: "PRIMARY_DOMESTIC",
          status: "CERTIFIED_ACTIVE",
          cover_url: indexDef?.cover_url || equitySeat?.cover_url || null,
          canonical_issue_id: equitySeat?.canonical_issue_id || `iss_seat_${seatNum}`,
          source: "CE70 Constitutional Seat",
        };
      }
    }

    // 0.5. Check Multi-Asset and Derivative Instruments in INITIAL_SURFACE_ASSETS
    const normalizedKey = cleanKey.replace(/^\$/, "").toUpperCase();
    const matchedAsset = INITIAL_SURFACE_ASSETS.find(
      (a) =>
        (a.assetId && a.assetId.toUpperCase() === normalizedKey) ||
        (a.entryId && a.entryId.toUpperCase() === normalizedKey) ||
        (a.symbol && a.symbol.replace(/^\$/, "").toUpperCase() === normalizedKey) ||
        (a.displayName && a.displayName.toUpperCase() === normalizedKey)
    );

    if (matchedAsset) {
      const p = matchedAsset.pricing;
      const fmv = p.fmv_usd ?? p.fmv ?? p.price ?? 0;
      const effectiveKey = matchedAsset.assetId || matchedAsset.entryId;
      return {
        id: matchedAsset.entryId,
        surface_key: effectiveKey,
        series: matchedAsset.displayName,
        title: matchedAsset.description || null,
        issue_number: matchedAsset.symbol,
        publisher: matchedAsset.universe || "Alternative Sovereign Instrument",
        publication_year: p.maturity ? parseInt(String(p.maturity), 10) : 2026,
        origin_era: p.era ? String(p.era).toUpperCase() : "DERIVATIVE_MULTI_ASSET",
        production_age: p.production_age ? String(p.production_age).toUpperCase() : "MULTI_ASSET",
        lineage: `${matchedAsset.assetType} Instrument · ${matchedAsset.universe || "Sovereign Alternative Asset"}`,
        reference_grade: matchedAsset.assetType,
        reference_fmv_usd: fmv,
        price_formatted: `$${fmv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        gregory_score: 195.0,
        evidence_confidence: "SOVEREIGN_ASSET_COVENANT_VERIFIED",
        seat_number: null,
        seat_type: matchedAsset.assetType,
        status: "ACTIVE_INSTRUMENT",
        cover_url: matchedAsset.coverImageUrl || `/surface-art/${matchedAsset.assetType.toLowerCase()}.png`,
        canonical_issue_id: `asset_${effectiveKey.toLowerCase()}`,
        source: `Multi-Asset Class (${matchedAsset.assetType})`,
      };
    }

    // 1. Try finding by ID or canonical_issue_id in ce70_equity_universe
    const { data: equityRow } = await db
      .from("ce70_equity_universe")
      .select("*")
      .or(`id.eq.${surfaceKey},canonical_issue_id.eq.${surfaceKey}`)
      .maybeSingle();

    if (equityRow) {
      const refGrade = equityRow.reference_grade ? String(equityRow.reference_grade) : null;
      const refPrice = equityRow.reference_fmv_usd ? Number(equityRow.reference_fmv_usd) : null;
      return {
        id: equityRow.id,
        surface_key: surfaceKey,
        series: equityRow.series || equityRow.title || "Comic Asset",
        title: equityRow.title || null,
        issue_number: equityRow.issue_number || null,
        publisher: "CE70 Constitutional Allocation",
        publication_year: null,
        origin_era: equityRow.origin_era || null,
        production_age: equityRow.production_age || null,
        lineage: equityRow.lineage || null,
        reference_grade: refGrade || (refPrice ? "UNGRADED" : "Unpriced"),
        reference_fmv_usd: refPrice,
        price_formatted: equityRow.price_formatted || (refPrice ? `$${refPrice.toLocaleString()}` : "Unpriced"),
        gregory_score: equityRow.gregory_score ? Number(equityRow.gregory_score) : null,
        evidence_confidence: equityRow.evidence_confidence || "HIGH_HISTORICAL",
        seat_number: equityRow.seat_number || null,
        seat_type: equityRow.seat_type || "PRIMARY_DOMESTIC",
        status: equityRow.status || "ACTIVE_CERTIFIED",
        cover_url: equityRow.cover_url || null,
        canonical_issue_id: equityRow.canonical_issue_id || null,
        source: "CE70 Sovereign Universe",
      };
    }

    // 2. Try finding in public.comics
    const { data: comicRow } = await db
      .from("comics")
      .select("*")
      .eq("id", surfaceKey)
      .maybeSingle();

    if (comicRow) {
      // Determine authentic highest graded price and reference grade
      const ppLadder = panelProfitsGrades(comicRow);
      const cbLadder = comicBaseGrades(comicRow);
      const highest = getHighestGradedPrice({
        "Panel Profits": ppLadder,
        "ComicBase": cbLadder,
      });

      let finalGrade: string | null = null;
      let finalPrice: number | null = null;

      if (highest) {
        finalGrade = highest.grade;
        finalPrice = highest.price;
      } else if (comicRow.baseline_grade_9_8_value) {
        finalGrade = "9.8";
        finalPrice = Number(comicRow.baseline_grade_9_8_value);
      } else if (comicRow.pp_grade_9_8_price) {
        finalGrade = "9.8";
        finalPrice = Number(comicRow.pp_grade_9_8_price);
      } else if (comicRow.comicbase_price) {
        finalGrade = "RAW";
        finalPrice = Number(comicRow.comicbase_price);
      }

      return {
        id: comicRow.id,
        surface_key: surfaceKey,
        series: comicRow.series || "Comic Asset",
        title: comicRow.title || null,
        issue_number: comicRow.issue_number || null,
        publisher: comicRow.publisher || null,
        publication_year: comicRow.publication_year ? Number(comicRow.publication_year) : null,
        origin_era: null,
        production_age: null,
        lineage: null,
        reference_grade: finalGrade || "Unpriced",
        reference_fmv_usd: finalPrice,
        price_formatted: finalPrice ? `$${finalPrice.toLocaleString()}` : "Unpriced",
        gregory_score: null,
        evidence_confidence: "VERIFIED_CATALOG",
        seat_number: null,
        seat_type: null,
        status: "ACTIVE_CATALOG",
        cover_url: comicRow.cover_url || null,
        canonical_issue_id: comicRow.id,
        source: "Clean Master Comics Catalog",
      };
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch clean equity detail:", err);
    return null;
  }
}
