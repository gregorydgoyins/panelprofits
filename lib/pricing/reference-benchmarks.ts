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
 * Normalizes title or series strings for resilient matching.
 */
function normalizeTitle(s?: string | null): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/#\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Robust, unified benchmark lookup for any comic book constituent.
 * Matches by title and series + issue FIRST before any numeric seat identifier.
 * Prevents catastrophic seat-number collisions (e.g. Mad #1 getting Wonder Woman #1's $45k price,
 * or X-Men #1 getting Two-Fisted Tales #35's $2.4k price).
 * NEVER returns synthetic multiplier values.
 */
export function lookupReferenceFmv(
  identifier?: string | number | null,
  title?: string | null,
  canonicalId?: string | null
): ComicBenchmarkPricing | null {
  // 1. Direct and normalized title matching (PRIMARY)
  if (title) {
    const cleanTitle = title.trim();

    // 1a. Exact key in map
    if (BENCHMARKS_MAP[cleanTitle]) return BENCHMARKS_MAP[cleanTitle];

    // 1b. Unbracketed key
    const unbracketed = cleanTitle.replace(/#\[.*?\]/g, "").replace(/\s+/g, " ").trim();
    if (BENCHMARKS_MAP[unbracketed]) return BENCHMARKS_MAP[unbracketed];

    // 1c. Normalized comparison across all keys and benchmark titles
    const targetNorm = normalizeTitle(cleanTitle);
    for (const [key, val] of Object.entries(BENCHMARKS_MAP)) {
      if (!val || typeof val !== "object") continue;
      
      const keyNorm = normalizeTitle(key);
      if (keyNorm === targetNorm) return val;

      const valTitleNorm = normalizeTitle(val.title);
      if (valTitleNorm && valTitleNorm === targetNorm) return val;

      // Match series + issue or series
      if (val.series && val.issueNumber !== undefined) {
        const valSeriesIssueNorm = normalizeTitle(`${val.series} ${val.issueNumber}`);
        if (valSeriesIssueNorm === targetNorm) return val;
        const valSeriesNorm = normalizeTitle(val.series);
        if (valSeriesNorm === targetNorm) return val;
      }
    }
  }

  // 2. Canonical ID matching
  if (canonicalId) {
    const cleanCid = canonicalId.trim();
    if (BENCHMARKS_MAP[cleanCid]) return BENCHMARKS_MAP[cleanCid];

    for (const val of Object.values(BENCHMARKS_MAP)) {
      if (val && typeof val === "object" && val.canonicalId === cleanCid) {
        return val;
      }
    }
  }

  // 3. Fallback to Identifier / Seat Number ONLY IF SAFE
  if (identifier !== undefined && identifier !== null && identifier !== "") {
    const idStr = String(identifier).trim();
    const numMatch = idStr.match(/(?:seat|ce70)[-_]?(\d+)/i) || idStr.match(/^(\d+)$/);
    const seatKey = numMatch ? numMatch[1] : idStr;

    const candidate = BENCHMARKS_MAP[seatKey];
    if (candidate && typeof candidate === "object") {
      // CRITICAL GUARD: If a title was requested, verify the candidate actually matches that title or series!
      // This prevents blind seat collision where seat 13 (Two-Fisted Tales) would be assigned to X-Men #1.
      if (title) {
        const targetNorm = normalizeTitle(title);
        const candTitleNorm = normalizeTitle(candidate.title || candidate.series);
        if (targetNorm && candTitleNorm && (targetNorm.includes(candTitleNorm) || candTitleNorm.includes(targetNorm))) {
          return candidate;
        }
        // If titles conflict, DO NOT return the seat candidate!
      } else {
        // No title provided; safe to return by seat
        return candidate;
      }
    }
  }

  return null;
}
