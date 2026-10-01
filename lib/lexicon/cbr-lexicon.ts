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

import { CORE_CANON_DICTIONARY } from "./core-canon-dictionary";

let cachedTerms: Record<string, CbrLexiconEntry> | null = null;
let cachedTermList: CbrLexiconEntry[] | null = null;

function loadCbrDictionary(): Record<string, CbrLexiconEntry> {
  if (cachedTerms && Object.keys(cachedTerms).length > 0) return cachedTerms;
  if (typeof window !== "undefined") {
    cachedTerms = CORE_CANON_DICTIONARY;
    cachedTermList = Object.values(CORE_CANON_DICTIONARY);
    return cachedTerms;
  }

  try {
    const jsonPath = path.join(process.cwd(), "lib/lexicon/cbr_market_lexicon.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      cachedTerms = { ...CORE_CANON_DICTIONARY, ...JSON.parse(raw) };
      cachedTermList = Object.values(cachedTerms!);
    } else {
      cachedTerms = CORE_CANON_DICTIONARY;
      cachedTermList = Object.values(CORE_CANON_DICTIONARY);
    }
  } catch {
    cachedTerms = CORE_CANON_DICTIONARY;
    cachedTermList = Object.values(CORE_CANON_DICTIONARY);
  }

  return cachedTerms || CORE_CANON_DICTIONARY;
}

