import { NextResponse } from "next/server";
import { armAuction, binAction, cancelOrder, listOrders } from "@/lib/sniper/paper-store";

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
export async function POST(request: Request) {
  let b: any;
  try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "bad json" }, { status: 400 }); }
  const { owner, action, itemId } = b ?? {};
  if (!owner || !itemId) return NextResponse.json({ success: false, error: "owner and itemId required" }, { status: 400 });

  const r = action === "arm"
    ? await armAuction({ owner, itemId, maxBid: Number(b.maxBid), fireSecs: b.fireSecs, fmv: b.fmv })
    : action === "offer" || action === "accept_counter" || action === "buy_at_ask"
      ? await binAction({ owner, itemId, action, offer: b.offer != null ? Number(b.offer) : undefined, fmv: b.fmv })
      : { ok: false, error: "unknown action" };
  return NextResponse.json({ success: r.ok, error: r.error, order: r.order }, { status: r.ok ? 200 : 400 });
}

export async function DELETE(request: Request) {
  const sp = new URL(request.url).searchParams;
  const ok = await cancelOrder(sp.get("owner") || "", Number(sp.get("id")));
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 404 });
}
