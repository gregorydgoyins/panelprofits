import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";
import { replaceNonOverlappingTerms, transformOutsideAnchorTags } from "@/lib/news/passes/tag-safe-replace";

export interface PassResult {
  transformedText: string;
  matchCount: number;
}

/**
 * PASS 1: CBR Directory
 * Scans article text for character lore, creators, publishers, and titles,
 * hyperlinking first mentions safely to /intelligence?q=... or /wiki?q=...
 */
export function runCbrDirectoryPass(text: string, seenTerms: Set<string>): PassResult {
  if (!text) return { transformedText: "", matchCount: 0 };

  const directoryEntities = KNOWN_NEWS_ENTITIES_MAP.filter(
    (e) => e.type === "character" || e.type === "creator" || e.type === "publisher"
  ).sort((a, b) => b.term.length - a.term.length);

  const candidates = directoryEntities
    .filter((entity) => !seenTerms.has(entity.term.toLowerCase()))
    .map((entity) => {
      const termLower = entity.term.toLowerCase();
      const targetUrl = entity.wikiPath || `/intelligence?q=${encodeURIComponent(entity.term)}`;
      return {
        term: entity.term,
        render: (matched: string) =>
          `<a href="${targetUrl}" class="text-amber-300 font-semibold underline decoration-amber-500/70 underline-offset-4 hover:text-amber-100 transition-colors">${matched}</a>`,
        onMatch: () => seenTerms.add(termLower),
      };
    });

  const { transformedHtml, totalMatches } = transformOutsideAnchorTags(text, (plainText) => {
    const { result, matchCount } = replaceNonOverlappingTerms(plainText, candidates);
    return { text: result, count: matchCount };
  });

  return { transformedText: transformedHtml, matchCount: seenTerms.size };
}
