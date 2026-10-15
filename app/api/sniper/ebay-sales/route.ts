import { readCompletedEbaySales } from "@/lib/sniper/ebay-history";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Read-only access test and raw completed-sale records. No database writes. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() || "Amazing Spider-Man 300 CGC 9.8";
  if (q.length > 160) return Response.json({ error: "Search is limited to 160 characters." }, { status: 400 });
  const result = await readCompletedEbaySales(q);
  return Response.json({ query: q, ...result }, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600" },
  });
}
