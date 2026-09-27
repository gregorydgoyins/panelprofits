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

  const { transformedHtml } = replaceOutsideTags(text, (plainText) => {
    let current = plainText;
    let localCount = 0;

    for (const entity of tickerEntities) {
      if (!entity.ticker) continue;
      const tickerKey = entity.ticker.toLowerCase();
      if (seenTickers.has(tickerKey)) continue;

      const escaped = entity.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b(${escaped})\\b`, "i");
      if (regex.test(current)) {
        localCount++;
        seenTickers.add(tickerKey);
        const targetUrl = entity.wikiPath || `/intelligence?q=${encodeURIComponent(entity.term)}`;
        const tickerBadge = `<a href="${targetUrl}" class="inline-flex items-center px-1.5 py-0.5 text-xs font-mono font-bold tracking-tight rounded border border-amber-500/50 bg-amber-950/60 text-amber-300 hover:border-amber-300 hover:text-amber-100 transition-colors" title="${entity.term}">${entity.ticker}</a>`;

        current = current.replace(regex, tickerBadge);
      }
    }
    return { text: current, count: localCount };
  });

  return { transformedText: transformedHtml, matchCount: seenTickers.size };
}
