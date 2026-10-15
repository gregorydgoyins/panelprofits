import { NextResponse } from "next/server";
import { getStorySummary } from "@/lib/comics/story-summary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const series = searchParams.get("series");
  const issueNumber = searchParams.get("issueNumber");
  const yearStr = searchParams.get("year");
  const publisher = searchParams.get("publisher");
  const volumeStr = searchParams.get("volume");

  if (!series || !issueNumber) {
    return NextResponse.json(
      { success: false, error: "Missing required series or issueNumber" },
      { status: 400 }
    );
  }

  const year = yearStr ? parseInt(yearStr, 10) : null;
  const volume = volumeStr ? parseInt(volumeStr, 10) : null;

  try {
    const summary = await Promise.race([
      getStorySummary({
        series,
        issueNumber,
        year: Number.isNaN(year) ? null : year,
        publisher,
        volume: Number.isNaN(volume) ? null : volume,
        allowSeriesReference: searchParams.get("allowSeriesReference") === "true",
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 9000)),
    ]);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || "Failed to retrieve story summary",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { series, issueNumber, year, publisher, volume } = body;

    if (!series || !issueNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required series or issueNumber" },
        { status: 400 }
      );
    }

    const summary = await Promise.race([
      getStorySummary({
        series,
        issueNumber: String(issueNumber),
        year: typeof year === "number" ? year : null,
        publisher: publisher || null,
        volume: typeof volume === "number" ? volume : null,
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 9000)),
    ]);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || "Failed to retrieve story summary",
      },
      { status: 500 }
    );
  }
}
