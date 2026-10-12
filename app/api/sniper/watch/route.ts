import { NextResponse } from "next/server";
import { watchLot } from "@/lib/sniper/watch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Live state of armed auctions straight from eBay: current bid, the minimum next bid, bid count and the end time.
 * GET /api/sniper/watch?ids=ebay-1234,ebay-5678   (at most 8 lots; calls are shared and cached for 3 seconds)
 */
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") || "")
    .split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8);
  if (ids.length === 0) return NextResponse.json({ success: false, error: "ids required" }, { status: 400 });
  const lots = await Promise.all(ids.map((id) => watchLot(id)));
  return NextResponse.json({ success: true, lots, serverTime: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