export function getCbrTermBySlug(slug: string): CbrLexiconEntry | null {
  if (!slug) return null;
  const dict = loadCbrDictionary();
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}
  const clean = decoded.toLowerCase().trim().replace(/\/$/, "");

  // 1. Direct slug match
  if (dict[clean]) return dict[clean];

  const normalized = clean.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (dict[normalized]) return dict[normalized];

  // 2. Fallback search by normalized slug or title
  if (cachedTermList) {
    const found = cachedTermList.find((t) => {
      const tSlug = t.slug.toLowerCase();
      const tTerm = t.term.toLowerCase();
      const tNorm = tSlug.replace(/[^a-z0-9]+/g, "-");
      return (
        tSlug === clean ||
        tNorm === normalized ||
        tTerm === clean.replace(/[-_]/g, " ") ||
        tTerm.replace(/[^a-z0-9]+/g, " ") === clean.replace(/[^a-z0-9]+/g, " ")
      );
    });
    if (found) return found;

    // 3. Prefix matching for terms with parentheticals (e.g. "market-capitalization" -> "market-capitalization-asset-float-cap")
    const prefixMatch = cachedTermList.find(
      (t) => t.slug.toLowerCase().startsWith(`${normalized}-`) || normalized.startsWith(`${t.slug.toLowerCase()}-`)
    );
    if (prefixMatch) return prefixMatch;
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

// --- Efficient text matching against the full lexicon ---
//
// Matching runs per news story (potentially on each render/request), so this builds a
// normalized-phrase -> entry index once (same approach as lib/wiki/lore-search.ts's
// cachedTitleMap) and walks the candidate text as word n-grams, doing O(1) Map lookups
// per n-gram instead of testing a regex per lexicon term (which would be O(words * N)).
//
// A small number of lexicon "terms" are not real glossary entries at all -- they are
// scraped Investopedia article headlines (e.g. "Top CD Rates Today, April 18, 2024 - Earn
// 5% to 5.55% on Terms of 6 Months to 3 Years") that happened to be ingested into the same
// JSON. Those are overwhelmingly 13+ words long, so capping the n-gram window at 12 words
// excludes them from text matching (they remain fully resolvable by slug via
// getCbrTermBySlug -- this cap only affects the news-matching index, not the data itself).
//
// Bare single-word terms (a handful, e.g. "J", "Z", "Jitter", "Metrics", "Joint") are
// excluded from the match index since a bare single common word is far too likely to
// false-positive match inside ordinary prose; they remain directly resolvable by slug.
// The one structural exception is a *hyphenated compound* term such as "High-Grade":
// written in running text ("high-grade census copies"), the hyphen keeps it as a single
// token, so it can never be found by word n-grams (n >= 2) alone even though the term
// itself is a real, existing lexicon entry -- this is a matcher gap, not a missing-data
// gap. isSafeSingleToken() gates that one case in: a single token is only indexable when
// it contains a hyphen (a structurally compound, two-part term), which is what lets
// "High-Grade" in while continuing to keep bare dictionary words like "Metrics" or "Joint"
// out. A hyphenated term is also indexed under its space-joined form ("high grade") so
// prose written either way resolves to the same entry.
const MAX_MATCH_NGRAM = 12;
const MIN_MATCH_NGRAM = 1;

let cachedMatchIndex: Map<string, CbrLexiconEntry> | null = null;

function normalizeMatchPhrase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A single-token (no internal space) normalized term is only safe to index on its own if
 * it's a hyphenated compound (e.g. "high-grade") -- a structurally two-part domain term.
 * A bare single dictionary word (e.g. "metrics", "joint", "j") is never indexable alone,
 * no matter how it's spelled, because it would false-positive match constantly in
 * ordinary financial/comics prose. See the block comment above for the concrete case
 * ("High-Grade") this exists to let through.
 */
const COMMON_PHRASE_BLOCKLIST = new Set([
  "the top",
  "the bottom",
  "the best",
  "the only",
  "top 10",
  "how to",
  "what is",
  "why you",
  "all of",
  "part of",
  "in the",
  "on the",
  "at the",
  "out of",
  "one of",
  "some of",
  "up to",
  "down to",
  "top",
  "bottom",
  "best",
  "worst",
  "only",
  "about",
  "who is",
  "what are",
  "when to",
  "where to",
  "which is",
  "more than",
  "less than",
]);

function isSafeSingleToken(normalized: string): boolean {
  return normalized.includes("-");
}

function wordCountOf(normalized: string): number {
  return normalized.length ? normalized.split(" ").length : 0;
}

/** Registers `phrase` -> entry in idx, plus its hyphen<->space variant (e.g. indexing
 *  both "high-grade" and "high grade" for a term stored as "High-Grade"), so hyphen-vs-
 *  space variance in how a compound term is written doesn't prevent a match. */
function indexPhraseAndVariants(idx: Map<string, CbrLexiconEntry>, normalized: string, entry: CbrLexiconEntry): void {
  if (!normalized || COMMON_PHRASE_BLOCKLIST.has(normalized)) return;
  const existing = idx.get(normalized);
  if (!existing || (!existing.is_core_canon && entry.is_core_canon)) {
    idx.set(normalized, entry);
  }

  if (normalized.includes("-")) {
    const spaced = normalized.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (spaced !== normalized && !COMMON_PHRASE_BLOCKLIST.has(spaced)) {
      const existingSpaced = idx.get(spaced);
      if (!existingSpaced || (!existingSpaced.is_core_canon && entry.is_core_canon)) {
        idx.set(spaced, entry);
      }
    }
  }
}

function buildCbrMatchIndex(): Map<string, CbrLexiconEntry> {
  if (cachedMatchIndex) return cachedMatchIndex;
  loadCbrDictionary();

  const idx = new Map<string, CbrLexiconEntry>();
  for (const entry of cachedTermList || []) {
    const termLower = entry.term.toLowerCase();
    if (termLower.startsWith("the top (and only")) continue;
    const normalized = normalizeMatchPhrase(entry.term);
    if (COMMON_PHRASE_BLOCKLIST.has(normalized)) continue;
    const wordCount = wordCountOf(normalized);
    const indexable =
      wordCount >= 2 ? wordCount <= MAX_MATCH_NGRAM : wordCount === 1 && isSafeSingleToken(normalized);
    if (indexable) indexPhraseAndVariants(idx, normalized, entry);

    // Many terms carry a parenthetical short form, e.g. "Market Capitalization (Asset
    // Float Cap)" or "Fair Market Value (FMV Benchmark)". Index the base phrase before the
    // parenthesis too, so the shorter, more commonly-written form also resolves.
    const parenMatch = entry.term.match(/^([^(]+)\(/);
    if (parenMatch) {
      const base = normalizeMatchPhrase(parenMatch[1]);
      if (!COMMON_PHRASE_BLOCKLIST.has(base)) {
        const baseWordCount = wordCountOf(base);
        const baseIndexable =
          baseWordCount >= 2 ? baseWordCount <= MAX_MATCH_NGRAM : baseWordCount === 1 && isSafeSingleToken(base);
        if (baseIndexable) indexPhraseAndVariants(idx, base, entry);
      }
    }
  }

  cachedMatchIndex = idx;
  return idx;
}

/**
 * Cheap, low-risk singular/plural fallback: if the exact normalized phrase isn't in the
 * index, try toggling a trailing "s" (e.g. text says "certificates", the entry is stored
 * as "Certificate", or vice versa). Deliberately not a general stemmer/Levenshtein
 * matcher -- just the one common, low-risk English plural pattern -- so it can't turn
 * into an unrelated-word fuzzy match. Only applied as a fallback after the exact lookup
 * fails, and only lengthens/shortens the phrase's own last character, so it can't bridge
 * two otherwise-different terms.
 */
function lookupWithPluralFallback(
  index: Map<string, CbrLexiconEntry>,
  phrase: string
): CbrLexiconEntry | undefined {
  const exact = index.get(phrase);
  if (exact) return exact;

  if (phrase.endsWith("s") && phrase.length > 4) {
    const singular = phrase.slice(0, -1);
    const found = index.get(singular);
    if (found) return found;
  } else if (phrase.length > 3) {
    const plural = `${phrase}s`;
    const found = index.get(plural);
    if (found) return found;
  }

  return undefined;
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
 * independent of the lexicon's size.
 *
 * n goes down to 1 (a single raw token) so hyphenated single-token compounds like
 * "high-grade" -- which the tokenizer below keeps as one token since a hyphen isn't
 * whitespace -- can match. This is safe against false positives because the index itself
 * (buildCbrMatchIndex) only ever contains a single-token key when isSafeSingleToken()
 * accepted it (i.e. the token is a hyphenated compound); a bare common word like "metrics"
 * or "joint" was never inserted, so an n=1 lookup for it simply misses, exactly as before.
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
      const entry = lookupWithPluralFallback(index, phrase);
      if (entry && !seenSlugs.has(entry.slug)) {
        seenSlugs.add(entry.slug);
        results.push({ entry, matchedText: slice.join(" ") });
      }
    }
    if (results.length >= limit) break;
  }

  return results;
}
