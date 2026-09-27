import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";

export interface PassResult {
  transformedText: string;
  matchCount: number;
}

/**
 * Helper to safely transform only raw text nodes outside of existing HTML tags or <a> links.
 */
function replaceOutsideTags(
  html: string,
  transform: (plainText: string) => { text: string; count: number }
): { transformedHtml: string; totalMatches: number } {
  const parts = html.split(/(<[^>]+>)/g);
  let insideAnchor = false;
  let totalMatches = 0;

  const transformedParts = parts.map((part) => {
    if (part.startsWith("<")) {
      if (/^<a\b/i.test(part)) insideAnchor = true;
      if (/^<\/a>/i.test(part)) insideAnchor = false;
      return part;
    }
    if (insideAnchor) return part;

    const { text, count } = transform(part);
    totalMatches += count;
    return text;
  });

  return { transformedHtml: transformedParts.join(""), totalMatches };
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

  const { transformedHtml } = replaceOutsideTags(text, (plainText) => {
    let current = plainText;
    let localCount = 0;

    for (const entity of lexiconEntities) {
      const termLower = entity.term.toLowerCase();
      if (seenTerms.has(termLower)) continue;

      const escaped = entity.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b(${escaped})\\b`, "i");
      if (regex.test(current)) {
        localCount++;
        seenTerms.add(termLower);
        const targetUrl = entity.wikiPath || `/lexicon?q=${encodeURIComponent(entity.term)}`;
        current = current.replace(
          regex,
          `<a href="${targetUrl}" class="text-cyan-200 font-medium underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-100 transition-colors">$1</a>`
        );
      }
    }
    return { text: current, count: localCount };
  });

  return { transformedText: transformedHtml, matchCount: seenTerms.size };
}
