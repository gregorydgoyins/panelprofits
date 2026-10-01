import { NextResponse } from "next/server";
import { getNewsStories, refreshNewsStore, getNetworkHealthSummary } from "@/lib/news/feed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const archive = url.searchParams.get("archive") === "1";
  const limit = Number(url.searchParams.get("limit") || (archive ? 60 : 24));
  const stories = await getNewsStories(limit, archive);
  const health = getNetworkHealthSummary();
  return NextResponse.json(
    { stories, health, refreshedAt: new Date().toISOString() },
    {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    }
  );
}

export async function POST(request: Request) {
  try {
    const result = await refreshNewsStore();
    const stories = await getNewsStories(24);
    const health = getNetworkHealthSummary();
    return NextResponse.json({
      status: "refreshed",
      activeCount: stories.length,
      ingested: result.ingested,
      wireCount: result.wireCount,
      syndicatedCount: result.syndicatedCount,
      health,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
