import { NextRequest, NextResponse } from "next/server";
import { fetchNextSimLot } from "@/lib/sniper/sim/lot-service";
import type { BrokerLevel, GameRole } from "@/lib/sniper/sim/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") as GameRole | null;
    const role: GameRole = roleParam === "whale" ? "whale" : "broker";
    const level = Number(searchParams.get("level") || "1") as BrokerLevel;
    const exclude = searchParams.get("exclude") ? searchParams.get("exclude")!.split(",") : [];

    const lot = await fetchNextSimLot(role, level, exclude);
    return NextResponse.json({ ok: true, lot });
  } catch (err: any) {
    console.error("[api-sniper-sim-lot] Error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Failed to generate lot" }, { status: 500 });
  }
}
