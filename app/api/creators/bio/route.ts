import { NextRequest, NextResponse } from "next/server";
import { getCreatorBio } from "@/lib/creators/creator-bio-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || searchParams.get("q") || searchParams.get("slug");

  if (!name) {
    return NextResponse.json({ error: "Name or slug query param is required" }, { status: 400 });
  }

  const bio = await getCreatorBio(name);
  if (!bio) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  return NextResponse.json({ creator: bio });
}
