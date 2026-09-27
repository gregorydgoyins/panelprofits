import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";

export interface PassResult {
  transformedText: string;
  matchCount: number;
}

/**
 * PASS 1: CBR Directory
 * Scans article text for character lore, creators, publishers, and titles,
 * hyperlinking first mentions to /intelligence?q=... or /wiki?q=...
 */
export function runCbrDirectoryPass(text: string, seenTerms: Set<string>): PassResult {
  if (!text) return { transformedText: "", matchCount: 0 };

  const directoryEntities = KNOWN_NEWS_ENTITIES_MAP.filter(
    (e) => e.type === "character" || e.type === "creator" || e.type === "publisher"
  ).sort((a, b) => b.term.length - a.term.length);

  let matchCount = 0;
  let resultText = text;

  for (const entity of directoryEntities) {
    const termLower = entity.term.toLowerCase();
    if (seenTerms.has(termLower)) continue;

    const regex = new RegExp(`\\b(${entity.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");
    if (regex.test(resultText)) {
      matchCount++;
      seenTerms.add(termLower);
      const targetUrl = entity.wikiPath || `/wiki?q=${encodeURIComponent(entity.term)}`;
      resultText = resultText.replace(
        regex,
        `<a href="${targetUrl}" class="text-amber-300 font-semibold underline decoration-amber-500/70 underline-offset-4 hover:text-amber-100 transition-colors">$1</a>`
      );
    }
  }

  return { transformedText: resultText, matchCount };
}
