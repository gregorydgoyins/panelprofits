import { readSavedStorySummary } from "@/lib/comics/story-summary";
import { readCachedWriteup } from "@/lib/sniper/listing-writeup";
export const runtime = "nodejs";
export const maxDuration = 60;

/** Opening a lot only reads the saved write-up. Generation belongs to the snapshot worker. */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const title = (p.get("title") || "").slice(0, 240);
  if (!title) return Response.json({ writeup: null, state: "error", error: "Listing title required" }, { status: 400 });
  const listing = { title, series: p.get("series")?.slice(0, 160), issue: p.get("issue")?.slice(0, 20), year: Number(p.get("year")) || null, publisher: p.get("publisher")?.slice(0, 80), grader: p.get("grader")?.slice(0, 12) };
  const [{ writeup, failedRecently }, story] = await Promise.all([readCachedWriteup(listing), readSavedStorySummary({ series: listing.series || "", issueNumber: listing.issue || "", year: listing.year, publisher: listing.publisher || null })]);
  if (writeup) return Response.json({ writeup, story, state: "ready" }, { headers: { "cache-control": "public, s-maxage=600" } });
  if (failedRecently) return Response.json({ writeup: null, story, state: "unavailable" }, { headers: { "cache-control": "no-store" } });
  return Response.json({ writeup: null, story, state: "pending" }, { headers: { "cache-control": "no-store" } });
}
