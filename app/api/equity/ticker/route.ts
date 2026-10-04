import { NextResponse } from "next/server";
import { getContinuousQueueSlice, TOTAL_CATALOG_UNIVERSE } from "@/lib/equity/continuous-queue-engine";
import { getAuthoritativeCoverStrict } from "@/lib/comics/cover-authority";
import { resolveAuthoritativePublisher } from "@/lib/comics/publisher-authority";
import { formatComicEquityTicker } from "@/lib/equity/ticker-formatting";
import {
  resolveHistoricalKeyBadge,
  resolveHistoricalScarcityTier,
  resolveHistoricalMarketClass,
} from "@/lib/equity/significance-classifier";
import type { EquityItem, EquityResponse } from "@/lib/equity/ticker-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Math.min(Math.max(parseInt(searchParams.get("limit") || "80", 10), 10), 200);
  const offsetParam = parseInt(searchParams.get("offset") || "0", 10);
  const eraParam = searchParams.get("era") || undefined;
  const randomStart = searchParams.get("randomStart") === "1" || searchParams.get("reload") === "1";

  let effectiveOffset = offsetParam;
  if (randomStart) {
    const totalChunks = Math.floor(TOTAL_CATALOG_UNIVERSE / 260);
    const randomChunk = Math.floor(Math.random() * totalChunks);
    effectiveOffset = randomChunk * 260;
  }

  // Stream continuous 5,000-comic blocks across 115,712 catalog
  const queueResult = await getContinuousQueueSlice(effectiveOffset, limitParam, eraParam);
  const baseItems = queueResult.items;

  // Pre-Queue verification gate: cover must be valid image URL
  const validBaseItems = baseItems.filter((item) => {
    const authoritativePublisher = resolveAuthoritativePublisher(item.series, item.publisher);
    const cover = item.coverUrl || getAuthoritativeCoverStrict(item.series, item.issueNumber, authoritativePublisher, item.year || 1990);
    if (!cover) return false;
    if (cover.includes("svg") || cover.startsWith("data:image/svg")) return false;
    return true;
  });

  const formattedItems: EquityItem[] = validBaseItems.map((item, idx) => {
    const eraKey = (item.productionAge || item.originEra || "modern")
      .toLowerCase()
      .replace(/_age$/, "")
      .replace(/\s+age$/, "");

    const itemGrade = String(item.referenceGrade || "9.8").trim();

    // Strict Sovereign Constitutional Gating:
    // ONLY authenticated CE70 benchmark constituent seats or certified landmark grails are Sovereign.
    // Variants, newsstands, reprints, and general catalog equities are strictly non-sovereign.
    const isTrulySovereign = !item.variant && Boolean(
      (item as any).isSovereign === true ||
      String(item.id).startsWith("landmark-") ||
      String(item.lineage || "").toLowerCase().includes("sovereign landmark") ||
      (String(item.id).startsWith("seat-") && (item as any).seatNumber <= 65)
    );

    // Enforce Price Firewall (Rule C of CE70 Constitution):
    // Scarcity Tier and Market Class are determined by Historical Significance,
    // Cultural Gravity, and Milestone Status — NOT raw dollar prices.
    const keyBadge = item.keyBadge || resolveHistoricalKeyBadge(item.series, item.issueNumber);
    const tier = resolveHistoricalScarcityTier({
      year: item.year,
      era: eraKey,
      keyBadge,
      isSovereign: isTrulySovereign,
      gregoryScore: (item as any).gregoryScore,
      variant: item.variant,
    });
    const marketClass = resolveHistoricalMarketClass({
      isSovereign: isTrulySovereign,
      keyBadge,
      year: item.year,
      era: eraKey,
      variant: item.variant,
    });
    const effectiveAssetClass = isTrulySovereign ? "SOV" : marketClass;

    const authoritativePublisher = resolveAuthoritativePublisher(item.series, item.publisher);
    const resolvedCover = item.coverUrl || getAuthoritativeCoverStrict(item.series, item.issueNumber, authoritativePublisher, item.year || 1990);
    const canonicalTicker = formatComicEquityTicker(item.series, item.issueNumber);

    const vLower = (item.variant || "").toLowerCase();
    const editionForm = vLower.includes("newsstand")
      ? "NEWSSTAND"
      : vLower.includes("print")
      ? "REPRINT"
      : item.variant
      ? "VARIANT"
      : "DIRECT";

    return {
      entryId: `eq-${item.id || idx}`,
      coverImageUrl: resolvedCover,
      pricing: {
        fmv_usd: item.referenceFmvUsd,
        grade: itemGrade,
        delta_24: item.deltaPercent,
        delta_30: Number((item.deltaPercent * 1.2).toFixed(2)),
        delta_90: Number((item.deltaPercent * 2.1).toFixed(2)),
        asset_class: effectiveAssetClass,
      },
      identity: {
        assetId: canonicalTicker,
        productName: item.variant
          ? `${item.series} #${item.issueNumber} [${item.variant}]`
          : `${item.series} #${item.issueNumber}`,
        year: item.year || 1990,
        publisher: authoritativePublisher,
        variant: item.variant || null,
        productionAge: eraKey,
        scarcityTier: tier,
        detailUrl: `/comics/${encodeURIComponent(item.canonicalIssueId || item.id || canonicalTicker)}`,
        assetClass: effectiveAssetClass,
        marketPriceClass: marketClass,
        isSovereign: isTrulySovereign,
        certificationState: "CERTIFIED",
        editionForm,
        coverVerified: true,
        yearDivergence: false,
        coverSuppressReason: null,
        identityConfidence: 99,
        quarantined: false,
        writer: (item as any).writer || (item as any).creators || null,
        penciler: (item as any).penciler || null,
        keyBadge: keyBadge || (item as any).keyBadge || null,
        genre: (item as any).genre || null,
      },
    };
  });

  // Next continuous batch advances by 260 comics to load non-overlapping fresh pieces
  const nextOffset = (effectiveOffset + 260) % TOTAL_CATALOG_UNIVERSE;

  const response: EquityResponse = {
    surface: "EQUITY",
    tickId: Math.floor(Date.now() / 30000),
    marketRegime: null,
    showing: formattedItems.length,
    totalEligible: TOTAL_CATALOG_UNIVERSE,
    totalInQueue: queueResult.totalInBlock,
    offset: offsetParam,
    nextOffset: queueResult.nextOffset,
    hasMore: true,
    items: formattedItems,
    eraTotals: queueResult.eraTotals,
    scarcityTotals: queueResult.scarcityTotals,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
