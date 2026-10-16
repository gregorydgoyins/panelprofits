import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** Retired unfunded replay entry point. The account game seals results and controls its own clock. */
export async function GET() { return NextResponse.json({ success: false, error: "Use the unified Sniper game queue." }, { status: 410 }); }
export async function POST() { return NextResponse.json({ success: false, error: "Use the unified Sniper game queue." }, { status: 410 }); }
