/**
 * Relevant videos for one Sniper listing, from the YouTube Data API (YOUTUBE_API_KEY, server side only).
 * Order of preference: the book itself, then its creators, then the series, and at worst an explainer
 * on how Sniper's money terms work. Anything whose title does not name what we searched for is dropped.
 * Pure logic with injected fetch/cache so it can be tested without network.
 */

export type VideoKind = "book" | "creator" | "series" | "explainer";

export interface SniperVideo {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  kind: VideoKind;
}

export interface VideoLookup {
  series: string;
  issue?: string;
  creators?: string[];
}

export interface VideoDeps {
  apiKey: string;
  fetchFn: typeof fetch;
  cacheGet: (key: string) => Promise<SniperVideo[] | null>;
  cacheSet: (key: string, videos: SniperVideo[]) => Promise<void>;
}

const STOP = new Set(["the", "a", "an", "of", "and", "issue", "comic", "comics", "no", "vol", "volume"]);

const norm = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&amp;/g, "&").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

const tokens = (s: string) => norm(s).split(" ").filter((t) => t.length > 1 && !STOP.has(t));

/** True when every meaningful word of `needle` appears in `haystack`. */
export function titleNames(haystack: string, needle: string): boolean {
  const want = tokens(needle);
  if (want.length === 0) return false;
  const have = new Set(tokens(haystack));
  return want.every((t) => have.has(t));
}

const EXPLAINER_QUERIES = [
  "how to flip comic books on eBay profit after fees",
  "eBay auction sniping explained",
  "reselling profit margin and ROI explained for beginners",
];
const EXPLAINER_WORDS = /(snip|flip|resell|reselling|arbitrage|margin|roi|fees|profit|invest)/i;

export function cacheKey(l: VideoLookup): string {
  return `v1:${norm(l.series)}#${norm(l.issue ?? "")}`;
}

interface YtItem {
  id?: { videoId?: string };
  snippet?: { title?: string; channelTitle?: string; thumbnails?: Record<string, { url?: string }> };
}

async function ytSearch(q: string, deps: VideoDeps): Promise<{ videoId: string; title: string; channel: string; thumbnail: string }[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("q", q);
  url.searchParams.set("key", deps.apiKey);
  const res = await deps.fetchFn(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`youtube search ${res.status}`);
  const json = (await res.json()) as { items?: YtItem[] };
  const out: { videoId: string; title: string; channel: string; thumbnail: string }[] = [];
  for (const it of json.items ?? []) {
    const id = it.id?.videoId;
    const title = it.snippet?.title;
    if (!id || !title) continue;
    const th = it.snippet?.thumbnails;
    out.push({
      videoId: id,
      title: title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      channel: it.snippet?.channelTitle ?? "",
      thumbnail: th?.medium?.url ?? th?.high?.url ?? th?.default?.url ?? `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    });
  }
  return out;
}

async function explainers(deps: VideoDeps): Promise<SniperVideo[]> {
  const key = "v1:explainers";
  const hit = await deps.cacheGet(key);
  if (hit && hit.length > 0) return hit;
  const found: SniperVideo[] = [];
  for (const q of EXPLAINER_QUERIES) {
    if (found.length >= 3) break;
    let rows: Awaited<ReturnType<typeof ytSearch>> = [];
    try { rows = await ytSearch(q, deps); } catch { continue; }
    for (const r of rows) {
      if (found.length >= 3) break;
      if (EXPLAINER_WORDS.test(r.title) && !found.some((f) => f.videoId === r.videoId)) found.push({ ...r, kind: "explainer" });
    }
  }
  if (found.length > 0) await deps.cacheSet(key, found);
  return found;
}

/** Returns up to 3 videos, most specific first. Never returns a video whose title does not name the book, creator or series. */
export async function findVideos(l: VideoLookup, deps: VideoDeps): Promise<SniperVideo[]> {
  const series = l.series.trim();
  if (!series) return explainers(deps);

  const key = cacheKey(l);
  const cached = await deps.cacheGet(key);
  if (cached) return cached;

  const out: SniperVideo[] = [];
  const add = (rows: Awaited<ReturnType<typeof ytSearch>>, kind: VideoKind, ok: (title: string) => boolean) => {
    for (const r of rows) {
      if (out.length >= 3) return;
      if (out.some((o) => o.videoId === r.videoId)) continue;
      if (ok(r.title)) out.push({ ...r, kind });
    }
  };

  let searchFailed = false;
  const run = async (q: string, kind: VideoKind, ok: (title: string) => boolean) => {
    if (out.length >= 3) return;
    try { add(await ytSearch(q, deps), kind, ok); } catch { searchFailed = true; }
  };

  const issue = (l.issue ?? "").replace(/^#/, "").trim();
  if (issue) await run(`${series} #${issue} comic`, "book", (t) => titleNames(t, series) && new RegExp(`(^|[^0-9])${issue.replace(/[^0-9a-z]/gi, "")}([^0-9]|$)`).test(norm(t)));
  const creators = (l.creators ?? []).map((c) => c.trim()).filter(Boolean).slice(0, 2);
  for (const c of creators) await run(`${c} comic book artist interview`, "creator", (t) => titleNames(t, c));
  if (out.length < 2) await run(`${series} comic book`, "series", (t) => titleNames(t, series));

  if (out.length === 0) {
    const ex = await explainers(deps);
    // A failed search is not a verdict about this book, so it is not cached.
    if (!searchFailed) await deps.cacheSet(key, ex);
    return ex;
  }
  if (!searchFailed) await deps.cacheSet(key, out);
  return out;
}
