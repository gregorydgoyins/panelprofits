import { NextResponse } from "next/server";
import { cancelOrder, listOrders } from "@/lib/sniper/paper-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Paper-trading orders for one device. GET ?owner=<device id>. Nothing here places anything on a venue. */
export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get("owner") || "";
  const orders = await listOrders(owner);
  return NextResponse.json({ success: true, orders }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * POST { owner, action: "arm", itemId, maxBid, fmv?, fireSecs? }            arm a paper snipe on a live auction
 * POST { owner, action: "offer" | "accept_counter" | "buy_at_ask", itemId, offer?, fmv? }   simulated Buy It Now haggle
 */
export async function POST() {
  return NextResponse.json({ success: false, error: "Paper bidding now uses your funded Sniper game. Open the game queue to bid." }, { status: 410 });
}

export async function DELETE(request: Request) {
  const sp = new URL(request.url).searchParams;
  const ok = await cancelOrder(sp.get("owner") || "", Number(sp.get("id")));
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 404 });
}
