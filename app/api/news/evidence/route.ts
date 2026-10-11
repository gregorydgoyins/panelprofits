import { NextRequest, NextResponse } from "next/server";
import { getBookEvidence } from "@/lib/news/market-evidence";

export const revalidate = 300;

/** GET /api/news/evidence?k=Amazing%20Spider-Man%20%23129&k=... -> real per-source evidence per key. */
export async function GET(req: NextRequest) {
  const keys = req.nextUrl.searchParams.getAll("k").map((k) => k.trim()).filter(Boolean).slice(0, 6);
  if (keys.length === 0) return NextResponse.json({ evidence: [] });
  try {
    const evidence = await getBookEvidence(keys);
    return NextResponse.json({ evidence }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (err) {
    console.error("[News Evidence API]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "evidence lookup failed" }, { status: 500 });
  }
}
