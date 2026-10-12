import { NextResponse } from "next/server";
import { paperTick } from "@/lib/sniper/paper-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Watches armed paper snipes through their last minute and settles the ones whose auction has ended.
 * Safe to call from anywhere: it only acts on orders that already exist and does nothing else.
 */
export async function GET() {
  try {
    return NextResponse.json({ ok: true, ...(await paperTick()) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
