import ce70ReferenceFmvJson from "@/lib/equity/ce70-reference-fmv.json";

export interface ComicBenchmarkPricing {
  seatNumber?: number;
  series: string;
  issueNumber: string;
  title: string;
  publisher?: string;
  year?: number;
  creators?: string;
  canonicalId?: string;
  coverPrice: number;
  rawFmvUsd: number;
  grade40FmvUsd?: number;
  grade60FmvUsd?: number;
  grade80FmvUsd?: number;
  grade90FmvUsd?: number;
  grade92FmvUsd?: number;
  grade94FmvUsd?: number;
  grade96FmvUsd?: number;
  grade98FmvUsd: number;
  referenceGrade: string;
  referenceFmvUsd: number;
  pricechartingUrl?: string;
  gregoryScore?: number;
}

const BENCHMARKS_MAP = ce70ReferenceFmvJson as unknown as Record<string, ComicBenchmarkPricing>;

/**
 * Robust, unified benchmark lookup for any comic book constituent.
 * Matches by seat number, title, canonical ID, or series + issue.
 * NEVER returns synthetic multiplier values (e.g. gregoryScore * 850).
 */
export function lookupReferenceFmv(
  identifier?: string | number | null,
  title?: string | null,
  canonicalId?: string | null
): ComicBenchmarkPricing | null {
  if (identifier !== undefined && identifier !== null && identifier !== "") {
    const idKey = String(identifier).trim();
    if (BENCHMARKS_MAP[idKey]) return BENCHMARKS_MAP[idKey];

    // Check clean number e.g. "seat-50" -> "50"
    const numMatch = idKey.match(/(?:seat|ce70)[-_]?(\d+)/i) || idKey.match(/^(\d+)$/);
    if (numMatch && BENCHMARKS_MAP[numMatch[1]]) {
      return BENCHMARKS_MAP[numMatch[1]];
    }
  }

  if (canonicalId && BENCHMARKS_MAP[canonicalId]) {
    return BENCHMARKS_MAP[canonicalId];
  }

  if (title) {
    const cleanTitle = title.trim();
    if (BENCHMARKS_MAP[cleanTitle]) return BENCHMARKS_MAP[cleanTitle];

    // Try without bracketed annotations e.g. "Fun Home #[nn]" -> "Fun Home"
    const unbracketed = cleanTitle.replace(/#\[.*?\]/g, "").replace(/\s+/g, " ").trim();
    if (BENCHMARKS_MAP[unbracketed]) return BENCHMARKS_MAP[unbracketed];

    // Look for case-insensitive match
    const lower = cleanTitle.toLowerCase();
    for (const [key, val] of Object.entries(BENCHMARKS_MAP)) {
      if (key.toLowerCase() === lower || val.title?.toLowerCase() === lower) {
        return val;
      }
    }
  }

  return null;
}
