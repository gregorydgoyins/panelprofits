import { createAdminServerClient } from "@/lib/supabase/admin";
import { findVideos, type SniperVideo } from "@/lib/sniper/videos";

export const dynamic = "force-dynamic";

const TTL_MS = 14 * 24 * 3600_000;
const mem = new Map<string, { at: number; videos: SniperVideo[] }>();

async function cacheGet(key: string): Promise<SniperVideo[] | null> {
  const m = mem.get(key);
  if (m && Date.now() - m.at < TTL_MS) return m.videos;
  try {
    const db: any = createAdminServerClient();
    const { data } = await db.from("sniper_video_cache").select("videos,fetched_at").eq("key", key).maybeSingle();
    if (data && Date.now() - new Date(data.fetched_at).getTime() < TTL_MS && Array.isArray(data.videos)) {
      mem.set(key, { at: Date.now(), videos: data.videos });
      return data.videos;
    }
  } catch {}
  return null;
}

async function cacheSet(key: string, videos: SniperVideo[]) {
  mem.set(key, { at: Date.now(), videos });
  if (mem.size > 500) mem.delete(mem.keys().next().value as string);
  try {
    const db: any = createAdminServerClient();
    await db.from("sniper_video_cache").upsert({ key, videos, fetched_at: new Date().toISOString() });
  } catch {}
}

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const series = (sp.get("series") ?? "").slice(0, 120);
  const issue = (sp.get("issue") ?? "").slice(0, 20);
  const creators = (sp.get("creators") ?? "").split("|").map((s) => s.trim().slice(0, 80)).filter(Boolean).slice(0, 2);

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json({ videos: [], error: "YOUTUBE_API_KEY is not set" }, { headers: { "cache-control": "no-store" } });
  }
  const found = await findVideos({ series, issue, creators }, { apiKey, fetchFn: fetch, cacheGet, cacheSet });
  const related = found.filter(v => v.kind !== "explainer").slice(0,2);
  const explainer = found.find(v => v.kind === "explainer" && !related.some(r => r.videoId === v.videoId));
  const videos = [...related, ...(explainer ? [explainer] : [])];
  return Response.json(
    { videos },
    { headers: { "cache-control": videos.length ? "public, s-maxage=86400, stale-while-revalidate=604800" : "no-store" } }
  );
}
