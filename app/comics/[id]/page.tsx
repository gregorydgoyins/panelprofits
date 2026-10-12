import { notFound, redirect } from "next/navigation";
import { getComicById } from "@/lib/comics/queries";
import { getCurrentUser, getComicUserStatus } from "@/lib/account/queries";
import { PricingDossier } from "@/components/comics/pricing-dossier";
import { displayIssue, displaySeries } from "@/lib/comics/display";
import { getComicCoverEvidence } from "@/lib/comics/covers";
import { getComicCensusDossier } from "@/lib/comics/census";
import { resolveIssueDebuts } from "@/lib/wiki/debut-resolver";
import { getAuthoritativeCover } from "@/lib/comics/cover-authority";
import { coverSourceContradictsPublisher } from "@/lib/comics/cover-trust";
import { resolveAuthoritativePublisher } from "@/lib/comics/publisher-authority";
import { formatComicEquityTicker } from "@/lib/equity/ticker-formatting";
import { GcdBibliographicDossier } from "@/components/comics/gcd-bibliographic-dossier";
import { AtomicVariantsAndInternationalMatrix } from "@/components/comics/atomic-variants-and-international-matrix";
import { BlendedHoldingDossier } from "@/components/comics/blended-holding-dossier";
import { findComicBaseVideoForComic } from "@/lib/video/comicbase-archive";
import { ComicBaseVideoPlayer } from "@/components/comics/comicbase-video-player";
import { ComparativePriceMatrix } from "@/components/comics/comparative-price-matrix";
import { VideoIntelligenceCard } from "@/components/comics/video-intelligence-card";
import { getGcdRelationalData } from "@/lib/comics/gcd-relational-service";
import AuctionHistoryCard from "@/components/detail/equity/AuctionHistoryCard";
import HeroSection from "@/components/detail/equity/HeroSection";
import TopChartSection from "@/components/detail/equity/TopChartSection";
import PriceStatsPanel from "@/components/detail/equity/PriceStatsPanel";
import NewsPanel from "@/components/detail/equity/NewsPanel";
import type { DetailResponse } from "@/components/detail/equity/types";
import { getEraColors, getScarcityColors, type ScarcityTier } from "@/lib/design-system/colors";
import { panelProfitsGrades } from "@/lib/pricing/source-ladder";
import { buildComicPriceHistory, normalizeGradeLabel } from "@/lib/pricing/historical-chronology";
import { resolvePriceTier, isDirectEdition, PREMIUM_MIN_PRICE } from "@/lib/pricing/market-tiers";
import StorySummaryCard from "@/components/detail/equity/StorySummaryCard";
import { Suspense } from "react";
import { resolveGcdStoryDossier } from "@/lib/comics/gcd-story-service";
import { createAdminServerClient } from "@/lib/supabase/admin";

import { DealerQuotesCard } from "@/components/comics/dealer-quotes-card";
import { MarketTruthPanel } from "@/components/detail/shared/MarketTruthPanel";
import { ProvenanceLedger } from "@/components/detail/shared/ProvenanceLedger";
import { classifyScarcityTier } from "@/lib/equity/scarcity-float";
import {
  toSaleList, lastSale, countSalesByGrade, latestSnapshotDate, delta24hPct, ppSpreadAnchors,
  censusNinePlus, buildCompleteness, buildProvenanceLedger, buildQuote, pickQuoteGrade,
  type SaleRow, type SnapshotObservation, type ExecutionQuote,
} from "@/lib/comics/detail-model";

export const dynamic = "force-dynamic";

interface ComicDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatPrinting(value: string | number | null): string {
  if (value === null || value === undefined || value === "") return "1st Printing";
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) return /printing/i.test(raw) ? raw : `${raw} Printing`;
  const n = Number(raw);
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th"
    : n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th";
  return `${n}${suffix} Printing`;
}

