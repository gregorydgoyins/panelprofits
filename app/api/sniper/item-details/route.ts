import { NextResponse } from "next/server";
import { fetchEbayItemDetails } from "@/lib/sniper/ebay-api";
import { watchLot } from "@/lib/sniper/watch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One listing the player pasted in: its details plus eBay's current price, bid count and end time. Two eBay reads, only on request. */
export async function GET(request: Request) {
  const itemId = new URL(request.url).searchParams.get("id");
  if (!itemId) return NextResponse.json({ success: false, error: "Missing itemId parameter" }, { status: 400 });

  try {
    const [details, live] = await Promise.all([fetchEbayItemDetails(itemId), watchLot(itemId)]);
    if (live.status === 429) return NextResponse.json({ success: false, error: "eBay is rate-limiting us right now. Try again later." }, { status: 503 });
    if (!details || !live.ok) return NextResponse.json({ success: false, error: "Item not found or details unavailable" }, { status: 404 });
    return NextResponse.json({ success: true, details, live });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error)?.message || "Failed to fetch item details" }, { status: 500 });
  }
}
