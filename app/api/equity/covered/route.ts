import { NextResponse } from "next/server";
import { getCoveredBooksSlice } from "@/lib/equity/covered-books";
import type { EquityResponse } from "@/lib/equity/ticker-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "80", 10) || 80, 10), 200);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

  try {
    const slice = await getCoveredBooksSlice(offset, limit);
    const response: EquityResponse = {
      surface: "EQUITY",
      tickId: Math.floor(Date.now() / 30000),
      marketRegime: null,
      showing: slice.items.length,
      totalEligible: slice.total,
      totalInQueue: slice.total,
      offset,
      nextOffset: slice.nextOffset,
      hasMore: true,
      items: slice.items,
    };
    return NextResponse.json(response, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ error: "rail unavailable" }, { status: 503 });
  }
}
