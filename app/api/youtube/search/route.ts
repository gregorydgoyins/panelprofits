import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface YTVideo {
  videoId: string;
  title: string;
  channel: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  youtubeUrl: string;
}

// Real results from the YouTube Data API (YOUTUBE_API_KEY). No page scraping, no made-up fallback videos:
// when nothing can be fetched the list is empty and the caller shows its own search links.
// A search costs 100 of the key's 10,000 daily units, so each answer is kept for 24 hours.
const TTL_MS = 24 * 3600_000;
const cache = new Map<string, { at: number; videos: YTVideo[] }>();

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "comic review CGC market value").slice(0, 160);
  const maxResults = Math.min(6, Math.max(1, parseInt(searchParams.get("maxResults") || "4", 10)));
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  const empty = (error: string) => NextResponse.json({ success: true, source: "fallback", videos: [], searchUrl, error }, { headers: { "cache-control": "no-store" } });

  const key = `${q}|${maxResults}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ success: true, source: "youtube-api", videos: hit.videos, searchUrl }, { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return empty("YOUTUBE_API_KEY is not set");

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("safeSearch", "strict");
    url.searchParams.set("relevanceLanguage", "en");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("q", q);
    url.searchParams.set("key", apiKey);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return empty(`youtube ${res.status}`);
    const json = (await res.json()) as { items?: any[] };
    const videos: YTVideo[] = [];
    for (const it of json.items ?? []) {
      const id = it?.id?.videoId;
      const sn = it?.snippet;
      if (!id || !sn?.title) continue;
      videos.push({
        videoId: id,
        title: decode(sn.title),
        channel: sn.channelTitle ?? "",
        description: decode(sn.description ?? ""),
        thumbnail: sn.thumbnails?.medium?.url ?? sn.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: sn.publishedAt ?? "",
        youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
      });
    }
    if (videos.length === 0) return empty("no results");
    cache.set(key, { at: Date.now(), videos });
    if (cache.size > 300) cache.delete(cache.keys().next().value as string);
    return NextResponse.json({ success: true, source: "youtube-api", videos, searchUrl }, { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    return empty("youtube request failed");
  }
}
