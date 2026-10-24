import { createAdminServerClient } from "@/lib/supabase/admin";
import { cacheKey, type SniperVideo } from "@/lib/sniper/videos";
import { resolveCuratedVideos } from "@/lib/sniper/curated-videos";

export const dynamic = "force-dynamic";

/**
 * Multi-tiered video intelligence endpoint:
 * 1. Checks stored cache for exact book/issue match.
 * 2. If absent, resolves relevant videos for series, creators, era, and financial mechanics.
 * Guarantees relevant educational context without YouTube API dependencies.
 */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const series = (p.get("series") || "").slice(0, 120);
  const issue = (p.get("issue") || "").slice(0, 20);
  const creators = (p.get("creators") || "").split("|").filter(Boolean).slice(0, 2);
  const era = (p.get("era") || "").slice(0, 50);

  const key = cacheKey({ series, issue, creators });

  let saved: SniperVideo[] = [];
  try {
    const { data, error } = await createAdminServerClient()
      .from("sniper_video_cache")
      .select("videos")
      .eq("key", key)
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();

    if (!error && Array.isArray(data?.videos) && data.videos.length > 0) {
      saved = data.videos as SniperVideo[];
    }
  } catch {
    // Database cache check bypassed; fall back to curated series/era knowledge base
  }

  if (saved.length > 0) {
    const related = saved.filter((v) => v.kind !== "explainer").slice(0, 2);
    const explainer = saved.find((v) => v.kind === "explainer" && !related.some((r) => r.videoId === v.videoId));
    return Response.json(
      { videos: [...related, ...(explainer ? [explainer] : [])] },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  }

  // Fallback: Resolve high-authority series, era, creator, and financial explainer videos
  const curated = resolveCuratedVideos({ series, issue, creators, era });
  return Response.json(
    { videos: curated },
    { status: 200, headers: { "cache-control": "no-store" } }
  );
}
