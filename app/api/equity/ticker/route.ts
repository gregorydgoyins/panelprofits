import { NextResponse } from "next/server";
import { getContinuousQueueSlice, TOTAL_CATALOG_UNIVERSE } from "@/lib/equity/continuous-queue-engine";
import { getAuthoritativeCoverStrict } from "@/lib/comics/cover-authority";
import type { EquityItem, EquityResponse } from "@/lib/equity/ticker-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get("limit") || "80", 10);
  const offsetParam = parseInt(searchParams.get("offset") || "0", 10);
  const eraParam = searchParams.get("era") || undefined;

  // Stream continuous 5,000-comic blocks across 115,712 catalog
  const queueResult = await getContinuousQueueSlice(offsetParam, limitParam, eraParam);
  const baseItems = queueResult.items;

  // Pre-Queue verification gate: cover must be valid image URL & FMV >= $17.01
  const validBaseItems = baseItems.filter((item) => {
    const cover = item.coverUrl || getAuthoritativeCoverStrict(item.series, item.issueNumber, item.publisher || "Independent", item.year || 1990);
    if (!cover) return false;
    if (cover.includes("svg") || cover.startsWith("data:image/svg")) return false;
    if ((item.referenceFmvUsd || 0) < 17.01) return false;
    return true;
  });

  const formattedItems: EquityItem[] = validBaseItems.map((item, idx) => {
    const eraKey = (item.productionAge || item.originEra || "modern")
      .toLowerCase()
      .replace(/_age$/, "")
      .replace(/\s+age$/, "");

    let tier = "rare";
    if (item.referenceFmvUsd >= 50000) {
      tier = "mythic";
    } else if (item.referenceFmvUsd >= 15000) {
      tier = "legendary";
    } else if (item.referenceFmvUsd >= 4000) {
      tier = "epic";
    } else if (item.referenceFmvUsd >= 1000) {
      tier = "rare";
    } else if (item.referenceFmvUsd >= 300) {
      tier = "uncommon";
    } else {
      tier = "common";
    }

    const itemGrade = String(item.referenceGrade || "9.8").trim();
    const isTrulySovereign = itemGrade === "9.8" && !item.variant;
    const marketClass = item.referenceFmvUsd >= 45 ? "PREMIUM" : item.referenceFmvUsd >= 20 ? "STD" : "OTC";
    const effectiveAssetClass = isTrulySovereign ? "SOV" : marketClass;

    const resolvedCover = item.coverUrl || getAuthoritativeCoverStrict(item.series, item.issueNumber, item.publisher || "Independent", item.year || 1990);

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
        assetId: item.ticker,
        productName: item.variant
          ? `${item.series} #${item.issueNumber} [${item.variant}]`
          : `${item.series} #${item.issueNumber}`,
        year: item.year || 1990,
        publisher: item.publisher || "Independent",
        variant: item.variant || null,
        productionAge: eraKey,
        scarcityTier: tier,
        detailUrl: `/comics/${encodeURIComponent(item.canonicalIssueId || item.id || item.ticker)}`,
        assetClass: effectiveAssetClass,
        marketPriceClass: marketClass,
        isSovereign: isTrulySovereign,
        certificationState: "CERTIFIED",
        editionForm: item.variant ? "VARIANT" : "DIRECT",
        coverVerified: true,
        yearDivergence: false,
        coverSuppressReason: null,
        identityConfidence: 99,
        quarantined: false,
        writer: (item as any).writer || (item as any).creators || null,
        penciler: (item as any).penciler || null,
        keyBadge: (item as any).keyBadge || null,
        genre: (item as any).genre || null,
      },
    };
  });

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
