import { NextResponse } from "next/server";
import { SURFACE_ORDER, type SurfaceKey } from "@/lib/assets/surfaceConfig";
import type { AssetItem, AssetResponse, SurfaceData } from "@/lib/assets/types";
import { getUnderlyings } from "@/lib/assets/underlyings";
import { issueInstruments } from "@/lib/assets/instruments";

/**
 * Assets rail: every row is a canon-formula instrument priced from real underlying equities
 * (see lib/assets/instruments.ts). Comics are the equities rail and never appear here.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const randomStart = searchParams.get("randomStart") === "1" || searchParams.get("reload") === "1";

  const unders = await getUnderlyings().catch(() => []);
  const issued = issueInstruments(unders);

  const surfaces: Partial<Record<SurfaceKey, SurfaceData>> = {};
  let total = 0;
  for (const key of SURFACE_ORDER) {
    let items: AssetItem[] = issued.filter((it) => it.assetType === key && Number(it.pricing?.fmv_usd) > 0);
    if (items.length === 0) continue;
    if (randomStart && items.length > 1) {
      const shift = Math.floor(Math.random() * items.length);
      items = [...items.slice(shift), ...items.slice(0, shift)];
    }
    surfaces[key] = { showing: items.length, totalInQueue: items.length, items };
    total += items.length;
  }

  const response: AssetResponse = {
    tickId: Math.floor(Date.now() / 30000),
    totalShowing: total,
    totalEligible: total,
    surfaces,
  };
  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" },
  });
}
