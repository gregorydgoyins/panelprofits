import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";
import { replaceNonOverlappingTerms, transformOutsideAnchorTags } from "@/lib/news/passes/tag-safe-replace";

export interface PassResult {
  transformedText: string;
  matchCount: number;
}

/**
 * PASS 3: CBR Ticker Legend
 * Scans article text for recognized asset terms with tickers ($TICKER),
 * appending clean, clickable ticker badges on first mentions linking to /intelligence?q=...
 * NEVER replaces terms inside existing links or HTML tags.
 */
export function runCbrTickerLegendPass(text: string, seenTickers: Set<string>): PassResult {
  if (!text) return { transformedText: "", matchCount: 0 };

  const tickerEntities = KNOWN_NEWS_ENTITIES_MAP.filter((e) => Boolean(e.ticker)).sort(
    (a, b) => b.term.length - a.term.length
  );

  const candidates = tickerEntities
    .filter((entity) => !seenTickers.has(entity.ticker!.toLowerCase()))
    .map((entity) => {
      const tickerKey = entity.ticker!.toLowerCase();
      const targetUrl = entity.wikiPath || `/intelligence?q=${encodeURIComponent(entity.term)}`;
      return {
        term: entity.term,
        render: (matched: string) =>
          `<a href="${targetUrl}" class="inline-flex items-center px-1.5 py-0.5 text-xs font-mono font-bold tracking-tight rounded border border-amber-500/50 bg-amber-950/60 text-amber-300 hover:border-amber-300 hover:text-amber-100 transition-colors" title="${entity.term}">${entity.ticker}</a>`,
        onMatch: () => seenTickers.add(tickerKey),
      };
    });

  const { transformedHtml, totalMatches } = transformOutsideAnchorTags(text, (plainText) => {
    const { result, matchCount } = replaceNonOverlappingTerms(plainText, candidates);
    return { text: result, count: matchCount };
  });

  return { transformedText: transformedHtml, matchCount: seenTickers.size };
}
