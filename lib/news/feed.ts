import crypto from "crypto";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";

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

export const SOURCES: NewsSource[] = [
  { name: "BLEEDING COOL", url: "https://bleedingcool.com/comics/feed/", category: "national" },
  { name: "CBR", url: "https://www.cbr.com/feed/", category: "national" },
  { name: "THE BEAT", url: "https://www.comicsbeat.com/feed/", category: "national" },
  { name: "AIPT", url: "https://aiptcomics.com/feed/", category: "national" },
  { name: "VARIETY", url: "https://variety.com/feed/", category: "national" },
  { name: "DEADLINE", url: "https://deadline.com/feed/", category: "national" },
  { name: "THR", url: "https://www.hollywoodreporter.com/feed/", category: "national" },
  { name: "ICV2", url: "https://icv2.com/rss", category: "national" },
  { name: "GAMESRADAR", url: "https://www.gamesradar.com/feeds/all/", category: "international" },
  { name: "IGN", url: "https://www.ign.com/rss/articles/feed?tags=comics", category: "international" },
  { name: "POLYGON", url: "https://www.polygon.com/rss/index.xml", category: "international" },
  { name: "COMICSXF", url: "https://comicsxf.com/feed/", category: "national" },
  { name: "COMICBOOK INVEST", url: "https://comicbookinvest.com/feed/", category: "national" },
  { name: "COMICS JOURNAL", url: "https://www.tcj.com/feed/", category: "international" },
];

const COMIC_TERMS = /comic\s*book|comic(s)?\b|superhero|super-hero|marvel|dc comics|avengers|x-men|spider-man|batman|superman|fantastic four|deadpool|wolverine|venom|manga|mangaka|graphic novel|image comics|\bdark horse\b|idw|boom studios|viz media|spawn|spawn universe/i;
const COMPANY_TERMS = /disney|warner bros|warner discovery|wbd|sony pictures|universal|paramount|skydance|marvel entertainment/i;
const FINANCIAL_TERMS = /earnings|revenue|profit|loss|shares|stock|investor|acquisition|merger|deal|buyout|results|box office/i;
const EXCLUDE_NON_COMIC = /\b(gameplay|playstation\s*5|ps5|xbox|nintendo switch|platinum trophy|earphones|headset|found footage|horror movie|blair witch|messi|lionel messi|soccer|football|nfl|nba|basketball|premier league|champions league|mls|inter miami|celebrity traitors|reality tv)\b/i;

export function isRelevantComicStory(source: string, headline: string, summary: string | null): boolean {
  const text = `${headline} ${summary || ""}`;
  if (EXCLUDE_NON_COMIC.test(text)) {
    return false;
  }
  const isComicOrManga = COMIC_TERMS.test(text);
  const isCompanyFinance = COMPANY_TERMS.test(text) && FINANCIAL_TERMS.test(text);
  return isComicOrManga || isCompanyFinance;
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code: string) => {
      try {
        return String.fromCodePoint(Number(code));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) => {
      try {
        return String.fromCodePoint(parseInt(code, 16));
      } catch {
        return "";
      }
    })
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    const rawUrl = tagValue(block, "link") || attributeValue(block, "link", "href");
    if (!rawTitle || !rawUrl) return [];

    const title = decodeEntities(rawTitle).slice(0, 300);
    const url = rawUrl.trim();
    const rawSummary =
      tagValue(block, "content:encoded") ||
      tagValue(block, "description") ||
      tagValue(block, "summary") ||
      tagValue(block, "content");
    const summary = rawSummary ? decodeEntities(rawSummary).slice(0, 3000) : null;
    const author = tagValue(block, "dc:creator") || tagValue(block, "author") || null;
    const imageUrl = extractImage(block);
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
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) return [];
    const xml = await response.text();
    const items = parseFeedItems(xml);

    return items
      .filter((item) => isRelevantComicStory(source.name, item.title, item.summary))
      .map((item) => ({
        story_key: generateStoryKey(source.url, item.url, item.title),
        source: source.name,
        source_url: source.url,
        category: source.category,
        headline: item.title,
        author: item.author,
        summary: item.summary,
        url: item.url,
        image_url: item.imageUrl || sourceFavicon(source.url),
        published_at: item.publishedAt,
      }));
  } catch {
    return [];
  }
}

export async function refreshNewsStore(): Promise<{ ingested: number; errors: number }> {
  const db = createAdminServerClient();
  let ingested = 0;
  let errors = 0;

  try {
    const feedBatches = await Promise.allSettled(SOURCES.map(fetchFeedSource));
    const allRows = feedBatches.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

    if (allRows.length > 0) {
      const nowIso = new Date().toISOString();
      const rowsToInsert = allRows.map((row) => ({
        ...row,
        ingested_at: nowIso,
        archived_at: null,
      }));

      // Upsert into Supabase pp_news_stories on conflict story_key
      const { error: upsertError } = await db
        .from("pp_news_stories")
        .upsert(rowsToInsert, { onConflict: "story_key", ignoreDuplicates: true });

      if (upsertError) {
        console.error("[News Ingest] Upsert error:", upsertError.message);
        errors += 1;
      } else {
        ingested = rowsToInsert.length;
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

  return { ingested, errors };
}

function mapStory(row: Record<string, unknown>): NewsStory {
  return {
    id: String(row.id),
    source: String(row.source),
    sourceUrl: String(row.source_url),
    category: row.category === "national" ? "national" : "international",
    headline: String(row.headline),
    author: row.author ? String(row.author) : null,
    summary: row.summary ? String(row.summary) : null,
    url: String(row.url),
    imageUrl: row.image_url ? String(row.image_url) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    ingestedAt: String(row.ingested_at),
    archivedAt: row.archived_at ? String(row.archived_at) : null,
  };
}

export async function getNewsStories(limit = 24, includeArchive = false): Promise<NewsStory[]> {
  const db = createAdminServerClient();
  const query = db
    .from("pp_news_stories")
    .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("ingested_at", { ascending: false })
    .limit(limit);

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
  return data.map(mapStory);
}

export async function getNewsStory(id: string): Promise<NewsStory | null> {
  const db = createAdminServerClient();
  const { data, error } = await db
    .from("pp_news_stories")
    .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapStory(data);
}