export default async function ComicDetailPage({ params }: ComicDetailPageProps) {
  const { id } = await params;

  // 1985 Transformers #4 alias redirect if user lands on 2024 Skybound reprint or typo hash
  if (
    id === "c2fd6ba5cc9177887397a07fb5c804b7eb1cdc7c33c8ab51dada672679073c2" ||
    id === "f461f722956cfb813b19b7a421b44ec74a9eb492211ea7c6999a36f6d0f666f3" ||
    id.startsWith("f461f722956")
  ) {
    redirect("/comics/f461f7228539e44876fde6b1e331bda11357a7556b13bafd28afd5cdab5add12");
  }

  // TMNT The Last Ronin Lost Day Special #1 alias redirect if user lands on OCR typo hash
  if (id === "71d3934cef37bf272f668bc5c9d4bcccbcaa347c3bf2f3d3b0c9541783433792") {
    redirect("/comics/71d3934caf37bf272f668bc5c9d4bcecbcee347e3bf2f3d3b0c954f783433792");
  }

  // Fantastic Four Annual #7 typo redirect if user lands on OCR typo hash
  if (
    id === "9eba4562c5d04bbacb9c33d4c073d25901cf87cda8d1531b7f4bdd3cc21a1390" ||
    id.startsWith("9eba4562c5")
  ) {
    redirect("/comics/9eba4562c6d04bbacb9e33d4c073d25901ef87ede8d1631b7f4bdd3ce21a1390");
  }

  // Spawn #300 (4th Printing) alias redirect for variant prefix or OCR typo hash
  const CANONICAL_SPAWN_300_4TH_PRINT = "9100cedb288d14d461a02acb8fe23bc9d8bb2fbbbea33455e3996ada7fe4d562";
  if (
    id !== CANONICAL_SPAWN_300_4TH_PRINT &&
    (id.includes("9100c0db") ||
      id.includes("9100cedb") ||
      id.includes("9100ccdb") ||
      (id.startsWith("var-prt4") && id.includes("33455")))
  ) {
    redirect(`/comics/${CANONICAL_SPAWN_300_4TH_PRINT}`);
  }

  let comic = null;
  let user = null;

  try {
    [comic, user] = await Promise.all([
      getComicById(id),
      getCurrentUser().catch(() => null),
    ]);
  } catch (err) {
    console.error("Error loading comic detail base record:", err);
  }

  if (!comic) {
    notFound();
  }

  // Canonical redirection: outward-facing URLs use ticker (e.g. /comics/BGN01 or /comics/ACT01)
  // Internal database IDs/hashes are resolved and masked
  const canonicalTicker = (comic.panel_profits_data as any)?.ticker || (comic as any).ticker || formatComicEquityTicker(comic.series, comic.issue_number);
  const targetSlug = canonicalTicker ? canonicalTicker.replace(/^\$/, "") : comic.id;
  const currentClean = id.trim().replace(/^\$/, "");

  // A record id (hex/uuid or PriceCharting number) names exactly one stored comic. A ticker does not
  // (Batman #30 has dozens of records), so never redirect a record id to its ticker.
  const isRecordId = /^[a-f0-9]{32,64}$/i.test(currentClean) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentClean) || /^(pp-)?\d{4,10}$/i.test(currentClean);
  if (!isRecordId && targetSlug && targetSlug.toLowerCase() !== currentClean.toLowerCase()) {
    redirect(`/comics/${targetSlug}`);
  }

  const cbVideo = findComicBaseVideoForComic(comic.series, comic.issue_number);

  const [coverEvidence, censusDossier, userStatus, gcdRelational, gcdStoryDossier] = await Promise.all([
    getComicCoverEvidence(comic.id).catch((err) => {
      console.warn("Cover evidence read unavailable:", err);
      return null;
    }),
    getComicCensusDossier(comic.series, comic.issue_number, { publicationYear: comic.publication_year }).catch((err) => {
      console.warn("Census dossier read unavailable:", err);
      return null;
    }),
    user
      ? getComicUserStatus(comic.id).catch((err) => {
          console.warn("User status read unavailable:", err);
          return {
            isInCollection: false,
            collectionItem: null,
            isInWatchlist: false,
            watchlistItem: null,
          };
        })
      : Promise.resolve({
          isInCollection: false,
          collectionItem: null,
          isInWatchlist: false,
          watchlistItem: null,
        }),
    getGcdRelationalData(
      comic.gcd_source_id || (comic.gcd_data as any)?.["GCD - gcd_issue.id"],
      comic.series && comic.publication_year && !comic.series.includes("(")
        ? `${comic.series} (${comic.publication_year})`
        : comic.series,
      comic.issue_number
    ).catch((err) => {
      console.warn("GCD relational read unavailable:", err);
      return null;
    }),
    resolveGcdStoryDossier(
      comic.gcd_source_id || (comic.gcd_data as any)?.["GCD - gcd_issue.id"] || (comic.gcd_data as any)?.["GCD Source ID"],
      comic.series,
      comic.issue_number,
      comic.publication_year
    ).catch((err) => {
      console.warn("GCD story dossier read unavailable:", err);
      return null;
    }),
  ]);
  const seriesLabel = displaySeries(comic.series, comic.issue_number);
  const issueLabel = displayIssue(comic.issue_number);
  const debut = resolveIssueDebuts(comic.series, comic.issue_number);
  const tickerSymbol =
    (comic.panel_profits_data as any)?.ticker ||
    formatComicEquityTicker(comic.series, comic.issue_number);

  // Non-pricing metadata hierarchy: GCD 1st -> ComicBase 2nd -> Legacy Master 3rd
  // Strictly separated from secondary market transaction / observation dates
  const resolvedPubDate =
    (comic.gcd_data as Record<string, unknown> | undefined)?.["GCD - gcd_issue.publication_date"] as string ||
    (comic.gcd_data as Record<string, unknown> | undefined)?.["issue_publication_date"] as string ||
    (comic.gcd_data as Record<string, unknown> | undefined)?.["publication_date"] as string ||
    (comic.comicbase_data as Record<string, unknown> | undefined)?.["pub_date"] as string ||
    comic.publication_date ||
    (comic.comicbase_data as Record<string, unknown> | undefined)?.["CB - Value Year 1"] as string ||
    null;

  const gcdData = (comic.gcd_data as Record<string, any>) || {};
  const gcdBadges = (gcdData.key_badges as string[]) || [];

  const authoritativePublisher = resolveAuthoritativePublisher(comic.series, comic.publisher, comic.publication_year);

  const sanitizeCreator = (val: any): string => {
    if (!val || typeof val !== "string") return "";
    const trimmed = val.trim();
    if (trimmed === "?" || trimmed === "none" || trimmed === "null" || trimmed === "undefined") return "";
    if (/[\u0400-\u04FF\uAC00-\uD7AF\u1100-\u11FF]/.test(trimmed)) return "";
    return trimmed;
  };

  const cleanGcdWriter = sanitizeCreator(gcdStoryDossier?.leadWriter) || sanitizeCreator(gcdData.writer) || sanitizeCreator(gcdData["GCD - story.writer"]) || sanitizeCreator((comic.comicbase_data as any)?.["CB - Writer"]) || (debut?.creators?.[0] ?? "");
  const cleanGcdPenciler = sanitizeCreator(gcdStoryDossier?.leadPenciler) || sanitizeCreator(gcdData.penciler) || sanitizeCreator(gcdData["GCD - story.penciler"]) || sanitizeCreator((comic.comicbase_data as any)?.["CB - Artist"]) || (debut?.creators?.[1] ?? "");
  const cleanGcdInker = sanitizeCreator(gcdStoryDossier?.leadInker) || sanitizeCreator(gcdData.inker) || sanitizeCreator(gcdData["GCD - story.inker"]);
  const cleanGcdColorist = sanitizeCreator(gcdStoryDossier?.leadColorist) || sanitizeCreator(gcdData.colorist) || sanitizeCreator(gcdData["GCD - story.colorist"]);
  const cleanGcdLetterer = sanitizeCreator(gcdStoryDossier?.leadLetterer) || sanitizeCreator(gcdData.letterer) || sanitizeCreator(gcdData["GCD - story.letterer"]);
  const cleanGcdEditor = sanitizeCreator(gcdStoryDossier?.leadEditor) || sanitizeCreator(gcdData.editor) || sanitizeCreator(gcdData["GCD - story.editor"]);

  const enrichedGcdData = {
    ...gcdData,
    story_title: gcdStoryDossier?.leadStoryTitle || gcdData.story_title || gcdData["GCD - story.lead_title"] || "",
    synopsis: gcdStoryDossier?.leadSynopsis || gcdData.synopsis || gcdData["GCD - story.synopsis"] || (comic.comicbase_data as any)?.["CB - Notes"] || "",
    characters: gcdStoryDossier?.leadCharacters || gcdData.characters || gcdData["GCD - story.characters"] || "",
    writer: cleanGcdWriter,
    penciler: cleanGcdPenciler,
    inker: cleanGcdInker,
    colorist: cleanGcdColorist,
    letterer: cleanGcdLetterer,
    editor: cleanGcdEditor,
    genre: gcdStoryDossier?.leadGenre || gcdData.genre || gcdData["GCD - story.genre"] || "",
  };
  const isCe70Seat = Boolean(
    (comic as any).seat_number ||
    (comic.panel_profits_data as any)?.seat_number ||
    (comic as any).is_ce70_seat
  );

  const ppData = (comic.panel_profits_data ?? {}) as Record<string, any>;
  const realEra: string | null = ppData.era || (comic as any).production_age || null;
  const eraColors = getEraColors(String(realEra || "modern").toLowerCase());
  const consensusFmv = Number(comic.pp_grade_9_8_price || comic.baseline_grade_9_8_value || 0);
  const candidateRawPrice = Number(
    (comic as any).pp_price_raw ||
    ppData["PP - Ungraded Market Price"] ||
    ppData["PP - Grade RAW Market Price"] ||
    ppData["raw_market_price"] ||
    comic.comicbase_price ||
    0
  );
  const effectivePrice = consensusFmv > 0 ? consensusFmv : candidateRawPrice;

  let railRows: Array<{ comics_id: string; cover_url: string | null; cover_source: string | null; cover_suspect: boolean | null; cgc_total: number | null; printing: string | null; variant_label: string | null; volume: string | null }> = [];
  const snapshotObservations: SnapshotObservation[] = [];
  let salesObservations: SaleRow[] = [];
  try {
    const supabase = createAdminServerClient();
    const cleanSourceId = comic.pp_source_id ? String(comic.pp_source_id).replace(/^pp-/i, "").trim() : null;

    // Dated sales for this title and issue. Restored and signed copies are different products, so they are left out.
    const salesPromise =
      comic.series && comic.issue_number
        ? supabase
            .from("graded_sales_observations")
            .select("sale_price, sale_date, native_grade_text, venue, native_designation, has_restoration, has_signature")
            .ilike("title_name", comic.series.replace(/[\\%_]/g, (m: string) => `\\${m}`))
            .eq("issue_number_raw", comic.issue_number)
            .not("has_restoration", "is", true)
            .not("has_signature", "is", true)
            .order("sale_date", { ascending: true })
            .limit(100)
        : Promise.resolve({ data: [] as SaleRow[] });

    const histPromise = cleanSourceId
      ? supabase
          .from("pp_price_history")
          .select("snapshot_date,pp_price_raw,pp_price_2_0,pp_price_3_0,pp_price_4_0,pp_price_5_0,pp_price_6_0,pp_price_7_0,pp_price_8_0,pp_price_9_0,pp_price_9_2,pp_price_9_4,pp_price_9_6,pp_price_9_8,pp_price_10_0")
          .eq("pp_id", cleanSourceId)
          .not("snapshot_date", "is", null)
          .order("snapshot_date", { ascending: true })
          .limit(400)
      : Promise.resolve({ data: [] as Array<Record<string, any>> });

    let railQuery = supabase
      .from("rail_books")
      .select("comics_id,cover_url,cover_source,cover_suspect,cgc_total,printing,variant_label,volume")
      .eq("series", comic.series)
      .eq("issue_number", String(comic.issue_number))
      .limit(8);
    if (comic.publication_year) railQuery = railQuery.eq("year", comic.publication_year);

    const [salesRes, histRes, railRes] = await Promise.all([
      salesPromise.then((r: any) => r, () => ({ data: [] })),
      histPromise.then((r: any) => r, () => ({ data: [] })),
      railQuery.then((r: any) => r, () => ({ data: null })),
    ]);

    salesObservations = (salesRes.data ?? []) as SaleRow[];
    if (railRes.data) railRows = railRes.data as typeof railRows;

    // Real dated Panel Profits prices: one row per PriceCharting snapshot (undated legacy loads are skipped).
    const gradeCols: Array<[string, string]> = [
      ["pp_price_raw", "RAW"], ["pp_price_2_0", "2.0"], ["pp_price_3_0", "3.0"], ["pp_price_4_0", "4.0"], ["pp_price_5_0", "5.0"],
      ["pp_price_6_0", "6.0"], ["pp_price_7_0", "7.0"], ["pp_price_8_0", "8.0"], ["pp_price_9_0", "9.0"], ["pp_price_9_2", "9.2"],
      ["pp_price_9_4", "9.4"], ["pp_price_9_6", "9.6"], ["pp_price_9_8", "9.8"], ["pp_price_10_0", "10.0"],
    ];
    for (const row of (histRes.data ?? []) as Array<Record<string, any>>) {
      for (const [col, grade] of gradeCols) {
        const amount = Number(row[col]);
        if (amount > 0) snapshotObservations.push({ amount, observed_at: row.snapshot_date, grade_label: grade });
      }
    }
  } catch (_) {}

  const salesByGrade = countSalesByGrade(salesObservations);
  const formattedSales = toSaleList(salesObservations, 20).map((s) => ({
    grade: s.grade,
    priceUsd: s.priceUsd,
    date: s.date,
    platform: s.platform ?? undefined,
  }));
  const latestSale = lastSale(salesObservations);
  const saleDates = toSaleList(salesObservations, 1000).map((s) => s.date).sort();
  const snapshotLatest = latestSnapshotDate(snapshotObservations);
  const snapshotCount = new Set(snapshotObservations.map((o) => o.observed_at)).size;

  const rawLattice = panelProfitsGrades(comic) as Record<string, number | undefined>;
  const gradeLattice = Object.entries(rawLattice).map(([grade, priceUsd]) => ({
    grade,
    priceUsd: Number(priceUsd),
    salesVolume: salesByGrade.get(grade) ?? null,
    observedAt: null,
  }));

  const railVolumeRaw = Number(railRows.find((r) => r.volume != null)?.volume);
  const railVolume = Number.isFinite(railVolumeRaw) && railVolumeRaw > 0 ? railVolumeRaw : null;
  const hasCensus = Boolean(censusDossier?.grades && censusDossier.grades.length > 0);
  const highGradeCount =
    censusDossier?.grades?.find((g) => g.grade_numeric === 9.8 || g.native_grade_text === "9.8")?.count_at_grade || 0;

  // CGC total from the catalog rail row when the census dossier has no snapshot for this book.
  const railCgcTotal = Number(
    (railRows.find((r) => r.comics_id === comic.id && Number(r.cgc_total) > 0) ??
      railRows.find((r) => !r.variant_label && Number(r.cgc_total) > 0))?.cgc_total || 0
  );
  const totalGradedCount = Number(
    censusDossier?.snapshot?.total_graded ||
    (hasCensus && censusDossier?.grades ? censusDossier.grades.reduce((acc, g) => acc + (g.count_at_grade || 0), 0) : 0) ||
    railCgcTotal
  );
  const censusSnapshotDate = censusDossier?.snapshot?.snapshot_timestamp || null;

  const censusSummary = {
    totalGraded: totalGradedCount,
    highGradeCount,
    snapshotDate: censusSnapshotDate ?? "",
    histogram: hasCensus && censusDossier?.grades
      ? censusDossier.grades.map((b) => ({
          grade: String(b.grade_numeric ?? b.native_grade_text),
          count: Number(b.count_at_grade || 0),
        }))
      : [],
  };

  // Scarcity tier comes from the real census count of copies graded 9.0 or higher. No census, no tier.
  const censusAtOrAbove90 = censusNinePlus(censusDossier?.grades);
  const scarcityKey: ScarcityTier | null = censusAtOrAbove90 != null ? classifyScarcityTier(censusAtOrAbove90) : null;
  const scarcityColors = getScarcityColors(scarcityKey);

  const rawPrice = rawLattice["RAW"] ?? ppData.pricecharting?.raw ?? null;
  const grade10Price = rawLattice["10.0"] ?? ppData.pricecharting?.grade_10_0 ?? null;

  const keyPrices = {
    fmv98Usd: consensusFmv,
    fmv10Usd: grade10Price != null ? Number(grade10Price) : null,
    fmvRawUsd: rawPrice != null ? Number(rawPrice) : null,
    sovPriceUsd: consensusFmv,
    sovGrade: "9.8",
    anchor9_8: consensusFmv,
    display_fmv_usd: consensusFmv,
    display_grade: "9.8",
    premiumPct: null,
    gradeCount: Object.keys(rawLattice).length,
    delta24h: delta24hPct(snapshotObservations, "9.8"),
    observedAt: snapshotLatest,
  };

  // ppcf_price_observations stamps every price with the book's RELEASE date (not when the price was seen),
  // so it is not history. Dated history = PriceCharting snapshots (pp_price_history) + dated sales.
  const chartSales = toSaleList(salesObservations, 1000).flatMap((s) => {
    const g = normalizeGradeLabel(s.grade);
    return g ? [{ grade: g, priceUsd: s.priceUsd, date: s.date }] : [];
  });
  const priceHistory = buildComicPriceHistory(comic, {
    dbObservations: snapshotObservations,
    salesObservations: toSaleList(salesObservations, 1000).map((x) => ({
      sale_price: x.priceUsd, sale_date: x.date, native_grade_text: x.grade, venue: x.platform ?? undefined,
    })),
  });

  // A cover found by a wiki name search for a different publisher is a false match: never show it.
  const dbCoverContradicts = coverSourceContradictsPublisher(comic.cover_source, comic.publisher);
  const railOwnCover = railRows.find((r) => r.cover_source === "google_bucket" && r.cover_url)?.cover_url ?? null;
  const authoritativeCoverImage =
    getAuthoritativeCover(comic.series, comic.issue_number, authoritativePublisher, comic.publication_year) ||
    railOwnCover ||
    (dbCoverContradicts ? null : comic.cover_retrieval_url || comic.cover_url || coverEvidence?.image_url) ||
    null;
  const coverIsTrusted = Boolean(
    authoritativeCoverImage && (authoritativeCoverImage === railOwnCover || (!dbCoverContradicts && comic.cover_verified_at))
  );

  // Canonical Asset Class & Market Price Tiers:
  // - OTC: 17.00 to 24.99 · STD: 25.00 to 44.99 · PREMIUM: 45.00 and up
  // - SOV: reserved for direct universal 9.8 apex benchmark equities (verified CE70 seats)
  const isDirect = isDirectEdition(comic.direct_or_variant) && isDirectEdition(comic.cover_variant);
  const priceTier = resolvePriceTier(effectivePrice);
  const isTrulySovereign = Boolean(isCe70Seat && isDirect && consensusFmv >= PREMIUM_MIN_PRICE);
  const effectiveAssetClass = isTrulySovereign ? "SOV" : priceTier;

  const completenessData = buildCompleteness({
    cover: Boolean(authoritativeCoverImage),
    census: totalGradedCount > 0,
    gradeLattice: gradeLattice.length > 0,
    priceHistory: priceHistory.length > 0,
    recentSales: formattedSales.length > 0,
    liquidity: salesObservations.length > 0,
  });

  const fullVariant: DetailResponse["variant"] = {
    id: comic.id,
    workId: null,
    issueId: null,
    productName: `${seriesLabel} #${comic.issue_number}`,
    variantDescription: comic.direct_or_variant || comic.cover_variant || null,
    variantKey: `${comic.series}-${comic.issue_number}`,
    artifactType: "comic_issue",
    assetClass: effectiveAssetClass,
    marketLane: effectivePrice >= 45 ? "investment_grade" : effectivePrice >= 25 ? "standard_exchange" : "over_the_counter",
    isSovereign: isTrulySovereign,
    marketPriceClass: priceTier,
    certificationState: null,
    editionForm: comic.direct_or_variant || null,
    productId: comic.id,
    sourceSlug: comic.series.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    issueNumber: String(comic.issue_number),
    year: comic.publication_year ?? null,
    productYear: comic.publication_year ?? null,
    yearDivergence: false,
    yearGap: 0,
    workName: seriesLabel,
    publisher: authoritativePublisher,
    era: realEra ? String(realEra).toLowerCase() : "",
    scarcityTier: scarcityKey ?? "",
    coverImageUrl: authoritativeCoverImage,
    coverSource: comic.cover_source ?? null,
    coverMeta: {
      source: comic.cover_source ?? null,
      verified: coverIsTrusted,
      eraVerified: false,
      adminVerified: Boolean(comic.cover_verified_at) && !dbCoverContradicts,
    },
    coverVerified: coverIsTrusted,
    coverResolvedAt: comic.cover_verified_at ?? null,
    totalGradesPriced: Object.keys(rawLattice).length,
    issueStatus: "ACTIVE",
    identityConfidence: null,
  };

  const fullCensusSummary: DetailResponse["censusSummary"] = {
    totalGraded: censusSummary.totalGraded,
    highGradeCount,
    floatConcentration: null,
    snapshotDate: censusSummary.snapshotDate,
    histogram: censusSummary.histogram,
    scope: "variant",
    isBaseVariant: true,
  };

  const atomicPrice = rawPrice != null && Number(rawPrice) > 0 ? Number(rawPrice) : null;
  const instrumentStates = {
    sovereign: isTrulySovereign ? { grade: "9.8", priceUsd: consensusFmv } : null,
    anchor: consensusFmv > 0 ? { grade: "9.8", priceUsd: consensusFmv, salesVolume: salesByGrade.get("9.8") ?? 0 } : null,
    atomic: atomicPrice != null ? { grade: "RAW", priceUsd: atomicPrice } : null,
    anchorToAtomicMultiple: atomicPrice != null && consensusFmv > 0 ? Number((consensusFmv / atomicPrice).toFixed(1)) : null,
    sovereignToAtomicMultiple: isTrulySovereign && atomicPrice != null ? Number((consensusFmv / atomicPrice).toFixed(1)) : null,
  };

  // Stored PriceCharting dealer buy / retail sell pairs. Drives the spread strip, the quote card and the quote modal.
  const spreadAnchors = ppSpreadAnchors(ppData.spreads);
  const quoteGrade = pickQuoteGrade(spreadAnchors);
  const quote: ExecutionQuote | null = quoteGrade
    ? buildQuote(quoteGrade, quoteGrade === "9.8" ? (consensusFmv > 0 ? consensusFmv : null) : (rawLattice[quoteGrade] != null ? Number(rawLattice[quoteGrade]) : null), spreadAnchors, snapshotLatest)
    : consensusFmv > 0
      ? buildQuote("9.8", consensusFmv, spreadAnchors, snapshotLatest)
      : null;

  const provenanceItems = buildProvenanceLedger({
    fmv98: consensusFmv > 0 ? consensusFmv : null,
    ppSnapshotDate: snapshotLatest,
    ppSnapshotCount: snapshotCount,
    ppSourceId: comic.pp_source_id ? String(comic.pp_source_id) : null,
    census: totalGradedCount > 0 ? { total: totalGradedCount, snapshotDate: censusSnapshotDate } : null,
    sales: salesObservations.length > 0 && saleDates.length > 0 ? { count: saleDates.length, first: saleDates[0], last: saleDates[saleDates.length - 1] } : null,
    cover: authoritativeCoverImage ? { source: comic.cover_source ?? null, verifiedAt: comic.cover_verified_at ?? null } : null,
  });

  const heroCreators = (() => {
    const list: Array<{ id: string; name: string; role: string; bio: null; notableWorks: never[]; activeYears: null; wikiUrl: null }> = [];
    const seen = new Set<string>();
    const add = (name: string, role: string) => {
      if (!name || seen.has(`${name}|${role}`)) return;
      if (role !== "Colorist" && role !== "Letterer" && list.some((c) => c.name === name)) return;
      seen.add(`${name}|${role}`);
      list.push({ id: name, name, role, bio: null, notableWorks: [], activeYears: null, wikiUrl: null });
    };
    add(cleanGcdWriter, "Writer");
    add(cleanGcdPenciler, "Penciler");
    add(cleanGcdInker, "Inker");
    add(cleanGcdColorist, "Colorist");
    add(cleanGcdLetterer, "Letterer");
    if (list.length === 0 && debut?.creators?.length) {
      for (const c of debut.creators) add(sanitizeCreator(c), "Creator");
    }
    return list.length > 0 ? { data: list } : undefined;
  })();

  const spreadData =
    Object.keys(spreadAnchors).length > 0
      ? { found: true, data: { spreadMethod: "PriceCharting", observedAnchors: spreadAnchors } }
      : { found: false, data: null };


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a', fontFamily: 'Hind, sans-serif' }}>
      {/* Top Era Accent Line */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          zIndex: 50,
          background: `linear-gradient(90deg, ${eraColors.border}00, ${eraColors.border}, ${scarcityColors.border}, ${eraColors.border}00)`,
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* SECTION 1: cover, ticker, price tier, buy/sell, census, story */}
        <section id="section-cockpit" className="space-y-4">
          <HeroSection
            variantId={comic.id}
            variant={fullVariant}
            completeness={completenessData}
            keyPrices={keyPrices}
            instrumentStates={instrumentStates}
            quote={quote}
            censusSummary={fullCensusSummary}
            gradeLattice={gradeLattice}
            wikiSummary={null}
            latestSaleImageUrl={fullVariant.coverImageUrl}
            eraColors={eraColors}
            scarcityColors={scarcityColors}
            heroCreatorsData={heroCreators}
            spreadData={spreadData}
            relationalData={gcdRelational}
            historyPoints={priceHistory
              .filter((h) => h.grade === "9.8" && h.source !== "PANEL_PROFITS_BASELINE" && h.source !== "PANEL_PROFITS_HISTORICAL_ANNUAL")
              .map((h) => ({ observedAt: h.observedAt, priceUsd: h.priceUsd, source: h.source }))}
          />

          <Suspense fallback={null}>
            <StorySummaryCard
              series={comic.series}
              issueNumber={String(comic.issue_number)}
              year={comic.publication_year ?? null}
              publisher={authoritativePublisher}
              volume={railVolume}
              accent={eraColors.border}
            />
          </Suspense>
        </section>

        {/* SECTION 2: prices by source and grade, dealer quotes, your holding */}
        <section id="section-order-book" className="space-y-6 pt-4 border-t border-white/10">
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase text-white font-sans">Prices</h2>
            <p className="text-xs text-slate-400 mt-0.5">Stored prices by grade and source, exactly as recorded. A source with no price for a grade shows a dash.</p>
          </div>

          <BlendedHoldingDossier comic={comic} userStatus={userStatus} isAuthenticated={Boolean(user)} />

          <ComparativePriceMatrix comic={comic} inspectedGrade="9.8" ticker={tickerSymbol} />

          <DealerQuotesCard anchors={spreadAnchors} asOf={snapshotLatest} />

          <PricingDossier comic={comic} />

          <div id="section-perspectives">
            <MarketTruthPanel
              price98={consensusFmv > 0 ? consensusFmv : null}
              price98AsOf={snapshotLatest}
              lastSale={latestSale}
              salesCount={salesObservations.length}
              census={totalGradedCount > 0 ? { total: totalGradedCount, ninePlus: censusAtOrAbove90, snapshotDate: censusSnapshotDate } : null}
              accentColor={eraColors.border}
            />
          </div>
        </section>

        {/* SECTION 3: price history chart and recorded sales */}
        <section id="section-trading-terminal" className="space-y-6 pt-4 border-t border-white/10">
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase text-white font-sans">Price history and sales</h2>
            <p className="text-xs text-slate-400 mt-0.5">Dated PriceCharting snapshots and recorded sales. Nothing is drawn where no dated price exists.</p>
          </div>

          <TopChartSection
            variantId={comic.id}
            variant={fullVariant}
            keyPrices={keyPrices}
            gradeLattice={gradeLattice}
            priceHistory={priceHistory}
            censusSummary={fullCensusSummary}
            eraColors={eraColors}
            quote={quote}
            creatorNames={debut?.creators ?? []}
            sales={chartSales}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <PriceStatsPanel history={priceHistory} eraColors={eraColors} issueReferencePoints={null} />
            <AuctionHistoryCard recentSales={formattedSales} eraColors={eraColors} />
          </div>
        </section>

        {/* SECTION 4: news, video, bibliographic record, variants, sources */}
        <section id="section-lore-catalysts" className="space-y-6 pt-4 border-t border-white/10">
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase text-white font-sans">News, record and sources</h2>
            <p className="text-xs text-slate-400 mt-0.5">News linked to this book, the Grand Comics Database record, variants and the source of each figure.</p>
          </div>

          <NewsPanel workName={seriesLabel} publisher={authoritativePublisher} assetId={comic.id} eraColors={eraColors} />

          <VideoIntelligenceCard cbVideo={cbVideo} />

          <GcdBibliographicDossier
            gcdData={enrichedGcdData as any}
            publisher={authoritativePublisher}
            series={comic.series}
            issueNumber={comic.issue_number}
          />

          <AtomicVariantsAndInternationalMatrix
            relationalData={gcdRelational}
            currentComicId={comic.id}
            series={comic.series}
            issueNumber={comic.issue_number}
            baseFmv={Number(comic.baseline_grade_9_8_value || comic.pp_grade_9_8_price || 0)}
          />

          <div id="section-provenance">
            <ProvenanceLedger items={provenanceItems} accentColor={eraColors.border} />
          </div>
        </section>
      </div>
    </div>
  );
}
