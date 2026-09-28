import { NextResponse } from "next/server";
import { produceVideoReel } from "@/lib/video/pipeline";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyId, headline, summary, presenterKey } = body;

    if (!storyId || !headline) {
      return NextResponse.json(
        { error: "storyId and headline are required" },
        { status: 400 }
      );
    }

    const reel = await produceVideoReel(storyId, headline, summary || null, presenterKey || "elena");

    return NextResponse.json({
      status: "success",
      reel,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
