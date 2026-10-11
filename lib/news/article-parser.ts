import { findNewsEntities, extractEntitiesFromContext, type EntityWikiDef } from "./entities";
import { analyzeStoryCatalyst, type CatalystAnalysis } from "./catalyst";
import { sanitizeHeadline, sanitizeSummary } from "./sanitize";

/**
 * A news story as published, plus entity links and its market-impact classification.
 * The body is the source's own text only. No analyst copy, no invented figures, no byline
 * other than the one the source gave. Price evidence is fetched separately (market-evidence.ts).
 */
export interface SynthesizedArticle {
  headline: string;
  paragraphs: string[];
  sections: Array<{ heading: string; body: string }>;
  readingTimeMinutes: number;
  wordCount: number;
  entities: EntityWikiDef[];
  catalyst: CatalystAnalysis;
}

const CACHE = new Map<string, SynthesizedArticle>();
const MAX_CACHE = 500;

export function parseAndSynthesizeArticle(story: {
  headline: string;
  summary: string | null;
  source: string;
  author?: string | null;
  id?: string;
}): SynthesizedArticle {
  const cacheKey = story.id || `${story.headline}|${story.summary || ""}`;
  const cached = CACHE.get(cacheKey);
  if (cached) return cached;

  const headline = sanitizeHeadline(story.headline);
  const summary = sanitizeSummary(story.summary) || "";

  const paragraphs = summary ? summary.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) : [headline];
  const wordCount = paragraphs.reduce((n, p) => n + p.split(/\s+/).filter(Boolean).length, 0);

  const seen = new Map<string, EntityWikiDef>();
  for (const e of findNewsEntities(headline, summary)) seen.set(e.term.toLowerCase(), e);
  for (const e of extractEntitiesFromContext([headline, ...paragraphs].join(" \n "))) {
    if (!seen.has(e.term.toLowerCase())) seen.set(e.term.toLowerCase(), e);
  }

  const article: SynthesizedArticle = {
    headline,
    paragraphs,
    sections: paragraphs.map((body, i) => ({ heading: i === 0 ? "Original Reporting" : "", body })),
    readingTimeMinutes: Math.max(1, Math.round(wordCount / 220)),
    wordCount,
    entities: Array.from(seen.values()),
    catalyst: analyzeStoryCatalyst(headline, summary),
  };

  if (CACHE.size >= MAX_CACHE) {
    const oldest = CACHE.keys().next().value;
    if (oldest) CACHE.delete(oldest);
  }
  CACHE.set(cacheKey, article);
  return article;
}
