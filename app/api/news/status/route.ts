import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/news/status — is the news ingest alive? Plain facts from pp_news_stories, no auth, no secrets.
 * `ok` is true only if something was ingested in the last 26 hours (the cron runs daily).
 */
export async function GET() {
  const db = createAdminServerClient();
  const since = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
  const [last, newest, d1, d7, total] = await Promise.all([
    db.from("pp_news_stories").select("ingested_at").order("ingested_at", { ascending: false }).limit(1),
    db.from("pp_news_stories").select("published_at").order("published_at", { ascending: false }).limit(1),
    db.from("pp_news_stories").select("id", { count: "exact", head: true }).gte("ingested_at", since(24)),
    db.from("pp_news_stories").select("id", { count: "exact", head: true }).gte("ingested_at", since(24 * 7)),
    db.from("pp_news_stories").select("id", { count: "exact", head: true }),
  ]);
  const err = last.error || newest.error || d1.error || d7.error || total.error;
  if (err) return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  const lastIngestedAt = last.data?.[0]?.ingested_at ?? null;
  const ageHours = lastIngestedAt ? (Date.now() - new Date(lastIngestedAt).getTime()) / 3_600_000 : null;
  return NextResponse.json({
    ok: ageHours !== null && ageHours <= 26,
    lastIngestedAt,
    hoursSinceLastIngest: ageHours === null ? null : Math.round(ageHours * 10) / 10,
    newestStoryPublishedAt: newest.data?.[0]?.published_at ?? null,
    ingestedLast24h: d1.count ?? 0,
    ingestedLast7d: d7.count ?? 0,
    totalStories: total.count ?? 0,
  });
}
