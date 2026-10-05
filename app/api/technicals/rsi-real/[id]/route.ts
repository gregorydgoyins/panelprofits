import { NextResponse } from "next/server";
import { getComicRsiReal } from "@/lib/technicals/rsi-calculator";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ data: [] });
    }

    const rsiPoints = await getComicRsiReal(id);
    return NextResponse.json({ data: rsiPoints });
  } catch (err) {
    console.error("Error in /api/technicals/rsi-real/[id]:", err);
    return NextResponse.json({ data: [] });
  }
}
