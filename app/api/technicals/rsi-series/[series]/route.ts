import { NextResponse } from "next/server";
import { getSeriesRsi } from "@/lib/technicals/rsi-calculator";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ series: string }> }
) {
  try {
    const { series } = await props.params;
    if (!series) {
      return NextResponse.json({ data: [] });
    }

    const decoded = decodeURIComponent(series);
    const rsiPoints = await getSeriesRsi(decoded);
    return NextResponse.json({ data: rsiPoints });
  } catch (err) {
    console.error("Error in /api/technicals/rsi-series/[series]:", err);
    return NextResponse.json({ data: [] });
  }
}
