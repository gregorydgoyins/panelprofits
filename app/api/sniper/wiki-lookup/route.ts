import { NextRequest, NextResponse } from "next/server";
import { lookupUnifiedFandomEntity } from "@/lib/wiki/local-fandom-lookup";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") || searchParams.get("q") || "";
    const typeHint = (searchParams.get("type") as any) || undefined;
    const universeHint = searchParams.get("universe") || undefined;

    if (!term || term.trim().length < 2) {
      return NextResponse.json({ error: "Missing or invalid search term" }, { status: 400 });
    }

    const result = lookupUnifiedFandomEntity(term, typeHint, universeHint);

    if (!result) {
      return NextResponse.json({
        found: false,
        term,
        message: "No exact record in local Fandom or CBR Lexicon databases",
      });
    }

    return NextResponse.json({
      found: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[api/sniper/wiki-lookup] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
