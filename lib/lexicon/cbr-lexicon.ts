import fs from "fs";
import path from "path";

export interface CbrLexiconEntry {
  term: string;
  slug: string;
  category: string;
  investopedia_definition: string;
  panel_profits_translation: string;
  canonical_formula?: string | null;
  comic_example?: string | null;
  anti_patterns?: string | null;
  is_core_canon: boolean;
  investopedia_url?: string | null;
}

let cachedTerms: Record<string, CbrLexiconEntry> | null = null;
let cachedTermList: CbrLexiconEntry[] | null = null;

function loadCbrDictionary(): Record<string, CbrLexiconEntry> {
  if (cachedTerms) return cachedTerms;
  if (typeof window !== "undefined") return {};

  try {
    const jsonPath = path.join(process.cwd(), "lib/lexicon/cbr_market_lexicon.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      cachedTerms = JSON.parse(raw);
      cachedTermList = Object.values(cachedTerms!);
    } else {
      cachedTerms = {};
      cachedTermList = [];
    }
  } catch {
    cachedTerms = {};
    cachedTermList = [];
  }

  return cachedTerms || {};
}

export function getCbrTermBySlug(slug: string): CbrLexiconEntry | null {
  if (!slug) return null;
  const dict = loadCbrDictionary();
  const clean = slug.toLowerCase().trim();

  // 1. Direct slug match
  if (dict[clean]) return dict[clean];

  // 2. Fallback search by normalized slug or title
  if (cachedTermList) {
    const found = cachedTermList.find(
      (t) => t.slug.toLowerCase() === clean || t.term.toLowerCase() === clean.replace(/-/g, " ")
    );
    if (found) return found;
  }

  return null;
}

export function getCoreCanonTerms(): CbrLexiconEntry[] {
  loadCbrDictionary();
  return (cachedTermList || []).filter((t) => t.is_core_canon);
}

export function getAllCbrCategories(): string[] {
  loadCbrDictionary();
  const set = new Set<string>();
  for (const t of cachedTermList || []) {
    if (t.category) set.add(t.category);
  }
  return Array.from(set).sort();
}

export function getCbrTermsByCategory(category: string, limit = 50): CbrLexiconEntry[] {
  loadCbrDictionary();
  return (cachedTermList || [])
    .filter((t) => t.category.toLowerCase() === category.toLowerCase())
    .slice(0, limit);
}

export function searchCbrTerms(query: string, limit = 24): CbrLexiconEntry[] {
  if (!query || !query.trim()) return [];
  loadCbrDictionary();
  const q = query.toLowerCase().trim();

  return (cachedTermList || [])
    .filter((t) => t.term.toLowerCase().includes(q) || t.investopedia_definition.toLowerCase().includes(q))
    .slice(0, limit);
}

export function getFeaturedCbrTerms(limit = 24): CbrLexiconEntry[] {
  loadCbrDictionary();
  const core = (cachedTermList || []).filter((t) => t.is_core_canon);
  const rest = (cachedTermList || []).filter((t) => !t.is_core_canon);
  return [...core, ...rest].slice(0, limit);
}

// --- Efficient text matching against the full 4,653-term lexicon ---
//
// Matching runs per news story (potentially on each render/request), so this builds a
// normalized-phrase -> entry index once (same approach as lib/wiki/lore-search.ts's
// cachedTitleMap) and walks the candidate text as word n-grams, doing O(1) Map lookups
// per n-gram instead of testing a regex per lexicon term (which would be O(words * 4653)).
//
// A small number of lexicon "terms" are not real glossary entries at all -- they are
// scraped Investopedia article headlines (e.g. "Top CD Rates Today, April 18, 2024 - Earn
// 5% to 5.55% on Terms of 6 Months to 3 Years") that happened to be ingested into the same
// JSON. Those are overwhelmingly 13+ words long, so capping the n-gram window at 12 words
// excludes them from text matching (they remain fully resolvable by slug via
// getCbrTermBySlug -- this cap only affects the news-matching index, not the data itself).
// Single-word terms are also excluded from the match index (a handful, e.g. "J", "Z",
// "Jitter") since a bare single common word is far too likely to false-positive match
// inside ordinary prose; they too remain directly resolvable by slug.
const MAX_MATCH_NGRAM = 12;
const MIN_MATCH_NGRAM = 2;

let cachedMatchIndex: Map<string, CbrLexiconEntry> | null = null;

function normalizeMatchPhrase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCbrMatchIndex(): Map<string, CbrLexiconEntry> {
  if (cachedMatchIndex) return cachedMatchIndex;
  loadCbrDictionary();

  const idx = new Map<string, CbrLexiconEntry>();
  for (const entry of cachedTermList || []) {
    const normalized = normalizeMatchPhrase(entry.term);
    const wordCount = normalized.length ? normalized.split(" ").length : 0;
    if (wordCount >= MIN_MATCH_NGRAM && wordCount <= MAX_MATCH_NGRAM && !idx.has(normalized)) {
      idx.set(normalized, entry);
    }

    // Many terms carry a parenthetical short form, e.g. "Market Capitalization (Asset
    // Float Cap)" or "Fair Market Value (FMV Benchmark)". Index the base phrase before the
    // parenthesis too, so the shorter, more commonly-written form also resolves.
    const parenMatch = entry.term.match(/^([^(]+)\(/);
    if (parenMatch) {
      const base = normalizeMatchPhrase(parenMatch[1]);
      const baseWordCount = base.length ? base.split(" ").length : 0;
      if (baseWordCount >= MIN_MATCH_NGRAM && baseWordCount <= MAX_MATCH_NGRAM && !idx.has(base)) {
        idx.set(base, entry);
      }
    }
  }

  cachedMatchIndex = idx;
  return idx;
}

export interface CbrTermTextMatch {
  entry: CbrLexiconEntry;
  /** The exact substring found in the source text (preserves original casing), so callers
   *  that need to re-locate/highlight the match against the original text can do so. */
  matchedText: string;
}

/**
 * Finds lexicon terms mentioned in unstructured text using n-gram exact matching against
 * the normalized-phrase index, longest match first. Runs in O(words * MAX_MATCH_NGRAM),
 * independent of the lexicon's 4,653-term size.
 */
export function findCbrTermsInText(text: string, limit = 12): CbrTermTextMatch[] {
  if (!text || !text.trim()) return [];
  const index = buildCbrMatchIndex();
  if (index.size === 0) return [];

  const rawWords = text
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (rawWords.length === 0) return [];

  const results: CbrTermTextMatch[] = [];
  const seenSlugs = new Set<string>();

  const maxN = Math.min(MAX_MATCH_NGRAM, rawWords.length);
  for (let n = maxN; n >= MIN_MATCH_NGRAM; n--) {
    for (let i = 0; i <= rawWords.length - n; i++) {
      if (results.length >= limit) break;

      const slice = rawWords.slice(i, i + n);
      const phrase = normalizeMatchPhrase(slice.join(" "));
      const entry = index.get(phrase);
      if (entry && !seenSlugs.has(entry.slug)) {
        seenSlugs.add(entry.slug);
        results.push({ entry, matchedText: slice.join(" ") });
      }
    }
    if (results.length >= limit) break;
  }

  return results;
}
