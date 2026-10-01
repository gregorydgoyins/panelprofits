import crypto from "crypto";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";
import { createCachedQuery } from "@/lib/cache/wrapper";

import { sanitizeHeadline, sanitizeSummary, sanitizeNewsText } from "./sanitize";

export {
  type NewsCategory,
  type NewsStory,
  type NewsSource,
  DEFAULT_NEWS_IMAGE,
  officialFavicon,
  sourceFavicon,
  shortNewsSource,
} from "./types";
import type { NewsCategory, NewsStory, NewsSource } from "./types";
import { sourceFavicon } from "./types";

import { EXTENDED_NEWS_SOURCES } from "./extended-sources";
import { CURATED_CHANNELS } from "./curated-sources";
import { fetchAllWireStories } from "./wire-apis";
import {
  shouldAttemptFetch,
  recordFetchSuccess,
  recordFetchFailure,
  getNetworkHealthSummary,
  getAlternateFeedUrls,
} from "./self-healing";

export { getNetworkHealthSummary } from "./self-healing";
export { fetchAllWireStories } from "./wire-apis";
export { CURATED_CHANNELS, CURATED_FEEDS } from "./curated-sources";

export const PRIMARY_SOURCES: NewsSource[] = [
  // Primary Comic Industry Trade & Critical News
  { name: "BLEEDING COOL", url: "https://bleedingcool.com/comics/feed/", category: "national" },
  { name: "CBR", url: "https://www.cbr.com/feed/", category: "national" },
  { name: "THE BEAT", url: "https://www.comicsbeat.com/feed/", category: "national" },
  { name: "AIPT", url: "https://aiptcomics.com/feed/", category: "national" },
  { name: "ICV2", url: "https://icv2.com/rss", category: "national" },
  { name: "COMICS JOURNAL", url: "https://www.tcj.com/feed/", category: "international" },
  { name: "COMICSXF", url: "https://comicsxf.com/feed/", category: "national" },
  { name: "MULTIVERSITY COMICS", url: "https://www.multiversitycomics.com/feed/", category: "national" },
  { name: "FIRST COMICS NEWS", url: "https://www.firstcomicsnews.com/feed/", category: "national" },
  { name: "MAJOR SPOILERS", url: "https://majorspoilers.com/feed/", category: "national" },
  { name: "COMIC CRUSADERS", url: "https://www.comiccrusaders.com/feed/", category: "national" },
  { name: "GRAPHIC POLICY", url: "https://graphicpolicy.com/feed/", category: "national" },
  { name: "SMASH PAGES", url: "https://smashpages.net/feed/", category: "national" },
  { name: "TRIPWIRE", url: "https://tripwiremagazine.co.uk/feed/", category: "international" },
  { name: "BROKEN FRONTIER", url: "https://www.brokenfrontier.com/feed/", category: "international" },
  { name: "PREVIEWS WORLD", url: "https://www.previewsworld.com/rss", category: "national" },

  // Secondary Market & Comic Equity Analytics Feeds
  { name: "COMICBOOK INVEST", url: "https://comicbookinvest.com/feed/", category: "national" },
  { name: "GOCOLLECT", url: "https://gocollect.com/blog/feed", category: "national" },
  { name: "COVRPRICE", url: "https://covrprice.com/feed/", category: "national" },
  { name: "COMIC BOOK HERALD", url: "https://www.comicbookherald.com/feed/", category: "national" },
  { name: "COMICHRON", url: "https://blog.comichron.com/feeds/posts/default?alt=rss", category: "national" },

  // Publisher Direct Bulletins
  { name: "IMAGE COMICS", url: "https://imagecomics.com/news.atom", category: "national" },
  { name: "DARK HORSE", url: "https://www.darkhorse.com/Blog/rss", category: "national" },
  { name: "2000 AD", url: "https://2000ad.com/news/feed/", category: "international" },

  // Financial & Media Industry M&A
  { name: "VARIETY", url: "https://variety.com/feed/", category: "national" },
  { name: "DEADLINE", url: "https://deadline.com/feed/", category: "national" },
  { name: "THR", url: "https://www.hollywoodreporter.com/feed/", category: "national" },
  { name: "GAMESRADAR", url: "https://www.gamesradar.com/feeds/all/", category: "international" },
  { name: "IGN", url: "https://www.ign.com/rss/articles/feed?tags=comics", category: "international" },
  { name: "POLYGON", url: "https://www.polygon.com/rss/index.xml", category: "international" },

  // Video Broadcast Channels (YouTube Native Atom XML Feeds)
  { name: "LORDS OF THE LONG BOX", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCowVZaDHDd7eoiU8ll5QPGQ", category: "national" },
  { name: "NEAR MINT CONDITION", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCUX6kqTUFQqv1tH6J-0Z5fA", category: "national" },
  { name: "COMICTOM101", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC6s16tJ0e5lQ5nQ4-6-666Q", category: "national" },
  { name: "GEM MINT COLLECTIBLES", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC31fEeAOTnfRgvGFwYJsFUA", category: "national" },
  { name: "CARTOONIST KAYFABE", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCU61d9D1F-Y03e05-Pj2-uA", category: "national" },
];

import { ACTIVE_NEWS_CHANNELS } from "./channels-registry";

export const EXTENDED_SOURCES: NewsSource[] = EXTENDED_NEWS_SOURCES;
export const CURATED_SOURCES: NewsSource[] = CURATED_CHANNELS;

// Deduplicated unified syndication network prioritizing active verified channels
const sourceRegistryMap = new Map<string, NewsSource>();
for (const s of [...ACTIVE_NEWS_CHANNELS, ...PRIMARY_SOURCES, ...EXTENDED_SOURCES]) {
  if (!sourceRegistryMap.has(s.url)) {
    sourceRegistryMap.set(s.url, s);
  }
}
export const SOURCES: NewsSource[] = Array.from(sourceRegistryMap.values());

import {
  isRelevantComicStory,
  STRICT_NEGATIVE_FILTER,
  CORE_COMIC_SIGNALS,
  evaluateArticleQuality,
  isFreshArticle,
} from "./classifier";

export {
  isRelevantComicStory,
  STRICT_NEGATIVE_FILTER,
  CORE_COMIC_SIGNALS,
  evaluateArticleQuality,
  isFreshArticle,
};

function decodeEntities(value: string): string {
  return sanitizeNewsText(value);
}

function tagValue(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : null;
}

function attributeValue(block: string, tag: string, attribute: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*\\b${attribute}=["']([^"']+)["']`, "i"));
  return match?.[1] || null;
}

function isLikelyEditorialImage(value: string | null | undefined): value is string {
  if (!value || value.startsWith("data:") || value.startsWith("javascript:")) return false;
  return !/advert|banner|doubleclick|tracking|pixel|sprite|logo-small/i.test(value);
}

function extractImage(block: string): string | null {
  const candidate =
    attributeValue(block, "media:content", "url") ||
    attributeValue(block, "media:thumbnail", "url") ||
    (attributeValue(block, "enclosure", "type")?.startsWith("image/") ? attributeValue(block, "enclosure", "url") : null) ||
    block.match(/<(?:img|media:content|media:thumbnail)\b[^>]*(?:src|url)=["']([^"']+)["']/i)?.[1] ||
    null;

  return isLikelyEditorialImage(candidate) ? candidate : null;
}

function parseFeedItems(xml: string): Array<{
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  author: string | null;
}> {
  const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((match) => match[0]);
  return blocks.flatMap((block) => {
    const rawTitle = tagValue(block, "title");
    const ytVideoId = tagValue(block, "yt:videoId");
    const rawUrl = ytVideoId
      ? `https://www.youtube.com/watch?v=${ytVideoId}`
      : tagValue(block, "link") || attributeValue(block, "link", "href");
    if (!rawTitle || !rawUrl) return [];

    const title = decodeEntities(rawTitle).slice(0, 300);
    const url = rawUrl.trim();
    const rawSummary =
      tagValue(block, "content:encoded") ||
      tagValue(block, "media:description") ||
      tagValue(block, "description") ||
      tagValue(block, "summary") ||
      tagValue(block, "content");
    const summary = rawSummary ? decodeEntities(rawSummary).slice(0, 3000) : null;
    const author = tagValue(block, "dc:creator") || tagValue(block, "name") || tagValue(block, "author") || null;
    const imageUrl = ytVideoId
      ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`
      : extractImage(block);
    const pubDateStr = tagValue(block, "pubDate") || tagValue(block, "published") || tagValue(block, "updated");
    const publishedAt = pubDateStr && !Number.isNaN(Date.parse(pubDateStr)) ? new Date(pubDateStr).toISOString() : null;

    return [{ title, url, summary, imageUrl, publishedAt, author }];
  });
}

function generateStoryKey(sourceUrl: string, itemUrl: string, title: string): string {
  return crypto.createHash("sha256").update(`${sourceUrl}|${itemUrl}|${title}`).digest("hex");
}

export async function fetchFeedSource(source: NewsSource): Promise<Array<{
  story_key: string;
  source: string;
  source_url: string;
  category: NewsCategory;
  headline: string;
  author: string | null;
  summary: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
}>> {
  if (!shouldAttemptFetch(source.url)) {
    return [];
  }

  const start = Date.now();
  let xml: string | null = null;

  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (response.ok) {
      xml = await response.text();
    } else {
      // Self-healing attempt with alternate mirror paths if available
      const alternates = getAlternateFeedUrls(source.url);
      for (const altUrl of alternates.slice(0, 2)) {
        try {
          const altResp = await fetch(altUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
            },
            signal: AbortSignal.timeout(5000),
            cache: "no-store",
          });
          if (altResp.ok) {
            xml = await altResp.text();
            break;
          }
        } catch {}
      }
    }

    if (!xml) {
      recordFetchFailure(source.name, source.url, `HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    recordFetchSuccess(source.name, source.url, Date.now() - start);
    const items = parseFeedItems(xml);

    return items
      .filter((item) => {
        if (!isFreshArticle(item.publishedAt, 45)) return false;
        if (!isRelevantComicStory(source.name, item.title, item.summary, true)) return false;
        return evaluateArticleQuality(item.title, item.summary, true).admit;
      })
      .map((item) => {
        const isVideo = item.url.includes("youtube.com") || item.url.includes("youtu.be");
        return {
          story_key: generateStoryKey(source.url, item.url, item.title),
          source: source.name,
          source_url: source.url,
          category: isVideo ? "video" : source.category,
          headline: item.title,
          author: item.author,
          summary: item.summary,
          url: item.url,
          image_url: item.imageUrl || sourceFavicon(source.url),
          published_at: item.publishedAt,
        };
      });
  } catch (err) {
    recordFetchFailure(source.name, source.url, (err as Error).message);
    return [];
  }
}

async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      try {
        const val = await fn(items[index]);
        results[index] = { status: "fulfilled", value: val };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });

  await Promise.all(workers);
  return results;
}

export async function refreshNewsStore(
  sources: NewsSource[] = SOURCES,
  concurrency = 24
): Promise<{ ingested: number; errors: number; wireCount: number; syndicatedCount: number }> {
  const db = createAdminServerClient();
  let ingested = 0;
  let errors = 0;
  let wireCount = 0;
  let syndicatedCount = 0;

  try {
    // 1. Fetch syndicated RSS/Atom feeds concurrently with bounded pool
    const feedBatches = await mapConcurrent(sources, concurrency, fetchFeedSource);
    const syndicatedRows = feedBatches.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    syndicatedCount = syndicatedRows.length;

    // 2. Fetch multi-wire news APIs (NewsData, Perigon, TheNewsAPI, NewsAPI, AskNews)
    let wireRows: Awaited<ReturnType<typeof fetchAllWireStories>> = [];
    try {
      wireRows = await fetchAllWireStories();
      wireCount = wireRows.length;
    } catch (wireErr) {
      console.error("[News Ingest] Wire APIs fetch error:", wireErr);
    }

    // 3. Combine and deduplicate by unique story_key, enforcing strict relevance gate
    const combinedMap = new Map<string, typeof syndicatedRows[0]>();
    for (const row of [...syndicatedRows, ...wireRows]) {
      if (
        isFreshArticle(row.published_at, 45) &&
        isRelevantComicStory(row.source, row.headline, row.summary) &&
        evaluateArticleQuality(row.headline, row.summary).admit
      ) {
        if (!combinedMap.has(row.story_key)) {
          combinedMap.set(row.story_key, row);
        }
      }
    }

    const allRows = Array.from(combinedMap.values());

    if (allRows.length > 0) {
      const nowIso = new Date().toISOString();
      const rowsToInsert = allRows.map((row) => ({
        ...row,
        ingested_at: nowIso,
        archived_at: null,
      }));

      // Upsert into Supabase pp_news_stories on conflict story_key in chunks of 100
      for (let i = 0; i < rowsToInsert.length; i += 100) {
        const chunk = rowsToInsert.slice(i, i + 100);
        const { error: upsertError } = await db
          .from("pp_news_stories")
          .upsert(chunk, { onConflict: "story_key", ignoreDuplicates: true });

        if (upsertError) {
          console.error("[News Ingest] Upsert error:", upsertError.message);
          errors += 1;
        } else {
          ingested += chunk.length;
        }
      }
    }

    // Archive stale stories older than 3 days
    try {
      await db.rpc("archive_old_news_stories");
    } catch {}
  } catch (err) {
    console.error("[News Ingest] Execution failed:", err);
    errors += 1;
  }

  return { ingested, errors, wireCount, syndicatedCount };
}

function mapStory(row: Record<string, unknown>): NewsStory {
  const cat = String(row.category || "national").toLowerCase();
  const validCategory: NewsCategory =
    cat === "video" || cat === "market" || cat === "creators" || cat === "international"
      ? (cat as NewsCategory)
      : "national";

  return {
    id: String(row.id),
    source: String(row.source),
    sourceUrl: String(row.source_url),
    category: validCategory,
    headline: sanitizeHeadline(String(row.headline)),
    author: row.author ? sanitizeNewsText(String(row.author)) : null,
    summary: sanitizeSummary(row.summary ? String(row.summary) : null),
    url: String(row.url),
    imageUrl: row.image_url ? String(row.image_url) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    ingestedAt: String(row.ingested_at),
    archivedAt: row.archived_at ? String(row.archived_at) : null,
  };
}

const DEDUP_STOP_WORDS = new Set([
  "a", "about", "after", "all", "an", "and", "are", "as", "at", "be", "been", "before", "but", "by",
  "can", "could", "did", "do", "does", "for", "from", "get", "gets", "getting", "had", "has", "have",
  "he", "her", "here", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its", "just", "like",
  "may", "me", "more", "most", "my", "no", "not", "now", "of", "off", "on", "once", "one", "only", "or",
  "other", "our", "out", "over", "report", "reports", "reveals", "revealed", "said", "say", "says",
  "see", "she", "should", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these",
  "they", "this", "those", "through", "to", "too", "under", "up", "us", "was", "we", "were", "what",
  "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "you", "your",
  "know", "everything", "things", "news", "official", "look", "looks", "first"
]);

function normalizeDedupWord(word: string): string {
  return word
    .replace(/^re-?release[s]?$/, "rerelease")
    .replace(/^scene[s]?$/, "scene")
    .replace(/^movie[s]?$/, "movie")
    .replace(/^film[s]?$/, "film")
    .replace(/^trailer[s]?$/, "trailer");
}

export function tokenizeHeadline(title: string): Set<string> {
  const norm = title
    .toLowerCase()
    .replace(/['’‘"`]/g, "")
    .replace(/[^a-z0-9]+/g, " ");
  return new Set(
    norm
      .split(/\s+/)
      .map(normalizeDedupWord)
      .filter((w) => w.length > 2 && !DEDUP_STOP_WORDS.has(w))
  );
}

export function areDuplicateStories(
  t1: string,
  d1: string | null | undefined,
  t2: string,
  d2: string | null | undefined
): boolean {
  if (d1 && d2) {
    const diff = Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
    if (diff > 72 * 60 * 60 * 1000) return false;
  }
  const s1 = tokenizeHeadline(t1);
  const s2 = tokenizeHeadline(t2);
  if (s1.size === 0 || s2.size === 0) return false;

  let intersection = 0;
  for (const w of s1) {
    if (s2.has(w)) intersection++;
  }

  const minSize = Math.min(s1.size, s2.size);
  const overlap = minSize > 0 ? intersection / minSize : 0;
  const union = new Set([...s1, ...s2]).size;
  const jaccard = union > 0 ? intersection / union : 0;

  return (overlap >= 0.55 && intersection >= 3) || jaccard >= 0.45;
}

const PREMIER_AUTHORITY_SOURCES = /variety|hollywood reporter|deadline|bleeding cool|cbr|comics beat|the beat|aipt|image comics|marvel|dc comics|dark horse|tcj|comics journal|polygon|ign/i;

function getStoryQualityScore(story: NewsStory): number {
  let score = 0;
  if (PREMIER_AUTHORITY_SOURCES.test(story.source)) score += 50;
  if (story.imageUrl && !story.imageUrl.includes("favicon") && !story.imageUrl.includes("google.com/s2/favicons")) score += 30;
  if (story.summary && story.summary.length > 100) score += 20;
  if (story.author) score += 10;
  return score;
}

export function deduplicateNewsStories(stories: NewsStory[]): NewsStory[] {
  const result: NewsStory[] = [];
  for (const candidate of stories) {
    const existingIndex = result.findIndex((existing) =>
      areDuplicateStories(existing.headline, existing.publishedAt, candidate.headline, candidate.publishedAt)
    );
    if (existingIndex === -1) {
      result.push(candidate);
    } else {
      const existingScore = getStoryQualityScore(result[existingIndex]);
      const candidateScore = getStoryQualityScore(candidate);
      if (candidateScore > existingScore) {
        result[existingIndex] = candidate;
      }
    }
  }
  return result;
}

async function fetchNewsStoriesRaw(limit = 24, includeArchive = false): Promise<NewsStory[]> {
  const db = createAdminServerClient();
  const query = db
    .from("pp_news_stories")
    .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("ingested_at", { ascending: false })
    .limit(Math.max(limit * 4, 100)); // Over-fetch to apply strict filtering & topic deduplication

  const { data, error } = includeArchive
    ? await query.not("archived_at", "is", null)
    : await query.is("archived_at", null);

  if (error) {
    if (!isMissingTableError(error)) {
      console.error("[News Store] Fetch error:", error.message);
    }
    return [];
  }

  if (!data) return [];
  const stories = data.map(mapStory);
  // Guarantee only verified relevant sequential art & market stories pass through
  const relevantStories = stories.filter((s) => isRelevantComicStory(s.source, s.headline, s.summary));
  // Deduplicate syndicated duplicate reporting across outlets
  return deduplicateNewsStories(relevantStories).slice(0, limit);
}

export const getNewsStories = createCachedQuery(
  fetchNewsStoriesRaw,
  "news-stories",
  { ttlSeconds: 60, staleWhileRevalidateSeconds: 300, tags: ["news"] }
);

async function fetchNewsStoryRaw(id: string): Promise<NewsStory | null> {
  const db = createAdminServerClient();
  const { data, error } = await db
    .from("pp_news_stories")
    .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const story = mapStory(data);
  // If story is disqualified by negative filters (e.g. legacy AC/DC or non-comic noise), reject it
  if (!isRelevantComicStory(story.source, story.headline, story.summary)) {
    return null;
  }

  return story;
}

export const getNewsStory = createCachedQuery(
  fetchNewsStoryRaw,
  "news-story",
  { ttlSeconds: 120, staleWhileRevalidateSeconds: 600, tags: ["news"] }
);
