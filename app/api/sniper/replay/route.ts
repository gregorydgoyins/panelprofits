import { NextResponse } from "next/server";
import { listReplays, playReplay } from "@/lib/sniper/replay-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Practice rounds on real eBay auctions that already closed.
 * GET ?owner=<device id>                      the rounds on offer (never includes how they closed)
 * POST { owner, itemId, maxBid, fmv?, secsLeft? }   fire a last-second bid; reveals the real close and scores it
 */
export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get("owner") || "";
  const { lots, pool } = await listReplays(owner);
  return NextResponse.json({ success: true, lots, pool }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let b: any;
  try { b = await request.json(); } catch { return NextResponse.json({ success: false, error: "bad json" }, { status: 400 }); }
  if (!b?.owner || !b?.itemId) return NextResponse.json({ success: false, error: "owner and itemId required" }, { status: 400 });
  const r = await playReplay({ owner: b.owner, itemId: b.itemId, maxBid: Number(b.maxBid), fmv: b.fmv != null ? Number(b.fmv) : null, secsLeft: b.secsLeft != null ? Number(b.secsLeft) : undefined, pass: !!b.pass });
  return NextResponse.json({ success: r.ok, error: r.error, ...r.result }, { status: r.ok ? 200 : 400 });
}
