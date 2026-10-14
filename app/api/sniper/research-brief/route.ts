import { getStorySummary } from "@/lib/comics/story-summary";
import { makeResearchBrief } from "@/lib/sniper/research-brief";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const series = (p.get("series") || "").slice(0, 160);
  const issueNumber = (p.get("issueNumber") || "").slice(0, 20);
  if (!series || !issueNumber) return Response.json({ error: "Series and issue required" }, { status: 400 });
  const year = Number(p.get("year")) || null;
  const input = { series, issueNumber, year, publisher: p.get("publisher"), allowSeriesReference: p.get("allowSeriesReference") === "true" };
  const summary = await Promise.race([getStorySummary(input), new Promise<null>(resolve => setTimeout(() => resolve(null), 12000))]);
  if (!summary) return Response.json({ summary: null, brief: null, error: "No sourced issue synopsis is available for this identity." });
  try {
    const brief = await makeResearchBrief(input, summary);
    return Response.json({ summary, brief }, { headers: { "cache-control": "public, s-maxage=3600" } });
  } catch (error) {
    console.warn("Sniper brief unavailable:", error instanceof Error ? error.name : "generation_error");
    return Response.json({ summary, brief: null, error: "The original research summary could not be generated. The source synopsis remains available." }, { headers: { "cache-control": "no-store" } });
  }
}
