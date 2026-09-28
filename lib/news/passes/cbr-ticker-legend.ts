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
 * High-tech terminal cyan styling with zero brown/amber labels.
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
          `<a href="${targetUrl}" class="inline-flex items-center px-1.5 py-0.5 text-xs font-mono font-bold tracking-tight rounded border border-cyan-500/40 bg-[#0C1626] text-cyan-300 hover:border-cyan-300 hover:text-cyan-100 transition-colors" title="${entity.term}">${entity.ticker}</a>`,
        onMatch: () => seenTickers.add(tickerKey),
      };
    });

  const { transformedHtml, totalMatches } = transformOutsideAnchorTags(text, (plainText) => {
    const { result, matchCount } = replaceNonOverlappingTerms(plainText, candidates);
    return { text: result, count: matchCount };
  });

  return { transformedText: transformedHtml, matchCount: seenTickers.size };
}
