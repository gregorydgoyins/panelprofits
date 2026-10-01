/**
 * Master Comic Intelligence Ingestion Engine.
 * 
 * Aggregates and ingests hundreds of fresh, verified comic intelligence stories across:
 * 1. 4 High-Volume News APIs (NewsData.io, AskNews, Perigon, TheNewsAPI)
 * 2. 13 Leading YouTube Video Essay & Retrospective Channels (NerdSync, Comics Explained, etc.)
 * 3. 15+ Immediate Dedicated Comic Journalism & Trade Outlets (Bleeding Cool, CBR, The Beat, etc.)
 * 4. 5 Pro Comic Creator Substacks (Tynion, Zdarsky, Snyder, Hickman, Thompson)
 * 5. Secondary Market & Valuation Trackers (CovrPrice, ComicBookInvest)
 * 
 * Enforces:
 * - Next-Gen Fuzzy Logic & Semantic Classifier
 * - Hard Freshness Filter (max 45 days old)
 * - Anti-Noise Disqualification
 * - Authentic High-Res Video Metadata
 */

import crypto from "crypto";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { ACTIVE_NEWS_CHANNELS, ActiveFeedChannel } from "./channels-registry";
import { fetchAllWireStories, WireStoryDraft } from "./wire-apis";
import { isRelevantComicStory, evaluateArticleQuality, isFreshArticle } from "./classifier";
import { sourceFavicon, NewsCategory } from "./types";
import { sanitizeHeadline, sanitizeSummary, sanitizeNewsText } from "./sanitize";

export interface IngestedStoryDraft {
  story_key: string;
  source: string;
  source_url: string;
  category: NewsCategory;
  headline: string;
  author: string | null;
  summary: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  channel_type: "trade" | "video" | "creator" | "market" | "wire";
}

function generateStoryKey(sourceUrl: string, itemUrl: string, title: string): string {
  return crypto.createHash("sha256").update(`${sourceUrl}|${itemUrl}|${title}`).digest("hex");
}

function decodeEntities(str: string): string {
  return sanitizeNewsText(str);
}

function tagValue(xml: string, tag: string): string | null {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const standardRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(standardRegex);
  return match ? match[1].trim() : null;
}

function attributeValue(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*?\\b${attr}=["']([^"']+)["'][^>]*>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractImage(block: string): string | null {
  const mediaContent = attributeValue(block, "media:content", "url");
  if (mediaContent && !mediaContent.endsWith(".svg")) return mediaContent;

  const mediaThumbnail = attributeValue(block, "media:thumbnail", "url");
  if (mediaThumbnail && !mediaThumbnail.endsWith(".svg")) return mediaThumbnail;

  const enclosure = attributeValue(block, "enclosure", "url");
  if (enclosure && (enclosure.includes(".jpg") || enclosure.includes(".png") || enclosure.includes(".jpeg") || enclosure.includes(".webp"))) {
    return enclosure;
  }

  const imgMatch = block.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch && !imgMatch[1].endsWith(".svg") && !imgMatch[1].includes("feed-icon")) {
    return imgMatch[1];
  }

  return null;
}

/**
 * Fetch and parse a single RSS/Atom/YouTube feed.
 */
