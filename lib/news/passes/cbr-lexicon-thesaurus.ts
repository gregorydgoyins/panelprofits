import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";
import { replaceNonOverlappingTerms, transformOutsideAnchorTags } from "@/lib/news/passes/tag-safe-replace";

export interface PassResult {
  transformedText: string;
  matchCount: number;
}

/**
 * PASS 2: CBR Lexicon Thesaurus
 * Scans article text for financial concepts, market terms, ratings, and industry jargon,
 * hyperlinking first mentions safely to Investopedia / Financial Lexicon targets (/lexicon?q=... or /indices?q=...)
 */
export function runCbrLexiconThesaurusPass(text: string, seenTerms: Set<string>): PassResult {
  if (!text) return { transformedText: "", matchCount: 0 };

  const lexiconEntities = KNOWN_NEWS_ENTITIES_MAP.filter(
    (e) => e.type === "lexicon" || e.type === "market-concept" || e.type === "grading" || e.type === "equity"
  ).sort((a, b) => b.term.length - a.term.length);

  const candidates = lexiconEntities
    .filter((entity) => !seenTerms.has(entity.term.toLowerCase()))
    .map((entity) => {
      const termLower = entity.term.toLowerCase();
      const targetUrl = entity.wikiPath || `/lexicon?q=${encodeURIComponent(entity.term)}`;
      return {
        term: entity.term,
        render: (matched: string) =>
          `<a href="${targetUrl}" class="text-cyan-200 font-medium underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-100 transition-colors">${matched}</a>`,
        onMatch: () => seenTerms.add(termLower),
      };
    });

  const { transformedHtml, totalMatches } = transformOutsideAnchorTags(text, (plainText) => {
    const { result, matchCount } = replaceNonOverlappingTerms(plainText, candidates);
    return { text: result, count: matchCount };
  });

  return { transformedText: transformedHtml, matchCount: seenTerms.size };
}
