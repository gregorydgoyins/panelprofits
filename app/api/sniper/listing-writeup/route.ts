import { makeListingWriteup } from "@/lib/sniper/listing-writeup";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const title = (p.get("title") || "").slice(0, 240);
  if (!title) return Response.json({ writeup: null, error: "Listing title required" }, { status: 400 });
  const year = Number(p.get("year")) || null;
  const writeup = await makeListingWriteup({ title, series: p.get("series")?.slice(0, 160), issue: p.get("issue")?.slice(0, 20), year, publisher: p.get("publisher")?.slice(0, 80), grader: p.get("grader")?.slice(0, 12) });
  return Response.json({ writeup }, { headers: { "cache-control": writeup ? "public, s-maxage=3600" : "no-store" } });
}