async function fetchChannelFeed(channel: ActiveFeedChannel): Promise<IngestedStoryDraft[]> {
  try {
    const res = await fetch(channel.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const xml = await res.text();
    const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((m) => m[0]);

    const drafts: IngestedStoryDraft[] = [];

    for (const block of blocks) {
      const rawTitle = tagValue(block, "title");
      const ytVideoId = tagValue(block, "yt:videoId");
      const rawUrl = ytVideoId
        ? `https://www.youtube.com/watch?v=${ytVideoId}`
        : tagValue(block, "link") || attributeValue(block, "link", "href");

      if (!rawTitle || !rawUrl) continue;

      const headline = decodeEntities(rawTitle).slice(0, 300);
      const url = rawUrl.trim();
      const rawSummary =
        tagValue(block, "content:encoded") ||
        tagValue(block, "media:description") ||
        tagValue(block, "description") ||
        tagValue(block, "summary") ||
        tagValue(block, "content");
      const summary = rawSummary ? decodeEntities(rawSummary).slice(0, 3000) : null;
      const author = tagValue(block, "dc:creator") || tagValue(block, "name") || tagValue(block, "author") || null;

      // Handle video images vs article images
      let imageUrl = extractImage(block);
      if (ytVideoId) {
        imageUrl = `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`;
      } else if (!imageUrl) {
        imageUrl = sourceFavicon(channel.url);
      }

      const pubDateStr = tagValue(block, "pubDate") || tagValue(block, "published") || tagValue(block, "updated");
      const publishedAt = pubDateStr && !Number.isNaN(Date.parse(pubDateStr))
        ? new Date(pubDateStr).toISOString()
        : new Date().toISOString();

      // Freshness Gate: strictly reject stories older than 45 days
      if (!isFreshArticle(publishedAt, 45)) {
        continue;
      }

      // Fuzzy Relevance Gate
      const isDedicated = channel.channelType === "video" || channel.channelType === "trade" || channel.channelType === "creator";
      if (!isRelevantComicStory(channel.name, headline, summary, isDedicated)) {
        continue;
      }

      const quality = evaluateArticleQuality(headline, summary, isDedicated);
      if (!quality.admit) {
        continue;
      }

      const story_key = generateStoryKey(channel.url, url, headline);
      drafts.push({
        story_key,
        source: channel.name,
        source_url: channel.url,
        category: channel.channelType === "video" ? "video" : channel.category,
        headline,
        author,
        summary,
        url,
        image_url: imageUrl,
        published_at: publishedAt,
        channel_type: channel.channelType,
      });
    }

    return drafts;
  } catch (err) {
    return [];
  }
}

/**
 * Execute master parallel ingestion across wire APIs, video essays, dedicated trade, and creator feeds.
 */
export async function executeMasterNewsIngestion(concurrency = 12): Promise<{
  totalIngested: number;
  totalErrors: number;
  breakdown: {
    videoCount: number;
    wireCount: number;
    tradeCount: number;
    creatorCount: number;
    marketCount: number;
  };
}> {
  const db = createAdminServerClient();
  const allDrafts: IngestedStoryDraft[] = [];
  const seenKeys = new Set<string>();

  // 1. Fetch Wire APIs in parallel
  try {
    const wireStories: WireStoryDraft[] = await fetchAllWireStories();
    for (const ws of wireStories) {
      // Apply freshness check
      if (!isFreshArticle(ws.published_at, 45)) continue;
      if (!isRelevantComicStory(ws.source, ws.headline, ws.summary)) continue;

      if (!seenKeys.has(ws.story_key)) {
        seenKeys.add(ws.story_key);
        allDrafts.push({
          story_key: ws.story_key,
          source: ws.source,
          source_url: ws.source_url,
          category: ws.category,
          headline: ws.headline,
          author: ws.author,
          summary: ws.summary,
          url: ws.url,
          image_url: ws.image_url,
          published_at: ws.published_at || new Date().toISOString(),
          channel_type: "wire",
        });
      }
    }
  } catch (err) {
    console.warn("Wire APIs fetch warning:", err);
  }

  // 2. Fetch Active Channels (YouTube videos, trade feeds, creator Substacks) concurrently
  const channelResults: IngestedStoryDraft[][] = [];
  let currentIndex = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (currentIndex < ACTIVE_NEWS_CHANNELS.length) {
      const channel = ACTIVE_NEWS_CHANNELS[currentIndex++];
      const drafts = await fetchChannelFeed(channel);
      channelResults.push(drafts);
    }
  });

  await Promise.all(workers);

  for (const channelDrafts of channelResults) {
    for (const draft of channelDrafts) {
      if (!seenKeys.has(draft.story_key)) {
        seenKeys.add(draft.story_key);
        allDrafts.push(draft);
      }
    }
  }

  // 3. Batch Upsert into Supabase (50 per batch)
  let totalIngested = 0;
  let totalErrors = 0;
  const batchSize = 50;

  for (let i = 0; i < allDrafts.length; i += batchSize) {
    const chunk = allDrafts.slice(i, i + batchSize).map((d) => ({
      story_key: d.story_key,
      source: d.source,
      source_url: d.source_url,
      category: d.category,
      headline: d.headline,
      summary: d.summary,
      url: d.url,
      image_url: d.image_url,
      published_at: d.published_at,
      ingested_at: new Date().toISOString(),
      author: d.author,
    }));

    const { error, count } = await db
      .from("pp_news_stories")
      .upsert(chunk, { onConflict: "story_key", count: "exact" });

    if (error) {
      console.error(`Batch upsert error at index ${i}:`, error.message);
      totalErrors += chunk.length;
    } else {
      totalIngested += count || chunk.length;
    }
  }

  // Count breakdown
  const breakdown = {
    videoCount: allDrafts.filter((d) => d.channel_type === "video").length,
    wireCount: allDrafts.filter((d) => d.channel_type === "wire").length,
    tradeCount: allDrafts.filter((d) => d.channel_type === "trade").length,
    creatorCount: allDrafts.filter((d) => d.channel_type === "creator").length,
    marketCount: allDrafts.filter((d) => d.channel_type === "market").length,
  };

  return {
    totalIngested,
    totalErrors,
    breakdown,
  };
}
