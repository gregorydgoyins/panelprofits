import { NextResponse } from "next/server";
import {
  SURFACE_ORDER,
  SURFACE_ART_MAP,
  type SurfaceKey,
} from "@/lib/assets/surfaceConfig";
import type { AssetItem, AssetResponse, SurfaceData } from "@/lib/assets/types";
import { INITIAL_SURFACE_ASSETS } from "@/lib/assets/initial-assets";
import { getSeatPrices } from "@/lib/assets/seat-prices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const randomStart = searchParams.get("randomStart") === "1" || searchParams.get("reload") === "1";

  const seatPrices = await getSeatPrices().catch(() => ({} as Awaited<ReturnType<typeof getSeatPrices>>));
  const surfaces: Partial<Record<SurfaceKey, SurfaceData>> = {};
  let totalShowing = 0;
  let totalEligible = 0;

  for (const surfaceKey of SURFACE_ORDER) {
    const artPath = SURFACE_ART_MAP[surfaceKey] || null;
    const initialItems = INITIAL_SURFACE_ASSETS.filter((it) => it.assetType === surfaceKey);

    const items: AssetItem[] = initialItems.map((s, idx) => {
      const stored = s.assetId ? seatPrices[s.assetId] : undefined;
      const fmvVal = stored?.priceUsd ?? null;
      return {
        entryId: s.entryId || `asset-${surfaceKey.toLowerCase()}-${idx}`,
        assetId: s.assetId || s.symbol?.replace(/^\$/, "") || `${surfaceKey}-${idx}`,
        assetType: surfaceKey,
        displayRank: idx + 1,
        diversityBucket: s.diversityBucket || "standard",
        symbol: s.symbol || `$${surfaceKey}`,
        displayName: s.displayName || `${surfaceKey} Asset`,
        description: s.description,
        universe: s.universe || "Global",
        pricing: {
          ...(s.pricing || {}),
          fmv_usd: fmvVal,
          fmv: fmvVal,
          price: fmvVal,
          referenceGrade: stored ? stored.grade : null,
        },
        valueUnit: "USD",
        detailUrl: stored ? `/comics/${stored.comicId}` : (s.detailUrl || `/assets/${encodeURIComponent(s.symbol?.replace(/^\$/, "") || surfaceKey)}`),
        coverImageUrl: s.coverImageUrl || artPath,
        identityYear: (s.pricing as any)?.identityYear || (s as any).identityYear || (s as any).year || null,
        coverVerified: s.coverVerified ?? true,
        quarantined: false,
      };
    });

    let surfaceItems = items.filter((item) => {
      if (!item.coverImageUrl) return false;
      if (!(Number(item.pricing?.fmv_usd) > 0)) return false;
      return true;
    });

    if (randomStart && surfaceItems.length > 1) {
      const shift = Math.floor(Math.random() * surfaceItems.length);
      surfaceItems = [...surfaceItems.slice(shift), ...surfaceItems.slice(0, shift)];
    }

    surfaces[surfaceKey] = {
      showing: surfaceItems.length,
      totalInQueue: surfaceItems.length,
      items: surfaceItems,
    };

    totalShowing += surfaceItems.length;
    totalEligible += surfaceItems.length;
  }

  const response: AssetResponse = {
    tickId: Math.floor(Date.now() / 30000),
    totalShowing,
    totalEligible,
    surfaces,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
    },
  });
}
