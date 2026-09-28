import { NextResponse } from "next/server";
import { getStoryVideoReel } from "@/lib/video/pipeline";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("storyId");

  if (!storyId) {
    return NextResponse.json(
      { error: "storyId query parameter is required" },
      { status: 400 }
    );
  }

  const reel = await getStoryVideoReel(storyId);
  if (!reel) {
    return NextResponse.json(
      { error: "No video reel found for this story" },
      { status: 404 }
    );
  }

  return NextResponse.json({ reel });
}
