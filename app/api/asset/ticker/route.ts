import { NextResponse } from "next/server";
import { SURFACE_ORDER, type SurfaceKey } from "@/lib/assets/surfaceConfig";
import type { AssetItem, AssetResponse, SurfaceData } from "@/lib/assets/types";
import { applyShocks, getUnderlyings } from "@/lib/assets/underlyings";
import { getShocks } from "@/lib/assets/shocks";
import { getUniverseCensus } from "@/lib/assets/universe";
import { getRoster } from "@/lib/assets/roster";
import { getUniverseCharacters } from "@/lib/assets/universe-footprints";
import { getFootprintEntries, type Footprint } from "@/lib/assets/footprint";
import { issueInstruments } from "@/lib/assets/instruments";

/**
 * Assets rail: every row is a canon-formula instrument priced from real underlying equities
 * (see lib/assets/instruments.ts). Comics are the equities rail and never appear here.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const randomStart = searchParams.get("randomStart") === "1" || searchParams.get("reload") === "1";

  const now = Date.now();
  const [baseUnders, state, census] = await Promise.all([getUnderlyings().catch(() => []), getShocks().catch(() => ({ shocks: new Map(), outcomes: [] })), getUniverseCensus().catch(() => [])]);
  const [roster, fpEntries] = await Promise.all([getRoster().catch(() => []), getFootprintEntries().catch(() => [] as [string, Footprint][])]);
  const unders = applyShocks(baseUnders, state.shocks, now);
  const issued = issueInstruments(unders, state.shocks, now, state.outcomes, census, roster, new Map(fpEntries), getUniverseCharacters());

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
    universeCensus: census,
    surfaces,
  };
  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" },
  });
}
