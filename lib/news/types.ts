export type NewsCategory = "national" | "international";
export const DEFAULT_NEWS_IMAGE = "/newsroom-default.svg";

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

export function officialFavicon(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export function sourceFavicon(sourceUrl: string): string {
  try {
    return officialFavicon(new URL(sourceUrl).hostname.replace(/^www\./, ""));
  } catch {
    return DEFAULT_NEWS_IMAGE;
  }
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

export interface NewsSource {
  name: string;
  url: string;
  category: NewsCategory;
}
