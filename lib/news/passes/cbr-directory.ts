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
 * PASS 1: CBR Directory
 * Scans article text for character lore, creators, publishers, and titles,
 * hyperlinking first mentions safely to /intelligence?q=... or /wiki?q=...
 */
export function runCbrDirectoryPass(text: string, seenTerms: Set<string>): PassResult {
  if (!text) return { transformedText: "", matchCount: 0 };

  const directoryEntities = KNOWN_NEWS_ENTITIES_MAP.filter(
    (e) => e.type === "character" || e.type === "creator" || e.type === "publisher"
  ).sort((a, b) => b.term.length - a.term.length);

  let matchCount = 0;

  const { transformedHtml } = replaceOutsideTags(text, (plainText) => {
    let current = plainText;
    let localCount = 0;

    for (const entity of directoryEntities) {
      const termLower = entity.term.toLowerCase();
      if (seenTerms.has(termLower)) continue;

      const escaped = entity.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b(${escaped})\\b`, "i");
      if (regex.test(current)) {
        localCount++;
        seenTerms.add(termLower);
        const targetUrl = entity.wikiPath || `/intelligence?q=${encodeURIComponent(entity.term)}`;
        current = current.replace(
          regex,
          `<a href="${targetUrl}" class="text-amber-300 font-semibold underline decoration-amber-500/70 underline-offset-4 hover:text-amber-100 transition-colors">$1</a>`
        );
      }
    }
    return { text: current, count: localCount };
  });

  matchCount = seenTerms.size;
  return { transformedText: transformedHtml, matchCount };
}
