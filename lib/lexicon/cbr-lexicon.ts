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
