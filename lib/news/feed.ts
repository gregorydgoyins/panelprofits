import crypto from "node:crypto";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";
import { scrapeSourceArticle, generatePanelProfitsArticle, cleanScrapedText } from "@/lib/news/generator";

export type NewsCategory = "national" | "international";
export const DEFAULT_NEWS_IMAGE = "/newsroom-default.svg";

function officialFavicon(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function sourceFavicon(sourceUrl: string): string {
  try {
    return officialFavicon(new URL(sourceUrl).hostname.replace(/^www\./, ""));
  } catch {
    return DEFAULT_NEWS_IMAGE;
  }
}

function isUsableStoryImage(value: string | null | undefined): value is string {
  if (typeof value !== "string" || value === DEFAULT_NEWS_IMAGE) return false;
  return true;
}

export function newsFallbackImage(source: string, headline: string, summary: string | null): string | null {
  const text = `${source} ${headline} ${summary || ""}`;
  if (/\bmarvel\b|avengers|spider-man|x-men|wolverine|deadpool/i.test(text)) return officialFavicon("marvel.com");
  if (/\bdc comics?\b|batman|superman|wonder woman|justice league/i.test(text)) return officialFavicon("dc.com");
  if (/dark horse/i.test(text)) return officialFavicon("darkhorse.com");
  if (/\bidw\b/i.test(text)) return officialFavicon("idwpublishing.com");
  if (/boom studios|\bboom!\b/i.test(text)) return officialFavicon("boom-studios.com");
  return null;
}

export interface NewsStory {
  id: string;
  source: string;
  sourceUrl: string;
  category: NewsCategory;
  headline: string;
  author: string | null;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string | null;
  ingestedAt: string;
  archivedAt: string | null;
}

export function shortNewsSource(source: string): string {
  const normalized = source.trim().toLowerCase();
  const labels: Record<string, string> = {
    "ap entertainment": "AP",
    "anime news network": "ANN",
    "bleeding cool": "BLEEDING COOL",
    "comicbook.com": "COMICBOOK",
    "gamesradar": "GAMESRADAR",
    "screenrant": "SCREENRANT",
    "the beat": "THE BEAT",
    "the guardian film": "GUARDIAN",
    "the hollywood reporter": "THR",
  };
  if (labels[normalized]) return labels[normalized];
  if (source.length <= 14) return source.toUpperCase();
  return source.split(/\s+/).map((word) => word[0]).join("").slice(0, 5).toUpperCase();
}

interface NewsSource {
  name: string;
  url: string;
  category: NewsCategory;
}

const SOURCES: NewsSource[] = [
  { name: "VARIETY", url: "https://variety.com/feed/", category: "national" },
  { name: "DEADLINE", url: "https://deadline.com/feed/", category: "national" },
  { name: "THR", url: "https://www.hollywoodreporter.com/feed/", category: "national" },
  { name: "COMICBOOK", url: "https://comicbook.com/feed/", category: "national" },
  { name: "CBR", url: "https://www.cbr.com/feed/", category: "national" },
  { name: "BLEEDING COOL", url: "https://bleedingcool.com/comics/feed/", category: "national" },
  { name: "THE BEAT", url: "https://www.comicsbeat.com/feed/", category: "national" },
  { name: "AIPT", url: "https://aiptcomics.com/feed/", category: "national" },
  { name: "GAMESRADAR", url: "https://www.gamesradar.com/feeds/all/", category: "international" },
  { name: "IGN", url: "https://www.ign.com/rss/articles/feed?tags=comics", category: "international" },
  { name: "POLYGON", url: "https://www.polygon.com/rss/index.xml", category: "international" },
  { name: "ANN", url: "https://www.animenewsnetwork.com/all/rss.xml", category: "international" },
  { name: "GUARDIAN", url: "https://www.theguardian.com/books/rss", category: "international" },
  { name: "SCREENRANT", url: "https://screenrant.com/feed/", category: "international" },
  { name: "COMICS JOURNAL", url: "https://www.tcj.com/feed/", category: "international" },
  { name: "BROKEN FRONTIER", url: "https://www.brokenfrontier.com/feed/", category: "international" },
  { name: "COMICSXF", url: "https://comicsxf.com/feed/", category: "national" },
  { name: "ICV2", url: "https://icv2.com/rss", category: "national" },
  { name: "COMICBOOK INVEST", url: "https://comicbookinvest.com/feed/", category: "national" },
  { name: "OTAKU USA", url: "https://otakuusamagazine.com/feed/", category: "international" },
  { name: "ANIME HERALD", url: "https://www.animeherald.com/feed/", category: "international" },
];

const TERTIARY_SOURCE_NAMES = new Set(["CBR", "THR", "COMICBOOK", "BLEEDING COOL", "THE BEAT", "ICV2", "ANIME TRENDING", "ANIME HERALD", "COMICS JOURNAL", "POLYGON", "ANN"]);
const COMIC_TERMS = /comic\s*book|comic(s)?\b|superhero|super-hero|marvel|dc comics|avengers|x-men|spider-man|batman|superman|fantastic four|deadpool|wolverine|venom|manga|mangaka|anime|graphic novel|image comics|dark horse|idw|boom studios|viz media|shonen|shojo|webtoon|manhwa/i;
const COMPANY_TERMS = /disney|warner bros|warner discovery|wbd|sony pictures|universal|paramount|skydance|marvel entertainment/i;
const FINANCIAL_TERMS = /earnings|earning report|annual report|quarterly|revenue|profit|loss|shares|stock|investor|acquisition|merger|deal|buyout|results/i;
const EXCLUDE_NON_COMIC = /\b(gameplay|playstation\s*5|ps5|xbox|nintendo switch|platinum trophy|earphones|headset|found footage|horror movie|blair witch|messi|lionel messi|soccer|football|nfl|nba|basketball|premier league|champions league|mls|inter miami)\b/i;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function isRelevantComicStory(source: string, headline: string, summary: string | null): boolean {
  const text = `${headline} ${summary || ""}`;
  if (EXCLUDE_NON_COMIC.test(text)) {
    return false;
  }
  const isComicOrManga = COMIC_TERMS.test(text);
  const isCompanyFinance = COMPANY_TERMS.test(text) && FINANCIAL_TERMS.test(text);
  if (!isComicOrManga && !isCompanyFinance) return false;
  return true;
}

let memoryStories: NewsStory[] = [];

function isTertiarySource(source: string) {
  return TERTIARY_SOURCE_NAMES.has(source);
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

function diversifyStories(stories: NewsStory[], limit: number): NewsStory[] {
  const remaining = shuffle(stories);
  const sourceCounts = new Map<string, number>();
  const result: NewsStory[] = [];
  const maxStoriesPerSource = 2;
  while (remaining.length && result.length < limit) {
    const eligible = remaining.filter((story) => (sourceCounts.get(story.source) || 0) < maxStoriesPerSource);
    if (!eligible.length) break;
    const minTier = Math.min(...eligible.map((story) => isTertiarySource(story.source) ? 1 : 0));
    const tierCandidates = eligible.filter((story) => (isTertiarySource(story.source) ? 1 : 0) === minTier);
    const minCount = Math.min(...new Set(tierCandidates.map((story) => sourceCounts.get(story.source) || 0)));
    const candidates = tierCandidates.filter((story) => (sourceCounts.get(story.source) || 0) === minCount);
    const weightedCandidates = candidates.flatMap((story) => isTertiarySource(story.source) ? [story] : [story, story, story]);
    const selected = weightedCandidates[crypto.randomInt(weightedCandidates.length)];
    const index = remaining.indexOf(selected);
    if (index < 0) break;
    remaining.splice(index, 1);
    sourceCounts.set(selected.source, (sourceCounts.get(selected.source) || 0) + 1);
    result.push(selected);
  }
  return result;
}

export async function processNewsIngestion(storyRow: Record<string, unknown>): Promise<boolean> {
  const db = createAdminServerClient();
  const storyId = String(storyRow.id);
  const url = String(storyRow.url);
  const source = String(storyRow.source);
  const headline = String(storyRow.headline);
  const rawSummary = storyRow.summary ? String(storyRow.summary) : null;
  const publishedAt = storyRow.published_at ? String(storyRow.published_at) : null;

  // Strip all legacy templated boilerplate from stored summaries before fact extraction
  let cleanedRawSummary = "";
  if (rawSummary) {
    const pubMatch = rawSummary.match(/publication parameters:\s*([\s\S]*?)(?:Panel Profits analysts note|From a comic equity|Looking ahead,|$)/i);
    if (pubMatch && pubMatch[1].trim().length > 20) {
      cleanedRawSummary = pubMatch[1].trim();
    } else {
      cleanedRawSummary = rawSummary
        .split(/(?<=[.!?])\s+|\n\n+/)
        .filter((s) => 
          !/Official industry reporting confirms|Recent distribution data|Industry solicitations|Publishing updates from|Media production reports|Independent creator publishing|According to verified reporting|Panel Profits analysts note|From a comic equity|When studio optioning|In terms of asset quality|Analyzing the broader market|Looking ahead, |Panel Profits will continue tracking|release parameters establish/i.test(s)
        )
        .join(" ")
        .trim();
    }
  }

  const scrapedContent = await scrapeSourceArticle(url);
  const generated = generatePanelProfitsArticle({
    storyKey: storyId,
    source,
    sourceUrl: url,
    headline,
    rawSummary: cleanedRawSummary,
    scrapedContent,
    publishedAt,
  });

  // Only publish if audit verdict passed!
  if (!generated.passReport.auditVerdict.isPassed) {
    console.warn(`[Ingestion] Story ${storyId} rejected by auditor (Score: ${generated.passReport.auditVerdict.auditScore}):`, generated.passReport.auditVerdict.violations);
    return false;
  }

  const cleanHeadline = cleanScrapedText(generated.headline);
  const cleanSummary = generated.paragraphs.join("\n\n");
  const author = generated.assignedAuthorName;

  const { error } = await db
    .from("pp_news_stories")
    .update({ headline: cleanHeadline, summary: cleanSummary, author })
    .eq("id", storyId);

  if (error) {
    console.error(`[Ingestion] Failed to persist story ${storyId}:`, error);
    return false;
  }
  return true;
}

export async function refreshNewsStore(): Promise<void> {
  const db = createAdminServerClient();
  const { data, error } = await db
    .from("pp_news_stories")
    .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (error || !data) return;

  for (const row of data) {
    // Ground and audit each story
    await processNewsIngestion(row);
  }
}

export async function getNewsStories(limit = 24, includeArchive = false): Promise<NewsStory[]> {
  const db = createAdminServerClient();
  const query = db
    .from("pp_news_stories")
    .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("ingested_at", { ascending: false })
    .limit(300);

  const { data, error } = includeArchive
    ? await query.not("archived_at", "is", null)
    : await query.is("archived_at", null);

  if (error) {
    if (!isMissingTableError(error)) {
      console.error("Error fetching news stories:", error);
    }
    return [];
  }
  if (!data) return [];

  const stories = data.map(mapStory).filter((story) => isRelevantComicStory(story.source, story.headline, story.summary) && isUsableStoryImage(story.imageUrl));
  return diversifyStories(stories, Math.min(Math.max(limit, 1), 100));
}

export async function getNewsStory(id: string): Promise<NewsStory | null> {
  const db = createAdminServerClient();
  const { data: directStory, error: directStoryError } = await db
    .from("pp_news_stories")
    .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
    .eq("id", id)
    .maybeSingle();

  if (!directStoryError && directStory) {
    return mapStory(directStory);
  }

  const activeStories = await getNewsStories(100);
  const activeStory = activeStories.find((story) => story.id === id);
  if (activeStory) return activeStory;

  const archivedStories = await getNewsStories(100, true);
  return archivedStories.find((story) => story.id === id) || null;
}
