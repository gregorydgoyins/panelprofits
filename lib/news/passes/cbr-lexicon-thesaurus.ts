import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";

export interface PassResult {
  transformedText: string;
  matchCount: number;
}

/**
 * PASS 2: CBR Lexicon Thesaurus
 * Scans article text for financial concepts, market terms, ratings, and industry jargon,
 * hyperlinking first mentions to Investopedia / Financial Lexicon targets (/lexicon?q=... or /wiki?q=...)
 */
export function runCbrLexiconThesaurusPass(text: string, seenTerms: Set<string>): PassResult {
  if (!text) return { transformedText: "", matchCount: 0 };

  const lexiconEntities = KNOWN_NEWS_ENTITIES_MAP.filter(
    (e) => e.type === "lexicon" || e.type === "market-concept" || e.type === "grading" || e.type === "equity"
  ).sort((a, b) => b.term.length - a.term.length);

  let matchCount = 0;
  let resultText = text;

  for (const entity of lexiconEntities) {
    const termLower = entity.term.toLowerCase();
    if (seenTerms.has(termLower)) continue;

    const regex = new RegExp(`\\b(${entity.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");
    if (regex.test(resultText)) {
      matchCount++;
      seenTerms.add(termLower);
      const targetUrl = entity.wikiPath || `/lexicon?q=${encodeURIComponent(entity.term)}`;
      resultText = resultText.replace(
        regex,
        `<a href="${targetUrl}" class="text-cyan-200 font-medium underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-100 transition-colors">$1</a>`
      );
    }
  }

  return { transformedText: resultText, matchCount };
}
