import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";

export interface PassResult {
  transformedText: string;
  matchCount: number;
}

/**
 * PASS 3: CBR Ticker Legend
 * Scans article text for recognized asset terms with tickers ($TICKER),
 * appending clean, clickable ticker badges on first mentions linking to /intelligence?q=...
 */
export function runCbrTickerLegendPass(text: string, seenTickers: Set<string>): PassResult {
  if (!text) return { transformedText: "", matchCount: 0 };

  const tickerEntities = KNOWN_NEWS_ENTITIES_MAP.filter((e) => Boolean(e.ticker)).sort(
    (a, b) => b.term.length - a.term.length
  );

  let matchCount = 0;
  let resultText = text;

  for (const entity of tickerEntities) {
    if (!entity.ticker) continue;
    const tickerKey = entity.ticker.toLowerCase();
    if (seenTickers.has(tickerKey)) continue;

    const regex = new RegExp(`\\b(${entity.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");
    if (regex.test(resultText)) {
      matchCount++;
      seenTickers.add(tickerKey);
      const targetUrl = entity.wikiPath || `/intelligence?q=${encodeURIComponent(entity.term)}`;
      const tickerBadge = `<a href="${targetUrl}" class="ml-1 inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono font-bold tracking-tight rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:border-amber-300 hover:text-amber-100 transition-colors" title="${entity.term} (${entity.ticker})">${entity.ticker}</a>`;

      // If the term is already inside an anchor tag, append ticker right outside
      resultText = resultText.replace(regex, `$1 ${tickerBadge}`);
    }
  }

  return { transformedText: resultText, matchCount };
}
