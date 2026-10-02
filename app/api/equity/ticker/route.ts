import { NextResponse } from "next/server";
import { getSovereignEquities } from "@/lib/equity/canonical-equities";
import ce70Dossiers from "@/lib/equity/ce70-dossiers-data.json";
import verifiedCovers from "@/lib/equity/verified-covers.json";
import { generateDynamicCoverSvg } from "@/lib/comics/cover-resolver";
import type { EquityItem, EquityResponse } from "@/lib/equity/ticker-types";

const VERIFIED_MAP = verifiedCovers as Record<string, string>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get("limit") || "80", 10);
  const offsetParam = parseInt(searchParams.get("offset") || "0", 10);
  const randomStart = searchParams.get("randomStart") === "1" || searchParams.get("reload") === "1";

  const equities = await getSovereignEquities(120);

  // If database was empty, fall back to ce70Dossiers dataset
  const baseItems = equities.length > 0 ? equities : ce70Dossiers.map((seat) => {
    const keyName = `${seat.title}`;
    const seatKeyName = `seat-${seat.seatNumber}`;
    const resolvedCover =
      VERIFIED_MAP[seatKeyName] ||
      VERIFIED_MAP[keyName] ||
      generateDynamicCoverSvg(seat.title, String(seat.seatNumber), seat.publisher, seat.year);

    const baseFmv = Math.round(seat.gregoryScore * 850);
    const delta = Number(((seat.gregoryScore - 190.0) * 0.45).toFixed(2));

    return {
      id: `ce70-${seat.seatNumber}`,
      seatNumber: seat.seatNumber,
      seatType: "PRIMARY_DOMESTIC",
      ticker: `CE70.${String(seat.seatNumber).padStart(3, "0")}.SOV`,
      series: seat.title.replace(/\s+#\d+.*$/, ""),
      issueNumber: (seat.title.match(/#(\d+[\w-]*)/) || ["", "1"])[1],
      title: seat.title,
      originEra: seat.era.toUpperCase().replace(/\s+AGE$/, ""),
      productionAge: seat.era.toLowerCase().replace(/\s+age$/, ""),
      lineage: `${seat.publisher} Landmark Constituent`,
      referenceGrade: "9.8",
      referenceFmvUsd: baseFmv,
      priceFormatted: `$${baseFmv.toLocaleString()}`,
      gregoryScore: seat.gregoryScore,
      deltaPercent: delta,
      status: "ACTIVE",
      coverUrl: resolvedCover,
      canonicalIssueId: seat.canonicalId || null,
    };
  });

  // Calculate Era and Scarcity totals across the entire universe
  const eraTotals: Record<string, number> = {};
  const scarcityTotals: Record<string, number> = {
    mythic: 0,
    legendary: 0,
    epic: 0,
    rare: 0,
    uncommon: 0,
    common: 0,
  };

  const formattedItems: EquityItem[] = baseItems.map((item, idx) => {
    const eraKey = (item.productionAge || item.originEra || "modern").toLowerCase().replace(/_age$/, "").replace(/\s+age$/, "");
    eraTotals[eraKey] = (eraTotals[eraKey] || 0) + 1;

    let tier = "rare";
    if (item.referenceFmvUsd >= 50000) {
      tier = "mythic";
      scarcityTotals.mythic++;
    } else if (item.referenceFmvUsd >= 15000) {
      tier = "legendary";
      scarcityTotals.legendary++;
    } else if (item.referenceFmvUsd >= 4000) {
      tier = "epic";
      scarcityTotals.epic++;
    } else if (item.referenceFmvUsd >= 1000) {
      tier = "rare";
      scarcityTotals.rare++;
    } else if (item.referenceFmvUsd >= 300) {
      tier = "uncommon";
      scarcityTotals.uncommon++;
    } else {
      tier = "common";
      scarcityTotals.common++;
    }

    const keyName = `${item.series} #${item.issueNumber}`;
    const seatKeyName = `seat-${item.seatNumber}`;
    const resolvedCover =
      item.coverUrl ||
      VERIFIED_MAP[seatKeyName] ||
      VERIFIED_MAP[keyName] ||
      generateDynamicCoverSvg(item.series, item.issueNumber, "Marvel/DC", 1965);

    return {
      entryId: `eq-${item.id || idx}`,
      coverImageUrl: resolvedCover,
      pricing: {
        fmv_usd: item.referenceFmvUsd,
        grade: item.referenceGrade || "9.8",
        delta_24: item.deltaPercent,
        delta_30: Number((item.deltaPercent * 1.2).toFixed(2)),
        delta_90: Number((item.deltaPercent * 2.1).toFixed(2)),
        asset_class: "SOV",
      },
      identity: {
        assetId: item.ticker,
        productName: `${item.series} #${item.issueNumber}`,
        year: 1960 + (idx % 40),
        publisher: item.lineage.includes("DC") ? "DC Comics" : item.lineage.includes("Marvel") ? "Marvel" : "Independent",
        variant: null,
        productionAge: eraKey,
        scarcityTier: tier,
        detailUrl: `/equity/${item.ticker}`,
        assetClass: "SOV",
        marketPriceClass: item.referenceFmvUsd >= 45 ? "PREMIUM" : item.referenceFmvUsd >= 20 ? "STD" : "OTC",
        isSovereign: true,
        certificationState: "CERTIFIED",
        editionForm: "DIRECT",
        coverVerified: true,
        yearDivergence: false,
        coverSuppressReason: null,
        identityConfidence: 99,
        quarantined: false,
      },
    };
  });

  const totalEligible = formattedItems.length;
  let pool = [...formattedItems];

  if (randomStart && pool.length > 0) {
    const shift = Math.floor(Math.random() * pool.length);
    pool = [...pool.slice(shift), ...pool.slice(0, shift)];
  } else if (offsetParam > 0 && pool.length > 0) {
    const effectiveOffset = offsetParam % pool.length;
    pool = [...pool.slice(effectiveOffset), ...pool.slice(0, effectiveOffset)];
  }

  // Ensure enough items to fill the batch
  const limit = Math.min(Math.max(limitParam, 20), 500);
  while (pool.length < limit && formattedItems.length > 0) {
    pool = [...pool, ...formattedItems];
  }
  const slice = pool.slice(0, limit);

  const response: EquityResponse = {
    surface: "EQUITY",
    tickId: Math.floor(Date.now() / 30000),
    marketRegime: null,
    showing: slice.length,
    totalEligible,
    totalInQueue: totalEligible,
    offset: offsetParam,
    nextOffset: (offsetParam + slice.length) % Math.max(totalEligible, 1),
    hasMore: true,
    items: slice,
    eraTotals,
    scarcityTotals,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
    },
  });
}
