import { NextResponse } from "next/server";
import { getHeritageSales } from "@/lib/technicals/rsi-calculator";

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

    const sales = await getHeritageSales(id);
    return NextResponse.json({ data: sales });
  } catch (err) {
    console.error("Error in /api/heritage/sales/[id]:", err);
    return NextResponse.json({ data: [] });
  }
}
